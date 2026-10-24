// Debe importarse primero en cada archivo de test, antes de cualquier
// módulo de src/. Node ya cargó .env.test mediante --env-file.
//
// Las variables se validan acá, antes de que config/env.js pueda completar
// alguna desde backend/.env. Solo se muestran nombres, nunca valores.

const REQUIRED_VARIABLES = [
  'PORT',
  'NODE_ENV',
  'DATABASE_URL',
  'FRONTEND_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
];

const missingVariables = REQUIRED_VARIABLES.filter(
  (name) => !process.env[name] || process.env[name].trim() === '',
);

if (missingVariables.length > 0) {
  throw new Error(
    `Faltan variables obligatorias para los tests: ${missingVariables.join(', ')}. ` +
      'Definilas en .env.test; no se completan desde backend/.env.',
  );
}

const databaseUrl = process.env.DATABASE_URL;

let databaseName;

try {
  databaseName = decodeURIComponent(
    new URL(databaseUrl).pathname.replace(/^\/+/, ''),
  );
} catch {
  throw new Error('DATABASE_URL no es una URL válida para los tests.');
}

if (!databaseName.endsWith('_test')) {
  throw new Error(
    'Seguridad: los tests solo pueden ejecutarse contra una base cuyo nombre termine en "_test".',
  );
}

// Se fuerza test para desactivar el rate limit y emitir cookies sin Secure,
// sin importar el NODE_ENV que traiga el archivo de entorno.
process.env.NODE_ENV = 'test';
