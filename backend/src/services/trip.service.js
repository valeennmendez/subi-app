import { AppError } from '../errors/AppError.js';
import {
  createTrip,
  findTripsByDriverId,
} from '../repositories/trip.repository.js';
import { toPublicTrip } from '../utils/trip.mapper.js';

const FOREIGN_KEY_VIOLATION = '23503';
const DRIVER_FK_CONSTRAINT = 'trips_driver_id_fkey';

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
