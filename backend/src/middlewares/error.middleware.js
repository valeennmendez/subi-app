import { env } from '../config/env.js';
import { AppError } from '../errors/AppError.js';

function getClientErrorMessage(error) {
  if (error.type === 'entity.parse.failed') {
    return 'JSON inválido';
  }

  if (error.type === 'entity.too.large') {
    return 'El cuerpo de la solicitud es demasiado grande';
  }

  return 'Solicitud inválida';
}

export function errorHandler(error, req, res, _next) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  if (
    Number.isInteger(error.status) &&
    error.status >= 400 &&
    error.status < 500
  ) {
    return res
      .status(error.status)
      .json({ error: getClientErrorMessage(error) });
  }

  console.error('Error no controlado:', {
    name: error.name,
    code: error.code ?? null,
  });

  if (env.nodeEnv !== 'production') {
    console.error(error.stack);
  }

  return res.status(500).json({ error: 'Error interno del servidor' });
}
