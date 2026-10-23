import { env } from './env.js';

export const COOKIE_NAME = 'token';

export const COOKIE_OPTIONS = Object.freeze({
  httpOnly: true,
  sameSite: 'lax',
  secure: env.nodeEnv === 'production',
  path: '/',
});

export function setAuthCookie(res, token, expiresAt) {
  // Evita un Max-Age inválido si la expiración del token es muy corta.
  const maxAge = Math.max(expiresAt - Date.now(), 1000);

  res.cookie(COOKIE_NAME, token, { ...COOKIE_OPTIONS, maxAge });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { ...COOKIE_OPTIONS });
}
