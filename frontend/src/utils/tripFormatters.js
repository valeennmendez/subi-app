const ARGENTINA_TIME_ZONE = 'America/Argentina/Buenos_Aires';

const DATE_FORMATTER = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: ARGENTINA_TIME_ZONE,
});

const TIME_FORMATTER = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: ARGENTINA_TIME_ZONE,
});

const PRICE_FORMATTER = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 0,
});

// Formato del diseño: "domingo 8 de noviembre · 07:30 h".
export function formatTripDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const dayAndMonth = DATE_FORMATTER.format(date).replace(/,/g, '');

  return `${dayAndMonth} · ${TIME_FORMATTER.format(date)} h`;
}

// price_per_seat llega como string desde NUMERIC: se convierte solo para
// mostrar, sin tocarlo en el envío.
export function formatPrice(value) {
  const price = Number(value);

  if (!Number.isFinite(price)) return '';

  return `$${PRICE_FORMATTER.format(price)}`;
}
