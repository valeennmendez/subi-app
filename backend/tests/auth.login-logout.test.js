import './setup.js';
import assert from 'node:assert/strict';
import { after, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import {
  buildUser,
  newAgent,
  setCookieHeader,
} from './helpers/auth.js';
import { closePool, truncateUsers } from './helpers/db.js';

describe('POST /api/auth/login y /api/auth/logout', () => {
  beforeEach(truncateUsers);
  after(closePool);

  it('inicia sesión y devuelve el perfil sin datos sensibles', async () => {
    const payload = buildUser({ email: 'qa.test.login@example.com' });
    await request(app).post('/api/auth/register').send(payload).expect(201);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: payload.email, password: payload.password });

    assert.equal(response.status, 200);
    assert.deepEqual(Object.keys(response.body), ['user']);
    assert.equal(response.body.user.email, payload.email);
    assert.equal(response.body.user.password_hash, undefined);
    assert.equal(response.body.token, undefined);

    const cookie = setCookieHeader(response);
    assert.match(cookie, /^token=/);
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Lax/);
  });

  it('acepta el email en mayúsculas', async () => {
    const payload = buildUser({ email: 'qa.test.mayusculas@example.com' });
    await request(app).post('/api/auth/register').send(payload).expect(201);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: payload.email.toUpperCase(),
        password: payload.password,
      });

    assert.equal(response.status, 200);
    assert.equal(response.body.user.email, payload.email);
  });

  it('responde igual para email inexistente y contraseña incorrecta', async () => {
    const payload = buildUser({ email: 'qa.test.credenciales@example.com' });
    await request(app).post('/api/auth/register').send(payload).expect(201);

    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: payload.email, password: 'PasswordIncorrecta' });

    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'qa.test.inexistente@example.com',
        password: payload.password,
      });

    assert.equal(wrongPassword.status, 401);
    assert.equal(unknownEmail.status, 401);
    assert.deepEqual(wrongPassword.body, {
      error: 'Credenciales inválidas',
    });
    assert.deepEqual(unknownEmail.body, wrongPassword.body);
  });

  it('cierra la sesión y borra la cookie', async () => {
    const agent = newAgent();
    const payload = buildUser({ email: 'qa.test.logout@example.com' });
    await agent.post('/api/auth/register').send(payload).expect(201);

    const response = await agent.post('/api/auth/logout');

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      message: 'Sesión cerrada correctamente',
    });

    const cookie = setCookieHeader(response);
    assert.match(cookie, /^token=;/);
    assert.match(cookie, /Expires=Thu, 01 Jan 1970/);

    const meResponse = await agent.get('/api/auth/me');

    assert.equal(meResponse.status, 401);
    assert.deepEqual(meResponse.body, { error: 'No autenticado' });
  });
});
