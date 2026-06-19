'use client';

import { useState, useTransition } from 'react';
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
import { deleteIntroPhotoAction, reorderIntroPhotosAction } from './actions';

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

  const [deleteOpen, setDeleteOpen] = useState(false);

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
          src={photo.imageUrl}
          alt={photo.title}
          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <span className="font-ko text-[12px] font-bold text-cream bg-ink/75 px-3 py-1.5 rounded-full">
            드래그하여 순서 변경
          </span>
        </div>
        <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-gold-deep text-cream text-[11px] font-bold flex items-center justify-center shadow-md">
          {index + 1}
        </span>
      </div>

      {/* Card Info & Delete Button */}
      <div className="border-t border-line px-3 py-2 flex items-center justify-between bg-card-head">
        <span className="font-en text-[11px] font-bold text-ink-soft truncate max-w-[70%]">
          {photo.title}
        </span>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="font-ko text-[11px] font-bold text-red-600 hover:text-red-800 transition"
        >
          삭제
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-ink/60 px-5 pointer-events-auto">
          <section className="w-full max-w-[360px] border border-line bg-cream p-5 shadow-2xl">
            <h3 className="font-ko text-[16px] font-bold text-ink mb-2">사진을 삭제할까요?</h3>
            <p className="font-ko text-[13px] text-ink-soft leading-relaxed mb-5">
              인트로 몬타주 목록에서 이 사진을 완전히 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="border border-line bg-card px-3.5 py-2 font-ko text-[12px] text-ink transition hover:border-gold"
              >
                취소
              </button>
              <form action={deleteIntroPhotoAction}>
                <input type="hidden" name="id" value={photo.id} />
                <button
                  type="submit"
                  className="border border-red-700 bg-red-700 px-4 py-2 font-ko text-[12px] font-bold text-white transition hover:bg-red-800"
                >
                  삭제
                </button>
              </form>
            </div>
          </section>
        </div>
      )}
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
