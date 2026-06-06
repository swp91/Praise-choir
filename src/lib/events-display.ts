export type PublicEventLike = {
  title: string;
  eventDate: string | null;
  month: number | null;
  dateLabel: string | null;
  sortOrder: number;
  createdAt?: string | null;
};

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function dateSortKey(event: PublicEventLike) {
  if (event.eventDate) {
    const [, month, day] = event.eventDate.split('-');
    return `${month}-${day}-0`;
  }
  if (event.month) return `${pad(event.month)}-99-1`;
  return '99-99-2';
}

export function sortPublicEvents<T extends PublicEventLike>(events: T[]) {
  return [...events].sort((a, b) => {
    const dateCompare = dateSortKey(a).localeCompare(dateSortKey(b));
    if (dateCompare !== 0) return dateCompare;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? ''));
  });
}

export function formatPublicEventDate(event: Pick<PublicEventLike, 'eventDate' | 'month' | 'dateLabel'>) {
  if (event.eventDate) {
    const [, month, day] = event.eventDate.split('-').map(Number);
    return `${month}월 ${day}일`;
  }

  if (event.month) return `${event.month}월`;

  const dateParts = event.dateLabel?.match(/^\d{2}\.(\d{1,2})(?:\.(\d{1,2}))?$/);
  if (dateParts?.[2]) return `${Number(dateParts[1])}월 ${Number(dateParts[2])}일`;
  if (dateParts?.[1]) return `${Number(dateParts[1])}월`;

  return '미정';
}
