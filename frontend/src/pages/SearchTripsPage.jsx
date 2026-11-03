import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import { api, ApiError } from '../api/client.js';
import { Header } from '../components/Header.jsx';
import { TripRow } from '../components/TripRow.jsx';
import { Button } from '../components/ui/Button.jsx';
import {
  CalendarIcon,
  OriginIcon,
  PinIcon,
  UsersIcon,
} from '../components/ui/icons.jsx';
import { TextField } from '../components/ui/TextField.jsx';

const EMPTY_VALUES = {
  origin: '',
  destination: '',
  date: '',
  seats: '1',
};

const GENERIC_ERROR = {
  title: 'No pudimos cargar los viajes',
  description: 'Revisá tu conexión e intentá de nuevo.',
};

function readFilters(searchParams) {
  return {
    origin: searchParams.get('origin') ?? '',
    destination: searchParams.get('destination') ?? '',
    date: searchParams.get('date') ?? '',
    seats: searchParams.get('seats') || '1',
  };
}

function buildSearchParams(values) {
  const next = new URLSearchParams();

  if (values.origin) next.set('origin', values.origin);
  if (values.destination) next.set('destination', values.destination);
  if (values.date) next.set('date', values.date);
  if (values.seats && values.seats !== '1') next.set('seats', values.seats);

  return next;
}

function SkeletonRow() {
  return (
    <li
      aria-hidden="true"
      className="rounded-card border border-line bg-canvas p-6"
    >
      <div className="grid grid-cols-2 gap-4 min-[800px]:grid-cols-[minmax(0,1fr)_auto_auto] min-[800px]:items-center min-[800px]:gap-8">
        <div className="col-span-2 min-[800px]:col-span-1">
          <div className="h-5 w-52 max-w-full animate-pulse rounded-full bg-surface motion-reduce:animate-none" />
          <div className="mt-3 h-4 w-40 max-w-full animate-pulse rounded-full bg-surface motion-reduce:animate-none" />
        </div>
        <div className="hidden h-4 w-28 animate-pulse rounded-full bg-surface motion-reduce:animate-none min-[800px]:block" />
        <div className="hidden h-4 w-24 animate-pulse rounded-full bg-surface motion-reduce:animate-none min-[800px]:block" />
      </div>
    </li>
  );
}

