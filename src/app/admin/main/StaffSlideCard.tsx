'use client';

import type { AdminSlidePhoto } from '@/lib/admin/main';
import ImageClickUploader from './ImageClickUploader';

type Props = {
  slide: AdminSlidePhoto;
  updateAction: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
  uploadSlidePhotoAction: (formData: FormData) => void;
};

export default function StaffSlideCard({
  slide,
  updateAction,
  deleteAction,
  uploadSlidePhotoAction,
}: Props) {
  function handleDeleteSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm(`'${slide.title}' 지휘·반주자를 슬라이드와 대원 명단에서 정말로 제거할까요?`)) {
      e.preventDefault();
    }
  }

  return (
    <section className="border border-line bg-card flex flex-col justify-between">
      <div>
        <div className="border-b border-line bg-card-head px-5 py-3 flex items-center justify-between">
          <h2 className="font-ko text-[16px] font-bold text-ink">지휘·반주자 슬라이드</h2>
          <span className="font-en text-[11px] px-2 py-0.5 rounded bg-gold-deep/10 text-gold-deep font-semibold">
            지휘·반주자
          </span>
        </div>

        {/* 이름/역할 편집 폼 */}
        <div className="px-5 py-4 border-b border-line bg-cream/30 space-y-4">
          <form action={updateAction} className="space-y-3">
            <input type="hidden" name="person_id" value={slide.targetId} />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-ko text-[11px] font-bold text-ink-soft mb-1">이름</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={slide.title}
                  required
                  className="w-full border border-line bg-card px-2.5 py-1.5 font-ko text-[12px] text-ink outline-none"
                />
              </div>
              <div>
                <label className="block font-ko text-[11px] font-bold text-ink-soft mb-1">직책</label>
                <input
                  name="role"
                  type="text"
                  defaultValue={slide.role}
                  required
                  className="w-full border border-line bg-card px-2.5 py-1.5 font-ko text-[12px] text-ink outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="border border-gold-deep/50 bg-transparent text-gold-deep px-3 py-1 font-ko text-[11px] font-bold transition hover:bg-gold-deep hover:text-cream"
              >
                정보 수정
              </button>
            </div>
          </form>
        </div>

        <div className="px-5 py-4">
          <ImageClickUploader
            action={uploadSlidePhotoAction}
            currentImageUrl={slide.imageUrl}
            name="slide_image"
            label={`${slide.title} 슬라이드 사진`}
            aspectRatioClass="aspect-[4/3]"
            hiddenFields={[
              { name: 'slide_type', value: slide.type },
              { name: 'target_id', value: slide.targetId },
            ]}
          />
        </div>
      </div>

      {/* 지휘·반주자 삭제 버튼 */}
      <div className="px-5 py-3 border-t border-line bg-card-head flex justify-end">
        <form action={deleteAction} onSubmit={handleDeleteSubmit}>
          <input type="hidden" name="person_id" value={slide.targetId} />
          <button
            type="submit"
            className="font-ko text-[12px] font-bold text-red-600 hover:text-red-800 transition"
          >
            지휘·반주자 삭제
          </button>
        </form>
      </div>
    </section>
  );
}
