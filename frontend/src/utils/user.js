function splitName(name) {
  return String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function getFirstName(name) {
  return splitName(name)[0] ?? '';
}

export function getInitials(name) {
  const parts = splitName(name);

  if (parts.length === 0) return '';

  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';

  return `${first}${last}`.toLocaleUpperCase('es-AR');
}

export function formatRating(rating) {
  if (rating === null || rating === undefined || rating === '') return null;

  const value = Number(rating);

  if (!Number.isFinite(value)) return null;

  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatMemberSince(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}
