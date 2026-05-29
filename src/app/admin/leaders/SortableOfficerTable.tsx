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
import type { AdminOfficer } from '@/lib/admin/leadership';
import type { reorderOfficersAction, setOfficerActiveAction, updateOfficerAction } from './actions';
import DeleteOfficerButton from './DeleteOfficerButton';
import ToggleOfficerButton from './ToggleOfficerButton';

type Props = {
  officers: AdminOfficer[];
  editId?: string;
  actions: {
    reorder: typeof reorderOfficersAction;
    setActive: typeof setOfficerActiveAction;
    update: typeof updateOfficerAction;
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

function OfficerRow({ officer, editId, actions }: { officer: AdminOfficer; editId?: string; actions: Props['actions'] }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: officer.id });
  const editing = editId === officer.id;
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <tr id={`officer-${officer.id}`} ref={setNodeRef} style={style} className="scroll-mt-6 border-b border-line-soft last:border-b-0">
      <td className="px-4 py-3">
        <button type="button" {...attributes} {...listeners} aria-label={`${officer.name} 순서 변경`}
          className="cursor-grab border border-line bg-cream px-2 py-1 font-ko text-[12px] font-bold text-ink-mute active:cursor-grabbing">
          {officer.sortOrder + 1}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <PhotoPreview src={officer.photoUrl} name={officer.name} />
          <div>
            <div className="font-ko text-[13px] font-bold text-ink">{officer.name}</div>
            <div className="mt-1 font-ko text-[12px] text-ink-soft">{officer.sectionName}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <form id={`officer-${officer.id}`} action={actions.update}>
            <input type="hidden" name="id" value={officer.id} />
            <input type="hidden" name="person_id" value={officer.personId} />
            <input name="role_text" className={inputClass} defaultValue={officer.roleText} />
            {officer.isActive ? <input type="hidden" name="is_active" value="on" /> : null}
          </form>
        ) : (
          <span className="font-ko text-[13px] text-ink-soft">{officer.roleText}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <ToggleOfficerButton id={officer.id} isActive={officer.isActive} action={actions.setActive} />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-nowrap gap-2">
          {editing ? (
            <>
              <button form={`officer-${officer.id}`} type="submit"
                className="border border-gold-deep bg-gold-deep px-3 py-2 font-ko text-[12px] font-bold text-cream transition hover:bg-ink">
                저장
              </button>
              <Link href={`/admin/leaders#officer-${officer.id}`}
                className="border border-line bg-cream px-3 py-2 font-ko text-[12px] text-ink transition hover:border-gold">
                취소
              </Link>
            </>
          ) : (
            <>
              <Link href={`/admin/leaders?editOfficer=${officer.id}#officer-${officer.id}`}
                className="border border-line bg-cream px-3 py-2 font-ko text-[12px] text-ink transition hover:border-gold">
                수정
              </Link>
              <DeleteOfficerButton id={officer.id} name={officer.name} />
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function OfficerCard({ officer, editId, actions }: { officer: AdminOfficer; editId?: string; actions: Props['actions'] }) {
  const editing = editId === officer.id;

  return (
    <div id={`officer-${officer.id}`} className="scroll-mt-4 border-b border-line-soft px-4 py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="min-w-[20px] font-ko text-[12px] font-bold text-ink-mute">{officer.sortOrder + 1}</span>
          <PhotoPreview src={officer.photoUrl} name={officer.name} />
          <div>
            <div className="font-ko text-[13px] font-bold text-ink">{officer.name}</div>
            <div className="font-ko text-[12px] text-ink-soft">{officer.sectionName}</div>
          </div>
        </div>
        <ToggleOfficerButton id={officer.id} isActive={officer.isActive} action={actions.setActive} />
      </div>

      <div className="mt-3 pl-[44px]">
        {editing ? (
          <form id={`officer-card-form-${officer.id}`} action={actions.update}>
            <input type="hidden" name="id" value={officer.id} />
            <input type="hidden" name="person_id" value={officer.personId} />
            <input name="role_text" className={inputClass} defaultValue={officer.roleText} autoFocus />
            {officer.isActive ? <input type="hidden" name="is_active" value="on" /> : null}
            <div className="mt-2 flex gap-2">
              <button form={`officer-card-form-${officer.id}`} type="submit"
                className="border border-gold-deep bg-gold-deep px-3 py-2 font-ko text-[12px] font-bold text-cream transition hover:bg-ink">
                저장
              </button>
              <Link href={`/admin/leaders#officer-${officer.id}`}
                className="border border-line bg-cream px-3 py-2 font-ko text-[12px] text-ink transition hover:border-gold">
                취소
              </Link>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <span className="font-ko text-[13px] text-ink-soft">{officer.roleText}</span>
            <div className="flex gap-2">
              <Link href={`/admin/leaders?editOfficer=${officer.id}#officer-${officer.id}`}
                className="border border-line bg-cream px-3 py-2 font-ko text-[12px] text-ink transition hover:border-gold">
                수정
              </Link>
              <DeleteOfficerButton id={officer.id} name={officer.name} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SortableOfficerTable({ officers: initialOfficers, editId, actions }: Props) {
  const [officers, setOfficers] = useState(initialOfficers);
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = officers.findIndex((officer) => officer.id === active.id);
    const newIndex = officers.findIndex((officer) => officer.id === over.id);
    const reordered = arrayMove(officers, oldIndex, newIndex).map((officer, index) => ({ ...officer, sortOrder: index }));
    setOfficers(reordered);
    setSaving(true);
    try { await actions.reorder(reordered.map((officer) => officer.id)); } finally { setSaving(false); }
  }

  return (
    <DndContext id="admin-leaders-officers" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={officers.map((officer) => officer.id)} strategy={verticalListSortingStrategy}>
        <div className="relative">
          {saving && <div className="absolute right-4 top-3 font-ko text-[12px] text-gold-deep">저장 중...</div>}

          {/* 데스크탑 테이블 */}
          <div className="hidden overflow-x-auto min-[900px]:block">
            <table className="w-full min-w-[820px] border-collapse">
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
                {officers.map((officer) => <OfficerRow key={officer.id} officer={officer} editId={editId} actions={actions} />)}
                {!officers.length && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center font-ko text-[13px] text-ink-soft">등록된 임원진이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 */}
          <div className="min-[900px]:hidden">
            {officers.map((officer) => <OfficerCard key={officer.id} officer={officer} editId={editId} actions={actions} />)}
            {!officers.length && (
              <p className="px-4 py-10 text-center font-ko text-[13px] text-ink-soft">등록된 임원진이 없습니다.</p>
            )}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
}
