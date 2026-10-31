import {
  createTripForDriver,
  listTripsForDriver,
  searchAvailableTrips,
} from '../services/trip.service.js';

export async function createTrip(req, res) {
  const trip = await createTripForDriver(req.user.id, req.body);

  return res.status(201).json({ trip });
}

export async function listMyTrips(req, res) {
  const trips = await listTripsForDriver(req.user.id);

  return res.status(200).json({ trips });
}

export async function searchTrips(req, res) {
  const trips = await searchAvailableTrips(req.validatedQuery);

  return res.status(200).json({ trips });
}
