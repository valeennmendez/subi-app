import './setup.js';
import assert from 'node:assert/strict';
import { after, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { buildUser, newAgent } from './helpers/auth.js';
import {
  closePool,
  pool,
  truncateTripsAndUsers,
} from './helpers/db.js';
import { buildFutureTrip } from './helpers/trips.js';

const NONEXISTENT_TRIP_ID = '00000000-0000-4000-8000-000000000000';
const DRIVER_KEYS_NOT_EXPOSED = ['email', 'phone', 'password_hash'];
const INTERNAL_KEYS_NOT_EXPOSED = ['origin_search', 'destination_search'];

async function registerAgent(email) {
  const agent = newAgent();
  const response = await agent
    .post('/api/auth/register')
    .send(buildUser({ email }));

  assert.equal(response.status, 201);

  return { agent, user: response.body.user };
}

async function createTripAs(agent, overrides = {}) {
  const response = await agent
    .post('/api/trips')
    .send(buildFutureTrip(overrides));

  assert.equal(response.status, 201);

  return response.body.trip;
}

function assertNoSensitiveData(trip, user) {
  for (const key of DRIVER_KEYS_NOT_EXPOSED) {
    assert.ok(!(key in trip), `El detalle no debe incluir ${key}`);
  }

  for (const key of INTERNAL_KEYS_NOT_EXPOSED) {
    assert.ok(!(key in trip), `El detalle no debe incluir ${key}`);
  }

  const serialized = JSON.stringify(trip);

  assert.ok(
    !serialized.includes(user.email),
    'El detalle no debe contener el email del conductor',
  );
  assert.ok(
    !serialized.includes(user.phone),
    'El detalle no debe contener el teléfono del conductor',
  );
}

describe('GET /api/trips/:id', () => {
  beforeEach(truncateTripsAndUsers);
  after(closePool);

  it('devuelve el detalle con el nombre del conductor y sin datos sensibles', async () => {
    const { agent, user } = await registerAgent('qa.test.detail@example.com');
    const trip = await createTripAs(agent, {
      origin_city: 'Rosario',
      destination_city: 'Córdoba',
    });

    const response = await request(app).get(`/api/trips/${trip.id}`);

    assert.equal(response.status, 200);
    assert.deepEqual(Object.keys(response.body), ['trip']);

    const detail = response.body.trip;

    assert.equal(detail.id, trip.id);
    assert.equal(detail.driver_id, user.id);
    assert.equal(detail.driver_name, user.name);
    assert.equal(detail.origin_city, 'Rosario');
    assert.equal(detail.destination_city, 'Córdoba');
    assertNoSensitiveData(detail, user);
  });

  it('devuelve el detalle sin sesión', async () => {
    const { agent } = await registerAgent('qa.test.detail.anon@example.com');
    const trip = await createTripAs(agent, { origin_city: 'Público' });

    const response = await request(app).get(`/api/trips/${trip.id}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.trip.id, trip.id);
  });

  it('devuelve el detalle aunque el viaje esté cancelado', async () => {
    const { agent } = await registerAgent(
      'qa.test.detail.cancelled@example.com',
    );
    const trip = await createTripAs(agent, { origin_city: 'Cancelado' });

    await pool.query('UPDATE trips SET status = $1 WHERE id = $2', [
      'cancelled',
      trip.id,
    ]);

    const response = await request(app).get(`/api/trips/${trip.id}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.trip.status, 'cancelled');
  });

  it('responde 404 con un id inexistente', async () => {
    const response = await request(app).get(
      `/api/trips/${NONEXISTENT_TRIP_ID}`,
    );

    assert.equal(response.status, 404);
    assert.deepEqual(response.body, { error: 'Viaje no encontrado' });
  });

  it('responde 404 con un id mal formado', async () => {
    const response = await request(app).get('/api/trips/no-es-un-uuid');

    assert.equal(response.status, 404);
    assert.deepEqual(response.body, { error: 'Viaje no encontrado' });
  });
});
