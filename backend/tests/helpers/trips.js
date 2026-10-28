// Payload válido para POST /api/trips. La fecha es futura y tiene offset.
export const VALID_TRIP = {
  origin_city: 'Rosario',
  destination_city: 'Córdoba',
  departure_time: '2030-01-01T10:00:00-03:00',
  total_seats: 3,
  price_per_seat: 1500,
};

export function buildTrip(overrides = {}) {
  return { ...VALID_TRIP, ...overrides };
}
