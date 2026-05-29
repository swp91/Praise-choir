import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import type { EventFormValue, EventYearFormValue } from './event-form';
import { buildEventReorderUpdates, sortEventYears, sortEventsByDate } from './event-form';

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
  isHighlight: boolean;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string | null;
};

export type AdminEventYear = {
  year: number;
  displayType: 'schedule' | 'report';
};

export type AdminEventsData = {
  configured: boolean;
  currentYear: number;
  selectedYear: number;
  yearOptions: AdminEventYear[];
  candidateYears: number[];
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
    isHighlight: Boolean(row.is_highlight),
    sortOrder: Number(row.sort_order ?? 0),
    isPublished: row.is_published !== false,
    createdAt: row.created_at ? String(row.created_at) : null,
  };
}

async function getAdminCurrentYear() {
  const supabase = getSupabaseAdmin();
  const result = await supabase.from('site_settings').select('current_year_override').single();
  const settings = must<{ current_year_override: number | null }>(result, '사이트 설정 조회 실패');
  return settings.current_year_override ?? new Date().getFullYear();
}

function yearCandidateOptions(currentYear: number, existingYears: number[]) {
  const existing = new Set(existingYears);
  return Array.from({ length: 9 }, (_, index) => currentYear - 2 + index)
    .filter((year) => !existing.has(year))
    .sort((a, b) => b - a);
}

export async function getAdminEventsData(selectedYearParam?: string): Promise<AdminEventsData> {
  const fallbackYear = new Date().getFullYear();

  if (!isSupabaseAdminConfigured()) {
    return {
      configured: false,
      currentYear: fallbackYear,
      selectedYear: Number(selectedYearParam) || fallbackYear,
      yearOptions: [],
      candidateYears: yearCandidateOptions(fallbackYear, []),
      events: [],
    };
  }

  const supabase = getSupabaseAdmin();
  const currentYear = await getAdminCurrentYear();
  const yearsResult = await supabase
    .from('event_years')
    .select('year,display_type')
    .eq('is_active', true)
    .order('sort_order')
    .order('year', { ascending: false });
  const yearRows = must<Record<string, unknown>[]>(yearsResult, '일정 연도 조회 실패');
  const yearOptions = yearRows.map((row) => ({
    year: Number(row.year),
    displayType: String(row.display_type) === 'report' ? 'report' : 'schedule',
  })) satisfies AdminEventYear[];
  const selectedYear = Number(selectedYearParam) || yearOptions[0]?.year || currentYear;

  const eventsResult = await supabase
    .from('events')
    .select('*')
    .eq('year', selectedYear)
    .order('sort_order')
    .order('event_date', { nullsFirst: false })
    .order('created_at');
  const events = must<Record<string, unknown>[]>(eventsResult, '일정 목록 조회 실패');

  return {
    configured: true,
    currentYear,
    selectedYear,
    yearOptions: sortEventYears(yearOptions),
    candidateYears: yearCandidateOptions(currentYear, yearOptions.map((option) => option.year)),
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
    is_highlight: value.isHighlight,
    is_published: value.isPublished,
  };
}

async function reorderYearEvents(year: number) {
  const supabase = getSupabaseAdmin();
  const result = await supabase
    .from('events')
    .select('id,event_date,month,sort_order,created_at')
    .eq('year', year);
  const events = must<Record<string, unknown>[]>(result, '일정 정렬 조회 실패').map((row) => ({
    id: String(row.id),
    eventDate: row.event_date ? String(row.event_date) : null,
    month: row.month ? Number(row.month) : null,
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: row.created_at ? String(row.created_at) : null,
  }));

  const results = await Promise.all(
    buildEventReorderUpdates(sortEventsByDate(events).map((event) => event.id)).map(({ id, sortOrder }) =>
      supabase.from('events').update({ sort_order: sortOrder }).eq('id', id),
    ),
  );

  results.forEach((result, index) => {
    must(result, `일정 자동 정렬 실패 ${index + 1}`);
  });
}

export async function createEventYear(value: EventYearFormValue) {
  const supabase = getSupabaseAdmin();
  const maxResult = await supabase
    .from('event_years')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = Number(maxResult.data?.sort_order ?? -1) + 1;

  must(
    await supabase.from('event_years').insert({
      year: value.year,
      display_type: value.displayType,
      sort_order: nextOrder,
      is_active: true,
    }),
    '일정 연도 추가 실패',
  );

  await supabase.from('admin_audit_logs').insert({
    action: 'create',
    entity_table: 'event_years',
    metadata: { year: value.year, display_type: value.displayType },
  });
}

export async function deleteEventYear(year: number) {
  const supabase = getSupabaseAdmin();
  must(
    await supabase.from('events').delete().eq('year', year),
    '연도 일정 삭제 실패',
  );
  must(
    await supabase.from('event_years').delete().eq('year', year),
    '일정 연도 삭제 실패',
  );

  await supabase.from('admin_audit_logs').insert({
    action: 'delete',
    entity_table: 'event_years',
    metadata: { year },
  });
}

export async function createEvent(value: EventFormValue) {
  const supabase = getSupabaseAdmin();
  const event = must<{ id: string }>(
    await supabase
      .from('events')
      .insert({ ...eventPayload(value), sort_order: 0 })
      .select('id')
      .single(),
    '일정 추가 실패',
  );

  await reorderYearEvents(value.year);

  await supabase.from('admin_audit_logs').insert({
    action: 'create',
    entity_table: 'events',
    entity_id: event.id,
    metadata: { title: value.title, year: value.year },
  });
}

export async function updateEvent(id: string, value: EventFormValue) {
  const supabase = getSupabaseAdmin();
  const before = must<{ year: number }>(
    await supabase.from('events').select('year').eq('id', id).single(),
    '일정 조회 실패',
  );

  must(
    await supabase.from('events').update(eventPayload(value)).eq('id', id),
    '일정 수정 실패',
  );

  await reorderYearEvents(Number(before.year));
  if (Number(before.year) !== value.year) await reorderYearEvents(value.year);

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
  const event = must<{ year: number }>(
    await supabase.from('events').select('year').eq('id', id).single(),
    '일정 조회 실패',
  );
  must(
    await supabase.from('events').delete().eq('id', id),
    '일정 삭제 실패',
  );
  await reorderYearEvents(Number(event.year));
}
