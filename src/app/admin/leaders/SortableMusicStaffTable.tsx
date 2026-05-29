'use client';

import Link from 'next/link';
import { useState } from 'react';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { AdminMusicStaff } from '@/lib/admin/leadership';
import type { reorderMusicStaffAction, setMusicStaffActiveAction, updateMusicStaffAction } from './actions';
import ToggleStaffButton from './ToggleStaffButton';

type Props = {
  staff: AdminMusicStaff[];
  editId?: string;
  actions: {
    reorder: typeof reorderMusicStaffAction;
    setActive: typeof setMusicStaffActiveAction;
    update: typeof updateMusicStaffAction;
  };
};

const inputClass =
  'w-full border border-line bg-cream px-3 py-2.5 font-ko text-[13px] text-ink outline-none transition focus:border-gold-deep';

function PhotoPreview({ src, name }: { src: string | null; name: string }) {
  if (src) return <img src={src} alt={name} className="h-9 w-9 shrink-0 rounded-full object-cover" />;
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-line font-ko text-[13px] text-ink-mute">
      {name.charAt(0) || '?'}
    </span>
  );
}

function StaffRow({ staff, editId, actions }: { staff: AdminMusicStaff; editId?: string; actions: Props['actions'] }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: staff.id });
  const editing = editId === staff.id;
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <tr id={`staff-${staff.id}`} ref={setNodeRef} style={style} className="scroll-mt-6 border-b border-line-soft last:border-b-0">
      <td className="px-4 py-3">
        <button type="button" {...attributes} {...listeners} aria-label={`${staff.name} 순서 변경`}
          className="cursor-grab border border-line bg-cream px-2 py-1 font-ko text-[12px] font-bold text-ink-mute active:cursor-grabbing">
          {staff.sortOrder + 1}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <PhotoPreview src={staff.photoUrl} name={staff.name} />
          <div>
            <div className="font-ko text-[13px] font-bold text-ink">{staff.name}</div>
            <div className="mt-1 font-ko text-[12px] text-ink-soft">{staff.sectionName}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <form id={`staff-form-${staff.id}`} action={actions.update}>
            <input type="hidden" name="id" value={staff.id} />
            <input name="role_text" className={inputClass} defaultValue={staff.roleText} />
          </form>
        ) : (
          <span className="font-ko text-[13px] text-ink-soft">{staff.roleText}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <ToggleStaffButton id={staff.id} isActive={staff.isActive} action={actions.setActive} />
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          {editing ? (
            <>
              <button form={`staff-form-${staff.id}`} type="submit"
                className="border border-gold-deep bg-gold-deep px-3 py-2 font-ko text-[12px] font-bold text-cream transition hover:bg-ink">
                저장
              </button>
              <Link href={`/admin/leaders#staff-${staff.id}`}
                className="border border-line bg-cream px-3 py-2 font-ko text-[12px] text-ink transition hover:border-gold">
                취소
              </Link>
            </>
          ) : (
            <Link href={`/admin/leaders?editStaff=${staff.id}#staff-${staff.id}`}
              className="border border-line bg-cream px-3 py-2 font-ko text-[12px] text-ink transition hover:border-gold">
              수정
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
}

function StaffCard({ staff, editId, actions }: { staff: AdminMusicStaff; editId?: string; actions: Props['actions'] }) {
  const editing = editId === staff.id;

  return (
    <div id={`staff-${staff.id}`} className="scroll-mt-4 border-b border-line-soft px-4 py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="min-w-[20px] font-ko text-[12px] font-bold text-ink-mute">{staff.sortOrder + 1}</span>
          <PhotoPreview src={staff.photoUrl} name={staff.name} />
          <div>
            <div className="font-ko text-[13px] font-bold text-ink">{staff.name}</div>
            <div className="font-ko text-[12px] text-ink-soft">{staff.sectionName}</div>
          </div>
        </div>
        <ToggleStaffButton id={staff.id} isActive={staff.isActive} action={actions.setActive} />
      </div>

      <div className="mt-3 pl-[44px]">
        {editing ? (
          <form id={`staff-card-form-${staff.id}`} action={actions.update}>
            <input type="hidden" name="id" value={staff.id} />
            <input name="role_text" className={inputClass} defaultValue={staff.roleText} autoFocus />
            <div className="mt-2 flex gap-2">
              <button form={`staff-card-form-${staff.id}`} type="submit"
                className="border border-gold-deep bg-gold-deep px-3 py-2 font-ko text-[12px] font-bold text-cream transition hover:bg-ink">
                저장
              </button>
              <Link href={`/admin/leaders#staff-${staff.id}`}
                className="border border-line bg-cream px-3 py-2 font-ko text-[12px] text-ink transition hover:border-gold">
                취소
              </Link>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <span className="font-ko text-[13px] text-ink-soft">{staff.roleText}</span>
            <Link href={`/admin/leaders?editStaff=${staff.id}#staff-${staff.id}`}
              className="border border-line bg-cream px-3 py-2 font-ko text-[12px] text-ink transition hover:border-gold">
              수정
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SortableMusicStaffTable({ staff: initialStaff, editId, actions }: Props) {
  const [staff, setStaff] = useState(initialStaff);
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = staff.findIndex((item) => item.id === active.id);
    const newIndex = staff.findIndex((item) => item.id === over.id);
    const reordered = arrayMove(staff, oldIndex, newIndex).map((item, index) => ({ ...item, sortOrder: index }));
    setStaff(reordered);
    setSaving(true);
    try { await actions.reorder(reordered.map((item) => item.id)); } finally { setSaving(false); }
  }

  return (
    <DndContext id="admin-leaders-staff" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={staff.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="relative">
          {saving && <div className="absolute right-4 top-3 font-ko text-[12px] text-gold-deep">저장 중...</div>}

          {/* 데스크탑 테이블 */}
          <div className="overflow-x-auto max-[900px]:hidden">
            <table className="w-full min-w-[760px] border-collapse">
              <colgroup>
                <col className="w-16" /><col /><col className="w-44" /><col className="w-24" /><col className="w-44" />
              </colgroup>
              <thead>
                <tr className="border-b border-line-soft bg-cream/70 text-left">
                  <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">순서</th>
                  <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">이름</th>
                  <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">직무</th>
                  <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">상태</th>
                  <th className="px-4 py-3 font-ko text-[12px] text-ink-mute">관리</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((item) => <StaffRow key={item.id} staff={item} editId={editId} actions={actions} />)}
                {!staff.length && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center font-ko text-[13px] text-ink-soft">스태프 섹션에 등록된 대원이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 */}
          <div className="min-[900px]:hidden">
            {staff.map((item) => <StaffCard key={item.id} staff={item} editId={editId} actions={actions} />)}
            {!staff.length && (
              <p className="px-4 py-10 text-center font-ko text-[13px] text-ink-soft">스태프 섹션에 등록된 대원이 없습니다.</p>
            )}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
}
