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

describe('POST /api/trips', () => {
  beforeEach(truncateUsers);
  after(closePool);

  it('crea el viaje del usuario autenticado y responde 201', async () => {
    const { agent, user } = await registerAgent('qa.test.trips.create@example.com');

    const response = await agent.post('/api/trips').send(buildTrip());

    assert.equal(response.status, 201);
    assert.deepEqual(Object.keys(response.body), ['trip']);

    const { trip } = response.body;

    assert.equal(trip.driver_id, user.id);
    assert.equal(trip.origin_city, 'Rosario');
    assert.equal(trip.destination_city, 'Córdoba');
    assert.equal(trip.total_seats, 3);
    assert.equal(trip.available_seats, 3);
    assert.equal(trip.status, 'scheduled');
    assert.ok(trip.id);
    assert.ok(trip.created_at);
  });

  it('devuelve price_per_seat como string, tal cual lo entrega pg', async () => {
    const { agent } = await registerAgent('qa.test.trips.price@example.com');

    const response = await agent
      .post('/api/trips')
      .send(buildTrip({ price_per_seat: 1500 }));

    assert.equal(response.status, 201);
    assert.equal(typeof response.body.trip.price_per_seat, 'string');
    assert.equal(response.body.trip.price_per_seat, '1500.00');
  });

  it('guarda un horario con -03:00 como el mismo instante', async () => {
    const { agent } = await registerAgent('qa.test.trips.offset@example.com');
    const departureTime = '2030-01-01T10:00:00-03:00';

    const response = await agent
      .post('/api/trips')
      .send(buildTrip({ departure_time: departureTime }));

    assert.equal(response.status, 201);
    assert.equal(
      new Date(response.body.trip.departure_time).getTime(),
      Date.parse(departureTime),
    );
    assert.equal(response.body.trip.departure_time, '2030-01-01T13:00:00.000Z');
  });

  it('acepta una fecha con Z y horas sin segundos', async () => {
    const { agent } = await registerAgent('qa.test.trips.z@example.com');

    const response = await agent
      .post('/api/trips')
      .send(buildTrip({ departure_time: '2031-06-15T09:30Z' }));

    assert.equal(response.status, 201);
    assert.equal(response.body.trip.departure_time, '2031-06-15T09:30:00.000Z');
  });

  it('recorta y colapsa los espacios de las ciudades', async () => {
    const { agent } = await registerAgent('qa.test.trips.spaces@example.com');

    const response = await agent.post('/api/trips').send(
      buildTrip({
        origin_city: '  Rosario   del   Sur  ',
        destination_city: ' Santa   Fe ',
      }),
    );

    assert.equal(response.status, 201);
    assert.equal(response.body.trip.origin_city, 'Rosario del Sur');
    assert.equal(response.body.trip.destination_city, 'Santa Fe');
  });

  it('no cambia las mayúsculas ni las tildes de las ciudades', async () => {
    const { agent } = await registerAgent('qa.test.trips.case@example.com');

    const response = await agent
      .post('/api/trips')
      .send(buildTrip({ destination_city: 'CÓRDOBA' }));

    assert.equal(response.status, 201);
    assert.equal(response.body.trip.destination_city, 'CÓRDOBA');
  });

  it('responde 401 sin cookie', async () => {
    const response = await request(app).post('/api/trips').send(buildTrip());

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { error: 'No autenticado' });
  });

  it('responde 401 con un token válido de un usuario inexistente', async () => {
    const token = signTestToken({
      id: NONEXISTENT_USER_ID,
      email: 'qa.test.trips.fantasma@example.com',
    });

    const response = await request(app)
      .post('/api/trips')
      .set('Cookie', `token=${token}`)
      .send(buildTrip());

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { error: 'No autenticado' });
  });

  const missingFields = {
    origin_city: 'El origen es obligatorio',
    destination_city: 'El destino es obligatorio',
    departure_time: 'La fecha de salida es obligatoria',
    total_seats: 'La cantidad de asientos es obligatoria',
    price_per_seat: 'El precio por asiento es obligatorio',
  };

  for (const [field, message] of Object.entries(missingFields)) {
    it(`rechaza la falta de ${field}`, async () => {
      const { agent } = await registerAgent(`qa.test.trips.sin.${field}@example.com`);
      const payload = buildTrip();
      delete payload[field];

      const response = await agent.post('/api/trips').send(payload);

      assert.equal(response.status, 400);
      assert.equal(response.body.error, message);
    });
  }

  const invalidPayloads = [
    {
      name: 'un campo extra',
      overrides: { driver_id: NONEXISTENT_USER_ID },
      message: 'El campo "driver_id" no está permitido',
    },
    {
      name: 'origen y destino iguales con distinta capitalización y tildes',
      overrides: { origin_city: 'CORDOBA', destination_city: 'córdoba' },
      message: 'El origen y el destino no pueden ser iguales',
    },
    {
      name: 'origen y destino iguales con espacios distintos',
      overrides: { origin_city: 'Santa  Fe', destination_city: ' santa fe ' },
      message: 'El origen y el destino no pueden ser iguales',
    },
    {
      name: 'un origen vacío',
      overrides: { origin_city: '   ' },
      message: 'El origen es obligatorio',
    },
    {
      name: 'un origen de más de 120 caracteres',
      overrides: { origin_city: 'A'.repeat(121) },
      message: 'El origen no puede superar los 120 caracteres',
    },
    {
      name: 'un origen que no es texto',
      overrides: { origin_city: 1234 },
      message: 'El origen debe ser texto',
    },
    {
      name: 'total_seats como string',
      overrides: { total_seats: '3' },
      message: 'La cantidad de asientos debe ser un número entero',
    },
    {
      name: 'total_seats como notación científica en string',
      overrides: { total_seats: '1e3' },
      message: 'La cantidad de asientos debe ser un número entero',
    },
    {
      name: 'total_seats con decimales',
      overrides: { total_seats: 3.5 },
      message: 'La cantidad de asientos debe ser un número entero',
    },
    {
      name: 'total_seats en 0',
      overrides: { total_seats: 0 },
      message: 'Debe haber al menos 1 asiento',
    },
    {
      name: 'total_seats en 9',
      overrides: { total_seats: 9 },
      message: 'No se pueden ofrecer más de 8 asientos',
    },
    {
      name: 'price_per_seat como string',
      overrides: { price_per_seat: '1500' },
      message: 'El precio por asiento debe ser un número entero',
    },
    {
      name: 'price_per_seat como notación científica en string',
      overrides: { price_per_seat: '1e3' },
      message: 'El precio por asiento debe ser un número entero',
    },
    {
      name: 'price_per_seat con decimales',
      overrides: { price_per_seat: 1500.5 },
      message: 'El precio por asiento debe ser un número entero',
    },
    {
      name: 'price_per_seat en 0',
      overrides: { price_per_seat: 0 },
      message: 'El precio por asiento debe ser mayor que 0',
    },
    {
      name: 'price_per_seat por encima del tope',
      overrides: { price_per_seat: 5000001 },
      message: 'El precio por asiento no puede superar los 5000000',
    },
    {
      name: 'una fecha sin offset',
      overrides: { departure_time: '2030-01-01T10:00:00' },
      message:
        'La fecha de salida debe ser una fecha y hora ISO 8601 con zona horaria (por ejemplo 2030-01-01T10:00:00-03:00)',
    },
    {
      name: 'una fecha sin hora',
      overrides: { departure_time: '2030-01-01' },
      message:
        'La fecha de salida debe ser una fecha y hora ISO 8601 con zona horaria (por ejemplo 2030-01-01T10:00:00-03:00)',
    },
    {
      name: 'una fecha con día inexistente',
      overrides: { departure_time: '2030-02-31T10:00:00Z' },
      message:
        'La fecha de salida debe ser una fecha y hora ISO 8601 con zona horaria (por ejemplo 2030-01-01T10:00:00-03:00)',
    },
    {
      name: 'una fecha pasada',
      overrides: { departure_time: '2020-01-01T10:00:00-03:00' },
      message: 'La fecha de salida debe ser futura',
    },
  ];

  for (const { name, overrides, message } of invalidPayloads) {
    it(`rechaza ${name}`, async () => {
      const { agent } = await registerAgent('qa.test.trips.invalid@example.com');

      const response = await agent
        .post('/api/trips')
        .send(buildTrip(overrides));

      assert.equal(response.status, 400);
      assert.equal(response.body.error, message);
    });
  }
});
