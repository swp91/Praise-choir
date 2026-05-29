import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/admin';

type DbError = { message?: string };

type MediaRow = {
  id: string;
  bucket: string;
  path: string;
  source: string;
  external_url: string | null;
};

export type AdminLeaderPersonOption = {
  id: string;
  label: string;
  sectionName: string;
  photoUrl: string | null;
  sortOrder: number;
  sectionSortOrder: number;
};

export type AdminMusicStaff = {
  id: string;
  personId: string;
  roleText: string;
  name: string;
  sectionName: string;
  photoUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type AdminOfficer = {
  id: string;
  personId: string;
  name: string;
  sectionName: string;
  roleText: string;
  photoUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type AdminLeadershipData = {
  configured: boolean;
  musicStaff: AdminMusicStaff[];
  officers: AdminOfficer[];
  people: AdminLeaderPersonOption[];
};

export type MusicStaffFormValue = {
  id: string;
  roleText: string;
};

export type OfficerFormValue = {
  id?: string;
  personId: string;
  roleText: string;
  isActive: boolean;
};

function must<T>(result: { data: T | null; error: DbError | null }, label: string) {
  if (result.error) throw new Error(`${label}: ${result.error.message ?? 'unknown error'}`);
  return result.data as T;
}

function text(value: FormDataEntryValue | null) {
  const raw = String(value ?? '').trim();
  return raw || null;
}

function requiredText(value: FormDataEntryValue | null) {
  return String(value ?? '').trim();
}

function publicAssetUrl(asset: MediaRow | undefined) {
  if (!asset) return null;
  if (asset.source === 'supabase' && asset.bucket && asset.path) {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${asset.bucket}/${asset.path}`;
  }
  return asset.external_url;
}

export function parseMusicStaffForm(formData: FormData): MusicStaffFormValue {
  return {
    id: requiredText(formData.get('id')),
    roleText: requiredText(formData.get('role_text')),
  };
}

export function parseOfficerForm(formData: FormData): OfficerFormValue {
  return {
    id: text(formData.get('id')) ?? undefined,
    personId: requiredText(formData.get('person_id')),
    roleText: requiredText(formData.get('role_text')),
    isActive: formData.get('is_active') === 'on',
  };
}

export async function getAdminLeadershipData(): Promise<AdminLeadershipData> {
  if (!isSupabaseAdminConfigured()) {
    return { configured: false, musicStaff: [], officers: [], people: [] };
  }

  const supabase = getSupabaseAdmin();
  const [assignmentsResult, peopleResult, membershipsResult, sectionsResult, mediaResult] = await Promise.all([
    supabase.from('leadership_assignments').select('*').order('group_key').order('sort_order'),
    supabase.from('people').select('*').order('is_active', { ascending: false }).order('sort_order').order('display_name'),
    supabase.from('section_memberships').select('*').order('sort_order'),
    supabase.from('sections').select('id,key,name_ko,sort_order').eq('is_active', true),
    supabase.from('media_assets').select('id,bucket,path,source,external_url'),
  ]);

  const assignments = must<Record<string, unknown>[]>(assignmentsResult, '임원 정보 조회 실패');
  const people = must<Record<string, unknown>[]>(peopleResult, '대원 목록 조회 실패');
  const memberships = must<Record<string, unknown>[]>(membershipsResult, '소속 정보 조회 실패');
  const sections = must<Record<string, unknown>[]>(sectionsResult, '파트 조회 실패');
  const media = must<MediaRow[]>(mediaResult, '사진 조회 실패');

  const peopleById = new Map(people.map((person) => [String(person.id), person]));
  const sectionById = new Map(sections.map((section) => [String(section.id), section]));
  const activeMemberships = memberships.filter((membership) => membership.is_active !== false);
  const membershipByPersonId = new Map(activeMemberships.map((membership) => [String(membership.person_id), membership]));
  const staffSection = sections.find((section) => section.key === 'staff');
  const mediaById = new Map(media.map((asset) => [asset.id, asset]));

  return {
    configured: true,
    musicStaff: memberships
      .filter((membership) => staffSection && membership.section_id === staffSection.id)
      .map((membership) => {
        const person = peopleById.get(String(membership.person_id));
        const photo = mediaById.get(String(person?.photo_asset_id ?? ''));
        return {
          id: String(membership.id),
          personId: String(membership.person_id ?? ''),
          roleText: String(membership.role_text ?? ''),
          name: String(person?.display_name ?? ''),
          sectionName: staffSection ? String(staffSection.name_ko) : '스태프',
          photoUrl: publicAssetUrl(photo),
          sortOrder: Number(membership.sort_order ?? 0),
          isActive: membership.is_active !== false && person?.is_active !== false,
        };
      }),
    officers: assignments
      .filter((assignment) => assignment.group_key === 'officers')
      .map((assignment) => {
        const person = assignment.person_id ? peopleById.get(String(assignment.person_id)) : undefined;
        const membership = person ? membershipByPersonId.get(String(person.id)) : undefined;
        const section = membership ? sectionById.get(String(membership.section_id)) : undefined;
        const photo = mediaById.get(String(assignment.photo_asset_id ?? person?.photo_asset_id ?? ''));
        return {
          id: String(assignment.id),
          personId: String(assignment.person_id ?? ''),
          name: String(person?.display_name ?? ''),
          sectionName: section ? String(section.name_ko) : '미지정',
          roleText: String(assignment.role_text ?? ''),
          photoUrl: publicAssetUrl(photo),
          sortOrder: Number(assignment.sort_order ?? 0),
          isActive: assignment.is_active !== false,
        };
      }),
    people: people
      .map((person) => {
        const membership = membershipByPersonId.get(String(person.id));
        const section = membership ? sectionById.get(String(membership.section_id)) : undefined;
        const photo = mediaById.get(String(person.photo_asset_id ?? ''));
        return {
          id: String(person.id),
          label: String(person.display_name),
          sectionName: section ? String(section.name_ko) : '미지정',
          photoUrl: publicAssetUrl(photo),
          sortOrder: Number(membership?.sort_order ?? person.sort_order ?? 0),
          sectionSortOrder: Number(section?.sort_order ?? 999),
        };
      })
      .sort((a, b) => {
        if (a.sectionSortOrder !== b.sectionSortOrder) return a.sectionSortOrder - b.sectionSortOrder;
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.label.localeCompare(b.label, 'ko');
      }),
  };
}

export async function updateMusicStaff(value: MusicStaffFormValue) {
  if (!value.id || !value.roleText) throw new Error('필수 입력값이 없습니다.');
  const supabase = getSupabaseAdmin();
  must(
    await supabase.from('section_memberships').update({ role_text: value.roleText }).eq('id', value.id),
    '스태프 수정 실패',
  );
}

export async function setMusicStaffActive(id: string, active: boolean) {
  const supabase = getSupabaseAdmin();
  must(
    await supabase.from('section_memberships').update({ is_active: active }).eq('id', id),
    '스태프 공개 상태 변경 실패',
  );
}

export async function reorderMusicStaff(orderedIds: string[]) {
  const supabase = getSupabaseAdmin();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('section_memberships').update({ sort_order: index }).eq('id', id),
    ),
  );
}

export async function createOfficer(value: OfficerFormValue) {
  if (!value.personId || !value.roleText) throw new Error('필수 입력값이 없습니다.');
  const supabase = getSupabaseAdmin();
  const maxResult = await supabase
    .from('leadership_assignments')
    .select('sort_order')
    .eq('group_key', 'officers')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = Number(maxResult.data?.sort_order ?? -1) + 1;

  must(
    await supabase.from('leadership_assignments').insert({
      person_id: value.personId,
      group_key: 'officers',
      role_text: value.roleText,
      sort_order: nextOrder,
      is_active: value.isActive,
    }),
    '임원 추가 실패',
  );
}

export async function updateOfficer(value: OfficerFormValue) {
  if (!value.id || !value.roleText) throw new Error('필수 입력값이 없습니다.');
  const supabase = getSupabaseAdmin();
  must(
    await supabase
      .from('leadership_assignments')
      .update({
        role_text: value.roleText,
        is_active: value.isActive,
      })
      .eq('id', value.id)
      .eq('group_key', 'officers'),
    '임원 수정 실패',
  );
}

export async function setOfficerActive(id: string, active: boolean) {
  const supabase = getSupabaseAdmin();
  must(
    await supabase
      .from('leadership_assignments')
      .update({ is_active: active })
      .eq('id', id)
      .eq('group_key', 'officers'),
    '임원 공개 상태 변경 실패',
  );
}

export async function reorderOfficers(orderedIds: string[]) {
  const supabase = getSupabaseAdmin();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('leadership_assignments')
        .update({ sort_order: index })
        .eq('id', id)
        .eq('group_key', 'officers'),
    ),
  );
}

export async function deleteOfficer(id: string) {
  const supabase = getSupabaseAdmin();
  must(
    await supabase.from('leadership_assignments').delete().eq('id', id).eq('group_key', 'officers'),
    '임원 해제 실패',
  );
}
