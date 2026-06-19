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

export type AdminSlidePhoto = {
  key: string;
  type: 'part' | 'staff';
  title: string;
  role: string;
  targetId: string;
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
  slidePhotos: AdminSlidePhoto[];
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
      slidePhotos: [],
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

  // 5.5. 지휘자/반주자/편곡자 (staff 섹션 멤버) 정보 및 사진 조회
  let staffPhotos: AdminSlidePhoto[] = [];
  const staffSectionResult = await supabase
    .from('sections')
    .select('id')
    .eq('key', 'staff')
    .maybeSingle();
  const staffSection = staffSectionResult.data;

  if (staffSection) {
    const staffMembershipsResult = await supabase
      .from('section_memberships')
      .select('person_id, role_text')
      .eq('section_id', staffSection.id)
      .eq('is_active', true)
      .order('sort_order');
    const staffMemberships = staffMembershipsResult.data || [];
    const staffPeopleIds = staffMemberships.map((m) => m.person_id).filter(Boolean);

    if (staffPeopleIds.length > 0) {
      const staffPeopleResult = await supabase
        .from('people')
        .select('id, display_name, photo_asset_id')
        .in('id', staffPeopleIds);
      const staffPeople = staffPeopleResult.data || [];
      const staffPeopleMap = new Map(staffPeople.map((p) => [p.id, p]));

      staffPhotos = staffMemberships.flatMap((m) => {
        const person = staffPeopleMap.get(m.person_id);
        if (!person) return [];
        const asset = person.photo_asset_id ? mediaById.get(person.photo_asset_id) : null;
        return [{
          key: `staff-${person.id}`,
          type: 'staff',
          title: person.display_name,
          role: m.role_text ?? '',
          targetId: person.id,
          imageUrl: mediaUrl(asset?.path) ?? null,
        } satisfies AdminSlidePhoto];
      });
    }
  }

  // 6. 파트별 대표 이미지 조회 (media_assets metadata.usage = 'section_bg')
  const sectionKeys = ['soprano1', 'soprano2', 'alto', 'tenor', 'bass', 'ensemble'];
  const partPhotos: AdminSlidePhoto[] = sectionKeys.map((key) => {
    const asset = mediaRows.find((m) => m.metadata?.usage === 'section_bg' && m.metadata?.section_key === key);
    let title = '';
    let role = '';
    switch (key) {
      case 'soprano1': title = '소프라노 1'; role = 'SOPRANO 1'; break;
      case 'soprano2': title = '소프라노 2'; role = 'SOPRANO 2'; break;
      case 'alto': title = '알토'; role = 'ALTO'; break;
      case 'tenor': title = '테너'; role = 'TENOR'; break;
      case 'bass': title = '베이스'; role = 'BASS'; break;
      case 'ensemble': title = '하기오스 악단'; role = 'HAGIOS ENSEMBLE'; break;
    }
    return {
      key: `part-${key}`,
      type: 'part',
      title,
      role,
      targetId: key,
      imageUrl: mediaUrl(asset?.path) ?? null,
    };
  });

  const slidePhotos = [...staffPhotos, ...partPhotos];

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
    slidePhotos,
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

export async function updateIntroPhoto(itemId: string, file: File) {
  const supabase = getSupabaseAdmin();
  const id = crypto.randomUUID();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const path = `gallery/intro_update_${id}.${ext}`;
  const bytes = await file.arrayBuffer();

  // 1. Storage 업로드
  must(
    await supabase.storage.from(bucketName).upload(path, bytes, {
      contentType: file.type || 'image/webp',
    }),
    'intro photo update storage upload',
  );

  // 2. media_assets 등록
  const asset = must<{ id: string }>(
    await supabase
      .from('media_assets')
      .insert({
        bucket: bucketName,
        path,
        alt_text: 'Intro Photo Updated',
        source: 'supabase',
        is_public: true,
        metadata: { usage: 'intro' },
      })
      .select('id')
      .single(),
    'intro update media db insert',
  );

  // 3. 기존 gallery_items의 media_asset_id 조회
  const oldItem = must<{ media_asset_id: string }>(
    await supabase
      .from('gallery_items')
      .select('media_asset_id')
      .eq('id', itemId)
      .single(),
    'old intro item lookup',
  );

  // 4. gallery_items의 media_asset_id 교체
  must(
    await supabase
      .from('gallery_items')
      .update({ media_asset_id: asset.id })
      .eq('id', itemId),
    'intro gallery item update',
  );

  // 5. 이전 media_asset 제거
  if (oldItem && oldItem.media_asset_id) {
    const oldAssetResult = await supabase
      .from('media_assets')
      .select('bucket, path')
      .eq('id', oldItem.media_asset_id)
      .maybeSingle();
    const oldAsset = oldAssetResult.data;
    if (oldAsset) {
      await supabase.storage.from(oldAsset.bucket).remove([oldAsset.path]);
      await supabase.from('media_assets').delete().eq('id', oldItem.media_asset_id);
    }
  }
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

export async function uploadStaffPhoto(personId: string, file: File) {
  const supabase = getSupabaseAdmin();
  const id = crypto.randomUUID();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const path = `people/staff_${personId}_${id}.${ext}`;
  const bytes = await file.arrayBuffer();

  // 1. Storage 업로드
  must(
    await supabase.storage.from(bucketName).upload(path, bytes, {
      contentType: file.type || 'image/webp',
      upsert: true,
    }),
    'staff image storage upload',
  );

  // 2. media_assets 등록
  const asset = must<{ id: string }>(
    await supabase
      .from('media_assets')
      .insert({
        bucket: bucketName,
        path,
        alt_text: 'Staff Photo',
        source: 'supabase',
        is_public: true,
        metadata: { usage: 'staff_photo', person_id: personId },
      })
      .select('id')
      .single(),
    'staff media db insert',
  );

  // 3. 기존 person의 photo_asset_id 조회
  const person = must<{ photo_asset_id: string | null }>(
    await supabase
      .from('people')
      .select('photo_asset_id')
      .eq('id', personId)
      .single(),
    'staff person lookup',
  );

  // 4. people 테이블의 photo_asset_id 업데이트
  must(
    await supabase
      .from('people')
      .update({ photo_asset_id: asset.id })
      .eq('id', personId),
    'staff person photo_asset_id update',
  );

  // 5. 이전 에셋 제거
  if (person?.photo_asset_id) {
    const oldAssetResult = await supabase
      .from('media_assets')
      .select('bucket, path')
      .eq('id', person.photo_asset_id)
      .maybeSingle();
    const oldAsset = oldAssetResult.data;
    if (oldAsset) {
      await supabase.storage.from(oldAsset.bucket).remove([oldAsset.path]);
      await supabase.from('media_assets').delete().eq('id', person.photo_asset_id);
    }
  }

  return asset.id;
}

export async function addStaffMember(name: string, role: string, file: File | null) {
  const supabase = getSupabaseAdmin();
  
  // 1. staff 섹션 조회
  const staffSectionResult = await supabase
    .from('sections')
    .select('id')
    .eq('key', 'staff')
    .maybeSingle();
  const staffSection = staffSectionResult.data;
  if (!staffSection) throw new Error('스태프 섹션(staff)이 존재하지 않습니다.');

  // 2. people 테이블에 새 사람 등록
  const newPerson = must<{ id: string }>(
    await supabase
      .from('people')
      .insert({
        display_name: name.trim(),
        is_active: true,
      })
      .select('id')
      .single(),
    'staff person insert',
  );

  // 3. 파일이 있으면 이미지 업로드 및 photo_asset_id 설정
  if (file && file.size > 0) {
    const id = crypto.randomUUID();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const path = `people/staff_${newPerson.id}_${id}.${ext}`;
    const bytes = await file.arrayBuffer();

    // Storage 업로드
    must(
      await supabase.storage.from(bucketName).upload(path, bytes, {
        contentType: file.type || 'image/webp',
        upsert: true,
      }),
      'staff image upload on create',
    );

    // media_assets 등록
    const asset = must<{ id: string }>(
      await supabase
        .from('media_assets')
        .insert({
          bucket: bucketName,
          path,
          alt_text: 'Staff Photo',
          source: 'supabase',
          is_public: true,
          metadata: { usage: 'staff_photo', person_id: newPerson.id },
        })
        .select('id')
        .single(),
      'staff media insert on create',
    );

    // people 업데이트
    must(
      await supabase
        .from('people')
        .update({ photo_asset_id: asset.id })
        .eq('id', newPerson.id),
      'staff person photo_asset_id set',
    );
  }

  // 4. 멤버십 목록 조회하여 sort_order 구하기
  const maxOrderResult = await supabase
    .from('section_memberships')
    .select('sort_order')
    .eq('section_id', staffSection.id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = Number(maxOrderResult.data?.sort_order ?? -1) + 1;

  // 5. section_memberships에 멤버십 등록
  must(
    await supabase
      .from('section_memberships')
      .insert({
        section_id: staffSection.id,
        person_id: newPerson.id,
        role_text: role.trim(),
        sort_order: nextOrder,
        is_active: true,
      }),
    'staff membership insert',
  );
}

export async function deleteStaffMember(personId: string) {
  const supabase = getSupabaseAdmin();
  
  // 1. staff 섹션 조회
  const staffSectionResult = await supabase
    .from('sections')
    .select('id')
    .eq('key', 'staff')
    .maybeSingle();
  const staffSection = staffSectionResult.data;
  if (!staffSection) throw new Error('스태프 섹션(staff)이 존재하지 않습니다.');

  // 2. 멤버십 삭제
  must(
    await supabase
      .from('section_memberships')
      .delete()
      .eq('section_id', staffSection.id)
      .eq('person_id', personId),
    'staff membership delete',
  );

  // 3. 기존 이미지 에셋 및 Storage 파일 조회 후 삭제
  const person = await supabase
    .from('people')
    .select('photo_asset_id')
    .eq('id', personId)
    .maybeSingle();
  const photoAssetId = person.data?.photo_asset_id;

  if (photoAssetId) {
    const assetResult = await supabase
      .from('media_assets')
      .select('bucket, path')
      .eq('id', photoAssetId)
      .maybeSingle();
    const asset = assetResult.data;
    if (asset) {
      await supabase.storage.from(asset.bucket).remove([asset.path]);
      await supabase.from('media_assets').delete().eq('id', photoAssetId);
    }
  }

  // 4. people 테이블에서 삭제 시도 (참조 에러가 나면 비활성화 처리)
  const { error: deleteError } = await supabase
    .from('people')
    .delete()
    .eq('id', personId);

  if (deleteError) {
    console.warn('Failed to delete person, fall back to deactivation:', deleteError.message);
    await supabase
      .from('people')
      .update({ is_active: false })
      .eq('id', personId);
  }
}

export async function updateStaffMember(personId: string, name: string, role: string) {
  const supabase = getSupabaseAdmin();

  // 1. staff 섹션 조회
  const staffSectionResult = await supabase
    .from('sections')
    .select('id')
    .eq('key', 'staff')
    .maybeSingle();
  const staffSection = staffSectionResult.data;
  if (!staffSection) throw new Error('스태프 섹션(staff)이 존재하지 않습니다.');

  // 2. 이름 수정
  must(
    await supabase
      .from('people')
      .update({ display_name: name.trim() })
      .eq('id', personId),
    'staff person name update',
  );

  // 3. 역할 수정
  must(
    await supabase
      .from('section_memberships')
      .update({ role_text: role.trim() })
      .eq('section_id', staffSection.id)
      .eq('person_id', personId),
    'staff membership role update',
  );
}
