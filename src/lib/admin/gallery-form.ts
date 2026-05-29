export type GalleryUploadFormValue = {
  title: string;
  file: File;
};

export type GalleryUploadFormResult =
  | { ok: true; value: GalleryUploadFormValue }
  | { ok: false; errors: string[] };

export function parseGalleryUploadForm(formData: FormData): GalleryUploadFormResult {
  const title = String(formData.get('title') ?? '').trim();
  const file = formData.get('photo_file');
  const errors: string[] = [];

  if (!title) errors.push('Enter a title.');
  if (!(file instanceof File) || file.size === 0) {
    errors.push('Choose one image.');
  } else if (!file.type.startsWith('image/')) {
    errors.push('Choose an image file.');
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { title, file: file as File } };
}

export function buildGalleryReorderUpdates(orderedIds: string[]) {
  return orderedIds.map((id, sortOrder) => ({ id, sortOrder }));
}
