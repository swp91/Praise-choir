export function imageUrl(source?: string | null, _transform?: unknown) {
  // Option parameter exists to match callers, but we bypass it for Supabase direct serving
  if (_transform) {}
  return source || '';
}
