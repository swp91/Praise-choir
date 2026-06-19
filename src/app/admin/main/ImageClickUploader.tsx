'use client';

import { useRef, useState } from 'react';

type Props = {
  action: (formData: FormData) => void;
  currentImageUrl: string | null;
  name: string;
  label: string;
  aspectRatioClass?: string; // e.g., 'aspect-video' or 'aspect-[4/3]'
  hiddenFields?: { name: string; value: string }[];
};

export default function ImageClickUploader({
  action,
  currentImageUrl,
  name,
  label,
  aspectRatioClass = 'aspect-video',
  hiddenFields = [],
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setSubmitting(true);
      // requestSubmit()을 호출하면 HTML5 폼 검증과 Server Action 바인딩이 정상 호출됩니다.
      formRef.current?.requestSubmit();
    }
  }

  const inputId = `click-uploader-${name}-${hiddenFields.map((f) => f.value).join('-')}`;

  return (
    <form ref={formRef} action={action} className="w-full">
      {hiddenFields.map((field) => (
        <input key={field.name} type="hidden" name={field.name} value={field.value} />
      ))}
      
      <label
        htmlFor={inputId}
        className={`block relative cursor-pointer overflow-hidden border border-line bg-cream transition group rounded-lg ${aspectRatioClass}`}
      >
        {/* 현재 이미지 표시 */}
        {currentImageUrl ? (
          <img
            src={currentImageUrl}
            alt={label}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
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
            {submitting ? '이미지 업로드 및 변경 중...' : '클릭하여 이미지 교체'}
          </span>
        </div>

        {submitting && (
          <div className="absolute inset-0 bg-ink/50 flex items-center justify-center pointer-events-none">
            <span className="font-ko text-[12px] font-bold text-cream animate-pulse">
              변경 반영 중...
            </span>
          </div>
        )}
      </label>

      {/* 숨겨진 실제 File Input */}
      <input
        id={inputId}
        name={name}
        type="file"
        accept="image/*"
        disabled={submitting}
        className="sr-only"
        onChange={handleFileChange}
      />
    </form>
  );
}
