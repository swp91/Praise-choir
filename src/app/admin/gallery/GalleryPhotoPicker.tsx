'use client';

import { useState } from 'react';

export default function GalleryPhotoPicker() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  return (
    <div className="border border-line bg-cream p-4">
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
        accept="image/*"
        required
        className="sr-only"
        onChange={handleChange}
      />
    </div>
  );
}
