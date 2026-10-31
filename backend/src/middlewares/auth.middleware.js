import { COOKIE_NAME } from '../config/cookie.js';
import { AppError } from '../errors/AppError.js';
import { verifyToken } from '../services/token.service.js';
import { isUuid } from '../utils/uuid.js';

function userFromToken(token) {
  const payload = verifyToken(token);

  // users.id es UUID: un id con otro formato haría fallar la consulta en
  // Postgres con 22P02, que terminaría en un 500.
  if (!isUuid(payload?.id)) {
    throw new Error('Token sin un id válido');
  }

  return { id: payload.id, email: payload.email };
}

export function requireAuth(req, _res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return next(new AppError(401, 'No autenticado'));
  }

  let user;

  try {
    user = userFromToken(token);
  } catch (error) {
    // jwt.verify lanza TokenExpiredError con name y clase propios.
    if (error.name === 'TokenExpiredError') {
      return next(new AppError(401, 'Sesión expirada'));
    }

    return next(new AppError(401, 'No autenticado'));
  }

  req.user = user;

  return next();
}

// En rutas públicas: si hay una sesión válida deja req.user; si no hay cookie
// o el token no sirve, sigue como visitante.
export function optionalAuth(req, _res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return next();
  }

  try {
    req.user = userFromToken(token);
  } catch {
    // Un token inválido o vencido no bloquea una ruta pública.
  }

  return next();
}
