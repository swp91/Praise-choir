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

// 드래그앤드롭(순서 정렬)이 활성화된 Row 컴포넌트
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
      <td className="font-ko text-[13px] font-bold text-ink">
        <span
          {...attributes}
          {...listeners}
          className="flex h-full w-full cursor-grab select-none items-center gap-3 px-4 py-2 active:cursor-grabbing"
        >
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={member.displayName}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-line font-ko text-[13px] text-ink-mute">
              {member.displayName.charAt(0)}
            </span>
          )}
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

// 드래그앤드롭이 비활성화된 일반 Row 컴포넌트 (전체 탭용)
function StaticRow({
  member,
  toggleAction,
}: {
  member: AdminMember;
  toggleAction: ToggleAction;
}) {
  return (
    <tr className="border-b border-line-soft last:border-b-0">
      <td className="px-4 py-2 font-ko text-[13px] font-bold text-ink">
        <div className="flex items-center gap-3">
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={member.displayName}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-line font-ko text-[13px] text-ink-mute">
              {member.displayName.charAt(0)}
            </span>
          )}
          {member.displayName}
        </div>
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
            href={`/admin/members?edit=${member.id}`}
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

// 모바일 환경에서의 카드 뷰 컴포넌트
function MemberCard({
  member,
  activeSection,
  toggleAction,
}: {
  member: AdminMember;
  activeSection?: string;
  toggleAction: ToggleAction;
}) {
  return (
    <div id={`member-${member.id}`} className="scroll-mt-4 border-b border-line-soft px-4 py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={member.displayName}
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-line font-ko text-[14px] text-ink-mute">
              {member.displayName.charAt(0)}
            </span>
          )}
          <div>
            <div className="font-ko text-[14px] font-bold text-ink">{member.displayName}</div>
            <div className="mt-0.5 font-ko text-[12px] text-ink-soft">{member.sectionName}</div>
          </div>
        </div>
        <ToggleActiveButton
          id={member.id}
          isActive={member.isActive}
          action={toggleAction}
        />
      </div>

      <div className="mt-4 pl-[52px] space-y-2">
        <div className="flex items-center justify-between text-[13px]">
          <span className="font-ko text-ink-mute w-20 shrink-0">역할/악기</span>
          <span className="font-ko text-ink-soft text-right grow">
            {[member.roleText, member.instrumentName].filter(Boolean).join(' / ') || '-'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <span className="font-ko text-ink-mute w-20 shrink-0">생일</span>
          <span className="font-ko text-ink-soft text-right grow">
            {member.showBirth ? member.birthLabel ?? '-' : '비공개'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <span className="font-ko text-ink-mute w-20 shrink-0">전화번호</span>
          <span className="font-ko text-ink-soft text-right grow">
            {member.showPhone ? member.phoneLabel ?? '-' : '비공개'}
          </span>
        </div>

        <div className="mt-4 pt-2 flex justify-end gap-2 border-t border-line-soft/50">
          <Link
            href={
              activeSection
                ? `/admin/members?edit=${member.id}&section=${activeSection}`
                : `/admin/members?edit=${member.id}`
            }
            className="border border-line bg-cream px-3 py-2 font-ko text-[12px] text-ink transition hover:border-gold"
          >
            수정
          </Link>
          <DeleteMemberButton id={member.id} name={member.displayName} />
        </div>
      </div>
    </div>
  );
}

type Props = {
  members: AdminMember[];
  sectionId?: string;
  reorderAction?: ReorderAction;
  toggleAction: ToggleAction;
};

export default function SortableMemberTable({ members, sectionId, reorderAction, toggleAction }: Props) {
  const [items, setItems] = useState(members);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const isSortable = !!(sectionId && reorderAction);

  async function handleDragEnd(event: DragEndEvent) {
    if (!isSortable || !reorderAction || !sectionId) return;

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

  // 테이블 내부 요소 렌더링
  const tableContent = (
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
        {items.map((member) =>
          isSortable && sectionId ? (
            <SortableRow
              key={member.id}
              member={member}
              activeSection={sectionId}
              toggleAction={toggleAction}
            />
          ) : (
            <StaticRow
              key={member.id}
              member={member}
              toggleAction={toggleAction}
            />
          )
        )}
        {!items.length ? (
          <tr>
            <td colSpan={7} className="px-4 py-10 text-center font-ko text-[13px] text-ink-soft">
              표시할 대원 데이터가 없습니다.
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );

  return (
    <div className="relative">
      {saving ? (
        <div className="absolute right-4 top-3 font-ko text-[12px] text-gold-deep">
          저장 중...
        </div>
      ) : null}

      {/* 데스크탑 테이블 뷰 */}
      <div className="overflow-x-auto max-[900px]:hidden">
        {isSortable ? (
          <DndContext
            id={`admin-members-${sectionId}`}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map((m) => m.id)} strategy={verticalListSortingStrategy}>
              {tableContent}
            </SortableContext>
          </DndContext>
        ) : (
          tableContent
        )}
      </div>

      {/* 모바일 카드 뷰 */}
      <div className="min-[900px]:hidden">
        {items.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            activeSection={sectionId}
            toggleAction={toggleAction}
          />
        ))}
        {!items.length ? (
          <p className="px-4 py-10 text-center font-ko text-[13px] text-ink-soft">
            표시할 대원 데이터가 없습니다.
          </p>
        ) : null}
      </div>
    </div>
  );
}
