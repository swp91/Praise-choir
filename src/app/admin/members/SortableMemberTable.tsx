'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import type { AdminMember } from '@/lib/admin/members';
import type { reorderSectionMembersAction, setMemberActiveAction } from './actions';
import ToggleActiveButton from './ToggleActiveButton';
import DeleteMemberButton from './DeleteMemberButton';

type ReorderAction = typeof reorderSectionMembersAction;
type ToggleAction = typeof setMemberActiveAction;

function SortableRow({
  member,
  activeSection,
  toggleAction,
}: {
  member: AdminMember;
  activeSection: string;
  toggleAction: ToggleAction;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-line-soft last:border-b-0"
    >
      <td className="px-4 py-3 font-ko text-[13px] font-bold text-ink">
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab select-none active:cursor-grabbing"
        >
          {member.displayName}
        </span>
      </td>
      <td className="px-4 py-3 font-ko text-[13px] text-ink-soft">{member.sectionName}</td>
      <td className="px-4 py-3 font-ko text-[13px] text-ink-soft">
        {[member.roleText, member.instrumentName].filter(Boolean).join(' / ') || '-'}
      </td>
      <td className="px-4 py-3 font-ko text-[13px] text-ink-soft">
        {member.showBirth ? member.birthLabel ?? '-' : '비공개'}
      </td>
      <td className="px-4 py-3 font-ko text-[13px] text-ink-soft">
        {member.showPhone ? member.phoneLabel ?? '-' : '비공개'}
      </td>
      <td className="px-4 py-3">
        <ToggleActiveButton
          id={member.id}
          isActive={member.isActive}
          action={toggleAction}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <Link
            href={`/admin/members?edit=${member.id}&section=${activeSection}`}
            className="border border-line bg-cream px-3 py-2 font-ko text-[12px] text-ink transition hover:border-gold"
          >
            수정
          </Link>
          <DeleteMemberButton id={member.id} name={member.displayName} />
        </div>
      </td>
    </tr>
  );
}

type Props = {
  members: AdminMember[];
  sectionId: string;
  reorderAction: ReorderAction;
  toggleAction: ToggleAction;
};

export default function SortableMemberTable({ members, sectionId, reorderAction, toggleAction }: Props) {
  const [items, setItems] = useState(members);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((m) => m.id === active.id);
    const newIndex = items.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);

    setItems(reordered);
    setSaving(true);
    try {
      await reorderAction(sectionId, reordered.map((m) => m.id));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((m) => m.id)} strategy={verticalListSortingStrategy}>
        <div className="relative overflow-x-auto">
          {saving ? (
            <div className="absolute right-4 top-3 font-ko text-[12px] text-gold-deep">
              저장 중...
            </div>
          ) : null}
          <table className="w-full min-w-[920px] border-collapse">
            <thead>
              <tr className="border-b border-line-soft bg-cream/70 text-left">
                <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">이름</th>
                <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">파트</th>
                <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">역할/악기</th>
                <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">생일</th>
                <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">전화번호</th>
                <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">상태</th>
                <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">관리</th>
              </tr>
            </thead>
            <tbody>
              {items.map((member) => (
                <SortableRow key={member.id} member={member} activeSection={sectionId} toggleAction={toggleAction} />
              ))}
              {!items.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center font-ko text-[13px] text-ink-soft">
                    표시할 대원 데이터가 없습니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SortableContext>
    </DndContext>
  );
}
