'use client';

import { useState, useTransition, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { PraiseVideo } from '@/lib/praise-archive';
import {
  createPraiseVideoAction,
  updatePraiseVideoAction,
  deletePraiseVideoAction,
} from './actions';

type Props = {
  initialItems: PraiseVideo[];
};

const inputClass =
  'w-full border border-line bg-cream px-3 py-2.5 font-ko text-[13px] text-ink outline-none transition focus:border-gold-deep disabled:opacity-60';
const textareaClass =
  'w-full border border-line bg-cream px-3 py-2.5 font-ko text-[13px] text-ink outline-none transition focus:border-gold-deep h-32 disabled:opacity-60';
const labelClass = 'block font-ko text-[12px] font-bold text-ink mb-1.5';

export default function ArchiveAdminClient({ initialItems }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingItem, setEditingItem] = useState<PraiseVideo | null>(null);
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo<PraiseVideo[]>(() => {
    const query = searchQuery.toLowerCase().trim();
    if (query === '') return initialItems;
    return initialItems.filter((item) => item.title.toLowerCase().includes(query));
  }, [initialItems, searchQuery]);

  const formRef = useRef<HTMLElement>(null);

  // Handle start editing and scroll to form
  function handleEditStart(video: PraiseVideo) {
    setEditingItem(video);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Modal notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    success: boolean;
    message: string;
  }>({
    open: false,
    success: false,
    message: '',
  });

  // Deletion confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<PraiseVideo | null>(null);

  // Reset form or cancel editing
  function handleCancel() {
    setEditingItem(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      let res;
      if (editingItem) {
        formData.append('id', editingItem.id);
        res = await updatePraiseVideoAction(formData);
      } else {
        res = await createPraiseVideoAction(formData);
      }

      if (res.success) {
        setNotification({
          open: true,
          success: true,
          message: editingItem
            ? '찬양 영상이 성공적으로 수정되었습니다.'
            : '찬양 영상이 성공적으로 등록되었습니다.',
        });
        setEditingItem(null);
        form.reset();
        router.refresh();
      } else {
        setNotification({
          open: true,
          success: false,
          message: res.error || '처리에 실패했습니다.',
        });
      }
    });
  }

  async function handleDeleteConfirm(video: PraiseVideo) {
    const formData = new FormData();
    formData.append('id', video.id);

    startTransition(async () => {
      const deleteRes = await deletePraiseVideoAction(formData);

      setDeleteConfirm(null);
      if (deleteRes.success) {
        setNotification({
          open: true,
          success: true,
          message: '찬양 영상이 성공적으로 삭제되었습니다.',
        });
        router.refresh();
      } else {
        setNotification({
          open: true,
          success: false,
          message: deleteRes.error || '삭제하지 못했습니다.',
        });
      }
    });
  }

  return (
    <div className="mt-6 space-y-6">
      {/* 1. 등록 / 수정 폼 */}
      <section ref={formRef} className="border border-line bg-card">
        <div className="border-b border-line bg-card-head px-5 py-4 flex items-center justify-between">
          <h2 className="font-ko text-[18px] font-bold text-ink">
            {editingItem ? '찬양 영상 수정' : '찬양 영상 등록'}
          </h2>
          {editingItem && (
            <button
              type="button"
              onClick={handleCancel}
              className="border border-line bg-card px-3 py-1 font-ko text-[12px] text-ink transition hover:border-gold cursor-pointer"
            >
              수정 취소
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid gap-4 min-[760px]:grid-cols-3">
            <div>
              <label className={labelClass} htmlFor="praiseDate">
                찬양 일자 (주일) *
              </label>
              <input
                type="date"
                id="praiseDate"
                name="praiseDate"
                className={inputClass}
                required
                disabled={isPending}
                defaultValue={editingItem?.praiseDate || ''}
              />
            </div>
            <div className="min-[760px]:col-span-2">
              <label className={labelClass} htmlFor="title">
                찬양 곡 제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="예: 은혜 (Grace)"
                className={inputClass}
                required
                disabled={isPending}
                defaultValue={editingItem?.title || ''}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="youtubeUrl">
              유튜브 URL *
            </label>
            <input
              type="url"
              id="youtubeUrl"
              name="youtubeUrl"
              placeholder="예: https://www.youtube.com/watch?v=..."
              className={inputClass}
              required
              disabled={isPending}
              defaultValue={editingItem?.youtubeUrl || ''}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="lyrics">
              가사 텍스트
            </label>
            <textarea
              id="lyrics"
              name="lyrics"
              placeholder="여기에 찬양 가사를 입력해 주세요. (가사는 줄바꿈을 반영하여 표시되며, .txt 파일 다운로드 시에 사용됩니다)"
              className={textareaClass}
              disabled={isPending}
              defaultValue={editingItem?.lyrics || ''}
            />
          </div>

          <div className="flex justify-end items-center gap-3 pt-2">
            {isPending && (
              <span className="font-ko text-[12px] text-gold-deep animate-pulse">
                처리 중...
              </span>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="border border-gold-deep bg-gold-deep px-6 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {editingItem ? '영상 정보 수정' : '영상 등록'}
            </button>
          </div>
        </form>
      </section>

      {/* 2. 등록된 영상 목록 리스트 */}
      <section className="border border-line bg-card">
        <div className="flex flex-col gap-4 border-b border-line bg-card-head px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <div className="flex items-baseline gap-2">
            <h2 className="font-ko text-[18px] font-bold text-ink">아카이브 등록 목록</h2>
            <span className="font-en text-[11px] italic text-gold-deep">
              {searchQuery.trim() !== '' ? `${filteredItems.length} / ${initialItems.length} filtered` : `${initialItems.length} videos`}
            </span>
          </div>

          <div className="relative w-full sm:w-[240px] shrink-0">
            <input
              type="text"
              placeholder="곡 제목 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-line bg-cream pl-8 pr-7 py-1.5 font-ko text-[12px] text-ink outline-none transition focus:border-gold-deep"
            />
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z"
                />
              </svg>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition bg-transparent border-none p-0 cursor-pointer"
                aria-label="검색어 초기화"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="w-3 h-3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-ko text-[13px]">
            <thead className="border-b border-line bg-card-head font-bold text-ink">
              <tr>
                <th className="px-5 py-3 w-[120px]">찬양 일자</th>
                <th className="px-5 py-3">곡 제목</th>
                <th className="px-5 py-3 w-[100px] text-center">가사 여부</th>
                <th className="px-5 py-3 w-[150px] text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-card">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-ink-soft">
                    {searchQuery.trim() !== '' ? '검색 결과에 맞는 찬양 영상이 없습니다.' : '등록된 찬양 영상이 없습니다.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-cream/40 transition">
                    <td className="px-5 py-3.5 whitespace-nowrap text-ink-soft">
                      {item.praiseDate}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-ink">
                      <div className="flex flex-col gap-1">
                        <span>{item.title}</span>
                        {item.youtubeId && (
                          <a
                            href={item.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-en text-[11px] text-gold-deep hover:underline"
                          >
                            YouTube ID: {item.youtubeId} ↗
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {item.lyrics ? (
                        <span className="text-green-700 bg-green-50 px-2 py-0.5 border border-green-150 rounded-sm text-[11px] font-bold">
                          등록됨
                        </span>
                      ) : (
                        <span className="text-ink-soft bg-card px-2 py-0.5 border border-line rounded-sm text-[11px]">
                          없음
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditStart(item)}
                          disabled={isPending}
                          className="border border-line bg-card px-3 py-1.5 text-ink transition hover:border-gold hover:text-gold-deep cursor-pointer text-[12px]"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(item)}
                          disabled={isPending}
                          className="border border-red-200 bg-red-50 px-3 py-1.5 text-red-700 transition hover:border-red-500 hover:bg-red-100 cursor-pointer text-[12px]"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 커스텀 결과 알림 모달 */}
      {notification.open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-ink/55 px-5">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="noti-modal-title"
            className="w-full max-w-[420px] border border-line bg-cream shadow-[0_24px_90px_rgba(42,38,32,0.3)] animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="border-b border-line bg-card-head px-5 py-4">
              <h2 id="noti-modal-title" className="font-ko text-[18px] font-bold text-ink">
                {notification.success ? '완료' : '오류'}
              </h2>
            </div>
            <div className="px-5 py-5">
              <p className="font-ko text-[14px] leading-relaxed text-ink-soft">
                {notification.message}
              </p>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setNotification((prev) => ({ ...prev, open: false }))}
                  className="border border-gold-deep bg-gold-deep px-5 py-2 font-ko text-[13px] font-bold text-cream transition hover:bg-ink cursor-pointer"
                >
                  확인
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-ink/55 px-5">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            className="w-full max-w-[420px] border border-line bg-cream shadow-[0_24px_90px_rgba(42,38,32,0.3)] animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="border-b border-line bg-card-head px-5 py-4">
              <h2 id="delete-confirm-title" className="font-ko text-[18px] font-bold text-ink">
                찬양 영상 삭제
              </h2>
            </div>
            <div className="px-5 py-5">
              <p className="font-ko text-[14px] leading-relaxed text-ink-soft">
                정말로 <span className="font-bold text-ink">&ldquo;{deleteConfirm.title}&rdquo;</span> (찬양일: {deleteConfirm.praiseDate}) 영상을 아카이브에서 삭제하시겠습니까?
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="border border-line bg-card px-4 py-2 font-ko text-[13px] text-ink transition hover:border-gold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteConfirm(deleteConfirm)}
                  className="border border-red-700 bg-red-700 px-4 py-2 font-ko text-[13px] font-bold text-white transition hover:bg-red-800 cursor-pointer"
                >
                  삭제 확인
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
