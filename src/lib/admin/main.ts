import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/admin';

type DbError = { message?: string };

function must<T>(result: { data: T | null; error: DbError | null }, label: string) {
  if (result.error) throw new Error(`${label}: ${result.error.message ?? 'unknown error'}`);
  return result.data as T;
}

export type AdminIntroPhoto = {
  id: string;
  title: string;
  mediaAssetId: string;
  imageUrl: string;
  sortOrder: number;
};

export type AdminPartPhoto = {
  key: string;
  title: string;
  mediaAssetId: string | null;
  imageUrl: string | null;
};

export type AdminContactPerson = {
  id: string;
  role: string;
  personId: string | null;
  name: string;
  phone: string;
  sortOrder: number;
};

export type AdminMainData = {
  configured: boolean;
  year: number;
  themeKo: string;
  themeEn: string;
  heroBackgroundAssetId: string | null;
  heroBackgroundUrl: string | null;
  heroBackgroundPosition: string;
  servantsBackgroundAssetId: string | null;
  servantsBackgroundUrl: string | null;
  practiceBackgroundAssetId: string | null;
  practiceBackgroundUrl: string | null;
  introPhotos: AdminIntroPhoto[];
  partPhotos: AdminPartPhoto[];
  contacts: AdminContactPerson[];
  peopleList: { id: string; name: string; phone: string }[];
};

