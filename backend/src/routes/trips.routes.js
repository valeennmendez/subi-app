import { Router } from 'express';
import { createTrip, listMyTrips } from '../controllers/trip.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createTripSchema } from '../validators/trip.validator.js';

export const tripsRouter = Router();

// /mine se declara antes que cualquier /:id futuro (Fase 4): Express resuelve
// en orden y "mine" nunca debe interpretarse como un id.
tripsRouter.get('/mine', requireAuth, listMyTrips);

tripsRouter.post('/', requireAuth, validate(createTripSchema), createTrip);
