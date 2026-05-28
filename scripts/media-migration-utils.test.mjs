import test from 'node:test';
import assert from 'node:assert/strict';
import { extensionFromContentType, storagePathForAsset } from './media-migration-utils.mjs';

test('maps image content types to file extensions', () => {
  assert.equal(extensionFromContentType('image/jpeg'), 'jpg');
  assert.equal(extensionFromContentType('image/png; charset=utf-8'), 'png');
  assert.equal(extensionFromContentType('image/webp'), 'webp');
  assert.equal(extensionFromContentType('application/octet-stream'), 'jpg');
});

test('builds stable storage paths from legacy keys', () => {
  assert.equal(
    storagePathForAsset({ id: 'asset-id', legacy_key: 'jin-sun-yeon' }, 'image/webp'),
    'members/jin-sun-yeon.webp',
  );
  assert.equal(
    storagePathForAsset({ id: 'asset-id', legacy_key: '이연옥 권사' }, 'image/jpeg'),
    'members/이연옥-권사.jpg',
  );
});
