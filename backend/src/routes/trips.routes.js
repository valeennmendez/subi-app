import { Router } from 'express';
import { createTrip } from '../controllers/trip.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createTripSchema } from '../validators/trip.validator.js';

export const tripsRouter = Router();

tripsRouter.post('/', requireAuth, validate(createTripSchema), createTrip);
