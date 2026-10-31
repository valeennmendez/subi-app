import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api, ApiError } from '../api/client.js';
import { Header } from '../components/Header.jsx';
import { TripRow } from '../components/TripRow.jsx';
import { Button } from '../components/ui/Button.jsx';
import { AlertIcon } from '../components/ui/icons.jsx';
import { LinkButton } from '../components/ui/LinkButton.jsx';

export function MyTripsPage() {
  const [trips, setTrips] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setStatus('loading');
    setError('');

    api
      .get('/trips/mine', { signal: controller.signal })
      .then((data) => {
        const list = Array.isArray(data?.trips) ? data.trips : [];
        // El backend devuelve del más lejano al más próximo; el diseño pide
        // el orden inverso, así que se ordena acá.
        const sorted = [...list].sort((first, second) => {
          const difference =
            new Date(first.departure_time) - new Date(second.departure_time);

          return difference !== 0 ? difference : first.id - second.id;
        });

        setTrips(sorted);
        setStatus('ready');
      })
      .catch((requestError) => {
        if (requestError.name === 'AbortError') return;

        setError(
          requestError instanceof ApiError
            ? requestError.message
            : 'No pudimos cargar tus viajes. Intentá de nuevo.',
        );
        setStatus('error');
      });

    return () => controller.abort();
  }, [attempt]);

  return (
    <div className="min-h-dvh bg-canvas">
      <Header />

      <main className="mx-auto w-full max-w-[1120px] px-4 py-8 min-[800px]:px-10 min-[800px]:pt-12 min-[800px]:pb-16">
        <div className="flex flex-col gap-4 min-[800px]:flex-row min-[800px]:items-end min-[800px]:justify-between">
          <div>
            <h1 className="text-[32px] font-bold leading-[1.2] text-ink min-[800px]:text-[36px]">
              Mis viajes
            </h1>
            <p className="mt-2 text-base text-muted">
              Tus viajes publicados, del más próximo al más lejano.
            </p>
          </div>

          <LinkButton
            to="/viajes/nuevo"
            className="w-full shrink-0 min-[800px]:w-auto"
          >
            Publicar viaje
          </LinkButton>
        </div>

        <section className="mt-8">
          {status === 'loading' ? (
            <p role="status" className="text-base text-muted">
              Cargando tus viajes…
            </p>
          ) : null}

          {status === 'error' ? (
            <div>
              <div
                role="alert"
                className="flex items-start gap-3 rounded-alert border border-error-line bg-error-soft px-4 py-3.5 text-sm font-semibold text-error"
              >
                <AlertIcon className="mt-0.5 size-5 shrink-0" />
                <p>{error}</p>
              </div>
              <Button
                variant="secondary"
                onClick={() => setAttempt((current) => current + 1)}
                className="mt-3 w-full min-[800px]:w-auto"
              >
                Reintentar
              </Button>
            </div>
          ) : null}

          {status === 'ready' && trips.length === 0 ? (
            <div className="rounded-card border border-line bg-canvas p-6">
              <h2 className="text-xl font-bold leading-[1.3] text-ink">
                Todavía no publicaste viajes
              </h2>
              <p className="mt-2 text-base text-muted">
                Cuando publiques uno, va a aparecer acá.
              </p>
              <Link
                to="/viajes/nuevo"
                className="mt-2 inline-flex min-h-11 items-center font-semibold text-brand-strong hover:underline"
              >
                Publicar un viaje
              </Link>
            </div>
          ) : null}

          {status === 'ready' && trips.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {trips.map((trip) => (
                <TripRow key={trip.id} trip={trip} />
              ))}
            </ul>
          ) : null}
        </section>
      </main>
    </div>
  );
}
