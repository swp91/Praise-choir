'use client';

import { useState } from 'react';
import { useImageCompress } from '@/hooks/useImageCompress';

export default function GalleryPhotoPicker() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { compress, isCompressing } = useImageCompress();

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const compressed = await compress(file);

    // DataTransfer를 사용하여 input의 files를 교체
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(compressed);
    event.target.files = dataTransfer.files;

    setPreviewUrl(URL.createObjectURL(compressed));
  }

  return (
    <div className="relative border border-line bg-cream p-4">
      <label
        htmlFor="photo_file"
        className="block cursor-pointer border border-dashed border-gold/70 bg-card px-4 py-8 text-center transition hover:border-gold-deep"
      >
        {previewUrl ? (
          <img src={previewUrl} alt="" className="mx-auto max-h-72 w-full object-contain" />
        ) : (
          <span className="font-ko text-[14px] font-bold text-ink">사진 1장을 선택하세요</span>
        )}
      </label>
      <input
        id="photo_file"
        name="photo_file"
        type="file"
        accept="image/png, image/jpeg, image/webp"
        required
        disabled={isCompressing}
        className="sr-only"
        onChange={handleChange}
      />
      {/* 로딩 오버레이 */}
      {isCompressing && (
        <div className="absolute inset-0 bg-ink/40 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3">
          <svg className="w-8 h-8 text-gold" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4 31.4">
              <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
            </circle>
          </svg>
          <span className="font-ko text-[12px] font-bold text-cream bg-ink/75 px-3 py-1.5 rounded-full shadow-md">
            이미지 최적화 중...
          </span>
        </div>
      )}
    </div>
  );
}
