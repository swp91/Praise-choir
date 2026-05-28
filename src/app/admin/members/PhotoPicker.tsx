'use client';

import { useRef, useState } from 'react';

type Props = {
  defaultPhotoUrl?: string | null;
  defaultName?: string;
  existingPhotoAssetId?: string | null;
};

export default function PhotoPicker({ defaultPhotoUrl, defaultName, existingPhotoAssetId }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultPhotoUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  return (
    <div className="flex flex-col gap-4 border border-line bg-cream p-4 min-[560px]:flex-row min-[560px]:items-center">
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
          accept="image/*"
          className="sr-only"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
