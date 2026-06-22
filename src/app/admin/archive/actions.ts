'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import {
  createPraiseVideo,
  updatePraiseVideo,
  deletePraiseVideo,
} from '@/lib/praise-archive';

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect('/admin');
}

function revalidateArchive() {
  revalidatePath('/archive');
  revalidatePath('/admin/archive');
  revalidatePath('/');
}

export async function createPraiseVideoAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const praiseDate = String(formData.get('praiseDate') ?? '');
    const title = String(formData.get('title') ?? '').trim();
    const youtubeUrl = String(formData.get('youtubeUrl') ?? '').trim();
    const lyrics = String(formData.get('lyrics') ?? '').trim();

    if (!praiseDate || !title || !youtubeUrl) {
      return { success: false, error: '날짜, 제목, 유튜브 URL은 필수 항목입니다.' };
    }

    await createPraiseVideo({
      praiseDate,
      title,
      youtubeUrl,
      lyrics,
    });

    revalidateArchive();
    return { success: true };
  } catch (error) {
    console.error('Error in createPraiseVideoAction:', error);
    return {
      success: false,
      error: '영상을 등록하지 못했습니다. 입력 데이터와 데이터베이스 설정을 확인해 주세요.',
    };
  }
}

export async function updatePraiseVideoAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const id = String(formData.get('id') ?? '');
    const praiseDate = String(formData.get('praiseDate') ?? '');
    const title = String(formData.get('title') ?? '').trim();
    const youtubeUrl = String(formData.get('youtubeUrl') ?? '').trim();
    const lyrics = String(formData.get('lyrics') ?? '').trim();

    if (!id || !praiseDate || !title || !youtubeUrl) {
      return { success: false, error: '필수 항목이 누락되었습니다.' };
    }

    await updatePraiseVideo(id, {
      praiseDate,
      title,
      youtubeUrl,
      lyrics,
    });

    revalidateArchive();
    return { success: true };
  } catch (error) {
    console.error('Error in updatePraiseVideoAction:', error);
    return {
      success: false,
      error: '영상을 수정하지 못했습니다. 입력 데이터와 데이터베이스 설정을 확인해 주세요.',
    };
  }
}

export async function deletePraiseVideoAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const id = String(formData.get('id') ?? '');
    if (!id) {
      return { success: false, error: '삭제할 영상의 ID가 올바르지 않습니다.' };
    }

    await deletePraiseVideo(id);

    revalidateArchive();
    return { success: true };
  } catch (error) {
    console.error('Error in deletePraiseVideoAction:', error);
    return {
      success: false,
      error: '영상을 삭제하지 못했습니다.',
    };
  }
}
