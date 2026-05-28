import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBirthLabel } from '../../../lib/admin/birth-label.ts';

test('parses stored birth labels used by legacy data', () => {
  assert.deepEqual(parseBirthLabel('06/16'), { month: '6', day: '16' });
  assert.deepEqual(parseBirthLabel('음7/10'), { month: '7', day: '10' });
  assert.deepEqual(parseBirthLabel('1. 2'), { month: '1', day: '2' });
});
