'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import {
  createWorshipVideo,
  updateWorshipVideo,
  deleteWorshipVideo,
} from '@/lib/worship-archive';

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect('/admin');
}

function revalidateWorshipArchive() {
  revalidatePath('/worship-archive');
  revalidatePath('/admin/worship-archive');
  revalidatePath('/');
}

export async function createWorshipVideoAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const worshipDate = String(formData.get('worshipDate') ?? '');
    const title = String(formData.get('title') ?? '').trim();
    const youtubeUrl = String(formData.get('youtubeUrl') ?? '').trim();
    const composer = String(formData.get('composer') ?? '').trim();
    const lyrics = String(formData.get('lyrics') ?? '').trim();

    if (!worshipDate || !title || !youtubeUrl) {
      return { success: false, error: '날짜, 제목, 유튜브 URL은 필수 항목입니다.' };
    }

    await createWorshipVideo({
      worshipDate,
      title,
      youtubeUrl,
      composer,
      lyrics,
    });

    revalidateWorshipArchive();
    return { success: true };
  } catch (error) {
    console.error('Error in createWorshipVideoAction:', error);
    return {
      success: false,
      error: '영상을 등록하지 못했습니다. 입력 데이터와 데이터베이스 설정을 확인해 주세요.',
    };
  }
}

export async function updateWorshipVideoAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const id = String(formData.get('id') ?? '');
    const worshipDate = String(formData.get('worshipDate') ?? '');
    const title = String(formData.get('title') ?? '').trim();
    const youtubeUrl = String(formData.get('youtubeUrl') ?? '').trim();
    const composer = String(formData.get('composer') ?? '').trim();
    const lyrics = String(formData.get('lyrics') ?? '').trim();

    if (!id || !worshipDate || !title || !youtubeUrl) {
      return { success: false, error: '필수 항목이 누락되었습니다.' };
    }

    await updateWorshipVideo(id, {
      worshipDate,
      title,
      youtubeUrl,
      composer,
      lyrics,
    });

    revalidateWorshipArchive();
    return { success: true };
  } catch (error) {
    console.error('Error in updateWorshipVideoAction:', error);
    return {
      success: false,
      error: '영상을 수정하지 못했습니다. 입력 데이터와 데이터베이스 설정을 확인해 주세요.',
    };
  }
}

export async function deleteWorshipVideoAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const id = String(formData.get('id') ?? '');
    if (!id) {
      return { success: false, error: '삭제할 영상의 ID가 올바르지 않습니다.' };
    }

    await deleteWorshipVideo(id);

    revalidateWorshipArchive();
    return { success: true };
  } catch (error) {
    console.error('Error in deleteWorshipVideoAction:', error);
    return {
      success: false,
      error: '영상을 삭제하지 못했습니다.',
    };
  }
}
