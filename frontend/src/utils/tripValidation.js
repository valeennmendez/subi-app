// Debe coincidir con MAX_PRICE_PER_SEAT en
// backend/src/validators/trip.validator.js. El servidor es la fuente final.
export const MAX_PRICE_PER_SEAT = 5000000;

export const CITY_MAX_LENGTH = 120;
export const MIN_SEATS = 1;
export const MAX_SEATS = 8;

// Argentina no tiene horario de verano: el offset es siempre -03:00.
const ARGENTINA_UTC_OFFSET = '-03:00';

const PRICE_FORMATTER = new Intl.NumberFormat('es-AR');

export const TRIP_FIELDS = [
  'origin_city',
  'destination_city',
  'departure_time',
  'total_seats',
  'price_per_seat',
];

// Solo para comparar origen y destino: minúsculas y sin tildes, igual que
// normalizeForComparison en el backend.
export function normalizeForComparison(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// El datetime-local no trae zona horaria. Se le agrega el offset fijo de
// Argentina sin pasar por new Date(...).toISOString(), que usaría UTC.
export function buildDepartureTime(value) {
  if (!value) return '';

  const withSeconds = /T\d{2}:\d{2}$/.test(value) ? `${value}:00` : value;

  return `${withSeconds}${ARGENTINA_UTC_OFFSET}`;
}

export function formatPriceLimit() {
  return `$${PRICE_FORMATTER.format(MAX_PRICE_PER_SEAT)}`;
}

function validateOrigin(value) {
  const origin = value.trim();

  if (!origin) return 'Ingresá la ciudad de origen.';
  if (origin.length > CITY_MAX_LENGTH) {
    return 'El origen no puede superar los 120 caracteres.';
  }

  return '';
}

function validateDestination(value, origin) {
  const destination = value.trim();

  if (!destination) return 'Ingresá la ciudad de destino.';
  if (destination.length > CITY_MAX_LENGTH) {
    return 'El destino no puede superar los 120 caracteres.';
  }

  const trimmedOrigin = String(origin ?? '').trim();

  if (
    trimmedOrigin &&
    normalizeForComparison(trimmedOrigin) === normalizeForComparison(destination)
  ) {
    return 'El origen y el destino no pueden ser iguales.';
  }

  return '';
}

function validateDepartureTime(value) {
  if (!value) return 'Elegí la fecha y hora de salida.';

  const timestamp = Date.parse(buildDepartureTime(value));

  if (Number.isNaN(timestamp) || timestamp <= Date.now()) {
    return 'La fecha de salida debe ser futura.';
  }

  return '';
}

function validateTotalSeats(value) {
  const seats = Number(value);

  if (!Number.isInteger(seats) || seats < MIN_SEATS || seats > MAX_SEATS) {
    return `Los asientos deben ser de ${MIN_SEATS} a ${MAX_SEATS}.`;
  }

  return '';
}

function validatePricePerSeat(value) {
  if (value === '' || value === null || value === undefined) {
    return 'Ingresá un precio válido.';
  }

  const price = Number(value);

  if (!Number.isInteger(price) || price <= 0) {
    return 'Ingresá un precio válido.';
  }

  if (price > MAX_PRICE_PER_SEAT) {
    return `El precio no puede superar ${formatPriceLimit()}.`;
  }

  return '';
}

export function validateTripField(field, values) {
  switch (field) {
    case 'origin_city':
      return validateOrigin(values.origin_city ?? '');
    case 'destination_city':
      return validateDestination(
        values.destination_city ?? '',
        values.origin_city,
      );
    case 'departure_time':
      return validateDepartureTime(values.departure_time ?? '');
    case 'total_seats':
      return validateTotalSeats(values.total_seats);
    case 'price_per_seat':
      return validatePricePerSeat(values.price_per_seat);
    default:
      return '';
  }
}

export function validateTripForm(values) {
  const errors = {};

  for (const field of TRIP_FIELDS) {
    const message = validateTripField(field, values);

    if (message) errors[field] = message;
  }

  return errors;
}
