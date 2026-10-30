// Payload válido para POST /api/trips. La fecha es futura y tiene offset.
export const VALID_TRIP = {
  origin_city: 'Rosario',
  destination_city: 'Córdoba',
  departure_time: '2030-01-01T10:00:00-03:00',
  total_seats: 3,
  price_per_seat: 1500,
};

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
// Argentina está en UTC-3 todo el año (no tiene horario de verano).
const ARGENTINA_OFFSET_MS = 3 * 60 * 60 * 1000;

// Fecha de salida relativa a ahora: no depende del calendario del día que se
// corran los tests. Devuelve el mismo instante expresado con offset -03:00.
export function futureDepartureTime(msFromNow = ONE_YEAR_MS) {
  const instant = new Date(Date.now() + msFromNow);
  const local = new Date(instant.getTime() - ARGENTINA_OFFSET_MS);
  const isoWithoutMillis = local.toISOString().replace(/\.\d{3}Z$/, '');

  return `${isoWithoutMillis}-03:00`;
}

export function buildTrip(overrides = {}) {
  return { ...VALID_TRIP, ...overrides };
}

export function buildFutureTrip(overrides = {}) {
  return buildTrip({ departure_time: futureDepartureTime(), ...overrides });
}
