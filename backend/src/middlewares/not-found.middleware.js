import { AppError } from '../errors/AppError.js';

export function notFoundHandler(req, _res, next) {
  next(new AppError(404, 'Ruta no encontrada'));
}
