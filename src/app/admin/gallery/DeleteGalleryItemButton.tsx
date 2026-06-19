'use client';

import { useState } from 'react';
import { deleteGalleryItemAction } from './actions';

type Props = {
  id: string;
  title: string;
};

export default function DeleteGalleryItemButton({ id, title }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-7 h-7 border border-red-200 bg-red-50 text-red-700 transition hover:border-red-500 hover:bg-red-100 shadow-sm"
        title="사진 삭제"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-ink/55 px-5">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-gallery-title"
            className="w-full max-w-[420px] border border-line bg-cream shadow-[0_24px_90px_rgba(42,38,32,0.3)]"
          >
            <div className="border-b border-line bg-card-head px-5 py-4">
              <h2 id="delete-gallery-title" className="font-ko text-[18px] font-bold text-ink">
                사진을 삭제할까요?
              </h2>
            </div>
            <div className="px-5 py-5">
              <p className="font-ko text-[14px] leading-relaxed text-ink-soft">
                <span className="font-bold text-ink">&ldquo;{title}&rdquo;</span> 사진을 삭제합니다.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
                >
                  취소
                </button>
                <form action={deleteGalleryItemAction}>
                  <input type="hidden" name="id" value={id} />
                  <button
                    type="submit"
                    className="border border-red-700 bg-red-700 px-4 py-2.5 font-ko text-[13px] font-bold text-white transition hover:bg-red-800"
                  >
                    삭제 확인
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
