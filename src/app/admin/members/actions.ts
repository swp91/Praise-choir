'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { parseMemberForm } from '@/lib/admin/member-form';
import {
  createMember,
  deleteMember,
  reorderSectionMembers,
  setMemberActive,
  updateMember,
} from '@/lib/admin/members';

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin');
  }
}

function errorRedirect(error: string): never {
  redirect(`/admin/members?error=${encodeURIComponent(error)}`);
}

export async function createMemberAction(formData: FormData) {
  await requireAdmin();

  const parsed = parseMemberForm(formData);
  if (!parsed.ok) errorRedirect(parsed.errors.join(' '));

  try {
    await createMember(parsed.value);
  } catch (err: any) {
    errorRedirect(`대원을 등록하지 못했습니다. (${err.message ?? '이유 알 수 없음'})`);
  }

  revalidatePath('/members');
  revalidatePath('/admin/members');
  redirect('/admin/members?success=' + encodeURIComponent('대원이 성공적으로 등록되었습니다.'));
}

export async function updateMemberAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) errorRedirect('수정할 대원을 찾지 못했습니다.');

  const parsed = parseMemberForm(formData);
  if (!parsed.ok) errorRedirect(parsed.errors.join(' '));

  try {
    await updateMember(id, parsed.value);
  } catch (err: any) {
    errorRedirect(`대원 정보를 수정하지 못했습니다. (${err.message ?? '이유 알 수 없음'})`);
  }

  revalidatePath('/members');
  revalidatePath('/admin/members');
  redirect('/admin/members?success=' + encodeURIComponent('대원 정보가 성공적으로 수정되었습니다.'));
}

export async function setMemberActiveAction(id: string, active: boolean) {
  await requireAdmin();
  await setMemberActive(id, active);
  revalidatePath('/members');
  revalidatePath('/admin/members');
}

export async function reorderSectionMembersAction(sectionId: string, orderedPersonIds: string[]) {
  await requireAdmin();
  await reorderSectionMembers(sectionId, orderedPersonIds);
  revalidatePath('/members');
  revalidatePath('/admin/members');
}

export async function deleteMemberAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) errorRedirect('삭제할 대원을 찾지 못했습니다.');

  try {
    await deleteMember(id);
  } catch (err: any) {
    errorRedirect(`대원을 삭제하지 못했습니다. (${err.message ?? '이유 알 수 없음'})`);
  }

  revalidatePath('/members');
  revalidatePath('/admin/members');
  redirect('/admin/members?success=' + encodeURIComponent('대원이 성공적으로 삭제되었습니다.'));
}
