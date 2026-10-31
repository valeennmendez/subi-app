import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  MAX_PRICE_PER_SEAT,
  buildDepartureTime,
  formatPriceLimit,
  validateTripField,
  validateTripForm,
} from '../src/utils/tripValidation.js';

const HOUR_MS = 60 * 60 * 1000;
const ARGENTINA_OFFSET_MS = 3 * HOUR_MS;

// Arma un valor de datetime-local (sin zona) con la hora de Argentina a
// partir de un instante. Las fechas se calculan desde Date.now() para que los
// tests no dependan de un año fijo.
function toArgentinaLocalValue(timestamp) {
  const date = new Date(timestamp - ARGENTINA_OFFSET_MS);
  const pad = (value) => String(value).padStart(2, '0');

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate(),
  )}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

function futureValue() {
  return toArgentinaLocalValue(Date.now() + 24 * HOUR_MS);
}

function pastValue() {
  return toArgentinaLocalValue(Date.now() - 24 * HOUR_MS);
}

function validValues(overrides = {}) {
  return {
    origin_city: 'Buenos Aires',
    destination_city: 'Rosario',
    departure_time: futureValue(),
    total_seats: '3',
    price_per_seat: '12000',
    ...overrides,
  };
}

function fieldError(field, overrides) {
  return validateTripField(field, validValues(overrides));
}

test('un formulario válido no devuelve errores', () => {
  assert.deepEqual(validateTripForm(validValues()), {});
});

test('el origen es obligatorio y tiene tope de 120 caracteres', () => {
  assert.equal(
    fieldError('origin_city', { origin_city: '   ' }),
    'Ingresá la ciudad de origen.',
  );
  assert.equal(
    fieldError('origin_city', { origin_city: 'a'.repeat(121) }),
    'El origen no puede superar los 120 caracteres.',
  );
  assert.equal(fieldError('origin_city', { origin_city: 'a'.repeat(120) }), '');
});

test('el destino es obligatorio y tiene tope de 120 caracteres', () => {
  assert.equal(
    fieldError('destination_city', { destination_city: '' }),
    'Ingresá la ciudad de destino.',
  );
  assert.equal(
    fieldError('destination_city', { destination_city: 'a'.repeat(121) }),
    'El destino no puede superar los 120 caracteres.',
  );
  assert.equal(
    fieldError('destination_city', { destination_city: 'a'.repeat(120) }),
    '',
  );
});

test('el origen y el destino no pueden ser iguales sin importar mayúsculas ni tildes', () => {
  assert.equal(
    fieldError('destination_city', {
      origin_city: 'Córdoba',
      destination_city: 'CORDOBA',
    }),
    'El origen y el destino no pueden ser iguales.',
  );
  assert.equal(
    fieldError('destination_city', {
      origin_city: 'Rosario',
      destination_city: 'Rosario',
    }),
    'El origen y el destino no pueden ser iguales.',
  );
});

test('la fecha es obligatoria y debe ser futura', () => {
  assert.equal(
    fieldError('departure_time', { departure_time: '' }),
    'Elegí la fecha y hora de salida.',
  );
  assert.equal(
    fieldError('departure_time', { departure_time: pastValue() }),
    'La fecha de salida debe ser futura.',
  );
  assert.equal(
    fieldError('departure_time', { departure_time: futureValue() }),
    '',
  );
});

test('los asientos deben ser un entero de 1 a 8', () => {
  const message = 'Los asientos deben ser de 1 a 8.';

  assert.equal(fieldError('total_seats', { total_seats: '0' }), message);
  assert.equal(fieldError('total_seats', { total_seats: '9' }), message);
  assert.equal(fieldError('total_seats', { total_seats: '3.5' }), message);
  assert.equal(fieldError('total_seats', { total_seats: '' }), message);
  assert.equal(fieldError('total_seats', { total_seats: '1' }), '');
  assert.equal(fieldError('total_seats', { total_seats: '8' }), '');
});

test('el precio debe ser un entero positivo', () => {
  const message = 'Ingresá un precio válido.';

  assert.equal(fieldError('price_per_seat', { price_per_seat: '' }), message);
  assert.equal(fieldError('price_per_seat', { price_per_seat: '0' }), message);
  assert.equal(fieldError('price_per_seat', { price_per_seat: '-1500' }), message);
  assert.equal(fieldError('price_per_seat', { price_per_seat: '12000.5' }), message);
  assert.equal(fieldError('price_per_seat', { price_per_seat: '1' }), '');
});

test('el precio no puede superar el tope del backend con separador de miles', () => {
  const message = 'El precio no puede superar $5.000.000.';

  assert.equal(formatPriceLimit(), '$5.000.000');
  assert.equal(
    fieldError('price_per_seat', {
      price_per_seat: String(MAX_PRICE_PER_SEAT + 1),
    }),
    message,
  );
  assert.equal(
    fieldError('price_per_seat', {
      price_per_seat: String(MAX_PRICE_PER_SEAT),
    }),
    '',
  );
});

test('buildDepartureTime agrega los segundos y el offset fijo -03:00', () => {
  const value = futureValue();

  assert.equal(buildDepartureTime(value), `${value}:00-03:00`);
  assert.equal(buildDepartureTime(''), '');
});

test('validateTripForm devuelve un error por cada campo obligatorio', () => {
  const errors = validateTripForm({
    origin_city: '',
    destination_city: '',
    departure_time: '',
    total_seats: '',
    price_per_seat: '',
  });

  assert.deepEqual(Object.keys(errors).sort(), [
    'departure_time',
    'destination_city',
    'origin_city',
    'price_per_seat',
    'total_seats',
  ]);
  assert.equal(errors.departure_time, 'Elegí la fecha y hora de salida.');
});
