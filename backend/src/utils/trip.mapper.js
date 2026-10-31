// price_per_seat se devuelve como string, tal cual lo entrega pg para
// NUMERIC: no se convierte a Number para no perder precisión.
export function toPublicTrip(row) {
  return {
    id: row.id,
    driver_id: row.driver_id,
    origin_city: row.origin_city,
    destination_city: row.destination_city,
    departure_time: row.departure_time,
    total_seats: row.total_seats,
    available_seats: row.available_seats,
    price_per_seat: row.price_per_seat,
    status: row.status,
    created_at: row.created_at,
  };
}

export function toPublicTripDetail(row) {
  return {
    ...toPublicTrip(row),
    driver_name: row.driver_name,
  };
}