export function SearchTripsPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();

  const [values, setValues] = useState(() => readFilters(searchParams));
  const [trips, setTrips] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setValues(readFilters(new URLSearchParams(queryString)));
  }, [queryString]);

  useEffect(() => {
    const controller = new AbortController();

    setStatus('loading');
    setError(null);

    api
      .get(`/trips${queryString ? `?${queryString}` : ''}`, {
        signal: controller.signal,
      })
      .then((data) => {
        setTrips(Array.isArray(data?.trips) ? data.trips : []);
        setStatus('ready');
      })
      .catch((requestError) => {
        if (requestError.name === 'AbortError') return;

        if (
          requestError instanceof ApiError &&
          requestError.status >= 400 &&
          requestError.status < 500
        ) {
          setError({ title: requestError.message, description: '' });
        } else {
          setError(GENERIC_ERROR);
        }

        setStatus('error');
      });

    return () => controller.abort();
  }, [queryString, attempt]);

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSearchParams(buildSearchParams(values));
  }

  function handleClearFilters() {
    setValues(EMPTY_VALUES);
    setSearchParams(new URLSearchParams());
  }

  const searchUrl = `${location.pathname}${location.search}`;
  const showResultsHeader =
    status === 'loading' || (status === 'ready' && trips.length > 0);
  const countLabel =
    trips.length === 1 ? '1 viaje' : `${trips.length} viajes`;

  return (
    <div className="min-h-dvh bg-canvas">
      <Header />

      <main className="mx-auto w-full max-w-[1120px] px-4 py-8 min-[800px]:px-10 min-[800px]:pt-12 min-[800px]:pb-16">
        <section>
          <h1 className="text-[32px] font-bold leading-[1.2] text-ink min-[800px]:text-[36px]">
            Buscar viajes
          </h1>
          <p className="mt-2 text-base text-muted">
            Filtrá por origen, destino, fecha o pasajeros. Todos los campos son
            opcionales.
          </p>
        </section>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="mt-8 rounded-card border border-line bg-canvas p-6"
        >
          <div className="grid grid-cols-1 gap-[18px] min-[800px]:grid-cols-2 min-[1000px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,0.6fr)_auto] min-[1000px]:items-end">
            <TextField
              id="search-origin"
              name="origin"
              label="Origen"
              icon={OriginIcon}
              type="text"
              autoComplete="off"
              placeholder="Ciudad de salida"
              shape="field"
              value={values.origin}
              onChange={handleChange}
            />

            <TextField
              id="search-destination"
              name="destination"
              label="Destino"
              icon={PinIcon}
              type="text"
              autoComplete="off"
              placeholder="Ciudad de llegada"
              shape="field"
              value={values.destination}
              onChange={handleChange}
            />

            <TextField
              id="search-date"
              name="date"
              label="Fecha"
              icon={CalendarIcon}
              type="date"
              shape="field"
              value={values.date}
              onChange={handleChange}
            />

            <TextField
              id="search-seats"
              name="seats"
              label="Pasajeros"
              icon={UsersIcon}
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              placeholder="1"
              shape="field"
              value={values.seats}
              onChange={handleChange}
            />

            <Button
              type="submit"
              className="min-[800px]:col-span-2 min-[1000px]:col-span-1 min-[1000px]:w-auto"
            >
              Buscar viajes
            </Button>
          </div>
        </form>

        <section className="mt-8">
          {showResultsHeader ? (
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-bold leading-[1.3] text-ink">
                Próximos viajes
              </h2>
              {status === 'loading' ? (
                <p role="status" className="text-sm text-muted">
                  Buscando viajes...
                </p>
              ) : (
                <p className="text-sm text-muted">{countLabel}</p>
              )}
            </div>
          ) : null}

          {status === 'loading' ? (
            <ul aria-busy="true" className="mt-4 flex flex-col gap-4">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </ul>
          ) : null}

          {status === 'error' && error ? (
            <div
              role="alert"
              className="rounded-card border border-line bg-canvas p-6 min-[800px]:flex min-[800px]:items-center min-[800px]:justify-between min-[800px]:gap-6"
            >
              <div>
                <h2 className="text-xl font-bold leading-[1.3] text-ink">
                  {error.title}
                </h2>
                {error.description ? (
                  <p className="mt-1 text-base text-muted">
                    {error.description}
                  </p>
                ) : null}
              </div>
              <Button
                variant="secondary"
                onClick={() => setAttempt((current) => current + 1)}
                className="mt-4 shrink-0 min-[800px]:mt-0 min-[800px]:w-auto"
              >
                Reintentar
              </Button>
            </div>
          ) : null}

          {status === 'ready' && trips.length === 0 ? (
            <div className="rounded-card border border-line bg-canvas p-6 min-[800px]:flex min-[800px]:items-center min-[800px]:justify-between min-[800px]:gap-6">
              <div>
                <h2 className="text-xl font-bold leading-[1.3] text-ink">
                  No encontramos viajes con esos filtros
                </h2>
                <p className="mt-1 text-base text-muted">
                  Probá con otras fechas o ciudades, o quitá algún filtro.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-2 inline-flex min-h-11 shrink-0 items-center font-semibold text-brand-strong hover:underline min-[800px]:mt-0"
              >
                Limpiar filtros
              </button>
            </div>
          ) : null}

          {status === 'ready' && trips.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-4">
              {trips.map((trip) => (
                <TripRow
                  key={trip.id}
                  trip={trip}
                  to={`/viajes/${trip.id}`}
                  state={{ from: searchUrl }}
                  showStatus={false}
                />
              ))}
            </ul>
          ) : null}
        </section>
      </main>
    </div>
  );
}
