import { createTripForDriver } from '../services/trip.service.js';

export async function createTrip(req, res) {
  const trip = await createTripForDriver(req.user.id, req.body);

  return res.status(201).json({ trip });
}
