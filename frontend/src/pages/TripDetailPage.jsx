import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { api, ApiError } from '../api/client.js';
import { Header } from '../components/Header.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { LoadingScreen } from '../components/ui/LoadingScreen.jsx';
import { SessionErrorScreen } from '../components/ui/SessionErrorScreen.jsx';
import { StatusBadge } from '../components/ui/StatusBadge.jsx';
import {
  formatPrice,
  formatTripDateLong,
} from '../utils/tripFormatters.js';
import { getInitials } from '../utils/user.js';

const SEARCH_PATH = '/viajes/buscar';

// Solo se acepta volver a la búsqueda; cualquier otro valor cae en la ruta
// limpia para no reutilizar un state manipulado.
function getBackTo(state) {
  const from = state?.from;

  if (typeof from !== 'string') return SEARCH_PATH;

  const [pathname] = from.split('?');

  return pathname === SEARCH_PATH ? from : SEARCH_PATH;
}

export function TripDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [trip, setTrip] = useState(null);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setStatus('loading');
    setTrip(null);

    api
      .get(`/trips/${encodeURIComponent(id ?? '')}`, {
        signal: controller.signal,
      })
      .then((data) => {
        if (!data?.trip) {
          setStatus('error');
          return;
        }

        setTrip(data.trip);
        setStatus('ready');
      })
      .catch((requestError) => {
        if (requestError.name === 'AbortError') return;

        if (requestError instanceof ApiError && requestError.status === 404) {
          setStatus('not-found');
          return;
        }

        setStatus('error');
      });

    return () => controller.abort();
  }, [id, attempt]);

  if (status === 'loading') return <LoadingScreen />;

  if (status === 'error') {
    return (
      <SessionErrorScreen
        onRetry={() => setAttempt((current) => current + 1)}
        title="No pudimos cargar el viaje"
        description="Revisá tu conexión e intentá de nuevo."
      />
    );
  }

  if (status === 'not-found') {
    return (
      <div className="min-h-dvh bg-canvas">
        <Header />

        <main className="mx-auto w-full max-w-[1120px] px-4 py-8 min-[800px]:px-10 min-[800px]:pt-12 min-[800px]:pb-16">
          <div className="max-w-[720px] rounded-card border border-line bg-canvas p-6">
            <h1 className="text-[28px] font-bold leading-[1.2] text-ink min-[800px]:text-[32px]">
              No encontramos este viaje.
            </h1>
            <p className="mt-2 text-base text-muted">
              Puede que el viaje ya no esté disponible o que el link no sea
              correcto.
            </p>
            <Link
              to={SEARCH_PATH}
              className="mt-2 inline-flex min-h-11 items-center font-semibold text-brand-strong hover:underline"
            >
              Volver a la búsqueda
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const backTo = getBackTo(location.state);
  const detailRows = [
    { label: 'Origen', value: trip.origin_city },
    { label: 'Destino', value: trip.destination_city },
    { label: 'Salida', value: formatTripDateLong(trip.departure_time) },
    {
      label: 'Asientos disponibles',
      value: `${trip.available_seats} de ${trip.total_seats} asientos`,
    },
    { label: 'Precio por asiento', value: formatPrice(trip.price_per_seat) },
  ];

  return (
    <div className="min-h-dvh bg-canvas">
      <Header />

      <main className="mx-auto w-full max-w-[1120px] px-4 py-8 min-[800px]:px-10 min-[800px]:pt-12 min-[800px]:pb-16">
        <Link
          to={backTo}
          className="inline-flex min-h-11 items-center font-semibold text-brand-strong hover:underline"
        >
          ← Volver a los resultados
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-[32px] font-bold leading-[1.2] text-ink min-[800px]:text-[36px]">
            {trip.origin_city} → {trip.destination_city}
          </h1>
          <StatusBadge status={trip.status} />
        </div>

        <p className="mt-2 text-base text-muted">
          {formatTripDateLong(trip.departure_time)}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 min-[800px]:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-card border border-line bg-canvas p-6">
            <h2 className="text-xl font-bold leading-[1.3] text-ink">
              Detalles del viaje
            </h2>

            <dl className="mt-2 divide-y divide-line">
              {detailRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-6 py-4"
                >
                  <dt className="text-base text-muted">{row.label}</dt>
                  <dd className="text-right text-base font-semibold text-ink">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <aside className="h-fit rounded-card border border-line bg-canvas p-6">
            <h2 className="text-xl font-bold leading-[1.3] text-ink">
              Conductor
            </h2>

            <div className="mt-4 flex items-center gap-4">
              <Avatar initials={getInitials(trip.driver_name)} size="md" />
              <div>
                <p className="text-base font-semibold text-ink">
                  {trip.driver_name}
                </p>
                <p className="mt-0.5 text-sm text-muted">Conductor</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
