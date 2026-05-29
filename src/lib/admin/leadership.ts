import { randomUUID } from 'node:crypto';
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
};

export type AdminMusicStaff = {
  id: string;
  roleText: string;
  roleEn: string;
  name: string;
  sinceText: string;
  birthLabel: string;
  phoneLabel: string;
  note: string;
  photoUrl: string | null;
  photoAssetId: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type AdminOfficer = {
  id: string;
  personId: string;
  name: string;
  sectionName: string;
  roleText: string;
  roleEn: string;
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
  roleEn: string | null;
  name: string;
  sinceText: string | null;
  birthLabel: string | null;
  phoneLabel: string | null;
  note: string | null;
  isActive: boolean;
  photoFile: File | null;
};

export type OfficerFormValue = {
  id?: string;
  personId: string;
  roleText: string;
  roleEn: string | null;
  sortOrder: number | null;
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

function extensionFromFile(file: File) {
  const contentType = file.type.split(';')[0].toLowerCase();
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  if (contentType === 'image/gif') return 'gif';
  if (contentType === 'image/avif') return 'avif';
  return 'jpg';
}

function safeFileNameSeed(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'leader';
}

function fileFromForm(formData: FormData) {
  const file = formData.get('photo_file');
  if (!(file instanceof File) || !file.size) return null;
  return file;
}

async function uploadLeadershipPhoto(file: File | null, name: string) {
  if (!file) return null;
  if (!file.type.startsWith('image/')) throw new Error('사진 파일은 이미지 형식이어야 합니다.');

  const supabase = getSupabaseAdmin();
  const path = `leaders/uploads/${safeFileNameSeed(name)}-${randomUUID()}.${extensionFromFile(file)}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const upload = await supabase.storage.from('public-media').upload(path, bytes, {
    contentType: file.type || 'image/jpeg',
    cacheControl: '31536000',
    upsert: false,
  });

  if (upload.error) throw new Error(`사진 업로드 실패: ${upload.error.message}`);

  const inserted = await supabase
    .from('media_assets')
    .insert({
      bucket: 'public-media',
      path,
      alt_text: `${name} 사진`,
      source: 'supabase',
      mime_type: file.type || 'image/jpeg',
      size_bytes: file.size,
      metadata: { original_file_name: file.name },
      is_public: true,
    })
    .select('id')
    .single();

  return must<{ id: string }>(inserted, '사진 등록 실패').id;
}

export function parseMusicStaffForm(formData: FormData): MusicStaffFormValue {
  return {
    id: requiredText(formData.get('id')),
    roleText: requiredText(formData.get('role_text')),
    roleEn: text(formData.get('role_en')),
    name: requiredText(formData.get('name')),
    sinceText: text(formData.get('since_text')),
    birthLabel: text(formData.get('birth_label')),
    phoneLabel: text(formData.get('phone_label')),
    note: text(formData.get('note')),
    isActive: formData.get('is_active') === 'on',
    photoFile: fileFromForm(formData),
  };
}

export function parseOfficerForm(formData: FormData): OfficerFormValue {
  return {
    id: text(formData.get('id')) ?? undefined,
    personId: requiredText(formData.get('person_id')),
    roleText: requiredText(formData.get('role_text')),
    roleEn: text(formData.get('role_en')),
    sortOrder: Number(formData.get('sort_order') || '') || null,
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
    supabase.from('section_memberships').select('*').eq('is_active', true),
    supabase.from('sections').select('id,name_ko').eq('is_active', true),
    supabase.from('media_assets').select('id,bucket,path,source,external_url'),
  ]);

  const assignments = must<Record<string, unknown>[]>(assignmentsResult, '임원 정보 조회 실패');
  const people = must<Record<string, unknown>[]>(peopleResult, '대원 목록 조회 실패');
  const memberships = must<Record<string, unknown>[]>(membershipsResult, '소속 정보 조회 실패');
  const sections = must<Record<string, unknown>[]>(sectionsResult, '파트 조회 실패');
  const media = must<MediaRow[]>(mediaResult, '사진 조회 실패');

  const peopleById = new Map(people.map((person) => [String(person.id), person]));
  const sectionById = new Map(sections.map((section) => [String(section.id), String(section.name_ko)]));
  const membershipByPersonId = new Map(memberships.map((membership) => [String(membership.person_id), membership]));
  const mediaById = new Map(media.map((asset) => [asset.id, asset]));

  return {
    configured: true,
    musicStaff: assignments
      .filter((assignment) => assignment.group_key === 'music_ministry')
      .map((assignment) => {
        const person = assignment.person_id ? peopleById.get(String(assignment.person_id)) : undefined;
        const photo = mediaById.get(String(assignment.photo_asset_id ?? person?.photo_asset_id ?? ''));
        return {
          id: String(assignment.id),
          roleText: String(assignment.role_text ?? ''),
          roleEn: String(assignment.role_en ?? ''),
          name: String(assignment.external_name ?? person?.display_name ?? ''),
          sinceText: String(assignment.since_text ?? ''),
          birthLabel: String(assignment.external_birth_label ?? person?.birth_label ?? ''),
          phoneLabel: String(assignment.external_phone_label ?? person?.phone_label ?? ''),
          note: String(assignment.note ?? ''),
          photoUrl: publicAssetUrl(photo),
          photoAssetId: assignment.photo_asset_id ? String(assignment.photo_asset_id) : null,
          sortOrder: Number(assignment.sort_order ?? 0),
          isActive: assignment.is_active !== false,
        };
      }),
    officers: assignments
      .filter((assignment) => assignment.group_key === 'officers')
      .map((assignment) => {
        const person = assignment.person_id ? peopleById.get(String(assignment.person_id)) : undefined;
        const membership = person ? membershipByPersonId.get(String(person.id)) : undefined;
        const sectionName = membership ? sectionById.get(String(membership.section_id)) : undefined;
        const photo = mediaById.get(String(assignment.photo_asset_id ?? person?.photo_asset_id ?? ''));
        return {
          id: String(assignment.id),
          personId: String(assignment.person_id ?? ''),
          name: String(person?.display_name ?? ''),
          sectionName: sectionName ?? '미지정',
          roleText: String(assignment.role_text ?? ''),
          roleEn: String(assignment.role_en ?? ''),
          photoUrl: publicAssetUrl(photo),
          sortOrder: Number(assignment.sort_order ?? 0),
          isActive: assignment.is_active !== false,
        };
      }),
    people: people.map((person) => {
      const membership = membershipByPersonId.get(String(person.id));
      const sectionName = membership ? sectionById.get(String(membership.section_id)) : '미지정';
      const photo = mediaById.get(String(person.photo_asset_id ?? ''));
      return {
        id: String(person.id),
        label: String(person.display_name),
        sectionName: sectionName ?? '미지정',
        photoUrl: publicAssetUrl(photo),
      };
    }),
  };
}

export async function updateMusicStaff(value: MusicStaffFormValue) {
  if (!value.id || !value.roleText || !value.name) throw new Error('필수 입력값이 없습니다.');
  const supabase = getSupabaseAdmin();
  const photoAssetId = await uploadLeadershipPhoto(value.photoFile, value.name);

  const payload: Record<string, unknown> = {
    person_id: null,
    group_key: 'music_ministry',
    role_text: value.roleText,
    role_en: value.roleEn,
    since_text: value.sinceText,
    note: value.note,
    external_name: value.name,
    external_birth_label: value.birthLabel,
    external_phone_label: value.phoneLabel,
    external_show_birth: true,
    external_show_phone: true,
    is_active: value.isActive,
  };
  if (photoAssetId) payload.photo_asset_id = photoAssetId;

  must(
    await supabase.from('leadership_assignments').update(payload).eq('id', value.id),
    '상단 스태프 수정 실패',
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
  const nextOrder = value.sortOrder ?? (Number(maxResult.data?.sort_order ?? -1) + 1);

  must(
    await supabase.from('leadership_assignments').insert({
      person_id: value.personId,
      group_key: 'officers',
      role_text: value.roleText,
      role_en: value.roleEn,
      sort_order: nextOrder,
      is_active: value.isActive,
    }),
    '임원 추가 실패',
  );
}

export async function updateOfficer(value: OfficerFormValue) {
  if (!value.id || !value.personId || !value.roleText) throw new Error('필수 입력값이 없습니다.');
  const supabase = getSupabaseAdmin();
  must(
    await supabase
      .from('leadership_assignments')
      .update({
        person_id: value.personId,
        role_text: value.roleText,
        role_en: value.roleEn,
        sort_order: value.sortOrder ?? 0,
        is_active: value.isActive,
      })
      .eq('id', value.id)
      .eq('group_key', 'officers'),
    '임원 수정 실패',
  );
}

export async function deleteOfficer(id: string) {
  const supabase = getSupabaseAdmin();
  must(
    await supabase.from('leadership_assignments').delete().eq('id', id).eq('group_key', 'officers'),
    '임원 해제 실패',
  );
}
