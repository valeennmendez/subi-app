import './setup.js';
import assert from 'node:assert/strict';
import { after, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { closePool, truncateUsers } from './helpers/db.js';

// Debe definirse antes de importar la app: auth.routes.js decide el skip
// al construir los limiters.
process.env.ENABLE_RATE_LIMIT_TEST = '1';

const { app } = await import('../src/app.js');

describe('rate limit en auth', () => {
  beforeEach(truncateUsers);
  after(closePool);

  it('bloquea el login después de 10 intentos fallidos', async () => {
    const credentials = {
      email: 'qa.test.ratelimit.login@example.com',
      password: 'Password123',
    };

    for (let attempt = 1; attempt <= 10; attempt += 1) {
      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      assert.equal(response.status, 401, `intento ${attempt}`);
    }

    const blocked = await request(app)
      .post('/api/auth/login')
      .send(credentials);

    assert.equal(blocked.status, 429);
    assert.deepEqual(blocked.body, {
      error:
        'Demasiados intentos de inicio de sesión. Intentá de nuevo más tarde.',
    });
  });

  it('bloquea el registro después de 20 intentos', async () => {
    for (let attempt = 1; attempt <= 20; attempt += 1) {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      assert.equal(response.status, 400, `intento ${attempt}`);
    }

    const blocked = await request(app)
      .post('/api/auth/register')
      .send({});

    assert.equal(blocked.status, 429);
    assert.deepEqual(blocked.body, {
      error:
        'Demasiados registros desde esta IP. Intentá de nuevo más tarde.',
    });
  });
});
