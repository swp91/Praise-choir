import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPublicEventDate, sortPublicEvents } from './events-display.ts';

test('formats public event dates as Korean month and day labels', () => {
  assert.equal(formatPublicEventDate({ eventDate: '2026-06-18', month: 6, dateLabel: '26.06.18' }), '6월 18일');
  assert.equal(formatPublicEventDate({ eventDate: null, month: 9, dateLabel: '26.09' }), '9월');
  assert.equal(formatPublicEventDate({ eventDate: null, month: null, dateLabel: null }), '미정');
});

test('sorts public events by date before display', () => {
  const sorted = sortPublicEvents([
    { title: 'September', eventDate: '2026-09-01', month: 9, dateLabel: '26.09.01', sortOrder: 0 },
    { title: 'June', eventDate: '2026-06-18', month: 6, dateLabel: '26.06.18', sortOrder: 1 },
    { title: 'Monthly', eventDate: null, month: 7, dateLabel: '26.07', sortOrder: 2 },
    { title: 'Undated', eventDate: null, month: null, dateLabel: null, sortOrder: 3 },
  ]);

  assert.deepEqual(sorted.map((event) => event.title), ['June', 'Monthly', 'September', 'Undated']);
});
