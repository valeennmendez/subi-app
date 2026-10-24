import './setup.js';
import assert from 'node:assert/strict';
import { after, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { buildUser, setCookieHeader } from './helpers/auth.js';
import { closePool, truncateUsers } from './helpers/db.js';

const register = (body) =>
  request(app).post('/api/auth/register').send(body);

describe('POST /api/auth/register', () => {
  beforeEach(truncateUsers);
  after(closePool);

  it('registra un usuario, devuelve el perfil y setea la cookie', async () => {
    const payload = buildUser({ email: 'qa.test.register@example.com' });
    const response = await register(payload);

    assert.equal(response.status, 201);
    assert.deepEqual(Object.keys(response.body), ['user']);
    assert.equal(response.body.user.email, payload.email);
    assert.equal(response.body.user.name, payload.name);
    assert.equal(response.body.user.phone, payload.phone);
    assert.ok(response.body.user.id);
    assert.ok(response.body.user.created_at);
    assert.equal(response.body.user.rating_average, null);
    assert.equal(response.body.user.password_hash, undefined);
    assert.equal(response.body.token, undefined);

    const cookie = setCookieHeader(response);
    assert.match(cookie, /^token=/);
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Lax/);
    assert.match(cookie, /Path=\//);
    assert.doesNotMatch(cookie, /Secure/);
  });

  const requiredFields = {
    email: 'El email es obligatorio',
    password: 'La contraseña es obligatoria',
    name: 'El nombre es obligatorio',
    phone: 'El teléfono es obligatorio',
  };

  for (const [field, message] of Object.entries(requiredFields)) {
    it(`rechaza la falta de ${field}`, async () => {
      const payload = buildUser();
      delete payload[field];

      const response = await register(payload);

      assert.equal(response.status, 400);
      assert.equal(response.body.error, message);
    });
  }

  it('rechaza una solicitud sin body', async () => {
    const response = await request(app).post('/api/auth/register');

    assert.equal(response.status, 400);
    assert.equal(typeof response.body.error, 'string');
  });

  it('rechaza un email inválido', async () => {
    const response = await register(
      buildUser({ email: 'no-es-un-email' }),
    );

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'El email no es válido');
  });

  it('rechaza una contraseña de menos de 8 caracteres', async () => {
    const response = await register(buildUser({ password: 'A'.repeat(7) }));

    assert.equal(response.status, 400);
    assert.equal(
      response.body.error,
      'La contraseña debe tener al menos 8 caracteres',
    );
  });

  it('acepta una contraseña ASCII de 72 bytes', async () => {
    const response = await register(buildUser({ password: 'A'.repeat(72) }));

    assert.equal(response.status, 201);
  });

  it('rechaza una contraseña ASCII de 73 bytes', async () => {
    const response = await register(buildUser({ password: 'A'.repeat(73) }));

    assert.equal(response.status, 400);
    assert.equal(
      response.body.error,
      'La contraseña no puede superar los 72 bytes',
    );
  });

  it('acepta una contraseña de 36 "ñ" (72 bytes)', async () => {
    const response = await register(buildUser({ password: 'ñ'.repeat(36) }));

    assert.equal(response.status, 201);
  });

  it('rechaza una contraseña de 37 "ñ" (74 bytes)', async () => {
    const response = await register(buildUser({ password: 'ñ'.repeat(37) }));

    assert.equal(response.status, 400);
    assert.equal(
      response.body.error,
      'La contraseña no puede superar los 72 bytes',
    );
  });

  it('rechaza campos desconocidos', async () => {
    const response = await register({ ...buildUser(), role: 'admin' });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'El campo role no está permitido');
  });

  it('rechaza un teléfono con menos de 8 dígitos', async () => {
    const response = await register(buildUser({ phone: '1234567' }));

    assert.equal(response.status, 400);
    assert.equal(
      response.body.error,
      'El teléfono debe tener entre 8 y 20 dígitos',
    );
  });

  it('rechaza un teléfono con letras', async () => {
    const response = await register(buildUser({ phone: '11aa2233' }));

    assert.equal(response.status, 400);
    assert.equal(
      response.body.error,
      'El teléfono solo puede contener números, espacios, +, - y paréntesis',
    );
  });

  it('rechaza un nombre vacío', async () => {
    const response = await register(buildUser({ name: '   ' }));

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'El nombre es obligatorio');
  });

  it('rechaza un nombre de más de 120 caracteres', async () => {
    const response = await register(buildUser({ name: 'N'.repeat(121) }));

    assert.equal(response.status, 400);
    assert.equal(
      response.body.error,
      'El nombre no puede superar los 120 caracteres',
    );
  });

  it('rechaza JSON inválido', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send('{"email": "qa.test.register@example.com"');

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { error: 'JSON inválido' });
  });

  it('rechaza un email duplicado aunque cambien las mayúsculas', async () => {
    const payload = buildUser({ email: 'qa.test.duplicado@example.com' });
    const first = await register(payload);

    assert.equal(first.status, 201);

    const second = await register({
      ...payload,
      email: payload.email.toUpperCase(),
    });

    assert.equal(second.status, 409);
    assert.deepEqual(second.body, {
      error: 'El email ya está registrado',
    });
  });
});