const bucketName = 'public-media';
const publicStorageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`;

function mediaUrl(path?: string | null) {
  if (!path) return null;
  return `${publicStorageBase}/${bucketName}/${path}`;
}

export async function getAdminMainData(): Promise<AdminMainData> {
  const currentYear = new Date().getFullYear();

  if (!isSupabaseAdminConfigured()) {
    return {
      configured: false,
      year: currentYear,
      themeKo: '',
      themeEn: '',
      heroBackgroundAssetId: null,
      heroBackgroundUrl: null,
      heroBackgroundPosition: 'center',
      servantsBackgroundAssetId: null,
      servantsBackgroundUrl: null,
      practiceBackgroundAssetId: null,
      practiceBackgroundUrl: null,
      introPhotos: [],
      partPhotos: [],
      contacts: [],
      peopleList: [],
    };
  }

  const supabase = getSupabaseAdmin();

  // 1. 연간 프로필 조회
  const profileResult = await supabase
    .from('annual_profiles')
    .select('year,theme_ko,theme_en,hero_background_asset_id,hero_background_position')
    .eq('year', currentYear)
    .maybeSingle();
  const profile = profileResult.data;

  // 2. 미디어 에셋 전체 조회
  const mediaResult = await supabase.from('media_assets').select('*');
  const mediaRows = must<any[]>(mediaResult, 'media assets query');
  const mediaById = new Map(mediaRows.map((m) => [m.id, m]));

  // 3. 인트로 앨범 ID 조회
  const albumResult = await supabase
    .from('gallery_albums')
    .select('id')
    .eq('key', 'intro')
    .maybeSingle();
  const introAlbum = albumResult.data;

  // 4. 인트로 갤러리 이미지 조회
  let introPhotos: AdminIntroPhoto[] = [];
  if (introAlbum) {
    const introPhotosResult = await supabase
      .from('gallery_items')
      .select('*')
      .eq('album_id', introAlbum.id)
      .order('sort_order')
      .order('created_at');
    const rows = must<any[]>(introPhotosResult, 'intro photos query');
    introPhotos = rows.map((r) => {
      const asset = mediaById.get(r.media_asset_id);
      return {
        id: r.id,
        title: r.title,
        mediaAssetId: r.media_asset_id,
        imageUrl: mediaUrl(asset?.path) ?? '',
        sortOrder: Number(r.sort_order ?? 0),
      };
    });
  }

  // 5. '섬기는 사람들' 및 '시간표' 배경 조회 (media_assets metadata.usage 검색)
  const servantsBgAsset = mediaRows.find((m) => m.metadata?.usage === 'servants_bg');
  const practiceBgAsset = mediaRows.find((m) => m.metadata?.usage === 'practice_bg');

  // 6. 파트별 대표 이미지 조회 (media_assets metadata.usage = 'section_bg')
  const sectionKeys = ['soprano1', 'soprano2', 'alto', 'tenor', 'bass', 'ensemble'];
  const partPhotos: AdminPartPhoto[] = sectionKeys.map((key) => {
    const asset = mediaRows.find((m) => m.metadata?.usage === 'section_bg' && m.metadata?.section_key === key);
    let title = '';
    switch (key) {
      case 'soprano1': title = '소프라노 1'; break;
      case 'soprano2': title = '소프라노 2'; break;
      case 'alto': title = '알토'; break;
      case 'tenor': title = '테너'; break;
      case 'bass': title = '베이스'; break;
      case 'ensemble': title = '하기오스 악단'; break;
    }
    return {
      key,
      title,
      mediaAssetId: asset?.id ?? null,
      imageUrl: mediaUrl(asset?.path) ?? null,
    };
  });

  // 7. 문의 대상 임원진 조회 (leadership_assignments group_key = 'music_ministry')
  const contactsResult = await supabase
    .from('leadership_assignments')
    .select('*')
    .eq('group_key', 'music_ministry')
    .order('sort_order');
  const contactRows = must<any[]>(contactsResult, 'contacts query');

  // 8. 드롭다운용 전체 대원 리스트
  const peopleResult = await supabase.from('people').select('id,display_name,phone_label').eq('is_active', true);
  const peopleRows = must<any[]>(peopleResult, 'people list query');
  const peopleById = new Map(peopleRows.map((p) => [p.id, p]));

  const contacts: AdminContactPerson[] = contactRows.map((r) => {
    const person = r.person_id ? peopleById.get(r.person_id) : null;
    return {
      id: r.id,
      role: r.role_text,
      personId: r.person_id ?? null,
      name: person?.display_name ?? r.external_name ?? '',
      phone: person?.phone_label ?? '',
      sortOrder: Number(r.sort_order ?? 0),
    };
  });

  const heroAsset = profile?.hero_background_asset_id ? mediaById.get(profile.hero_background_asset_id) : null;

  return {
    configured: true,
    year: currentYear,
    themeKo: profile?.theme_ko ?? '',
    themeEn: profile?.theme_en ?? '',
    heroBackgroundAssetId: profile?.hero_background_asset_id ?? null,
    heroBackgroundUrl: mediaUrl(heroAsset?.path),
    heroBackgroundPosition: profile?.hero_background_position ?? 'center',
    servantsBackgroundAssetId: servantsBgAsset?.id ?? null,
    servantsBackgroundUrl: mediaUrl(servantsBgAsset?.path),
    practiceBackgroundAssetId: practiceBgAsset?.id ?? null,
    practiceBackgroundUrl: mediaUrl(practiceBgAsset?.path),
    introPhotos,
    partPhotos,
    contacts,
    peopleList: peopleRows.map((p) => ({
      id: p.id,
      name: p.display_name,
      phone: p.phone_label ?? '',
    })),
  };
}

export async function updateSlogans(themeKo: string, themeEn: string, heroPosition: string) {
  const supabase = getSupabaseAdmin();
  const currentYear = new Date().getFullYear();
  must(
    await supabase
      .from('annual_profiles')
      .update({
        theme_ko: themeKo.trim(),
        theme_en: themeEn.trim(),
        hero_background_position: heroPosition.trim(),
      })
      .eq('year', currentYear),
    'slogan update',
  );
}

export async function uploadSpecialImage(
  usage: 'hero_bg' | 'servants_bg' | 'practice_bg' | 'section_bg',
  sectionKey: string | null,
  file: File
) {
  const supabase = getSupabaseAdmin();
  const id = crypto.randomUUID();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const path = `main/${usage}${sectionKey ? `_${sectionKey}` : ''}_${id}.${ext}`;
  const bytes = await file.arrayBuffer();

  // 1. Storage에 업로드
  must(
    await supabase.storage.from(bucketName).upload(path, bytes, {
      contentType: file.type || 'image/webp',
      upsert: true,
    }),
    'image storage upload',
  );

  // 2. media_assets 에 등록
  const metadata: any = { usage };
  if (sectionKey) metadata.section_key = sectionKey;

  const asset = must<{ id: string }>(
    await supabase
      .from('media_assets')
      .insert({
        bucket: bucketName,
        path,
        alt_text: usage,
        caption: '',
        mime_type: file.type || null,
        size_bytes: file.size,
        source: 'supabase',
        is_public: true,
        metadata,
      })
      .select('id')
      .single(),
    'media asset database insert',
  );

  // 3. 연결 업데이트
  if (usage === 'hero_bg') {
    const currentYear = new Date().getFullYear();
    must(
      await supabase
        .from('annual_profiles')
        .update({ hero_background_asset_id: asset.id })
        .eq('year', currentYear),
      'hero background mapping',
    );
  } else if (usage === 'servants_bg' || usage === 'practice_bg') {
    // 기존에 있던 에셋들의 metadata usage 변경하여 비활성화
    const { data: oldAssets } = await supabase
      .from('media_assets')
      .select('id')
      .eq('metadata->>usage', usage)
      .neq('id', asset.id);
    if (oldAssets && oldAssets.length > 0) {
      await Promise.all(
        oldAssets.map((o) =>
          supabase
            .from('media_assets')
            .update({ metadata: { usage: `${usage}_old` } })
            .eq('id', o.id)
        )
      );
    }
  } else if (usage === 'section_bg' && sectionKey) {
    // 기존에 있던 파트 에셋들의 metadata usage 변경
    const { data: oldAssets } = await supabase
      .from('media_assets')
      .select('id')
      .eq('metadata->>usage', 'section_bg')
      .eq('metadata->>section_key', sectionKey)
      .neq('id', asset.id);
    if (oldAssets && oldAssets.length > 0) {
      await Promise.all(
        oldAssets.map((o) =>
          supabase
            .from('media_assets')
            .update({ metadata: { usage: 'section_bg_old', section_key: sectionKey } })
            .eq('id', o.id)
        )
      );
    }
  }

  return asset.id;
}

export async function uploadIntroPhoto(file: File) {
  const supabase = getSupabaseAdmin();
  const id = crypto.randomUUID();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const path = `gallery/intro_${id}.${ext}`;
  const bytes = await file.arrayBuffer();

  // 1. Storage 업로드
  must(
    await supabase.storage.from(bucketName).upload(path, bytes, {
      contentType: file.type || 'image/webp',
    }),
    'intro photo storage upload',
  );

  // 2. media_assets 등록
  const asset = must<{ id: string }>(
    await supabase
      .from('media_assets')
      .insert({
        bucket: bucketName,
        path,
        alt_text: 'Intro Photo',
        source: 'supabase',
        is_public: true,
        metadata: { usage: 'intro' },
      })
      .select('id')
      .single(),
    'intro media db insert',
  );

  // 3. 인트로 앨범 ID 조회
  const albumResult = await supabase
    .from('gallery_albums')
    .select('id')
    .eq('key', 'intro')
    .maybeSingle();
  let introAlbumId = albumResult.data?.id;

  if (!introAlbumId) {
    const newAlbum = must<{ id: string }>(
      await supabase
        .from('gallery_albums')
        .insert({
          key: 'intro',
          label_ko: '인트로',
          label_en: 'Intro',
          sort_order: 10,
          is_active: true,
        })
        .select('id')
        .single(),
      'intro album creation',
    );
    introAlbumId = newAlbum.id;
  }

  // 4. gallery_items 등록 (마지막 순서로)
  const maxResult = await supabase
    .from('gallery_items')
    .select('sort_order')
    .eq('album_id', introAlbumId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = Number(maxResult.data?.sort_order ?? -1) + 1;

  must(
    await supabase.from('gallery_items').insert({
      album_id: introAlbumId,
      media_asset_id: asset.id,
      title: `Intro ${nextOrder + 1}`,
      sort_order: nextOrder,
      is_published: true,
    }),
    'intro gallery item insert',
  );
}

export async function deleteIntroPhoto(id: string) {
  const supabase = getSupabaseAdmin();
  const item = must<{ media_asset_id: string }>(
    await supabase.from('gallery_items').select('media_asset_id').eq('id', id).single(),
    'intro item lookup',
  );

  must(await supabase.from('gallery_items').delete().eq('id', id), 'intro item delete');

  const asset = must<{ bucket: string; path: string }>(
    await supabase.from('media_assets').select('bucket,path').eq('id', item.media_asset_id).single(),
    'intro asset lookup',
  );

  await supabase.storage.from(asset.bucket).remove([asset.path]);
  await supabase.from('media_assets').delete().eq('id', item.media_asset_id);
}

export async function reorderIntroPhotos(orderedIds: string[]) {
  const supabase = getSupabaseAdmin();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('gallery_items').update({ sort_order: index }).eq('id', id)
    )
  );
}

export async function addContactMember(personId: string, roleText: string) {
  const supabase = getSupabaseAdmin();
  const maxResult = await supabase
    .from('leadership_assignments')
    .select('sort_order')
    .eq('group_key', 'music_ministry')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = Number(maxResult.data?.sort_order ?? -1) + 1;

  must(
    await supabase.from('leadership_assignments').insert({
      group_key: 'music_ministry',
      role_text: roleText.trim(),
      person_id: personId || null,
      sort_order: nextOrder,
      is_active: true,
    }),
    'contact insert',
  );
}

export async function deleteContactMember(id: string) {
  const supabase = getSupabaseAdmin();
  must(
    await supabase
      .from('leadership_assignments')
      .delete()
      .eq('id', id)
      .eq('group_key', 'music_ministry'),
    'contact delete',
  );
}

export async function reorderContactMembers(orderedIds: string[]) {
  const supabase = getSupabaseAdmin();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('leadership_assignments')
        .update({ sort_order: index })
        .eq('id', id)
        .eq('group_key', 'music_ministry')
    )
  );
}
