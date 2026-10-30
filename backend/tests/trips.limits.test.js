import './setup.js';
import assert from 'node:assert/strict';
import { after, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { MAX_PRICE_PER_SEAT } from '../src/validators/trip.validator.js';
import { buildUser, newAgent } from './helpers/auth.js';
import { closePool, truncateUsers } from './helpers/db.js';
import { signExpiredToken } from './helpers/tokens.js';
import { buildFutureTrip } from './helpers/trips.js';

const DRIVER_KEYS_NOT_EXPOSED = ['email', 'phone', 'password_hash'];

async function registerAgent(email) {
  const agent = newAgent();
  const response = await agent
    .post('/api/auth/register')
    .send(buildUser({ email }));

  assert.equal(response.status, 201);

  return { agent, user: response.body.user };
}

async function createTripAs(agent, overrides) {
  const response = await agent
    .post('/api/trips')
    .send(buildFutureTrip(overrides));

  assert.equal(response.status, 201);

  return response.body.trip;
}

function assertNoDriverData(trip, user, serializedBody) {
  for (const key of DRIVER_KEYS_NOT_EXPOSED) {
    assert.ok(!(key in trip), `El viaje no debe incluir ${key}`);
  }

  assert.ok(
    !serializedBody.includes(user.email),
    'La respuesta no debe contener el email del conductor',
  );
  assert.ok(
    !serializedBody.includes(user.phone),
    'La respuesta no debe contener el teléfono del conductor',
  );
}

describe('Límites y datos expuestos de los viajes', () => {
  beforeEach(truncateUsers);
  after(closePool);

  it('acepta total_seats = 1', async () => {
    const { agent } = await registerAgent('qa.test.limits.seats.min@example.com');

    const trip = await createTripAs(agent, { total_seats: 1 });

    assert.equal(trip.total_seats, 1);
    assert.equal(trip.available_seats, 1);
  });

  it('acepta total_seats = 8', async () => {
    const { agent } = await registerAgent('qa.test.limits.seats.max@example.com');

    const trip = await createTripAs(agent, { total_seats: 8 });

    assert.equal(trip.total_seats, 8);
    assert.equal(trip.available_seats, 8);
  });

  it('acepta price_per_seat = 1', async () => {
    const { agent } = await registerAgent('qa.test.limits.price.min@example.com');

    const trip = await createTripAs(agent, { price_per_seat: 1 });

    assert.equal(trip.price_per_seat, '1.00');
  });

  it('acepta price_per_seat en el tope', async () => {
    const { agent } = await registerAgent('qa.test.limits.price.max@example.com');

    const trip = await createTripAs(agent, {
      price_per_seat: MAX_PRICE_PER_SEAT,
    });

    assert.equal(trip.price_per_seat, `${MAX_PRICE_PER_SEAT}.00`);
  });

  it('rechaza un precio negativo', async () => {
    const { agent } = await registerAgent(
      'qa.test.limits.price.negative@example.com',
    );

    const response = await agent
      .post('/api/trips')
      .send(buildFutureTrip({ price_per_seat: -1 }));

    assert.equal(response.status, 400);
    assert.equal(
      response.body.error,
      'El precio por asiento debe ser mayor que 0',
    );
  });

  it('rechaza driver_id en el body', async () => {
    const { agent } = await registerAgent('qa.test.limits.extra.driver@example.com');

    const response = await agent.post('/api/trips').send(
      buildFutureTrip({
        driver_id: '00000000-0000-4000-8000-000000000000',
      }),
    );

    assert.equal(response.status, 400);
    assert.equal(
      response.body.error,
      'El campo "driver_id" no está permitido',
    );
  });

  it('rechaza available_seats en el body', async () => {
    const { agent } = await registerAgent('qa.test.limits.extra.seats@example.com');

    const response = await agent
      .post('/api/trips')
      .send(buildFutureTrip({ available_seats: 1 }));

    assert.equal(response.status, 400);
    assert.equal(
      response.body.error,
      'El campo "available_seats" no está permitido',
    );
  });

  it('rechaza status en el body', async () => {
    const { agent } = await registerAgent('qa.test.limits.extra.status@example.com');

    const response = await agent
      .post('/api/trips')
      .send(buildFutureTrip({ status: 'completed' }));

    assert.equal(response.status, 400);
    assert.equal(
      response.body.error,
      'El campo "status" no está permitido',
    );
  });

  it('la respuesta de POST /api/trips no expone datos del conductor', async () => {
    const { agent, user } = await registerAgent(
      'qa.test.limits.post.privacy@example.com',
    );

    const response = await agent.post('/api/trips').send(buildFutureTrip());

    assert.equal(response.status, 201);

    assertNoDriverData(
      response.body.trip,
      user,
      JSON.stringify(response.body),
    );
  });

  it('la respuesta de GET /api/trips/mine no expone datos del conductor', async () => {
    const { agent, user } = await registerAgent(
      'qa.test.limits.mine.privacy@example.com',
    );

    await createTripAs(agent, {});

    const response = await agent.get('/api/trips/mine');

    assert.equal(response.status, 200);
    assert.equal(response.body.trips.length, 1);

    assertNoDriverData(
      response.body.trips[0],
      user,
      JSON.stringify(response.body),
    );
  });

  it('GET /api/trips/mine con un token vencido responde 401', async () => {
    const { user } = await registerAgent('qa.test.limits.mine.expired@example.com');
    const token = signExpiredToken({ id: user.id, email: user.email });

    const response = await request(app)
      .get('/api/trips/mine')
      .set('Cookie', `token=${token}`);

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { error: 'Sesión expirada' });
  });
});
