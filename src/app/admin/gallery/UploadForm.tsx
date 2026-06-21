'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createGalleryItemAction } from './actions';
import GalleryPhotoPicker from './GalleryPhotoPicker';

const inputClass =
  'w-full border border-line bg-cream px-3 py-2.5 font-ko text-[13px] text-ink outline-none transition focus:border-gold-deep';
const labelClass = 'block font-ko text-[12px] font-bold text-ink mb-1.5';

export default function UploadForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);

  // 모달 상태 관리
  const [modal, setModal] = useState<{
    open: boolean;
    success: boolean;
    message: string;
  }>({
    open: false,
    success: false,
    message: '',
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createGalleryItemAction(formData);

      if (res.success) {
        setModal({
          open: true,
          success: true,
          message: '사진이 성공적으로 등록되었습니다.',
        });
        // 폼 강제 리셋을 위해 key 변경
        setFormKey((prev) => prev + 1);
        // 서버 데이터 리프레시 (목록 갱신)
        router.refresh();
      } else {
        setModal({
          open: true,
          success: false,
          message: res.error || '사진을 등록하지 못했습니다.',
        });
      }
    });
  }

  return (
    <>
      <section className="border border-line bg-card">
        <div className="border-b border-line bg-card-head px-5 py-4">
          <h2 className="font-ko text-[18px] font-bold text-ink">사진 등록</h2>
        </div>
        <form
          key={formKey}
          onSubmit={handleSubmit}
          className="grid gap-5 px-5 py-5 min-[860px]:grid-cols-[minmax(280px,420px)_1fr]"
        >
          <GalleryPhotoPicker />
          <div className="flex flex-col justify-between gap-4">
            <div>
              <label className={labelClass} htmlFor="title">
                사진 제목
              </label>
              <input
                id="title"
                name="title"
                className={inputClass}
                placeholder="예: 2026 부활절 찬양"
                required
                disabled={isPending}
              />
              <p className="mt-2 font-ko text-[12px] leading-relaxed text-ink-soft">
                사진은 한 번에 1장씩 등록합니다. 설명 없이 제목만 공개 갤러리에 표시됩니다.
              </p>
            </div>
            <div className="flex justify-end items-center gap-3">
              {isPending && (
                <span className="font-ko text-[12px] text-gold-deep animate-pulse">
                  등록 중...
                </span>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="border border-gold-deep bg-gold-deep px-5 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                사진 등록
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* 커스텀 결과 알림 모달 */}
      {modal.open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-ink/55 px-5">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-modal-title"
            className="w-full max-w-[420px] border border-line bg-cream shadow-[0_24px_90px_rgba(42,38,32,0.3)] animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="border-b border-line bg-card-head px-5 py-4">
              <h2 id="upload-modal-title" className="font-ko text-[18px] font-bold text-ink">
                {modal.success ? '등록 완료' : '등록 실패'}
              </h2>
            </div>
            <div className="px-5 py-5">
              <p className="font-ko text-[14px] leading-relaxed text-ink-soft">
                {modal.message}
              </p>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setModal((prev) => ({ ...prev, open: false }))}
                  className="border border-gold-deep bg-gold-deep px-5 py-2 font-ko text-[13px] font-bold text-cream transition hover:bg-ink cursor-pointer"
                >
                  확인
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
