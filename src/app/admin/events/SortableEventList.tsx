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
import type { AdminEvent } from '@/lib/admin/events';
import type { reorderEventsAction, setEventHighlightAction, setEventPublishedAction } from './actions';
import DeleteEventButton from './DeleteEventButton';
import ToggleEventButton from './ToggleEventButton';

type Props = {
  events: AdminEvent[];
  year: number;
  actions: {
    reorder: typeof reorderEventsAction;
    setPublished: typeof setEventPublishedAction;
    setHighlight: typeof setEventHighlightAction;
  };
};

function displayDate(event: AdminEvent) {
  if (event.eventDate) {
    const [, month, day] = event.eventDate.split('-');
    return `${Number(month)}/${Number(day)}`;
  }
  if (event.month) return `${event.month}월`;
  return '미정';
}

function EventRow({
  event,
  index,
  year,
  actions,
}: {
  event: AdminEvent;
  index: number;
  year: number;
  actions: Props['actions'];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: event.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-[44px_130px_1fr_auto] items-start gap-3 border-b border-line-soft px-4 py-3 last:border-b-0 max-[900px]:grid-cols-[36px_1fr] ${
        !event.isPublished ? 'opacity-55' : ''
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab border border-line bg-cream px-2 py-1 font-ko text-[12px] font-bold text-ink-mute active:cursor-grabbing"
        aria-label={`${event.title} 순서 변경`}
      >
        {index + 1}
      </button>

      <div className="font-ko text-[13px] font-bold text-ink-soft text-center max-[900px]:col-start-2">
        {displayDate(event)}
      </div>

      <div className="min-w-0 max-[900px]:col-span-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-ko text-[15px] font-bold leading-snug text-ink">{event.title}</h3>
          {event.isHighlight ? (
            <span className="border border-gold bg-gold/10 px-2 py-0.5 font-ko text-[11px] text-gold-deep">
              강조
            </span>
          ) : null}
        </div>
        {event.detail ? (
          <p className="mt-1 font-ko text-[13px] leading-relaxed text-ink-soft">{event.detail}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-wrap justify-end gap-2 max-[900px]:col-span-2 max-[900px]:justify-start">
        <ToggleEventButton
          id={event.id}
          active={event.isPublished}
          activeLabel="공개"
          inactiveLabel="비공개"
          activeClass="border-green-400 bg-green-50 text-green-700 hover:bg-green-100"
          inactiveClass="border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
          action={actions.setPublished}
        />
        <ToggleEventButton
          id={event.id}
          active={event.isHighlight}
          activeLabel="강조"
          inactiveLabel="일반"
          activeClass="border-gold bg-gold/10 text-gold-deep hover:bg-gold/20"
          inactiveClass="border-line bg-cream text-ink-soft hover:border-gold"
          action={actions.setHighlight}
        />
        <Link
          href={`/admin/events?year=${year}&edit=${event.id}#event-form`}
          className="border border-line bg-cream px-3 py-1.5 font-ko text-[12px] text-ink transition hover:border-gold"
        >
          수정
        </Link>
        <DeleteEventButton id={event.id} year={year} title={event.title} />
      </div>
    </div>
  );
}

export default function SortableEventList({ events: initialEvents, year, actions }: Props) {
  const [events, setEvents] = useState(initialEvents);
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = events.findIndex((item) => item.id === active.id);
    const newIndex = events.findIndex((item) => item.id === over.id);
    const reordered = arrayMove(events, oldIndex, newIndex);
    setEvents(reordered);

    setSaving(true);
    try {
      await actions.reorder(reordered.map((item) => item.id));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DndContext id={`admin-events-${year}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={events.map((event) => event.id)} strategy={verticalListSortingStrategy}>
        <div className="relative">
          {saving ? (
            <div className="absolute right-4 top-2 font-ko text-[12px] text-gold-deep">저장 중...</div>
          ) : null}
          {events.map((event, index) => (
            <EventRow key={event.id} event={event} index={index} year={year} actions={actions} />
          ))}
          {!events.length ? (
            <p className="px-4 py-10 text-center font-ko text-[13px] text-ink-soft">
              등록된 일정이 없습니다.
            </p>
          ) : null}
        </div>
      </SortableContext>
    </DndContext>
  );
}
