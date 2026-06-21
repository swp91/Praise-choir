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

export async function createGalleryItemAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const parsed = parseGalleryUploadForm(formData);
    if (!parsed.ok) {
      return { success: false, error: parsed.errors.join(' ') };
    }

    await createGalleryItem(parsed.value);
    revalidateGallery();
    return { success: true };
  } catch (error) {
    console.error('Error creating gallery item:', error);
    return {
      success: false,
      error: '사진을 등록하지 못했습니다. Supabase Storage와 관리자 키 설정을 확인해 주세요.',
    };
  }
}

export async function reorderGalleryItemsAction(orderedIds: string[]) {
  await requireAdmin();
  await reorderGalleryItems(orderedIds);
  revalidateGallery();
}

export async function deleteGalleryItemAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const id = String(formData.get('id') ?? '');
    if (!id) {
      return { success: false, error: '삭제할 사진을 찾지 못했습니다.' };
    }

    await deleteGalleryItem(id);
    revalidateGallery();
    return { success: true };
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return {
      success: false,
      error: '사진을 삭제하지 못했습니다. Supabase Storage와 관리자 키 설정을 확인해 주세요.',
    };
  }
}
