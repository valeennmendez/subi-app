import { Link } from 'react-router';
import { formatPrice, formatTripDate } from '../utils/tripFormatters.js';
import { ChevronRightIcon } from './ui/icons.jsx';
import { StatusBadge } from './ui/StatusBadge.jsx';

const ROW_STYLES = 'rounded-card border border-line bg-canvas p-6';

export function TripRow({ trip, to, state, showStatus = true }) {
  const isLink = Boolean(to);

  const content = (
    <div className="grid grid-cols-2 gap-4 min-[800px]:grid-cols-[minmax(0,1fr)_auto_auto_auto] min-[800px]:items-center min-[800px]:gap-8">
      <div className="col-span-2 min-w-0 min-[800px]:col-span-1">
        <h2 className="break-words text-lg font-semibold leading-[1.3] text-ink">
          {trip.origin_city} → {trip.destination_city}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {formatTripDate(trip.departure_time)}
        </p>
      </div>

      <div>
        <span className="block text-sm text-muted">Asientos</span>
        <span className="mt-0.5 block text-base font-semibold text-ink">
          {trip.available_seats} de {trip.total_seats} asientos
        </span>
      </div>

      <div>
        <span className="block text-sm text-muted">Precio por asiento</span>
        <span className="mt-0.5 block text-base font-semibold text-ink">
          {formatPrice(trip.price_per_seat)}
        </span>
      </div>

      <div className="flex items-center">
        {showStatus ? (
          <StatusBadge status={trip.status} />
        ) : (
          <ChevronRightIcon className="size-5 text-neutral" />
        )}
      </div>
    </div>
  );

  if (isLink) {
    return (
      <li>
        <Link
          to={to}
          state={state}
          className={`${ROW_STYLES} block transition-colors hover:bg-surface`}
        >
          {content}
        </Link>
      </li>
    );
  }

  return <li className={ROW_STYLES}>{content}</li>;
}
