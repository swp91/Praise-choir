'use client';

import { useRef, useState } from 'react';
import { useImageCompress } from '@/hooks/useImageCompress';

type Props = {
  defaultPhotoUrl?: string | null;
  defaultName?: string;
  existingPhotoAssetId?: string | null;
};

export default function PhotoPicker({ defaultPhotoUrl, defaultName, existingPhotoAssetId }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultPhotoUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { compress, isCompressing } = useImageCompress();

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await compress(file);

    // DataTransfer를 사용하여 input의 files를 교체
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(compressed);
    e.target.files = dataTransfer.files;

    const url = URL.createObjectURL(compressed);
    setPreviewUrl(url);
  }

  return (
    <div className="relative flex flex-col gap-4 border border-line bg-cream p-4 min-[560px]:flex-row min-[560px]:items-center">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={defaultName ?? ''}
          className="h-24 w-24 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-line font-ko text-[28px] text-ink-mute">
          {defaultName?.charAt(0) ?? '?'}
        </div>
      )}
      <div className="flex-1">
        <div className="font-ko text-[13px] font-bold text-ink">
          {previewUrl ? '현재 사진' : '등록된 사진 없음'}
        </div>
        {existingPhotoAssetId && (
          <input type="hidden" name="existing_photo_asset_id" value={existingPhotoAssetId} />
        )}
        <label
          htmlFor="photo_file"
          className="mt-3 inline-flex cursor-pointer border border-gold-deep bg-gold-deep px-4 py-2.5 font-ko text-[13px] font-bold text-cream transition hover:bg-ink"
        >
          사진 변경
        </label>
        <input
          ref={inputRef}
          id="photo_file"
          name="photo_file"
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="sr-only"
          disabled={isCompressing}
          onChange={handleChange}
        />
      </div>
      {/* 로딩 오버레이 */}
      {isCompressing && (
        <div className="absolute inset-0 bg-ink/40 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 rounded-lg">
          <svg className="w-6 h-6 text-gold" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4 31.4">
              <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
            </circle>
          </svg>
          <span className="font-ko text-[11px] font-bold text-cream bg-ink/75 px-2.5 py-1 rounded-full shadow-md">
            이미지 최적화 중...
          </span>
        </div>
      )}
    </div>
  );
}
