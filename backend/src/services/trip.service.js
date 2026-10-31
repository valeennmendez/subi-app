import { AppError } from '../errors/AppError.js';
import {
  createTrip,
  findScheduledTrips,
  findTripByIdWithDriver,
  findTripsByDriverId,
} from '../repositories/trip.repository.js';
import { toPublicTrip, toPublicTripDetail } from '../utils/trip.mapper.js';
import { isUuid } from '../utils/uuid.js';

const FOREIGN_KEY_VIOLATION = '23503';
const DRIVER_FK_CONSTRAINT = 'trips_driver_id_fkey';

const ARGENTINA_OFFSET = '-03:00';
const DAY_MS = 24 * 60 * 60 * 1000;

const SEARCH_ACCENT_MAP = {
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
  ñ: 'n',
  ü: 'u',
  Á: 'a',
  É: 'e',
  Í: 'i',
  Ó: 'o',
  Ú: 'u',
  Ñ: 'n',
  Ü: 'u',
};

// Un token puede ser válido y estar firmado con el secreto correcto, pero
// apuntar a un usuario que ya no existe. La FK lo detecta al insertar: se
// responde 401 como cualquier sesión que ya no sirve. Cualquier otro error de
// base se propaga sin transformar.
function isMissingDriverError(error) {
  return (
    error.code === FOREIGN_KEY_VIOLATION &&
    error.constraint === DRIVER_FK_CONSTRAINT
  );
}

// Misma normalización que las columnas generadas de la migración 006.
function normalizeSearchTerm(value) {
  return value
    .replace(/[áéíóúñüÁÉÍÓÚÑÜ]/g, (character) => SEARCH_ACCENT_MAP[character])
    .toLowerCase();
}

// Argentina está en UTC-3 todo el año: el día calendario se puede calcular
// con un offset fijo.
function argentinaDayRange(date) {
  const start = new Date(`${date}T00:00:00${ARGENTINA_OFFSET}`);
  const end = new Date(start.getTime() + DAY_MS);

  return { dayStart: start, dayEnd: end };
}

export async function createTripForDriver(driverId, tripData) {
  try {
    const tripRow = await createTrip({
      driverId,
      originCity: tripData.origin_city,
      destinationCity: tripData.destination_city,
      departureTime: tripData.departure_time,
      totalSeats: tripData.total_seats,
      pricePerSeat: tripData.price_per_seat,
    });

    return toPublicTrip(tripRow);
  } catch (error) {
    if (isMissingDriverError(error)) {
      throw new AppError(401, 'No autenticado');
    }

    throw error;
  }
}

export async function listTripsForDriver(driverId) {
  const tripRows = await findTripsByDriverId(driverId);

  return tripRows.map(toPublicTrip);
}

export async function searchAvailableTrips({
  origin,
  destination,
  date,
  seats,
}) {
  const tripRows = await findScheduledTrips({
    originPrefix: origin ? normalizeSearchTerm(origin) : null,
    destinationPrefix: destination ? normalizeSearchTerm(destination) : null,
    seats: seats ?? 1,
    ...(date ? argentinaDayRange(date) : {}),
  });

  return tripRows.map(toPublicTrip);
}

export async function getTripDetail(id) {
  if (!isUuid(id)) {
    throw new AppError(404, 'Viaje no encontrado');
  }

  const tripRow = await findTripByIdWithDriver(id);

  if (!tripRow) {
    throw new AppError(404, 'Viaje no encontrado');
  }

  return toPublicTripDetail(tripRow);
}
