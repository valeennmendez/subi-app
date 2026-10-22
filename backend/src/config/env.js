import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(currentDirectory, '../../.env');

dotenv.config({ path: envPath, quiet: true });

const requiredVariables = [
  'PORT',
  'NODE_ENV',
  'DATABASE_URL',
  'FRONTEND_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
];

const missingVariables = requiredVariables.filter(
  (name) => !process.env[name] || process.env[name].trim() === '',
);

if (missingVariables.length > 0) {
  console.error(
    `Faltan variables de entorno obligatorias: ${missingVariables.join(', ')}`,
  );
  process.exit(1);
}

const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('La variable PORT debe ser un número entre 1 y 65535');
  process.exit(1);
}

export const env = Object.freeze({
  port,
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL,
  frontendUrl: process.env.FRONTEND_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
});
