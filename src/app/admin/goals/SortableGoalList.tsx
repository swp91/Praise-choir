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
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { AdminGoal } from '@/lib/admin/goals';
import type { setGoalActiveAction, reorderGoalsAction, updateGoalTextAction } from './actions';
import DeleteGoalButton from './DeleteGoalButton';

type Actions = {
  toggleActive: typeof setGoalActiveAction;
  reorder: typeof reorderGoalsAction;
  updateText: typeof updateGoalTextAction;
};

function GoalRow({
  goal,
  index,
  actions,
}: {
  goal: AdminGoal;
  index: number;
  actions: Actions;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: goal.id });

  const [text, setText] = useState(goal.text);
  const [isActive, setIsActive] = useState(goal.isActive);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [, startToggle] = useTransition();

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  async function handleSave() {
    if (text.trim() === goal.text) { setEditing(false); return; }
    setSaving(true);
    await actions.updateText(goal.id, text);
    setSaving(false);
    setEditing(false);
  }

  function handleToggle() {
    const next = !isActive;
    setIsActive(next);
    startToggle(() => { actions.toggleActive(goal.id, next); });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-3 border-b border-line-soft px-4 py-3 last:border-b-0 ${!isActive ? 'opacity-50' : ''}`}
    >
      <span
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab select-none font-en text-[13px] font-bold text-gold-deep active:cursor-grabbing min-w-[24px] text-center"
      >
        {index + 1}
      </span>

      <div className="flex-1">
        {editing ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="w-full border border-gold-deep bg-cream px-3 py-2 font-ko text-[13px] text-ink outline-none resize-none"
            autoFocus
          />
        ) : (
          <p className="font-ko text-[13px] leading-relaxed text-ink">{text}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 mt-0.5">
        {editing ? (
          <>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="border border-gold-deep bg-gold-deep px-3 py-1.5 font-ko text-[12px] font-bold text-cream transition hover:bg-ink disabled:opacity-60"
            >
              {saving ? '저장 중' : '저장'}
            </button>
            <button
              type="button"
              onClick={() => { setText(goal.text); setEditing(false); }}
              className="border border-line bg-card px-3 py-1.5 font-ko text-[12px] text-ink transition hover:border-gold"
            >
              취소
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="border border-line bg-cream px-3 py-1.5 font-ko text-[12px] text-ink transition hover:border-gold"
          >
            수정
          </button>
        )}

        <button
          type="button"
          onClick={handleToggle}
          className={`w-14 border px-2 py-1.5 font-ko text-[12px] font-bold transition ${
            isActive
              ? 'border-green-400 bg-green-50 text-green-700'
              : 'border-red-300 bg-red-50 text-red-600'
          }`}
        >
          {isActive ? '활성' : '비활성'}
        </button>

        <DeleteGoalButton id={goal.id} text={goal.text} />
      </div>
    </div>
  );
}

type Props = {
  goals: AdminGoal[];
  actions: Actions;
};

export default function SortableGoalList({ goals: initialGoals, actions }: Props) {
  const [goals, setGoals] = useState(initialGoals);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = goals.findIndex((g) => g.id === active.id);
    const newIndex = goals.findIndex((g) => g.id === over.id);
    const reordered = arrayMove(goals, oldIndex, newIndex);
    setGoals(reordered);

    setSaving(true);
    try {
      await actions.reorder(reordered.map((g) => g.id));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={goals.map((g) => g.id)} strategy={verticalListSortingStrategy}>
        <div className="relative">
          {saving && (
            <div className="absolute right-4 top-2 font-ko text-[12px] text-gold-deep">저장 중...</div>
          )}
          {goals.map((goal, index) => (
            <GoalRow key={goal.id} goal={goal} index={index} actions={actions} />
          ))}
          {goals.length === 0 && (
            <p className="px-4 py-10 text-center font-ko text-[13px] text-ink-soft">
              등록된 목표가 없습니다.
            </p>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
