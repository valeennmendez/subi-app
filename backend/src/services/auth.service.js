import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../errors/AppError.js';
import {
  createUser,
  findUserForLoginByEmail,
} from '../repositories/user.repository.js';

const BCRYPT_ROUNDS = 10;
const DUPLICATE_EMAIL_CONSTRAINT = 'users_email_lower_unique';

// Se genera una sola vez al arrancar. Así el login de un email inexistente
// tiene el mismo costo de bcrypt que el de un email existente.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(
  randomBytes(32).toString('hex'),
  BCRYPT_ROUNDS,
);

function toPublicUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    rating_average:
      row.rating_average === null ? null : Number(row.rating_average),
    created_at: row.created_at,
  };
}

function signToken(user) {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    env.jwtSecret,
    {
      algorithm: 'HS256',
      expiresIn: env.jwtExpiresIn,
    },
  );

  const { exp } = jwt.decode(token);

  // exp viene en segundos; la cookie usa milisegundos.
  return { token, expiresAt: exp * 1000 };
}

function isDuplicateEmailError(error) {
  return (
    error.code === '23505' &&
    error.constraint === DUPLICATE_EMAIL_CONSTRAINT
  );
}

export async function registerUser({ email, password, name, phone }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  let userRow;

  try {
    userRow = await createUser({ email, passwordHash, name, phone });
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      throw new AppError(409, 'El email ya está registrado');
    }

    throw error;
  }

  const user = toPublicUser(userRow);
  const { token, expiresAt } = signToken(user);

  return { user, token, expiresAt };
}

export async function loginUser({ email, password }) {
  const userRow = await findUserForLoginByEmail(email);
  const passwordHash = userRow?.password_hash ?? DUMMY_PASSWORD_HASH;
  const passwordMatches = await bcrypt.compare(password, passwordHash);

  if (!userRow || !passwordMatches) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  const user = toPublicUser(userRow);
  const { token, expiresAt } = signToken(user);

  return { user, token, expiresAt };
}
