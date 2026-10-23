import { clearAuthCookie, setAuthCookie } from '../config/cookie.js';
import { loginUser, registerUser } from '../services/auth.service.js';
import { getCurrentUser } from '../services/me.service.js';

export async function register(req, res) {
  const { user, token, expiresAt } = await registerUser(req.body);

  setAuthCookie(res, token, expiresAt);

  return res.status(201).json({ user });
}

export async function login(req, res) {
  const { user, token, expiresAt } = await loginUser(req.body);

  setAuthCookie(res, token, expiresAt);

  return res.status(200).json({ user });
}

export function logout(_req, res) {
  clearAuthCookie(res);

  return res.status(200).json({ message: 'Sesión cerrada correctamente' });
}

export async function me(req, res) {
  const user = await getCurrentUser(req.user.id);

  return res.status(200).json({ user });
}
