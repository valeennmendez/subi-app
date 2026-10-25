export const DEFAULT_REDIRECT = '/cuenta';

export function getSafeRedirectPath(state) {
  const from = state?.from;

  if (typeof from !== 'string') return DEFAULT_REDIRECT;
  if (!from.startsWith('/')) return DEFAULT_REDIRECT;
  if (from.startsWith('//')) return DEFAULT_REDIRECT;
  if (from.startsWith('/\\')) return DEFAULT_REDIRECT;

  return from;
}
