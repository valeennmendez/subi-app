import './setup.js';
import assert from 'node:assert/strict';
import { after, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { buildUser, newAgent } from './helpers/auth.js';
import { closePool, truncateUsers } from './helpers/db.js';
import { NONEXISTENT_USER_ID, signTestToken } from './helpers/tokens.js';
import { buildTrip } from './helpers/trips.js';

async function registerAgent(email) {
  const agent = newAgent();
  const response = await agent
    .post('/api/auth/register')
    .send(buildUser({ email }));

  assert.equal(response.status, 201);

  return { agent, user: response.body.user };
}

async function createTripAs(agent, overrides) {
  const response = await agent.post('/api/trips').send(buildTrip(overrides));

  assert.equal(response.status, 201);

  return response.body.trip;
}

describe('GET /api/trips/mine', () => {
  beforeEach(truncateUsers);
  after(closePool);

  it('responde 401 sin cookie', async () => {
    const response = await request(app).get('/api/trips/mine');

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { error: 'No autenticado' });
  });

  it('devuelve una lista vacía si el conductor no tiene viajes', async () => {
    const { agent } = await registerAgent('qa.test.mine.empty@example.com');

    const response = await agent.get('/api/trips/mine');

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { trips: [] });
  });

  it('devuelve solo los viajes del usuario autenticado', async () => {
    const first = await registerAgent('qa.test.mine.uno@example.com');
    const second = await registerAgent('qa.test.mine.dos@example.com');

    await createTripAs(first.agent, { origin_city: 'Rosario' });
    const secondTrip = await createTripAs(second.agent, {
      origin_city: 'Mendoza',
    });

    const response = await first.agent.get('/api/trips/mine');

    assert.equal(response.status, 200);
    assert.equal(response.body.trips.length, 1);
    assert.equal(response.body.trips[0].driver_id, first.user.id);
    assert.notEqual(response.body.trips[0].id, secondTrip.id);
    assert.equal(response.body.trips[0].origin_city, 'Rosario');
  });

  it('ordena por departure_time descendente', async () => {
    const { agent } = await registerAgent('qa.test.mine.order@example.com');

    await createTripAs(agent, {
      origin_city: 'Enero',
      departure_time: '2030-01-01T10:00:00Z',
    });
    await createTripAs(agent, {
      origin_city: 'Marzo',
      departure_time: '2030-03-01T10:00:00Z',
    });
    await createTripAs(agent, {
      origin_city: 'Febrero',
      departure_time: '2030-02-01T10:00:00Z',
    });

    const response = await agent.get('/api/trips/mine');

    assert.equal(response.status, 200);
    assert.deepEqual(
      response.body.trips.map((trip) => trip.origin_city),
      ['Marzo', 'Febrero', 'Enero'],
    );
  });

  it('desempata por id descendente cuando la fecha coincide', async () => {
    const { agent } = await registerAgent('qa.test.mine.tie@example.com');

    const firstTrip = await createTripAs(agent, {
      origin_city: 'Primero',
      departure_time: '2030-05-01T10:00:00Z',
    });
    const secondTrip = await createTripAs(agent, {
      origin_city: 'Segundo',
      departure_time: '2030-05-01T10:00:00Z',
    });

    const response = await agent.get('/api/trips/mine');
    const ids = response.body.trips.map((trip) => trip.id);

    assert.equal(response.status, 200);
    assert.equal(ids.length, 2);
    assert.deepEqual(ids, [firstTrip.id, secondTrip.id].sort().reverse());
  });

  it('devuelve una lista vacía con un token válido de un usuario inexistente', async () => {
    const token = signTestToken({
      id: NONEXISTENT_USER_ID,
      email: 'qa.test.mine.fantasma@example.com',
    });

    const response = await request(app)
      .get('/api/trips/mine')
      .set('Cookie', `token=${token}`);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { trips: [] });
  });
});
