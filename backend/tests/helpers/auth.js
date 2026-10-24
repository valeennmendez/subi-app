import '../setup.js';
import request from 'supertest';
import { app } from '../../src/app.js';

export const TEST_PASSWORD = 'Password123';

export function buildUser(overrides = {}) {
  return {
    email: 'qa.test.user@example.com',
    password: TEST_PASSWORD,
    name: 'QA Test',
    phone: '1122334455',
    ...overrides,
  };
}

export function newAgent() {
  return request.agent(app);
}

export function setCookieHeader(response) {
  const value = response.headers['set-cookie'];

  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

export function tokenCookie(response) {
  return setCookieHeader(response).split(';')[0];
}
