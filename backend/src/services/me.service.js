import { AppError } from '../errors/AppError.js';
import { findUserById } from '../repositories/user.repository.js';
import { toPublicUser } from '../utils/user.mapper.js';

export async function getCurrentUser(userId) {
  const userRow = await findUserById(userId);

  if (!userRow) {
    throw new AppError(401, 'No autenticado');
  }

  return toPublicUser(userRow);
}
