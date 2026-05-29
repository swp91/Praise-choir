import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

type GalleryDownloadRow = {
  title: string;
  media_assets:
    | {
        bucket: string;
        path: string;
        external_url: string | null;
        source: string;
        mime_type: string | null;
      }
    | {
        bucket: string;
        path: string;
        external_url: string | null;
        source: string;
        mime_type: string | null;
      }[]
    | null;
};

function assetFrom(row: GalleryDownloadRow) {
  return Array.isArray(row.media_assets) ? row.media_assets[0] : row.media_assets;
}

function safeFilename(title: string, fallbackExt: string) {
  const base = title
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 80) || 'praise-gallery';
  return `${base}.${fallbackExt}`;
}

function extensionFrom(path: string, mimeType?: string | null) {
  const ext = path.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (ext) return ext;
  if (mimeType?.includes('png')) return 'png';
  if (mimeType?.includes('webp')) return 'webp';
  return 'jpg';
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const { data, error } = await supabase
    .from('gallery_items')
    .select('title, media_assets(bucket,path,external_url,source,mime_type)')
    .eq('id', id)
    .eq('is_published', true)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const row = data as GalleryDownloadRow;
  const asset = assetFrom(row);
  if (!asset) return NextResponse.json({ error: 'Missing media' }, { status: 404 });

  const sourceUrl =
    asset.source === 'supabase'
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${asset.bucket}/${asset.path}`
      : asset.external_url;

  if (!sourceUrl) return NextResponse.json({ error: 'Missing media URL' }, { status: 404 });

  const response = await fetch(sourceUrl);
  if (!response.ok || !response.body) return NextResponse.json({ error: 'Download failed' }, { status: 502 });

  const contentType = response.headers.get('content-type') ?? asset.mime_type ?? 'application/octet-stream';
  const filename = safeFilename(row.title, extensionFrom(asset.path, contentType));

  return new NextResponse(response.body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Cache-Control': 'public, max-age=300',
    },
  });
}
