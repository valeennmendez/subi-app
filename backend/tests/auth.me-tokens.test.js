import './setup.js';
import assert from 'node:assert/strict';
import { after, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { buildUser, newAgent, tokenCookie } from './helpers/auth.js';
import { closePool, truncateUsers } from './helpers/db.js';
import {
  NONEXISTENT_USER_ID,
  signExpiredToken,
  signNoneToken,
  signTestToken,
  signWithOtherSecret,
  VALID_UUID,
} from './helpers/tokens.js';

async function registerAgent(email) {
  const agent = newAgent();
  const payload = buildUser({ email });
  const response = await agent.post('/api/auth/register').send(payload);

  assert.equal(response.status, 201);

  return { agent, payload, response };
}

function meWithToken(token) {
  return request(app)
    .get('/api/auth/me')
    .set('Cookie', `token=${token}`);
}

describe('GET /api/auth/me y tokens', () => {
  beforeEach(truncateUsers);
  after(closePool);

  it('devuelve el perfil con una sesión válida', async () => {
    const { agent, payload, response } = await registerAgent(
      'qa.test.me@example.com',
    );

    const meResponse = await agent.get('/api/auth/me');

    assert.equal(meResponse.status, 200);
    assert.deepEqual(meResponse.body, response.body);
    assert.equal(meResponse.body.user.email, payload.email);
    assert.equal(meResponse.body.user.password_hash, undefined);
  });

  it('responde 401 sin cookie', async () => {
    const response = await request(app).get('/api/auth/me');

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { error: 'No autenticado' });
  });

  it('responde 401 después de logout', async () => {
    const { agent } = await registerAgent('qa.test.me.logout@example.com');

    await agent.post('/api/auth/logout').expect(200);

    const response = await agent.get('/api/auth/me');

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { error: 'No autenticado' });
  });

  it('responde 401 con un UUID válido que no existe', async () => {
    const token = signTestToken({
      id: NONEXISTENT_USER_ID,
      email: 'qa.test.me.inexistente@example.com',
    });

    const response = await meWithToken(token);

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { error: 'No autenticado' });
  });

  it('responde 401 si el id del token no es un UUID', async () => {
    const token = signTestToken({
      id: '1',
      email: 'qa.test.me.uuid@example.com',
    });

    const response = await meWithToken(token);

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { error: 'No autenticado' });
  });

  it('responde 401 con un token vencido', async () => {
    const token = signExpiredToken({
      id: VALID_UUID,
      email: 'qa.test.me.vencido@example.com',
    });

    const response = await meWithToken(token);

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { error: 'Sesión expirada' });
  });

  it('responde 401 si se altera un carácter del medio de la firma', async () => {
    const { response: registerResponse } = await registerAgent(
      'qa.test.me.firma@example.com',
    );
    const original = tokenCookie(registerResponse).slice('token='.length);
    const [header, payload, signature] = original.split('.');
    const index = Math.floor(signature.length / 2);
    const replacement = signature[index] === 'A' ? 'B' : 'A';
    const tampered = `${header}.${payload}.${signature.slice(0, index)}${replacement}${signature.slice(index + 1)}`;

    assert.notEqual(tampered, original);

    const response = await meWithToken(tampered);

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { error: 'No autenticado' });
  });

  it('responde 401 con un token firmado con otro secreto', async () => {
    const token = signWithOtherSecret({
      id: VALID_UUID,
      email: 'qa.test.me.secreto@example.com',
    });

    const response = await meWithToken(token);

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { error: 'No autenticado' });
  });

  it('responde 401 con un token alg none', async () => {
    const token = signNoneToken({
      id: VALID_UUID,
      email: 'qa.test.me.none@example.com',
    });

    const response = await meWithToken(token);

    assert.equal(response.status, 401);
    assert.deepEqual(response.body, { error: 'No autenticado' });
  });
});
