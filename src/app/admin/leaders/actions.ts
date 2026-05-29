'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import {
  createOfficer,
  deleteOfficer,
  parseMusicStaffForm,
  parseOfficerForm,
  reorderOfficers,
  setOfficerActive,
  updateMusicStaff,
  updateOfficer,
} from '@/lib/admin/leadership';

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect('/admin');
}

function errorRedirect(error: string): never {
  redirect(`/admin/leaders?error=${encodeURIComponent(error)}#leaders-message`);
}

function revalidateLeadership() {
  revalidatePath('/leaders');
  revalidatePath('/admin/leaders');
}

export async function updateMusicStaffAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseMusicStaffForm(formData);
  if (!parsed.id || !parsed.roleText || !parsed.name) {
    errorRedirect('상단 스태프의 직무와 이름을 입력해 주세요.');
  }

  try {
    await updateMusicStaff(parsed);
  } catch {
    errorRedirect('상단 스태프 정보를 저장하지 못했습니다. Supabase 관리자 키 설정을 확인해 주세요.');
  }

  revalidateLeadership();
  redirect(`/admin/leaders#staff-${parsed.id}`);
}

export async function createOfficerAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseOfficerForm(formData);
  if (!parsed.personId || !parsed.roleText) {
    errorRedirect('대원과 직무를 선택해 주세요.');
  }

  try {
    await createOfficer(parsed);
  } catch {
    errorRedirect('임원을 추가하지 못했습니다. Supabase 관리자 키 설정을 확인해 주세요.');
  }

  revalidateLeadership();
  redirect('/admin/leaders#officers');
}

export async function updateOfficerAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseOfficerForm(formData);
  if (!parsed.id || !parsed.roleText) {
    errorRedirect('수정할 임원과 직무를 확인해 주세요.');
  }

  try {
    await updateOfficer(parsed);
  } catch {
    errorRedirect('임원 정보를 수정하지 못했습니다. Supabase 관리자 키 설정을 확인해 주세요.');
  }

  revalidateLeadership();
  redirect(`/admin/leaders#officer-${parsed.id}`);
}

export async function setOfficerActiveAction(id: string, active: boolean) {
  await requireAdmin();
  await setOfficerActive(id, active);
  revalidateLeadership();
}

export async function reorderOfficersAction(orderedIds: string[]) {
  await requireAdmin();
  await reorderOfficers(orderedIds);
  revalidateLeadership();
}

export async function deleteOfficerAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) errorRedirect('해제할 임원을 찾지 못했습니다.');

  try {
    await deleteOfficer(id);
  } catch {
    errorRedirect('임원을 해제하지 못했습니다. Supabase 관리자 키 설정을 확인해 주세요.');
  }

  revalidateLeadership();
  redirect('/admin/leaders#officers');
}
