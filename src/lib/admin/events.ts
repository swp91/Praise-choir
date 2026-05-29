import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import type { EventFormValue } from './event-form';
import { buildEventReorderUpdates } from './event-form';

type DbError = { message?: string };

function must<T>(result: { data: T | null; error: DbError | null }, label: string) {
  if (result.error) throw new Error(`${label}: ${result.error.message ?? 'unknown error'}`);
  return result.data as T;
}

export type AdminEvent = {
  id: string;
  year: number;
  title: string;
  detail: string | null;
  eventDate: string | null;
  month: number | null;
  dateLabel: string | null;
  category: string | null;
  isHighlight: boolean;
  sortOrder: number;
  isPublished: boolean;
};

export type AdminEventsData = {
  configured: boolean;
  currentYear: number;
  selectedYear: number;
  yearOptions: number[];
  events: AdminEvent[];
};

function toAdminEvent(row: Record<string, unknown>): AdminEvent {
  return {
    id: String(row.id),
    year: Number(row.year),
    title: String(row.title),
    detail: row.detail ? String(row.detail) : null,
    eventDate: row.event_date ? String(row.event_date) : null,
    month: row.month ? Number(row.month) : null,
    dateLabel: row.date_label ? String(row.date_label) : null,
    category: row.category ? String(row.category) : null,
    isHighlight: Boolean(row.is_highlight),
    sortOrder: Number(row.sort_order ?? 0),
    isPublished: row.is_published !== false,
  };
}

async function getAdminCurrentYear() {
  const supabase = getSupabaseAdmin();
  const result = await supabase.from('site_settings').select('current_year_override').single();
  const settings = must<{ current_year_override: number | null }>(result, '사이트 설정 조회 실패');
  return settings.current_year_override ?? new Date().getFullYear();
}

export async function getAdminEventsData(selectedYearParam?: string): Promise<AdminEventsData> {
  const fallbackYear = new Date().getFullYear();

  if (!isSupabaseAdminConfigured()) {
    return {
      configured: false,
      currentYear: fallbackYear,
      selectedYear: Number(selectedYearParam) || fallbackYear,
      yearOptions: [fallbackYear + 1, fallbackYear, fallbackYear - 1],
      events: [],
    };
  }

  const supabase = getSupabaseAdmin();
  const currentYear = await getAdminCurrentYear();
  const selectedYear = Number(selectedYearParam) || currentYear;

  const [yearsResult, eventsResult] = await Promise.all([
    supabase.from('events').select('year').order('year', { ascending: false }),
    supabase
      .from('events')
      .select('*')
      .eq('year', selectedYear)
      .order('sort_order')
      .order('event_date', { nullsFirst: false })
      .order('created_at'),
  ]);

  const years = must<{ year: number }[]>(yearsResult, '일정 연도 조회 실패');
  const events = must<Record<string, unknown>[]>(eventsResult, '일정 목록 조회 실패');
  const yearOptions = Array.from(new Set([
    currentYear + 1,
    currentYear,
    currentYear - 1,
    selectedYear,
    ...years.map((row) => Number(row.year)),
  ])).sort((a, b) => b - a);

  return {
    configured: true,
    currentYear,
    selectedYear,
    yearOptions,
    events: events.map(toAdminEvent),
  };
}

function eventPayload(value: EventFormValue) {
  return {
    year: value.year,
    title: value.title,
    detail: value.detail,
    event_date: value.eventDate,
    month: value.month,
    date_label: value.dateLabel,
    category: value.category,
    is_highlight: value.isHighlight,
    is_published: value.isPublished,
  };
}

export async function createEvent(value: EventFormValue) {
  const supabase = getSupabaseAdmin();
  const maxResult = await supabase
    .from('events')
    .select('sort_order')
    .eq('year', value.year)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = Number(maxResult.data?.sort_order ?? -1) + 1;

  const event = must<{ id: string }>(
    await supabase
      .from('events')
      .insert({ ...eventPayload(value), sort_order: nextOrder })
      .select('id')
      .single(),
    '일정 추가 실패',
  );

  await supabase.from('admin_audit_logs').insert({
    action: 'create',
    entity_table: 'events',
    entity_id: event.id,
    metadata: { title: value.title, year: value.year },
  });
}

export async function updateEvent(id: string, value: EventFormValue) {
  const supabase = getSupabaseAdmin();
  must(
    await supabase.from('events').update(eventPayload(value)).eq('id', id),
    '일정 수정 실패',
  );

  await supabase.from('admin_audit_logs').insert({
    action: 'update',
    entity_table: 'events',
    entity_id: id,
    metadata: { title: value.title, year: value.year },
  });
}

export async function setEventPublished(id: string, published: boolean) {
  const supabase = getSupabaseAdmin();
  must(
    await supabase.from('events').update({ is_published: published }).eq('id', id),
    '일정 공개 상태 변경 실패',
  );
}

export async function setEventHighlight(id: string, highlight: boolean) {
  const supabase = getSupabaseAdmin();
  must(
    await supabase.from('events').update({ is_highlight: highlight }).eq('id', id),
    '일정 강조 상태 변경 실패',
  );
}

export async function reorderEvents(orderedIds: string[]) {
  const supabase = getSupabaseAdmin();
  const results = await Promise.all(
    buildEventReorderUpdates(orderedIds).map(({ id, sortOrder }) =>
      supabase.from('events').update({ sort_order: sortOrder }).eq('id', id),
    ),
  );

  results.forEach((result, index) => {
    must(result, `일정 정렬 변경 실패 ${index + 1}`);
  });
}

export async function deleteEvent(id: string) {
  const supabase = getSupabaseAdmin();
  must(
    await supabase.from('events').delete().eq('id', id),
    '일정 삭제 실패',
  );
}
