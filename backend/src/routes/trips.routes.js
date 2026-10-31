import { Router } from 'express';
import {
  createTrip,
  listMyTrips,
  searchTrips,
} from '../controllers/trip.controller.js';
import { optionalAuth, requireAuth } from '../middlewares/auth.middleware.js';
import { validate, validateQuery } from '../middlewares/validate.middleware.js';
import {
  createTripSchema,
  searchTripsQuerySchema,
} from '../validators/trip.validator.js';

export const tripsRouter = Router();

// /mine se declara antes que cualquier /:id futuro (Fase 4): Express resuelve
// en orden y "mine" nunca debe interpretarse como un id.
tripsRouter.get('/mine', requireAuth, listMyTrips);

tripsRouter.get(
  '/',
  optionalAuth,
  validateQuery(searchTripsQuerySchema),
  searchTrips,
);

tripsRouter.post('/', requireAuth, validate(createTripSchema), createTrip);
