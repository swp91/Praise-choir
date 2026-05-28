import { randomUUID } from 'node:crypto';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import type { MemberFormValue } from './member-form';

type DbError = {
  message?: string;
};

export type AdminMember = MemberFormValue & {
  id: string;
  sortOrder: number;
  isActive: boolean;
  sectionName: string;
  instrumentName: string | null;
  membershipId: string | null;
};

export type AdminMemberOption = {
  id: string;
  label: string;
};

export type AdminMembersData = {
  configured: boolean;
  members: AdminMember[];
  sections: AdminMemberOption[];
  instruments: AdminMemberOption[];
};

function must<T>(result: { data: T | null; error: DbError | null }, label: string) {
  if (result.error) throw new Error(`${label}: ${result.error.message ?? 'unknown error'}`);
  return result.data as T;
}

function publicAssetUrl(asset: { bucket: string; path: string; external_url: string | null } | undefined) {
  if (!asset) return null;
  if (asset.external_url) return asset.external_url;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${asset.bucket}/${asset.path}`;
}

async function getOrCreateExternalPhotoAsset(photoUrl: string | null, displayName: string) {
  if (!photoUrl) return null;

  const supabase = getSupabaseAdmin();
  const existing = await supabase
    .from('media_assets')
    .select('id')
    .eq('external_url', photoUrl)
    .maybeSingle();

  if (existing.error) throw new Error(`사진 조회 실패: ${existing.error.message}`);
  if (existing.data?.id) return existing.data.id as string;

  const inserted = await supabase
    .from('media_assets')
    .insert({
      bucket: 'public-media',
      path: `external/members/${randomUUID()}`,
      alt_text: `${displayName} 사진`,
      source: 'external',
      external_url: photoUrl,
      is_public: true,
    })
    .select('id')
    .single();

  return must<{ id: string }>(inserted, '사진 등록 실패').id;
}

export async function getAdminMembersData(): Promise<AdminMembersData> {
  if (!isSupabaseAdminConfigured()) {
    return {
      configured: false,
      members: [],
      sections: [],
      instruments: [],
    };
  }

  const supabase = getSupabaseAdmin();
  const [peopleResult, privateResult, membershipsResult, sectionsResult, instrumentsResult, mediaResult] = await Promise.all([
    supabase.from('people').select('*').order('is_active', { ascending: false }).order('sort_order').order('display_name'),
    supabase.from('person_private').select('*'),
    supabase.from('section_memberships').select('*').order('sort_order'),
    supabase.from('sections').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('instruments').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('media_assets').select('id,bucket,path,external_url'),
  ]);

  const people = must<Record<string, unknown>[]>(peopleResult, '대원 목록 조회 실패');
  const privateRows = must<Record<string, unknown>[]>(privateResult, '개인 정보 조회 실패');
  const memberships = must<Record<string, unknown>[]>(membershipsResult, '소속 정보 조회 실패');
  const sections = must<Record<string, unknown>[]>(sectionsResult, '파트 조회 실패');
  const instruments = must<Record<string, unknown>[]>(instrumentsResult, '악기 조회 실패');
  const media = must<{ id: string; bucket: string; path: string; external_url: string | null }[]>(mediaResult, '사진 조회 실패');

  const privateByPersonId = new Map(privateRows.map((row) => [String(row.person_id), row]));
  const sectionById = new Map(sections.map((section) => [String(section.id), section]));
  const instrumentById = new Map(instruments.map((instrument) => [String(instrument.id), instrument]));
  const mediaById = new Map(media.map((asset) => [asset.id, asset]));

  return {
    configured: true,
    sections: sections.map((section) => ({
      id: String(section.id),
      label: String(section.name_ko),
    })),
    instruments: instruments.map((instrument) => ({
      id: String(instrument.id),
      label: String(instrument.name_ko),
    })),
    members: people.map((person) => {
      const membership = memberships.find((row) => row.person_id === person.id && row.is_active !== false) ?? null;
      const section = membership ? sectionById.get(String(membership.section_id)) : undefined;
      const instrument = membership?.instrument_id ? instrumentById.get(String(membership.instrument_id)) : undefined;
      const privateRow = privateByPersonId.get(String(person.id));
      const photo = mediaById.get(String(person.photo_asset_id ?? ''));

      return {
        id: String(person.id),
        displayName: String(person.display_name),
        sectionId: membership ? String(membership.section_id) : '',
        sectionName: section ? String(section.name_ko) : '미지정',
        roleText: membership?.role_text ? String(membership.role_text) : null,
        instrumentId: membership?.instrument_id ? String(membership.instrument_id) : null,
        instrumentName: instrument ? String(instrument.name_ko) : null,
        membershipId: membership ? String(membership.id) : null,
        birthLabel: person.birth_label ? String(person.birth_label) : privateRow?.birth_raw ? String(privateRow.birth_raw) : null,
        birthIsLunar: Boolean(person.birth_is_lunar),
        phoneLabel: person.phone_label ? String(person.phone_label) : privateRow?.phone_raw ? String(privateRow.phone_raw) : null,
        showBirth: person.show_birth !== false,
        showPhone: person.show_phone !== false,
        sortOrder: Number(person.sort_order ?? 0),
        photoUrl: publicAssetUrl(photo) ?? null,
        isActive: person.is_active !== false,
      };
    }),
  };
}

export async function createMember(value: MemberFormValue) {
  const supabase = getSupabaseAdmin();
  const photoAssetId = await getOrCreateExternalPhotoAsset(value.photoUrl, value.displayName);

  const maxResult = await supabase
    .from('section_memberships')
    .select('sort_order')
    .eq('section_id', value.sectionId)
    .eq('is_active', true)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = (Number(maxResult.data?.sort_order ?? 0)) + 1;

  const person = must<{ id: string }>(
    await supabase
      .from('people')
      .insert({
        display_name: value.displayName,
        photo_asset_id: photoAssetId,
        birth_label: value.birthLabel,
        birth_is_lunar: value.birthIsLunar,
        phone_label: value.phoneLabel,
        show_birth: value.showBirth,
        show_phone: value.showPhone,
        sort_name: value.displayName,
        sort_order: nextSortOrder,
        is_active: true,
      })
      .select('id')
      .single(),
    '대원 등록 실패',
  );

  must(
    await supabase.from('person_private').insert({
      person_id: person.id,
      birth_raw: value.birthLabel,
      phone_raw: value.phoneLabel,
    }),
    '개인 정보 등록 실패',
  );

  must(
    await supabase.from('section_memberships').insert({
      person_id: person.id,
      section_id: value.sectionId,
      role_text: value.roleText,
      instrument_id: value.instrumentId,
      sort_order: nextSortOrder,
      is_active: true,
    }),
    '소속 등록 실패',
  );

  must(
    await supabase.from('admin_audit_logs').insert({
      action: 'create',
      entity_table: 'people',
      entity_id: person.id,
      metadata: { display_name: value.displayName },
    }),
    '관리 로그 등록 실패',
  );
}

export async function updateMember(id: string, value: MemberFormValue) {
  const supabase = getSupabaseAdmin();
  const photoAssetId = await getOrCreateExternalPhotoAsset(value.photoUrl, value.displayName);

  must(
    await supabase
      .from('people')
      .update({
        display_name: value.displayName,
        photo_asset_id: photoAssetId,
        birth_label: value.birthLabel,
        birth_is_lunar: value.birthIsLunar,
        phone_label: value.phoneLabel,
        show_birth: value.showBirth,
        show_phone: value.showPhone,
        sort_name: value.displayName,
        is_active: true,
      })
      .eq('id', id),
    '대원 수정 실패',
  );

  must(
    await supabase.from('person_private').upsert({
      person_id: id,
      birth_raw: value.birthLabel,
      phone_raw: value.phoneLabel,
    }),
    '개인 정보 수정 실패',
  );

  const membership = await supabase
    .from('section_memberships')
    .select('id')
    .eq('person_id', id)
    .eq('is_active', true)
    .order('sort_order')
    .limit(1)
    .maybeSingle();

  if (membership.error) throw new Error(`소속 조회 실패: ${membership.error.message}`);

  const membershipPayload = {
    person_id: id,
    section_id: value.sectionId,
    role_text: value.roleText,
    instrument_id: value.instrumentId,
    is_active: true,
  };

  if (membership.data?.id) {
    must(
      await supabase.from('section_memberships').update(membershipPayload).eq('id', membership.data.id),
      '소속 수정 실패',
    );
  } else {
    must(
      await supabase.from('section_memberships').insert(membershipPayload),
      '소속 등록 실패',
    );
  }

  must(
    await supabase.from('admin_audit_logs').insert({
      action: 'update',
      entity_table: 'people',
      entity_id: id,
      metadata: { display_name: value.displayName },
    }),
    '관리 로그 등록 실패',
  );
}

export async function setMemberActive(id: string, active: boolean) {
  const supabase = getSupabaseAdmin();
  must(
    await supabase.from('people').update({ is_active: active }).eq('id', id),
    '상태 변경 실패',
  );
  must(
    await supabase.from('section_memberships').update({ is_active: active }).eq('person_id', id),
    '소속 상태 변경 실패',
  );
  must(
    await supabase.from('admin_audit_logs').insert({
      action: active ? 'activate' : 'deactivate',
      entity_table: 'people',
      entity_id: id,
    }),
    '관리 로그 등록 실패',
  );
}

export async function reorderSectionMembers(sectionId: string, orderedPersonIds: string[]) {
  const supabase = getSupabaseAdmin();
  await Promise.all(
    orderedPersonIds.map((personId, index) =>
      supabase
        .from('people')
        .update({ sort_order: index + 1 })
        .eq('id', personId),
    ),
  );
  must(
    await supabase.from('admin_audit_logs').insert({
      action: 'reorder',
      entity_table: 'section_memberships',
      entity_id: sectionId,
      metadata: { ordered_person_ids: orderedPersonIds },
    }),
    '관리 로그 등록 실패',
  );
}

export async function deactivateMember(id: string) {
  const supabase = getSupabaseAdmin();

  must(
    await supabase.from('people').update({ is_active: false }).eq('id', id),
    '대원 비활성화 실패',
  );
  must(
    await supabase.from('section_memberships').update({ is_active: false }).eq('person_id', id),
    '소속 비활성화 실패',
  );
  must(
    await supabase.from('admin_audit_logs').insert({
      action: 'deactivate',
      entity_table: 'people',
      entity_id: id,
    }),
    '관리 로그 등록 실패',
  );
}
