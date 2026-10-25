import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { api, ApiError } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ status: 'loading', user: null });
  const [attempt, setAttempt] = useState(0);
  const requestRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestRef.current;
    const controller = new AbortController();

    api
      .get('/auth/me', { signal: controller.signal })
      .then((data) => {
        if (requestId !== requestRef.current) return;

        if (!data?.user) {
          setAuth({ status: 'error', user: null });
          return;
        }

        setAuth({ status: 'authenticated', user: data.user });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        if (requestId !== requestRef.current) return;

        if (error instanceof ApiError && error.status === 401) {
          setAuth({ status: 'anonymous', user: null });
          return;
        }

        setAuth({ status: 'error', user: null });
      });

    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setAuth({ status: 'loading', user: null });
    setAttempt((current) => current + 1);
  }

  async function login(credentials) {
    const data = await api.post('/auth/login', credentials);

    if (!data?.user) {
      throw new ApiError('El servidor devolvió una respuesta inválida', 500);
    }

    setAuth({ status: 'authenticated', user: data.user });
    return data.user;
  }

  async function logout() {
    await api.post('/auth/logout');
    setAuth({ status: 'anonymous', user: null });
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, retry }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
}
