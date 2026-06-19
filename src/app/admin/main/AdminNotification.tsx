'use client';

import { useState, useEffect } from 'react';

type ToastInfo = {
  type: 'success' | 'error';
  message: string;
};

export default function AdminNotification() {
  const [toast, setToast] = useState<ToastInfo | null>(null);

  useEffect(() => {
    // 1. URL 파라미터 감지 및 처리
    const params = new URLSearchParams(window.location.search);
    const successMsg = params.get('success');
    const errorMsg = params.get('error');

    if (successMsg || errorMsg) {
      setToast({
        type: successMsg ? 'success' : 'error',
        message: successMsg || errorMsg || '',
      });

      // URL에서 success, error 파라미터만 제거하여 새로고침 시 다시 뜨지 않도록 처리
      const newParams = new URLSearchParams(window.location.search);
      newParams.delete('success');
      newParams.delete('error');
      
      const newRelativePathQuery =
        window.location.pathname +
        (newParams.toString() ? '?' + newParams.toString() : '');
      
      window.history.replaceState(null, '', newRelativePathQuery);
    }

    // 2. 커스텀 이벤트 감지 및 처리
    const handleCustomToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastInfo>;
      if (customEvent.detail && customEvent.detail.message) {
        setToast({
          type: customEvent.detail.type,
          message: customEvent.detail.message,
        });
      }
    };

    window.addEventListener('admin-toast', handleCustomToast);
    return () => {
      window.removeEventListener('admin-toast', handleCustomToast);
    };
  }, []);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/50 px-5 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-[380px] border border-line bg-cream p-6 shadow-2xl text-center transform scale-95 animate-scaleUp"
        style={{
          animationDuration: '250ms',
          animationFillMode: 'forwards',
        }}
      >
        {/* 아이콘 */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cream border-2">
          {isSuccess ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* 타이틀 */}
        <h3 className="font-ko text-[16px] font-bold text-ink mb-2">
          {isSuccess ? '성공적으로 완료되었습니다' : '오류가 발생했습니다'}
        </h3>

        {/* 내용 */}
        <p className="font-ko text-[13.5px] text-ink-soft leading-relaxed mb-6 select-text">
          {toast.message}
        </p>

        {/* 버튼 */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setToast(null)}
            className={`w-full max-w-[120px] border px-4 py-2.5 font-ko text-[13px] font-bold text-cream transition ${
              isSuccess 
                ? 'border-emerald-700 bg-emerald-700 hover:bg-emerald-800' 
                : 'border-red-700 bg-red-700 hover:bg-red-800'
            }`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
