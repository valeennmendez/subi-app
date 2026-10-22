import { getHealthStatus } from '../services/health.service.js';

export function getHealth(_req, res) {
  return res.status(200).json(getHealthStatus());
}
