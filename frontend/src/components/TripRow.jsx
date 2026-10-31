import { formatPrice, formatTripDate } from '../utils/tripFormatters.js';
import { StatusBadge } from './ui/StatusBadge.jsx';

export function TripRow({ trip }) {
  return (
    <li className="rounded-card border border-line bg-canvas p-6">
      <div className="grid grid-cols-2 gap-4 min-[800px]:grid-cols-[minmax(0,1fr)_auto_auto_auto] min-[800px]:items-center min-[800px]:gap-8">
        <div className="col-span-2 min-w-0 min-[800px]:col-span-1">
          <h2 className="break-words text-lg font-semibold leading-[1.3] text-ink">
            {trip.origin_city} → {trip.destination_city}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {formatTripDate(trip.departure_time)}
          </p>
        </div>

        <p className="text-base text-ink">
          {trip.available_seats} de {trip.total_seats} asientos
        </p>

        <p className="text-base text-ink">{formatPrice(trip.price_per_seat)}</p>

        <div className="flex items-center">
          <StatusBadge status={trip.status} />
        </div>
      </div>
    </li>
  );
}
