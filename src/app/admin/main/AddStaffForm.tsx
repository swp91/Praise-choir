'use client';

import { useRef, useState } from 'react';

type Props = {
  action: (formData: FormData) => void;
};

const inputClass =
  'w-full border border-line bg-cream px-3.5 py-2.5 font-ko text-[14px] text-ink outline-none transition focus:border-gold-deep';
const labelClass = 'block font-ko text-[13px] font-bold text-ink mb-2';

export default function AddStaffForm({ action }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  function handleRemovePreview() {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleSubmit() {
    setSubmitting(true);
  }

  if (!isOpen) {
    return (
      <div className="flex justify-start">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="border border-gold-deep bg-cream hover:bg-gold-deep hover:text-cream text-gold-deep px-5 py-2.5 font-ko text-[13px] font-bold transition flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          새 스태프 추가하기
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={handleSubmit}
      className="border border-line bg-cream p-5 space-y-5 relative"
    >
      {/* 접기 버튼 (우측 상단) */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(false);
          handleRemovePreview();
          if (formRef.current) formRef.current.reset();
        }}
        className="absolute top-4 right-5 text-ink-soft hover:text-ink transition font-ko text-[12px] font-bold flex items-center gap-1"
        title="접기"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        </svg>
        접기
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <div>
          <label className={labelClass} htmlFor="new_staff_name">이름</label>
          <input
            id="new_staff_name"
            name="name"
            type="text"
            required
            placeholder="예: 홍길동"
            className={inputClass}
            disabled={submitting}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="new_staff_role">직책 (역할)</label>
          <input
            id="new_staff_role"
            name="role"
            type="text"
            required
            placeholder="예: 지휘자, 반주자, 편곡자"
            className={inputClass}
            disabled={submitting}
          />
        </div>
      </div>

      {/* 사진 업로드 및 미리보기 박스 (클릭형 uploader) */}
      <div>
        <span className={labelClass}>사진 등록 (선택)</span>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div
            onClick={() => !submitting && fileInputRef.current?.click()}
            className="w-full sm:w-[200px] aspect-[4/3] relative border border-dashed border-line bg-card flex flex-col items-center justify-center cursor-pointer overflow-hidden group rounded-lg"
          >
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Staff Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center backdrop-blur-[1px]">
                  <span className="font-ko text-[11px] font-bold text-cream bg-ink/75 px-3 py-1.5 rounded-full">
                    사진 바꾸기
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center text-ink-mute">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 mb-1 text-gold-deep"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                  />
                </svg>
                <span className="font-ko text-[12px] font-bold text-ink-soft">클릭하여 이미지 선택</span>
                <span className="font-ko text-[10px] mt-0.5">선택사항</span>
              </div>
            )}

            {submitting && (
              <div className="absolute inset-0 bg-ink/50 flex items-center justify-center pointer-events-none">
                <span className="font-ko text-[11px] font-bold text-cream animate-pulse">등록 중...</span>
              </div>
            )}
          </div>

          {previewUrl && !submitting && (
            <button
              type="button"
              onClick={handleRemovePreview}
              className="border border-line bg-card px-3 py-1.5 font-ko text-[11px] text-ink transition hover:border-red-600 hover:text-red-600 rounded"
            >
              선택한 사진 제거
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          id="staff_photo"
          name="photo"
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          disabled={submitting}
          onChange={handleFileChange}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-line">
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            handleRemovePreview();
            if (formRef.current) formRef.current.reset();
          }}
          disabled={submitting}
          className="border border-line bg-card px-4 py-2.5 font-ko text-[13px] text-ink transition hover:border-gold disabled:opacity-55"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="border border-gold-deep bg-gold-deep px-5 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink disabled:opacity-55"
        >
          {submitting ? '등록 중...' : '+ 스태프 추가'}
        </button>
      </div>
    </form>
  );
}
