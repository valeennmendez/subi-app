const rawBaseUrl = import.meta.env.VITE_API_URL;

if (!rawBaseUrl || rawBaseUrl.trim() === '') {
  throw new Error(
    'Falta VITE_API_URL. Definila en frontend/.env, por ejemplo: VITE_API_URL=http://localhost:3000',
  );
}

// El prefijo /api se agrega una sola vez acá; las rutas se pasan sin /api.
const API_BASE_URL = `${rawBaseUrl.trim().replace(/\/+$/, '')}/api`;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function statusMessage(status) {
  if (status === 401) return 'No autenticado';
  if (status === 403) return 'No tenés permiso para realizar esta acción';
  if (status === 404) return 'El recurso solicitado no existe';
  if (status >= 500) return 'El servidor no pudo procesar la solicitud';
  return `La solicitud falló (código ${status})`;
}

function parseJson(text) {
  if (text === '') return null;

  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export async function apiRequest(path, { method = 'GET', body, headers, signal } = {}) {
  const requestHeaders = { Accept: 'application/json', ...headers };
  const options = {
    method,
    headers: requestHeaders,
    credentials: 'include',
    signal,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('No se pudo conectar con el servidor', 0);
  }

  if (response.status === 204) return null;

  const data = parseJson(await response.text());

  if (!response.ok) {
    const apiMessage = typeof data?.error === 'string' ? data.error.trim() : '';
    throw new ApiError(apiMessage || statusMessage(response.status), response.status);
  }

  if (data === undefined) {
    throw new ApiError('El servidor devolvió una respuesta inválida', response.status);
  }

  return data;
}

export const api = {
  get: (path, options) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options) => apiRequest(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => apiRequest(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => apiRequest(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
};
