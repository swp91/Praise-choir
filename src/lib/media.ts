const CLOUDINARY_BASE =
  'https://res.cloudinary.com/dmbiqatia/image/upload';

type Transform = {
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
};

export function imageUrl(source?: string | null, transform: Transform = {}) {
  if (!source) return '';
  if (source.startsWith('http://') || source.startsWith('https://') || source.startsWith('/')) {
    return source;
  }

  const options = [
    transform.width ? `w_${transform.width}` : null,
    transform.height ? `h_${transform.height}` : null,
    transform.crop ? `c_${transform.crop}` : null,
    transform.gravity ? `g_${transform.gravity}` : null,
    'f_auto',
    'q_auto',
  ].filter(Boolean);

  return `${CLOUDINARY_BASE}/${options.join(',')}/${source}`;
}
