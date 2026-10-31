import '../setup.js';
import { pool } from '../../src/config/db.js';

export { pool };

export async function truncateUsers() {
  await pool.query('TRUNCATE TABLE users CASCADE');
}

// Los viajes referencian a users: se truncan primero para no depender del
// orden de las FKs.
export async function truncateTripsAndUsers() {
  await pool.query('TRUNCATE TABLE trips, users CASCADE');
}

export async function closePool() {
  await pool.end();
}
