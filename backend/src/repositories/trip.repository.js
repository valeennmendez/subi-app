import { pool } from '../config/db.js';

const TRIP_COLUMNS = `id, driver_id, origin_city, destination_city, departure_time,
       total_seats, available_seats, price_per_seat, status, created_at`;

// available_seats y status los fija el servidor, nunca el cliente.
export async function createTrip({
  driverId,
  originCity,
  destinationCity,
  departureTime,
  totalSeats,
  pricePerSeat,
}) {
  const { rows } = await pool.query(
    `INSERT INTO trips (
       driver_id, origin_city, destination_city, departure_time,
       total_seats, available_seats, price_per_seat, status
     )
     VALUES ($1, $2, $3, $4, $5, $5, $6, 'scheduled')
     RETURNING ${TRIP_COLUMNS}`,
    [driverId, originCity, destinationCity, departureTime, totalSeats, pricePerSeat],
  );

  return rows[0];
}

export async function findTripsByDriverId(driverId) {
  const { rows } = await pool.query(
    `SELECT ${TRIP_COLUMNS}
     FROM trips
     WHERE driver_id = $1
     ORDER BY departure_time DESC, id DESC`,
    [driverId],
  );

  return rows;
}
