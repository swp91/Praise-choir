'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { parseDeleteEventYearForm, parseEventForm, parseEventYearForm } from '@/lib/admin/event-form';
import {
  createEvent,
  createEventYear,
  deleteEvent,
  deleteEventYear,
  reorderEvents,
  setEventHighlight,
  setEventPublished,
  updateEvent,
} from '@/lib/admin/events';

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect('/admin');
}

function eventsPath(year?: number) {
  return year ? `/admin/events?year=${year}` : '/admin/events';
}

function errorRedirect(error: string, year?: number): never {
  const path = eventsPath(year);
  const separator = path.includes('?') ? '&' : '?';
  redirect(`${path}${separator}error=${encodeURIComponent(error)}`);
}

function successRedirect(success: string, year?: number): never {
  const path = eventsPath(year);
  const separator = path.includes('?') ? '&' : '?';
  redirect(`${path}${separator}success=${encodeURIComponent(success)}`);
}

function revalidateEvents() {
  revalidatePath('/events');
  revalidatePath('/admin/events');
  revalidatePath('/');
}

export async function createEventYearAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseEventYearForm(formData);
  if (!parsed.ok) errorRedirect(parsed.errors.join(' '));

  try {
    await createEventYear(parsed.value);
  } catch {
    errorRedirect('연도를 추가하지 못했습니다. 이미 등록된 연도인지 확인해 주세요.');
  }

  revalidateEvents();
  successRedirect('year_created', parsed.value.year);
}

export async function deleteEventYearAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseDeleteEventYearForm(formData);
  if (!parsed.ok) errorRedirect(parsed.errors.join(' '));

  try {
    await deleteEventYear(parsed.value.year);
  } catch {
    errorRedirect('연도를 삭제하지 못했습니다. Supabase 관리자 키 설정을 확인해 주세요.', parsed.value.year);
  }

  revalidateEvents();
  successRedirect('year_deleted');
}

export async function createEventAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseEventForm(formData);
  const year = Number(formData.get('year')) || undefined;
  if (!parsed.ok) errorRedirect(parsed.errors.join(' '), year);

  try {
    await createEvent(parsed.value);
  } catch {
    errorRedirect('일정을 추가하지 못했습니다. Supabase 관리자 키 설정을 확인해 주세요.', parsed.value.year);
  }

  revalidateEvents();
  successRedirect('created', parsed.value.year);
}

export async function updateEventAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const parsed = parseEventForm(formData);
  const year = Number(formData.get('year')) || undefined;
  if (!id) errorRedirect('수정할 일정을 찾지 못했습니다.', year);
  if (!parsed.ok) errorRedirect(parsed.errors.join(' '), year);

  try {
    await updateEvent(id, parsed.value);
  } catch {
    errorRedirect('일정을 수정하지 못했습니다. Supabase 관리자 키 설정을 확인해 주세요.', parsed.value.year);
  }

  revalidateEvents();
  successRedirect('updated', parsed.value.year);
}

export async function setEventPublishedAction(id: string, published: boolean) {
  await requireAdmin();
  await setEventPublished(id, published);
  revalidateEvents();
}

export async function setEventHighlightAction(id: string, highlight: boolean) {
  await requireAdmin();
  await setEventHighlight(id, highlight);
  revalidateEvents();
}

export async function reorderEventsAction(orderedIds: string[]) {
  await requireAdmin();
  await reorderEvents(orderedIds);
  revalidateEvents();
}

export async function deleteEventAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const year = Number(formData.get('year')) || undefined;
  if (!id) errorRedirect('삭제할 일정을 찾지 못했습니다.', year);

  try {
    await deleteEvent(id);
  } catch {
    errorRedirect('일정을 삭제하지 못했습니다. Supabase 관리자 키 설정을 확인해 주세요.', year);
  }

  revalidateEvents();
  successRedirect('deleted', year);
}
