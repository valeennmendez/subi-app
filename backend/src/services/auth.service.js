import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import { AppError } from '../errors/AppError.js';
import {
  createUser,
  findUserForLoginByEmail,
} from '../repositories/user.repository.js';
import { toPublicUser } from '../utils/user.mapper.js';
import { signToken } from './token.service.js';

const BCRYPT_ROUNDS = 10;
const DUPLICATE_EMAIL_CONSTRAINT = 'users_email_lower_unique';

// Se genera una sola vez al arrancar. Así el login de un email inexistente
// tiene el mismo costo de bcrypt que el de un email existente.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(
  randomBytes(32).toString('hex'),
  BCRYPT_ROUNDS,
);

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
