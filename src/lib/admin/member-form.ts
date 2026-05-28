export type MemberFormValue = {
  displayName: string;
  sectionId: string;
  roleText: string | null;
  instrumentId: string | null;
  birthLabel: string | null;
  birthIsLunar: boolean;
  phoneLabel: string | null;
  showBirth: boolean;
  showPhone: boolean;
  photoUrl: string | null;
};

function text(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? '').trim();
  return value || null;
}

export function parseMemberForm(formData: FormData):
  | { ok: true; value: MemberFormValue }
  | { ok: false; errors: string[] } {
  const displayName = text(formData, 'display_name');
  const sectionId = text(formData, 'section_id');
  const errors: string[] = [];

  if (!displayName) errors.push('이름을 입력해 주세요.');
  if (!sectionId) errors.push('소속 파트를 선택해 주세요.');
  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      displayName: displayName ?? '',
      sectionId: sectionId ?? '',
      roleText: text(formData, 'role_text'),
      instrumentId: text(formData, 'instrument_id'),
      birthLabel: text(formData, 'birth_label'),
      birthIsLunar: formData.get('birth_is_lunar') === 'on',
      phoneLabel: text(formData, 'phone_label'),
      showBirth: formData.get('show_birth') === 'on',
      showPhone: formData.get('show_phone') === 'on',
      photoUrl: text(formData, 'photo_url'),
    },
  };
}
