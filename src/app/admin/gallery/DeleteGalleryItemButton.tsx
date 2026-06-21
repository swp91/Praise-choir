'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteGalleryItemAction } from './actions';

type Props = {
  id: string;
  title: string;
};

type Step = 'idle' | 'confirming' | 'deleting' | 'success' | 'error';

export default function DeleteGalleryItemButton({ id, title }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleDeleteConfirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setStep('deleting');
    startTransition(async () => {
      const res = await deleteGalleryItemAction(formData);
      if (res.success) {
        setStep('success');
        router.refresh();
      } else {
        setErrorMessage(res.error || '사진을 삭제하지 못했습니다.');
        setStep('error');
      }
    });
  }

  function handleCloseSuccess() {
    setStep('idle');
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setStep('confirming')}
        className="flex items-center justify-center w-7 h-7 border border-red-200 bg-red-50 text-red-700 transition hover:border-red-500 hover:bg-red-100 shadow-sm cursor-pointer"
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

      {step !== 'idle' && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-ink/55 px-5">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-gallery-title"
            className="w-full max-w-[420px] border border-line bg-cream shadow-[0_24px_90px_rgba(42,38,32,0.3)] animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="border-b border-line bg-card-head px-5 py-4">
              <h2 id="delete-gallery-title" className="font-ko text-[18px] font-bold text-ink">
                {step === 'confirming' && '사진을 삭제할까요?'}
                {step === 'deleting' && '삭제 진행 중'}
                {step === 'success' && '삭제 완료'}
                {step === 'error' && '삭제 실패'}
              </h2>
            </div>
            <div className="px-5 py-5">
              {step === 'confirming' && (
                <>
                  <p className="font-ko text-[14px] leading-relaxed text-ink-soft">
                    <span className="font-bold text-ink">&ldquo;{title}&rdquo;</span> 사진을 삭제합니다.
                  </p>
                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setStep('idle')}
                      className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold cursor-pointer"
                    >
                      취소
                    </button>
                    <form onSubmit={handleDeleteConfirm}>
                      <input type="hidden" name="id" value={id} />
                      <button
                        type="submit"
                        className="border border-red-700 bg-red-700 px-4 py-2.5 font-ko text-[13px] font-bold text-white transition hover:bg-red-800 cursor-pointer"
                      >
                        삭제 확인
                      </button>
                    </form>
                  </div>
                </>
              )}

              {step === 'deleting' && (
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                  <svg className="w-8 h-8 text-gold-deep" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4 31.4">
                      <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                  <span className="font-ko text-[13px] text-ink-soft">사진을 서버에서 삭제하는 중입니다...</span>
                </div>
              )}

              {step === 'success' && (
                <>
                  <p className="font-ko text-[14px] leading-relaxed text-ink-soft">
                    사진이 성공적으로 삭제되었습니다.
                  </p>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseSuccess}
                      className="border border-gold-deep bg-gold-deep px-5 py-2 font-ko text-[13px] font-bold text-cream transition hover:bg-ink cursor-pointer"
                    >
                      확인
                    </button>
                  </div>
                </>
              )}

              {step === 'error' && (
                <>
                  <p className="font-ko text-[14px] leading-relaxed text-red-800 bg-red-50 border border-red-200 p-3">
                    {errorMessage}
                  </p>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep('idle')}
                      className="border border-line bg-card px-5 py-2 font-ko text-[13px] text-ink transition hover:border-gold cursor-pointer"
                    >
                      닫기
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
