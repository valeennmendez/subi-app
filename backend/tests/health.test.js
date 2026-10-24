import './setup.js';
import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { closePool } from './helpers/db.js';

describe('endpoints base', () => {
  after(closePool);

  it('GET /api/health responde ok', async () => {
    const response = await request(app).get('/api/health');

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { status: 'ok' });
  });

  it('una ruta inexistente responde 404', async () => {
    const response = await request(app).get('/api/ruta-inexistente');

    assert.equal(response.status, 404);
    assert.deepEqual(response.body, { error: 'Ruta no encontrada' });
  });
});
