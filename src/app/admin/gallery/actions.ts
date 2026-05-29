'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { parseGalleryUploadForm } from '@/lib/admin/gallery-form';
import { createGalleryItem, deleteGalleryItem, reorderGalleryItems } from '@/lib/admin/gallery';

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect('/admin');
}

function errorRedirect(error: string): never {
  redirect(`/admin/gallery?error=${encodeURIComponent(error)}`);
}

function revalidateGallery() {
  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');
  revalidatePath('/');
}

export async function createGalleryItemAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseGalleryUploadForm(formData);
  if (!parsed.ok) errorRedirect(parsed.errors.join(' '));

  try {
    await createGalleryItem(parsed.value);
  } catch {
    errorRedirect('사진을 등록하지 못했습니다. Supabase Storage와 관리자 키 설정을 확인해 주세요.');
  }

  revalidateGallery();
  redirect('/admin/gallery');
}

export async function reorderGalleryItemsAction(orderedIds: string[]) {
  await requireAdmin();
  await reorderGalleryItems(orderedIds);
  revalidateGallery();
}

export async function deleteGalleryItemAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) errorRedirect('삭제할 사진을 찾지 못했습니다.');

  try {
    await deleteGalleryItem(id);
  } catch {
    errorRedirect('사진을 삭제하지 못했습니다. Supabase Storage와 관리자 키 설정을 확인해 주세요.');
  }

  revalidateGallery();
  redirect('/admin/gallery');
}
