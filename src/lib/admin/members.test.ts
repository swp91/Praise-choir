import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMemberForm } from './member-form.ts';
import { buildMemberReorderUpdates } from './member-reorder.ts';

test('parses a member form into normalized fields', () => {
  const formData = new FormData();
  formData.set('display_name', '  홍길동 집사 ');
  formData.set('section_id', 'section-1');
  formData.set('role_text', '  파트장 ');
  formData.set('instrument_id', '');
  formData.set('birth_label', '1. 2');
  formData.set('birth_is_lunar', 'on');
  formData.set('phone_label', '010-1234-5678');
  formData.set('show_phone', 'on');
  formData.set('photo_url', ' https://example.com/photo.jpg ');

  const result = parseMemberForm(formData);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.value, {
    displayName: '홍길동 집사',
    sectionId: 'section-1',
    roleText: '파트장',
    instrumentId: null,
    birthLabel: '1. 2',
    birthIsLunar: true,
    phoneLabel: '010-1234-5678',
    showBirth: false,
    showPhone: true,
    photoUrl: 'https://example.com/photo.jpg',
  });
});

test('rejects missing required member fields', () => {
  const formData = new FormData();

  const result = parseMemberForm(formData);

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(result.errors, ['이름을 입력해 주세요.', '소속 파트를 선택해 주세요.']);
});

test('builds reorder updates for both people and section memberships', () => {
  assert.deepEqual(buildMemberReorderUpdates('section-1', ['person-a', 'person-b']), [
    { personId: 'person-a', sectionId: 'section-1', sortOrder: 1 },
    { personId: 'person-b', sectionId: 'section-1', sortOrder: 2 },
  ]);
});
