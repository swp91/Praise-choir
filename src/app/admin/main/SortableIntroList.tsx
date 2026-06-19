'use client';

import { useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { AdminIntroPhoto } from '@/lib/admin/main';
import { updateIntroPhotoAction, reorderIntroPhotosAction } from './actions';
import { useImageCompress } from '@/hooks/useImageCompress';

function IntroPhotoCard({
  photo,
  index,
}: {
  photo: AdminIntroPhoto;
  index: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { compress, isCompressing } = useImageCompress();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await compress(file);

    // DataTransfer를 사용하여 input의 files를 교체
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(compressed);
    e.target.files = dataTransfer.files;

    setPreviewUrl(URL.createObjectURL(compressed));
  }

  function handleCancel() {
    setPreviewUrl(null);
    if (formRef.current) formRef.current.reset();
  }

  function handleSubmit() {
    setSubmitting(true);
  }

  const displayUrl = previewUrl || photo.imageUrl;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group border border-line bg-card aspect-[4/3] flex flex-col overflow-hidden"
    >
      {/* Drag Handle & Image */}
      <div 
        {...attributes} 
        {...listeners} 
        className="relative flex-1 cursor-grab active:cursor-grabbing overflow-hidden"
      >
        <img
          src={displayUrl}
          alt={photo.title}
          className="w-full h-full object-cover transition duration-300 group-hover:scale-102"
        />
        
        {/* 드래그 오버레이 (대기 중이 아닐 때만 노출) */}
        {!previewUrl && !submitting && !isCompressing && (
          <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
            <span className="font-ko text-[11px] font-bold text-cream bg-ink/75 px-2.5 py-1 rounded-full">
              드래그하여 순서 변경
            </span>
          </div>
        )}

        {submitting && (
          <div className="absolute inset-0 bg-ink/50 flex items-center justify-center pointer-events-none">
            <span className="font-ko text-[11px] font-bold text-cream animate-pulse">
              변경 적용 중...
            </span>
          </div>
        )}

        {isCompressing && (
          <div className="absolute inset-0 bg-ink/40 flex flex-col items-center justify-center gap-1.5 backdrop-blur-[1px] pointer-events-none">
            <svg className="w-6 h-6 text-gold" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4 31.4">
                <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
              </circle>
            </svg>
            <span className="font-ko text-[9px] font-bold text-cream bg-ink/75 px-2 py-0.5 rounded shadow">
              이미지 최적화 중...
            </span>
          </div>
        )}

        {previewUrl && !submitting && !isCompressing && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-gold-deep text-cream font-ko text-[9px] font-bold shadow-md">
            변경 대기 중
          </div>
        )}

        <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-gold-deep text-cream text-[11px] font-bold flex items-center justify-center shadow-md pointer-events-none">
          {index + 1}
        </span>
      </div>

      {/* Card Info & Control Form */}
      <div className="border-t border-line px-3 py-2 bg-card-head">
        <form ref={formRef} action={updateIntroPhotoAction} onSubmit={handleSubmit} className="flex flex-col gap-1.5 w-full">
          <input type="hidden" name="item_id" value={photo.id} />
          
          <input
            ref={fileInputRef}
            name="intro_image"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            disabled={submitting || isCompressing}
            className="hidden"
            onChange={handleFileChange}
          />

          {!previewUrl ? (
            <div className="flex items-center justify-between w-full">
              <span className="font-en text-[11px] font-bold text-ink-soft truncate max-w-[60%]">
                {photo.title}
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-ko text-[11px] font-bold text-gold-deep hover:text-ink transition"
              >
                사진 변경
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-1.5 w-full">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting || isCompressing}
                className="border border-line bg-card px-2 py-1 font-ko text-[10px] text-ink transition hover:border-gold disabled:opacity-55"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting || isCompressing}
                className="border border-gold-deep bg-gold-deep px-2.5 py-1 font-ko text-[10px] font-bold text-cream transition hover:bg-ink disabled:opacity-55"
              >
                변경 적용
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

type Props = {
  photos: AdminIntroPhoto[];
};

export default function SortableIntroList({ photos: initialPhotos }: Props) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(photos, oldIndex, newIndex);
    setPhotos(reordered);

    setSaving(true);
    try {
      await reorderIntroPhotosAction(reordered.map((p) => p.id));
      window.dispatchEvent(new CustomEvent('admin-toast', {
        detail: { type: 'success', message: '인트로 오프닝 사진 순서가 성공적으로 변경되었습니다.' }
      }));
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('admin-toast', {
        detail: { type: 'error', message: err.message ?? '순서 변경 중 오류가 발생했습니다.' }
      }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DndContext id="admin-intro-photos" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="relative">
          {saving && (
            <div className="absolute right-0 -top-8 font-ko text-[12px] text-gold-deep animate-pulse">
              순서 저장 중...
            </div>
          )}
          
          {photos.length === 0 ? (
            <div className="border border-dashed border-line bg-card py-16 text-center">
              <p className="font-ko text-[13px] text-ink-soft">등록된 인트로 사진이 없습니다. 새 사진을 추가하세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <IntroPhotoCard key={photo.id} photo={photo} index={index} />
              ))}
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
