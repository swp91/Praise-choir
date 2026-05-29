import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEventReorderUpdates, parseEventForm, parseEventYearForm, sortEventsByDate } from './event-form.ts';

test('parses an event form with a specific date', () => {
  const formData = new FormData();
  formData.set('year', '2026');
  formData.set('title', '  제27회 광진찬양제 ');
  formData.set('detail', '  2026.07.05 예정 ');
  formData.set('event_date', '2026-07-05');
  formData.set('month', '');
  formData.set('is_highlight', 'on');
  formData.set('is_published', 'on');

  const result = parseEventForm(formData);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.value, {
    year: 2026,
    title: '제27회 광진찬양제',
    detail: '2026.07.05 예정',
    eventDate: '2026-07-05',
    month: 7,
    dateLabel: '26.07',
    category: null,
    isHighlight: true,
    isPublished: true,
  });
});

test('parses an event form with only a month', () => {
  const formData = new FormData();
  formData.set('year', '2027');
  formData.set('title', '헌신예배');
  formData.set('month', '6');

  const result = parseEventForm(formData);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.value.eventDate, null);
  assert.equal(result.value.month, 6);
  assert.equal(result.value.dateLabel, '27.06');
  assert.equal(result.value.isHighlight, false);
  assert.equal(result.value.isPublished, false);
});

test('rejects missing required event fields', () => {
  const result = parseEventForm(new FormData());

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(result.errors, ['연도를 입력해 주세요.', '일정 제목을 입력해 주세요.']);
});

test('builds event reorder updates with zero-based order', () => {
  assert.deepEqual(buildEventReorderUpdates(['event-a', 'event-b']), [
    { id: 'event-a', sortOrder: 0 },
    { id: 'event-b', sortOrder: 1 },
  ]);
});

test('parses an event year form with a display type', () => {
  const formData = new FormData();
  formData.set('year', '2027');
  formData.set('display_type', 'schedule');

  const result = parseEventYearForm(formData);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.value, { year: 2027, displayType: 'schedule' });
});

test('rejects invalid event year display type', () => {
  const formData = new FormData();
  formData.set('year', '2027');
  formData.set('display_type', 'other');

  const result = parseEventYearForm(formData);

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(result.errors, ['표시 방식을 선택해 주세요.']);
});

test('sorts events by specific date, month, then undated items', () => {
  const sorted = sortEventsByDate([
    { id: 'created-last', eventDate: null, month: null, sortOrder: 0, createdAt: '2026-01-04' },
    { id: 'march', eventDate: null, month: 3, sortOrder: 1, createdAt: '2026-01-03' },
    { id: 'feb-specific', eventDate: '2026-02-14', month: 2, sortOrder: 4, createdAt: '2026-01-05' },
    { id: 'jan-specific', eventDate: '2026-01-28', month: 1, sortOrder: 2, createdAt: '2026-01-02' },
    { id: 'jan-month', eventDate: null, month: 1, sortOrder: 3, createdAt: '2026-01-01' },
  ]);

  assert.deepEqual(sorted.map((event) => event.id), ['jan-specific', 'jan-month', 'feb-specific', 'march', 'created-last']);
});
