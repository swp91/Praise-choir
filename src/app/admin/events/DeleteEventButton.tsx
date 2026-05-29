'use client';

import { useState } from 'react';
import { deleteEventAction } from './actions';

type Props = {
  id: string;
  year: number;
  title: string;
};

export default function DeleteEventButton({ id, year, title }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border border-red-200 bg-red-50 px-3 py-1.5 font-ko text-[12px] font-bold text-red-700 transition hover:border-red-500 hover:bg-red-100"
      >
        삭제
      </button>

      {open ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-ink/55 px-5">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-event-title"
            className="w-full max-w-[420px] border border-line bg-cream shadow-[0_24px_90px_rgba(42,38,32,0.3)]"
          >
            <div className="border-b border-line bg-card-head px-5 py-4">
              <h2 id="delete-event-title" className="font-ko text-[18px] font-bold text-ink">
                일정을 삭제할까요?
              </h2>
            </div>
            <div className="px-5 py-5">
              <p className="font-ko text-[14px] leading-relaxed text-ink-soft">
                <span className="font-bold text-ink">&ldquo;{title}&rdquo;</span> 일정을 완전히 삭제합니다.
                삭제된 데이터는 복구할 수 없습니다.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold"
                >
                  취소
                </button>
                <form action={deleteEventAction}>
                  <input type="hidden" name="id" value={id} />
                  <input type="hidden" name="year" value={year} />
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
