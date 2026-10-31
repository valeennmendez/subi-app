import { pool } from '../config/db.js';

const TRIP_COLUMNS = [
  'id',
  'driver_id',
  'origin_city',
  'destination_city',
  'departure_time',
  'total_seats',
  'available_seats',
  'price_per_seat',
  'status',
  'created_at',
];

function selectTripColumns(alias = '') {
  return TRIP_COLUMNS.map((column) => `${alias}${column}`).join(', ');
}

// Los comodines de LIKE se escapan para que el usuario busque un prefijo
// literal y no pueda ampliar la búsqueda con % o _.
function escapeLikePattern(value) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

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
     RETURNING ${selectTripColumns()}`,
    [driverId, originCity, destinationCity, departureTime, totalSeats, pricePerSeat],
  );

  return rows[0];
}

export async function findTripsByDriverId(driverId) {
  const { rows } = await pool.query(
    `SELECT ${selectTripColumns()}
     FROM trips
     WHERE driver_id = $1
     ORDER BY departure_time DESC, id DESC`,
    [driverId],
  );

  return rows;
}

export async function findScheduledTrips({
  originPrefix,
  destinationPrefix,
  dayStart,
  dayEnd,
  seats,
}) {
  const values = [seats];
  const conditions = [`status = 'scheduled'`, `available_seats >= $1`];

  if (originPrefix) {
    values.push(`${escapeLikePattern(originPrefix)}%`);
    conditions.push(`origin_search LIKE $${values.length}`);
  }

  if (destinationPrefix) {
    values.push(`${escapeLikePattern(destinationPrefix)}%`);
    conditions.push(`destination_search LIKE $${values.length}`);
  }

  if (dayStart && dayEnd) {
    values.push(dayStart);
    conditions.push(`departure_time >= $${values.length}`);

    values.push(dayEnd);
    conditions.push(`departure_time < $${values.length}`);
  }

  const { rows } = await pool.query(
    `SELECT ${selectTripColumns()}
     FROM trips
     WHERE ${conditions.join(' AND ')}
     ORDER BY departure_time ASC, id ASC`,
    values,
  );

  return rows;
}
