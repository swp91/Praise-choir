export type EventFormValue = {
  year: number;
  title: string;
  detail: string | null;
  eventDate: string | null;
  month: number | null;
  dateLabel: string | null;
  category: string | null;
  isHighlight: boolean;
  isPublished: boolean;
};

export type EventFormResult =
  | { ok: true; value: EventFormValue }
  | { ok: false; errors: string[] };

export type EventYearDisplayType = 'schedule' | 'report';

export type EventYearFormValue = {
  year: number;
  displayType: EventYearDisplayType;
};

export type EventYearFormResult =
  | { ok: true; value: EventYearFormValue }
  | { ok: false; errors: string[] };

export type DeleteEventYearFormValue = {
  year: number;
};

export type DeleteEventYearFormResult =
  | { ok: true; value: DeleteEventYearFormValue }
  | { ok: false; errors: string[] };

export type EventYearLike = {
  year: number;
  displayType: EventYearDisplayType;
};

export type SortableEventLike = {
  id: string;
  eventDate: string | null;
  month: number | null;
  sortOrder: number;
  createdAt?: string | null;
};

function optionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text || null;
}

function yearShortLabel(year: number, month: number) {
  return `${String(year).slice(-2)}.${String(month).padStart(2, '0')}`;
}

function monthFromDate(value: string | null) {
  if (!value) return null;
  const match = value.match(/^\d{4}-(\d{2})-\d{2}$/);
  return match ? Number(match[1]) : null;
}

export function parseEventForm(formData: FormData): EventFormResult {
  const year = Number(formData.get('year'));
  const title = String(formData.get('title') ?? '').trim();
  const detail = optionalText(formData.get('detail'));
  const eventDate = optionalText(formData.get('event_date'));
  const category = optionalText(formData.get('category'));
  const dateMonth = monthFromDate(eventDate);
  const month = (dateMonth ?? Number(formData.get('month') || 0)) || null;
  const errors: string[] = [];

  if (!year) errors.push('연도를 입력해 주세요.');
  if (!title) errors.push('일정 제목을 입력해 주세요.');
  if (month && (month < 1 || month > 12)) errors.push('월은 1월부터 12월 사이로 입력해 주세요.');

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      year,
      title,
      detail,
      eventDate,
      month,
      dateLabel: month ? yearShortLabel(year, month) : null,
      category,
      isHighlight: formData.get('is_highlight') === 'on',
      isPublished: formData.get('is_published') === 'on',
    },
  };
}

export function buildEventReorderUpdates(orderedIds: string[]) {
  return orderedIds.map((id, sortOrder) => ({ id, sortOrder }));
}

export function parseEventYearForm(formData: FormData): EventYearFormResult {
  const year = Number(formData.get('year'));
  const displayType = String(formData.get('display_type') ?? '') as EventYearDisplayType;
  const errors: string[] = [];

  if (!year) errors.push('연도를 선택해 주세요.');
  if (displayType !== 'schedule' && displayType !== 'report') errors.push('표시 방식을 선택해 주세요.');

  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { year, displayType } };
}

export function parseDeleteEventYearForm(formData: FormData): DeleteEventYearFormResult {
  const year = Number(formData.get('year'));
  if (!year) return { ok: false, errors: ['삭제할 연도를 찾지 못했습니다.'] };
  return { ok: true, value: { year } };
}

export function sortEventYears<T extends EventYearLike>(years: T[]) {
  return [...years].sort((a, b) => {
    const typeOrder = (t: string) => (t === 'schedule' ? 0 : 1);
    const typeDiff = typeOrder(a.displayType) - typeOrder(b.displayType);
    if (typeDiff !== 0) return typeDiff;
    return b.year - a.year;
  });
}

function sortKey(event: SortableEventLike) {
  if (event.eventDate) {
    const [, month, day] = event.eventDate.split('-');
    return `${month}-${day}-0`;
  }
  if (event.month) return `${String(event.month).padStart(2, '0')}-99-1`;
  return '99-99-2';
}

export function sortEventsByDate<T extends SortableEventLike>(events: T[]) {
  return [...events].sort((a, b) => {
    const dateCompare = sortKey(a).localeCompare(sortKey(b));
    if (dateCompare !== 0) return dateCompare;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? ''));
  });
}
