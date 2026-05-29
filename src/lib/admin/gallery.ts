import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import type { GalleryUploadFormValue } from './gallery-form';
import { buildGalleryReorderUpdates } from './gallery-form';

type DbError = { message?: string };

function must<T>(result: { data: T | null; error: DbError | null }, label: string) {
  if (result.error) throw new Error(`${label}: ${result.error.message ?? 'unknown error'}`);
  return result.data as T;
}

type MediaAssetRow = {
  id: string;
  bucket: string;
  path: string;
  external_url: string | null;
  source: string;
};

type GalleryItemRow = {
  id: string;
  title: string;
  media_asset_id: string;
  sort_order: number;
  is_published: boolean;
  created_at: string | null;
  media_assets?: MediaAssetRow | MediaAssetRow[] | null;
};

export type AdminGalleryItem = {
  id: string;
  title: string;
  mediaAssetId: string;
  imageUrl: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string | null;
};

export type AdminGalleryData = {
  configured: boolean;
  items: AdminGalleryItem[];
};

const bucketName = 'public-media';
const publicStorageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`;

function mediaUrl(asset?: MediaAssetRow | MediaAssetRow[] | null) {
  const row = Array.isArray(asset) ? asset[0] : asset;
  if (!row) return '';
  if (row.source === 'supabase' && row.bucket && row.path) {
    return `${publicStorageBase}/${row.bucket}/${row.path}`;
  }
  return row.external_url ?? '';
}

function fileExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (fromName) return fromName;
  const fromType = file.type.split('/')[1]?.toLowerCase().replace(/[^a-z0-9]/g, '');
  return fromType || 'jpg';
}

function toAdminGalleryItem(row: GalleryItemRow): AdminGalleryItem {
  return {
    id: row.id,
    title: row.title,
    mediaAssetId: row.media_asset_id,
    imageUrl: mediaUrl(row.media_assets),
    sortOrder: Number(row.sort_order ?? 0),
    isPublished: row.is_published !== false,
    createdAt: row.created_at,
  };
}

export async function getAdminGalleryData(): Promise<AdminGalleryData> {
  if (!isSupabaseAdminConfigured()) return { configured: false, items: [] };

  const supabase = getSupabaseAdmin();
  const result = await supabase
    .from('gallery_items')
    .select('id,title,media_asset_id,sort_order,is_published,created_at,media_assets(id,bucket,path,external_url,source)')
    .order('sort_order')
    .order('created_at');

  const rows = must<GalleryItemRow[]>(result, 'gallery list lookup failed');
  return { configured: true, items: rows.map(toAdminGalleryItem) };
}

export async function createGalleryItem(value: GalleryUploadFormValue) {
  const supabase = getSupabaseAdmin();
  const id = crypto.randomUUID();
  const path = `gallery/${id}.${fileExtension(value.file)}`;
  const bytes = await value.file.arrayBuffer();

  must(
    await supabase.storage.from(bucketName).upload(path, bytes, {
      contentType: value.file.type || 'image/jpeg',
      upsert: false,
    }),
    'gallery photo upload failed',
  );

  try {
    const media = must<{ id: string }>(
      await supabase
        .from('media_assets')
        .insert({
          bucket: bucketName,
          path,
          alt_text: value.title,
          caption: value.title,
          mime_type: value.file.type || null,
          size_bytes: value.file.size,
          source: 'supabase',
          is_public: true,
          metadata: { usage: 'gallery' },
        })
        .select('id')
        .single(),
      'gallery media asset insert failed',
    );

    const maxResult = await supabase
      .from('gallery_items')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextOrder = Number(maxResult.data?.sort_order ?? -1) + 1;

    const item = must<{ id: string }>(
      await supabase
        .from('gallery_items')
        .insert({
          media_asset_id: media.id,
          title: value.title,
          description: null,
          is_featured: false,
          sort_order: nextOrder,
          is_published: true,
        })
        .select('id')
        .single(),
      'gallery item insert failed',
    );

    await supabase.from('admin_audit_logs').insert({
      action: 'create',
      entity_table: 'gallery_items',
      entity_id: item.id,
      metadata: { title: value.title, media_asset_id: media.id },
    });
  } catch (error) {
    await supabase.storage.from(bucketName).remove([path]);
    throw error;
  }
}

export async function reorderGalleryItems(orderedIds: string[]) {
  const supabase = getSupabaseAdmin();
  const results = await Promise.all(
    buildGalleryReorderUpdates(orderedIds).map(({ id, sortOrder }) =>
      supabase.from('gallery_items').update({ sort_order: sortOrder }).eq('id', id),
    ),
  );

  results.forEach((result, index) => {
    must(result, `gallery reorder failed ${index + 1}`);
  });
}

export async function deleteGalleryItem(id: string) {
  const supabase = getSupabaseAdmin();
  const item = must<{
    title: string;
    media_asset_id: string;
    media_assets?: MediaAssetRow | MediaAssetRow[] | null;
  }>(
    await supabase
      .from('gallery_items')
      .select('title,media_asset_id,media_assets(id,bucket,path,source)')
      .eq('id', id)
      .single(),
    'gallery item lookup failed',
  );
  const asset = Array.isArray(item.media_assets) ? item.media_assets[0] : item.media_assets;

  must(await supabase.from('gallery_items').delete().eq('id', id), 'gallery item delete failed');

  if (asset?.source === 'supabase' && asset.bucket && asset.path) {
    await supabase.storage.from(asset.bucket).remove([asset.path]);
  }
  if (item.media_asset_id) {
    await supabase.from('media_assets').delete().eq('id', item.media_asset_id);
  }

  await supabase.from('admin_audit_logs').insert({
    action: 'delete',
    entity_table: 'gallery_items',
    entity_id: id,
    metadata: { title: item.title, media_asset_id: item.media_asset_id },
  });
}
