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
