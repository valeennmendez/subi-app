import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { login, logout, me, register } from '../controllers/auth.controller.js';
import { AppError } from '../errors/AppError.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, _res, next) => {
    next(
      new AppError(
        429,
        'Demasiados intentos de inicio de sesión. Intentá de nuevo más tarde.',
      ),
    );
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      new AppError(
        429,
        'Demasiados registros desde esta IP. Intentá de nuevo más tarde.',
      ),
    );
  },
});

export const authRouter = Router();

authRouter.post(
  '/register',
  registerLimiter,
  validate(registerSchema),
  register,
);
authRouter.post('/login', loginLimiter, validate(loginSchema), login);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);
