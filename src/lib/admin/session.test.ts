import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAdminSessionToken,
  verifyAdminSessionToken,
} from './session.ts';

test('creates and verifies an admin session token', () => {
  const token = createAdminSessionToken('test-secret', 60, 1_700_000_000_000);

  assert.equal(verifyAdminSessionToken(token, 'test-secret', 1_700_000_030_000), true);
});

test('rejects expired or mismatched admin session tokens', () => {
  const token = createAdminSessionToken('test-secret', 60, 1_700_000_000_000);

  assert.equal(verifyAdminSessionToken(token, 'test-secret', 1_700_000_061_000), false);
  assert.equal(verifyAdminSessionToken(token, 'other-secret', 1_700_000_030_000), false);
  assert.equal(verifyAdminSessionToken('broken-token', 'test-secret', 1_700_000_030_000), false);
});
