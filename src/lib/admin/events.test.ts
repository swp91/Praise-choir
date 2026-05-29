import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEventReorderUpdates, parseEventForm } from './event-form.ts';

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
