import { useEffect, useState } from 'react';
import { api, ApiError } from '../api/client.js';

const CARD_STYLES = {
  loading: 'border-slate-200 bg-white text-slate-700',
  ok: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
};

export function HomePage() {
  const [health, setHealth] = useState({
    status: 'loading',
    message: 'Verificando conexión con el backend…',
  });

  useEffect(() => {
    const controller = new AbortController();

    api
      .get('/health', { signal: controller.signal })
      .then((data) => {
        if (data?.status === 'ok') {
          setHealth({ status: 'ok', message: 'Backend conectado' });
          return;
        }

        setHealth({
          status: 'error',
          message: 'El backend respondió de forma inesperada',
        });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;

        setHealth({
          status: 'error',
          message:
            error instanceof ApiError ? error.message : 'Ocurrió un error inesperado',
        });
      });

    return () => controller.abort();
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Subi</h1>
        <p className="mt-1 text-base text-slate-600">Base del frontend</p>
      </header>

      <section
        className={`rounded-lg border p-4 text-base ${CARD_STYLES[health.status]}`}
      >
        <p
          role={health.status === 'error' ? 'alert' : 'status'}
          className="font-medium"
        >
          {health.message}
        </p>
      </section>

      <p className="text-sm text-slate-500">
        Verificación temporal del backend; se reemplaza en la próxima parte.
      </p>
    </main>
  );
}
