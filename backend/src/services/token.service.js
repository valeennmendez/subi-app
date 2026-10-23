import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signToken(user) {
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

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
}
