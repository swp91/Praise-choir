'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import {
  updateSlogans,
  uploadSpecialImage,
  uploadIntroPhoto,
  deleteIntroPhoto,
  updateIntroPhoto,
  reorderIntroPhotos,
  addContactMember,
  deleteContactMember,
  reorderContactMembers,
  uploadStaffPhoto,
  addStaffMember,
  deleteStaffMember,
  updateStaffMember,
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

  try {
    await updateSlogans(themeKo, themeEn, 'center 30%');
  } catch (err: any) {
    errorRedirect(err.message ?? '슬로건 업데이트 실패');
  }

  revalidateMain();
  redirect(`/admin/main?success=${encodeURIComponent('슬로건이 성공적으로 변경되었습니다.')}`);
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
  redirect(`/admin/main?success=${encodeURIComponent('히어로 이미지가 업로드되었습니다.')}`);
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
  redirect(`/admin/main?success=${encodeURIComponent('섬기는 사람들 섹션 배경이 업로드되었습니다.')}`);
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
  redirect(`/admin/main?success=${encodeURIComponent('연습 시간표 섹션 배경이 업로드되었습니다.')}`);
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
  redirect(`/admin/main?success=${encodeURIComponent('파트 사진이 성공적으로 업로드되었습니다.')}`);
}

export async function uploadSlidePhotoAction(formData: FormData) {
  await requireAdmin();
  const type = String(formData.get('slide_type') ?? ''); // 'part' | 'staff'
  const targetId = String(formData.get('target_id') ?? ''); // part key 또는 person ID
  const file = formData.get('slide_image') as File;

  if (!type || !targetId) errorRedirect('올바르지 않은 슬라이드 유형 또는 대상입니다.');
  if (!file || file.size === 0) errorRedirect('업로드할 이미지 파일을 선택하세요.');

  try {
    if (type === 'staff') {
      await uploadStaffPhoto(targetId, file);
    } else {
      await uploadSpecialImage('section_bg', targetId, file);
    }
  } catch (err: any) {
    errorRedirect(err.message ?? '슬라이드 이미지 업로드 실패');
  }

  revalidateMain();
  redirect(`/admin/main?tab=parts&success=${encodeURIComponent('슬라이드 사진이 성공적으로 변경되었습니다.')}`);
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
  redirect(`/admin/main?tab=intro&success=${encodeURIComponent('인트로 오프닝 사진이 성공적으로 추가되었습니다.')}`);
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
  redirect(`/admin/main?tab=intro&success=${encodeURIComponent('인트로 오프닝 사진이 성공적으로 삭제되었습니다.')}`);
}

export async function updateIntroPhotoAction(formData: FormData) {
  await requireAdmin();
  const itemId = String(formData.get('item_id') ?? '');
  const file = formData.get('intro_image') as File;
  if (!itemId) errorRedirect('올바르지 않은 사진 지정입니다.');
  if (!file || file.size === 0) errorRedirect('업로드할 이미지 파일을 선택하세요.');

  try {
    await updateIntroPhoto(itemId, file);
  } catch (err: any) {
    errorRedirect(err.message ?? '인트로 이미지 변경 실패');
  }

  revalidateMain();
  redirect(`/admin/main?tab=intro&success=${encodeURIComponent('인트로 오프닝 사진이 성공적으로 변경되었습니다.')}`);
}

export async function reorderIntroPhotosAction(orderedIds: string[]) {
  await requireAdmin();
  await reorderIntroPhotos(orderedIds);
  revalidateMain();
}

export async function addContactAction(formData: FormData) {
  await requireAdmin();
  const officerSelect = String(formData.get('officer_select') ?? '');

  if (!officerSelect) errorRedirect('담당할 임원을 선택하세요.');

  const [personId, roleText] = officerSelect.split('|');
  if (!personId || !roleText) errorRedirect('올바르지 않은 임원 정보입니다.');

  try {
    await addContactMember(personId, roleText);
  } catch (err: any) {
    errorRedirect(err.message ?? '문의 담당자 추가 실패');
  }

  revalidateMain();
  redirect(`/admin/main?tab=contacts&success=${encodeURIComponent('문의 담당자가 성공적으로 추가되었습니다.')}`);
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
  redirect(`/admin/main?tab=contacts&success=${encodeURIComponent('문의 담당자가 성공적으로 삭제되었습니다.')}`);
}

export async function reorderContactsAction(orderedIds: string[]) {
  await requireAdmin();
  await reorderContactMembers(orderedIds);
  revalidateMain();
}

export async function addStaffMemberAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get('name') ?? '');
  const role = String(formData.get('role') ?? '');
  const file = formData.get('photo') as File | null;

  if (!name) errorRedirect('이름을 입력해야 합니다.');
  if (!role) errorRedirect('직책(역할)을 입력해야 합니다.');

  try {
    await addStaffMember(name, role, file);
  } catch (err: any) {
    errorRedirect(err.message ?? '디렉터 추가 실패');
  }

  revalidateMain();
  redirect(`/admin/main?tab=parts&success=${encodeURIComponent('새로운 디렉터가 성공적으로 추가되었습니다.')}`);
}

export async function deleteStaffMemberAction(formData: FormData) {
  await requireAdmin();
  const personId = String(formData.get('person_id') ?? '');
  if (!personId) errorRedirect('삭제할 대상의 ID가 없습니다.');

  try {
    await deleteStaffMember(personId);
  } catch (err: any) {
    errorRedirect(err.message ?? '디렉터 삭제 실패');
  }

  revalidateMain();
  redirect(`/admin/main?tab=parts&success=${encodeURIComponent('디렉터가 성공적으로 삭제되었습니다.')}`);
}

export async function updateStaffMemberAction(formData: FormData) {
  await requireAdmin();
  const personId = String(formData.get('person_id') ?? '');
  const name = String(formData.get('name') ?? '');
  const role = String(formData.get('role') ?? '');

  if (!personId) errorRedirect('올바르지 않은 디렉터 지정입니다.');
  if (!name) errorRedirect('이름은 비워둘 수 없습니다.');
  if (!role) errorRedirect('역할은 비워둘 수 없습니다.');

  try {
    await updateStaffMember(personId, name, role);
  } catch (err: any) {
    errorRedirect(err.message ?? '디렉터 정보 수정 실패');
  }

  revalidateMain();
  redirect(`/admin/main?tab=parts&success=${encodeURIComponent('디렉터 정보가 성공적으로 수정되었습니다.')}`);
}
