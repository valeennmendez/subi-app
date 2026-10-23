import { pool } from '../config/db.js';

export async function createUser({ email, passwordHash, name, phone }) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, name, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, name, phone, rating_average, created_at`,
    [email, passwordHash, name, phone],
  );

  return rows[0];
}

export async function findUserForLoginByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, email, name, phone, rating_average, created_at, password_hash
     FROM users
     WHERE lower(email) = lower($1)
     LIMIT 1`,
    [email],
  );

  return rows[0] ?? null;
}
