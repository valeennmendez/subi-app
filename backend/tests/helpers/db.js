import '../setup.js';
import { pool } from '../../src/config/db.js';

export async function truncateUsers() {
  await pool.query('TRUNCATE TABLE users CASCADE');
}

export async function closePool() {
  await pool.end();
}
