import { COOKIE_NAME } from '../config/cookie.js';
import { AppError } from '../errors/AppError.js';
import { verifyToken } from '../services/token.service.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function requireAuth(req, _res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return next(new AppError(401, 'No autenticado'));
  }

  let payload;

  try {
    payload = verifyToken(token);
  } catch (error) {
    // jwt.verify lanza TokenExpiredError con name y clase propios.
    if (error.name === 'TokenExpiredError') {
      return next(new AppError(401, 'Sesión expirada'));
    }

    return next(new AppError(401, 'No autenticado'));
  }

  // users.id es UUID: un id con otro formato haría fallar la consulta en
  // Postgres con 22P02, que terminaría en un 500.
  if (typeof payload?.id !== 'string' || !UUID_PATTERN.test(payload.id)) {
    return next(new AppError(401, 'No autenticado'));
  }

  req.user = { id: payload.id, email: payload.email };

  return next();
}
