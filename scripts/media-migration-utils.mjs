export function extensionFromContentType(contentType) {
  const normalized = contentType?.split(';')[0]?.trim().toLowerCase();

  if (normalized === 'image/jpeg') return 'jpg';
  if (normalized === 'image/png') return 'png';
  if (normalized === 'image/webp') return 'webp';
  if (normalized === 'image/gif') return 'gif';
  if (normalized === 'image/avif') return 'avif';

  return 'jpg';
}

export function storagePathForAsset(asset, contentType) {
  const key = asset.legacy_key || asset.id;
  const safeKey = String(key)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `members/${safeKey || asset.id}.${extensionFromContentType(contentType)}`;
}
