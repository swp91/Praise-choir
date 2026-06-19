'use client';

import { useRef, useState } from 'react';

type Props = {
  action: (formData: FormData) => void;
  currentImageUrl: string | null;
  name: string;
  label: string;
  aspectRatioClass?: string; // e.g., 'aspect-video' or 'aspect-[4/3]'
  hiddenFields?: { name: string; value: string }[];
  submitButtonText?: string;
};

export default function ImageClickUploader({
  action,
  currentImageUrl,
  name,
  label,
  aspectRatioClass = 'aspect-video',
  hiddenFields = [],
  submitButtonText = '변경 적용',
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  function handleSubmit() {
    setSubmitting(true);
  }

  const inputId = `click-uploader-${name}-${hiddenFields.map((f) => f.value).join('-')}`;
  const displayUrl = previewUrl || currentImageUrl;

  return (
    <form ref={formRef} action={action} onSubmit={handleSubmit} className="w-full space-y-3">
      {hiddenFields.map((field) => (
        <input key={field.name} type="hidden" name={field.name} value={field.value} />
      ))}
      
      <label
        htmlFor={inputId}
        className={`block relative cursor-pointer overflow-hidden border border-line bg-cream transition group rounded-lg ${aspectRatioClass}`}
      >
        {/* 현재 이미지 또는 미리보기 이미지 */}
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={label}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.01]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <span className="font-ko text-[13px] font-bold text-ink-soft mb-1">{label}</span>
            <span className="font-ko text-[11px] text-ink-mute">클릭하여 이미지 선택</span>
          </div>
        )}

        {/* Hover / Submitting Overlay */}
        <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center backdrop-blur-[1px]">
          <span className="font-ko text-[12px] font-bold text-cream bg-ink/75 px-4 py-2 rounded-full shadow-lg">
            {previewUrl ? '클릭하여 다른 이미지 선택' : '클릭하여 이미지 교체'}
          </span>
        </div>

        {submitting && (
          <div className="absolute inset-0 bg-ink/50 flex items-center justify-center pointer-events-none">
            <span className="font-ko text-[12px] font-bold text-cream animate-pulse">
              변경 반영 중...
            </span>
          </div>
        )}

        {/* 대기 상태 배지 */}
        {previewUrl && !submitting && (
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded bg-gold-deep text-cream font-ko text-[10px] font-bold shadow-md">
            변경 대기 중 (저장 필요)
          </div>
        )}
      </label>

      {/* 숨겨진 실제 File Input */}
      <input
        id={inputId}
        name={name}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        disabled={submitting}
        className="sr-only"
        onChange={handleFileChange}
      />

      {/* 새 사진이 대기 중일 때만 나타나는 확정 버튼 */}
      {previewUrl && (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setPreviewUrl(null);
              if (formRef.current) formRef.current.reset();
            }}
            disabled={submitting}
            className="border border-line bg-card px-4 py-2 font-ko text-[12px] text-ink transition hover:border-gold disabled:opacity-55"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="border border-gold-deep bg-gold-deep px-5 py-2 font-ko text-[12px] font-bold text-cream transition hover:bg-ink disabled:opacity-55"
          >
            {submitting ? '저장 중...' : submitButtonText}
          </button>
        </div>
      )}
    </form>
  );
}
