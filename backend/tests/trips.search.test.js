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
import { signExpiredToken } from './helpers/tokens.js';
import { buildFutureTrip, futureDepartureTime } from './helpers/trips.js';

const DAY_MS = 24 * 60 * 60 * 1000;

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

async function setTripStatus(id, status) {
  await pool.query('UPDATE trips SET status = $1 WHERE id = $2', [status, id]);
}

async function setAvailableSeats(id, availableSeats) {
  await pool.query('UPDATE trips SET available_seats = $1 WHERE id = $2', [
    availableSeats,
    id,
  ]);
}

function tripIds(response) {
  return response.body.trips.map((trip) => trip.id);
}

function addDays(date, days) {
  const [year, month, day] = date.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));

  return next.toISOString().slice(0, 10);
}

describe('GET /api/trips', () => {
  beforeEach(truncateTripsAndUsers);
  after(closePool);

  it('busca por origen ignorando tildes y mayúsculas', async () => {
    const { agent } = await registerAgent('qa.test.search.accent@example.com');

    const lowercase = await createTripAs(agent, {
      origin_city: 'Córdoba',
      destination_city: 'Rosario',
    });
    const uppercase = await createTripAs(agent, {
      origin_city: 'CÓRDOBA',
      destination_city: 'Mendoza',
    });

    const response = await request(app)
      .get('/api/trips')
      .query({ origin: 'CORDOBA' });

    assert.equal(response.status, 200);
    assert.deepEqual(
      tripIds(response).sort(),
      [lowercase.id, uppercase.id].sort(),
    );
  });

  it('busca solo por prefijo del origen', async () => {
    const { agent } = await registerAgent('qa.test.search.prefix@example.com');

    const sanMartin = await createTripAs(agent, {
      origin_city: 'San Martín de los Andes',
      destination_city: 'Neuquén',
    });
    await createTripAs(agent, {
      origin_city: 'Villa San Martín',
      destination_city: 'Córdoba',
    });

    const prefixed = await request(app)
      .get('/api/trips')
      .query({ origin: 'San Mart' });
    const notPrefix = await request(app)
      .get('/api/trips')
      .query({ origin: 'Martín' });

    assert.equal(prefixed.status, 200);
    assert.deepEqual(tripIds(prefixed), [sanMartin.id]);
    assert.equal(notPrefix.status, 200);
    assert.deepEqual(tripIds(notPrefix), []);
  });

  it('combina origen, destino, fecha y asientos', async () => {
    const { agent } = await registerAgent('qa.test.search.combined@example.com');
    const departureTime = futureDepartureTime(10 * DAY_MS);
    const date = departureTime.slice(0, 10);

    const matching = await createTripAs(agent, {
      origin_city: 'Rosario',
      destination_city: 'Córdoba',
      departure_time: departureTime,
      total_seats: 3,
    });
    await createTripAs(agent, {
      origin_city: 'Santa Fe',
      destination_city: 'Córdoba',
      departure_time: departureTime,
      total_seats: 3,
    });
    await createTripAs(agent, {
      origin_city: 'Rosario',
      destination_city: 'Mendoza',
      departure_time: departureTime,
      total_seats: 3,
    });
    await createTripAs(agent, {
      origin_city: 'Rosario',
      destination_city: 'Córdoba',
      departure_time: futureDepartureTime(11 * DAY_MS),
      total_seats: 3,
    });
    await createTripAs(agent, {
      origin_city: 'Rosario',
      destination_city: 'Córdoba',
      departure_time: departureTime,
      total_seats: 1,
    });

    const response = await request(app).get('/api/trips').query({
      origin: 'ros',
      destination: 'cord',
      date,
      seats: 2,
    });

    assert.equal(response.status, 200);
    assert.deepEqual(tripIds(response), [matching.id]);
  });

  it('filtra por día calendario argentino, no por UTC', async () => {
    const { agent } = await registerAgent('qa.test.search.day@example.com');
    const date = futureDepartureTime(10 * DAY_MS).slice(0, 10);
    const nextDate = addDays(date, 1);

    const early = await createTripAs(agent, {
      departure_time: `${date}T00:30:00-03:00`,
    });
    const late = await createTripAs(agent, {
      departure_time: `${date}T23:30:00-03:00`,
    });
    const nextDay = await createTripAs(agent, {
      departure_time: `${nextDate}T00:30:00-03:00`,
    });

    const sameDay = await request(app).get('/api/trips').query({ date });
    const followingDay = await request(app)
      .get('/api/trips')
      .query({ date: nextDate });

    assert.equal(sameDay.status, 200);
    assert.deepEqual(tripIds(sameDay).sort(), [early.id, late.id].sort());
    assert.equal(followingDay.status, 200);
    assert.deepEqual(tripIds(followingDay), [nextDay.id]);
  });

  it('excluye viajes cancelados, completados y sin asientos', async () => {
    const { agent } = await registerAgent('qa.test.search.status@example.com');

    const available = await createTripAs(agent, { origin_city: 'Disponible' });
    const cancelled = await createTripAs(agent, { origin_city: 'Cancelado' });
    const completed = await createTripAs(agent, { origin_city: 'Completado' });
    const full = await createTripAs(agent, { origin_city: 'Lleno' });

    await setTripStatus(cancelled.id, 'cancelled');
    await setTripStatus(completed.id, 'completed');
    await setAvailableSeats(full.id, 0);

    const response = await request(app).get('/api/trips');

    assert.equal(response.status, 200);
    assert.deepEqual(tripIds(response), [available.id]);
  });

  it('ordena por departure_time ascendente', async () => {
    const { agent } = await registerAgent('qa.test.search.order@example.com');

    const later = await createTripAs(agent, {
      origin_city: 'Tercero',
      departure_time: futureDepartureTime(12 * DAY_MS),
    });
    const sooner = await createTripAs(agent, {
      origin_city: 'Primero',
      departure_time: futureDepartureTime(10 * DAY_MS),
    });
    const middle = await createTripAs(agent, {
      origin_city: 'Segundo',
      departure_time: futureDepartureTime(11 * DAY_MS),
    });

    const response = await request(app).get('/api/trips');

    assert.equal(response.status, 200);
    assert.deepEqual(tripIds(response), [sooner.id, middle.id, later.id]);
  });

  it('permite buscar sin sesión', async () => {
    const { agent } = await registerAgent('qa.test.search.anon@example.com');
    const trip = await createTripAs(agent, { origin_city: 'Público' });

    const response = await request(app).get('/api/trips');

    assert.equal(response.status, 200);
    assert.deepEqual(tripIds(response), [trip.id]);
  });

  it('permite buscar con una sesión válida', async () => {
    const { agent } = await registerAgent('qa.test.search.session@example.com');
    const trip = await createTripAs(agent, { origin_city: 'Con sesión' });

    const response = await agent.get('/api/trips');

    assert.equal(response.status, 200);
    assert.deepEqual(tripIds(response), [trip.id]);
  });

  it('trata un token vencido como visitante', async () => {
    const { agent, user } = await registerAgent(
      'qa.test.search.expired@example.com',
    );
    const trip = await createTripAs(agent, { origin_city: 'Vencido' });
    const token = signExpiredToken({ id: user.id, email: user.email });

    const response = await request(app)
      .get('/api/trips')
      .set('Cookie', `token=${token}`);

    assert.equal(response.status, 200);
    assert.deepEqual(tripIds(response), [trip.id]);
  });

  const invalidQueries = [
    {
      query: { seats: 'abc' },
      message: 'La cantidad de asientos debe ser un número entero',
    },
    {
      query: { seats: '0' },
      message: 'Debe haber al menos 1 asiento',
    },
    {
      query: { seats: '1.5' },
      message: 'La cantidad de asientos debe ser un número entero',
    },
    {
      query: { date: '2026-02-30' },
      message: 'La fecha no es válida',
    },
    {
      query: { date: '31-10-2026' },
      message: 'La fecha debe tener el formato YYYY-MM-DD',
    },
    {
      query: { foo: 'bar' },
      message: 'El parámetro "foo" no está permitido',
    },
  ];

  for (const { query, message } of invalidQueries) {
    it(`rechaza query params inválidos: ${JSON.stringify(query)}`, async () => {
      const response = await request(app).get('/api/trips').query(query);

      assert.equal(response.status, 400);
      assert.equal(response.body.error, message);
    });
  }
});
