'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import {
  updateSlogans,
  uploadSpecialImage,
  uploadIntroPhoto,
  deleteIntroPhoto,
  reorderIntroPhotos,
  addContactMember,
  deleteContactMember,
  reorderContactMembers,
} from '@/lib/admin/main';

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect('/admin');
}

function errorRedirect(error: string): never {
  redirect(`/admin/main?error=${encodeURIComponent(error)}`);
}

function revalidateMain() {
  revalidatePath('/');
  revalidatePath('/admin/main');
}

export async function updateSloganAction(formData: FormData) {
  await requireAdmin();
  const themeKo = String(formData.get('theme_ko') ?? '');
  const themeEn = String(formData.get('theme_en') ?? '');
  const heroPosition = String(formData.get('hero_position') ?? 'center 30%');

  try {
    await updateSlogans(themeKo, themeEn, heroPosition);
  } catch (err: any) {
    errorRedirect(err.message ?? '슬로건 업데이트 실패');
  }

  revalidateMain();
  redirect('/admin/main');
}

export async function uploadHeroImageAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get('hero_image') as File;
  if (!file || file.size === 0) errorRedirect('업로드할 이미지 파일을 선택하세요.');

  try {
    await uploadSpecialImage('hero_bg', null, file);
  } catch (err: any) {
    errorRedirect(err.message ?? '히어로 이미지 업로드 실패');
  }

  revalidateMain();
  redirect('/admin/main');
}

export async function uploadServantsBgAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get('servants_bg') as File;
  if (!file || file.size === 0) errorRedirect('업로드할 이미지 파일을 선택하세요.');

  try {
    await uploadSpecialImage('servants_bg', null, file);
  } catch (err: any) {
    errorRedirect(err.message ?? '섬기는 사람들 배경 업로드 실패');
  }

  revalidateMain();
  redirect('/admin/main');
}

export async function uploadPracticeBgAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get('practice_bg') as File;
  if (!file || file.size === 0) errorRedirect('업로드할 이미지 파일을 선택하세요.');

  try {
    await uploadSpecialImage('practice_bg', null, file);
  } catch (err: any) {
    errorRedirect(err.message ?? '시간표 배경 업로드 실패');
  }

  revalidateMain();
  redirect('/admin/main');
}

export async function uploadPartPhotoAction(formData: FormData) {
  await requireAdmin();
  const key = String(formData.get('section_key') ?? '');
  const file = formData.get('section_image') as File;
  if (!key) errorRedirect('올바르지 않은 파트 지정입니다.');
  if (!file || file.size === 0) errorRedirect('업로드할 이미지 파일을 선택하세요.');

  try {
    await uploadSpecialImage('section_bg', key, file);
  } catch (err: any) {
    errorRedirect(err.message ?? '파트 이미지 업로드 실패');
  }

  revalidateMain();
  redirect('/admin/main');
}

export async function uploadIntroPhotoAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get('intro_image') as File;
  if (!file || file.size === 0) errorRedirect('업로드할 이미지 파일을 선택하세요.');

  try {
    await uploadIntroPhoto(file);
  } catch (err: any) {
    errorRedirect(err.message ?? '인트로 이미지 추가 실패');
  }

  revalidateMain();
  redirect('/admin/main');
}

export async function deleteIntroPhotoAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) errorRedirect('삭제할 사진 ID가 없습니다.');

  try {
    await deleteIntroPhoto(id);
  } catch (err: any) {
    errorRedirect(err.message ?? '인트로 이미지 삭제 실패');
  }

  revalidateMain();
  redirect('/admin/main');
}

export async function reorderIntroPhotosAction(orderedIds: string[]) {
  await requireAdmin();
  await reorderIntroPhotos(orderedIds);
  revalidateMain();
}

export async function addContactAction(formData: FormData) {
  await requireAdmin();
  const personId = String(formData.get('person_id') ?? '');
  const roleText = String(formData.get('role_text') ?? '');

  if (!personId) errorRedirect('담당할 대원을 선택하세요.');
  if (!roleText.trim()) errorRedirect('직무명(역할)을 입력하세요.');

  try {
    await addContactMember(personId, roleText);
  } catch (err: any) {
    errorRedirect(err.message ?? '문의 담당자 추가 실패');
  }

  revalidateMain();
  redirect('/admin/main?tab=contacts');
}

export async function deleteContactAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) errorRedirect('삭제할 대상의 ID가 없습니다.');

  try {
    await deleteContactMember(id);
  } catch (err: any) {
    errorRedirect(err.message ?? '문의 담당자 삭제 실패');
  }

  revalidateMain();
  redirect('/admin/main?tab=contacts');
}

export async function reorderContactsAction(orderedIds: string[]) {
  await requireAdmin();
  await reorderContactMembers(orderedIds);
  revalidateMain();
}
