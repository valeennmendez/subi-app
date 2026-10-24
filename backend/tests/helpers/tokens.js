import jwt from 'jsonwebtoken';

// Secreto ficticio: solo sirve para probar el rechazo de firmas ajenas.
const OTHER_SECRET = 'secreto-de-prueba-ajeno-de-32-caracteres';

export const VALID_UUID = '11111111-1111-4111-8111-111111111111';
export const NONEXISTENT_USER_ID = '00000000-0000-4000-8000-000000000000';

export function signTestToken(payload, options = {}) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    ...options,
  });
}

export function signExpiredToken(payload) {
  return jwt.sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) - 60,
    },
    process.env.JWT_SECRET,
    { algorithm: 'HS256' },
  );
}

export function signWithOtherSecret(payload) {
  return jwt.sign(payload, OTHER_SECRET, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });
}

function base64url(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

export function signNoneToken(payload) {
  return `${base64url({ alg: 'none', typ: 'JWT' })}.${base64url(payload)}.`;
}
