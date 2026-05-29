import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGalleryReorderUpdates,
  parseGalleryUploadForm,
} from './gallery-form.ts';

test('parses a gallery upload with a title and one image file', () => {
  const file = new File(['photo-bytes'], 'Sunday Worship.JPG', { type: 'image/jpeg' });
  const formData = new FormData();
  formData.set('title', '  Sunday Worship  ');
  formData.set('photo_file', file);

  const result = parseGalleryUploadForm(formData);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.value.title, 'Sunday Worship');
  assert.equal(result.value.file, file);
});

test('rejects missing gallery title and photo', () => {
  const result = parseGalleryUploadForm(new FormData());

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(result.errors, ['Enter a title.', 'Choose one image.']);
});

test('rejects non-image gallery uploads', () => {
  const formData = new FormData();
  formData.set('title', 'Program PDF');
  formData.set('photo_file', new File(['pdf'], 'program.pdf', { type: 'application/pdf' }));

  const result = parseGalleryUploadForm(formData);

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(result.errors, ['Choose an image file.']);
});

test('builds gallery reorder updates with zero-based order', () => {
  assert.deepEqual(buildGalleryReorderUpdates(['photo-a', 'photo-b']), [
    { id: 'photo-a', sortOrder: 0 },
    { id: 'photo-b', sortOrder: 1 },
  ]);
});
