import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.on('error', (error) => {
  console.error(
    'Error inesperado en el pool de PostgreSQL:',
    error.code ?? 'sin código',
  );
});

export async function verifyDatabaseConnection() {
  await pool.query('SELECT 1');
  console.log('conexión a la base OK');
}
