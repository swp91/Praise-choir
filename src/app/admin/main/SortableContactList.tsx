'use client';

import { useState } from 'react';
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
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { AdminContactPerson } from '@/lib/admin/main';
import { deleteContactAction, reorderContactsAction } from './actions';

function ContactRow({
  contact,
  index,
}: {
  contact: AdminContactPerson;
  index: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: contact.id });

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
      className="flex items-center gap-3 border border-line bg-card px-4 py-3 rounded-lg shadow-sm"
    >
      {/* Drag Handle */}
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab select-none font-en text-[13px] font-bold text-gold-deep active:cursor-grabbing min-w-[24px] text-center"
      >
        {index + 1}
      </span>

      {/* Contact Info */}
      <div className="flex-1 min-w-0">
        <p className="font-ko text-[14px] font-bold text-ink">
          {contact.name} <span className="font-ko text-[12px] font-normal text-gold-deep px-1.5 py-0.5 border border-gold/40 bg-gold/5 rounded ml-2">{contact.role}</span>
        </p>
        <p className="font-sans text-[12px] text-ink-mute mt-1">
          {contact.phone || '전화번호 정보 없음'}
        </p>
      </div>

      {/* Delete Button */}
      <div className="shrink-0 flex items-center">
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="border border-red-200 bg-red-50 px-3 py-1.5 font-ko text-[12px] font-bold text-red-700 transition hover:border-red-500 hover:bg-red-100 hover:text-red-800"
        >
          삭제
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-ink/60 px-5 pointer-events-auto">
          <section className="w-full max-w-[360px] border border-line bg-cream p-5 shadow-2xl">
            <h3 className="font-ko text-[16px] font-bold text-ink mb-2">담당자를 삭제할까요?</h3>
            <p className="font-ko text-[13px] text-ink-soft leading-relaxed mb-5">
              문의 연락처 목록에서 <strong>{contact.name} ({contact.role})</strong> 님을 삭제합니다.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="border border-line bg-card px-3.5 py-2 font-ko text-[12px] text-ink transition hover:border-gold"
              >
                취소
              </button>
              <form action={deleteContactAction}>
                <input type="hidden" name="id" value={contact.id} />
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
  contacts: AdminContactPerson[];
};

export default function SortableContactList({ contacts: initialContacts }: Props) {
  const [contacts, setContacts] = useState(initialContacts);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = contacts.findIndex((c) => c.id === active.id);
    const newIndex = contacts.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(contacts, oldIndex, newIndex);
    setContacts(reordered);

    setSaving(true);
    try {
      await reorderContactsAction(reordered.map((c) => c.id));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DndContext id="admin-contacts" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={contacts.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="relative space-y-3">
          {saving && (
            <div className="absolute right-0 -top-8 font-ko text-[12px] text-gold-deep animate-pulse">
              순서 저장 중...
            </div>
          )}
          
          {contacts.length === 0 ? (
            <div className="border border-dashed border-line bg-card py-16 text-center">
              <p className="font-ko text-[13px] text-ink-soft">지정된 문의 연락처가 없습니다. 아래 폼에서 대원을 추가해 주세요.</p>
            </div>
          ) : (
            contacts.map((contact, index) => (
              <ContactRow key={contact.id} contact={contact} index={index} />
            ))
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
