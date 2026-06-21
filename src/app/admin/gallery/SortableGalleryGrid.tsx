'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { AdminGalleryItem } from '@/lib/admin/gallery';
import type { reorderGalleryItemsAction } from './actions';
import DeleteGalleryItemButton from './DeleteGalleryItemButton';

type Props = {
  items: AdminGalleryItem[];
  reorderAction: typeof reorderGalleryItemsAction;
};

function GalleryCard({ item, index }: { item: AdminGalleryItem; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.55 : 1 };

  return (
    <article ref={setNodeRef} style={style} className="mb-3 break-inside-avoid">
      <div className="group relative overflow-hidden border border-line bg-card">
        <img src={item.imageUrl} alt={item.title} className="block h-auto w-full" />
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/80 to-transparent px-3 pb-3 pt-12">
          <h3 className="font-ko text-[13px] font-bold leading-snug text-cream">{item.title}</h3>
        </div>
        <div className="absolute left-2 top-2 flex gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab border border-white/70 bg-cream/95 px-2 py-1 font-en text-[11px] font-bold text-ink active:cursor-grabbing"
            aria-label={`${item.title} 순서 변경`}
          >
            {index + 1}
          </button>
        </div>
        <div className="absolute right-2 top-2">
          <DeleteGalleryItemButton id={item.id} title={item.title} />
        </div>
      </div>
    </article>
  );
}

export default function SortableGalleryGrid({ items: initialItems, reorderAction }: Props) {
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    setSaving(true);
    try {
      await reorderAction(reordered.map((item) => item.id));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DndContext id="admin-gallery" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
        <div className="relative">
          {saving ? (
            <div className="absolute right-0 top-[-28px] font-ko text-[12px] text-gold-deep">저장 중...</div>
          ) : null}
          <div className="columns-2 gap-3 min-[760px]:columns-4">
            {items.map((item, index) => (
              <GalleryCard key={item.id} item={item} index={index} />
            ))}
          </div>
          {!items.length ? (
            <p className="border border-line bg-card px-5 py-12 text-center font-ko text-[13px] text-ink-soft">
              등록된 갤러리 사진이 없습니다.
            </p>
          ) : null}
        </div>
      </SortableContext>
    </DndContext>
  );
}
