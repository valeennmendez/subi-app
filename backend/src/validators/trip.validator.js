import Joi from 'joi';

// Un solo lugar para el tope: lo usan el schema y el mensaje de error.
export const MAX_PRICE_PER_SEAT = 5000000;

const CITY_MAX_LENGTH = 120;
const MIN_SEATS = 1;
const MAX_SEATS = 8;

// Fecha y hora completas con zona horaria explícita: se exige el offset o la
// "Z" para no depender de la zona del servidor. Los segundos y las fracciones
// son opcionales.
const ISO_WITH_OFFSET =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:?\d{2})$/;

// Se guarda con trim y espacios internos colapsados; no se toca nada más.
function collapseSpaces(value) {
  if (typeof value !== 'string') {
    return value;
  }

  return value.trim().replace(/\s+/g, ' ');
}

// Solo para la validación de origen != destino: minúsculas y sin tildes.
function normalizeForComparison(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Valida el calendario real (rechaza, por ejemplo, 2030-02-30), exige que la
// fecha sea futura y devuelve el string original: no se normaliza ni se
// convierte, así Postgres guarda el instante con el offset que mandó el cliente.
function validateDepartureTime(value, helpers) {
  const match = ISO_WITH_OFFSET.exec(value);

  if (!match) {
    return helpers.error('departureTime.format');
  }

  const [, year, month, day, hour, minute, second] = match;
  const parts = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second ?? 0),
  };

  const asUtc = new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    ),
  );

  const isRealDate =
    asUtc.getUTCFullYear() === parts.year &&
    asUtc.getUTCMonth() === parts.month - 1 &&
    asUtc.getUTCDate() === parts.day &&
    asUtc.getUTCHours() === parts.hour &&
    asUtc.getUTCMinutes() === parts.minute &&
    asUtc.getUTCSeconds() === parts.second;

  const timestamp = Date.parse(value);

  if (!isRealDate || Number.isNaN(timestamp)) {
    return helpers.error('departureTime.format');
  }

  if (timestamp <= Date.now()) {
    return helpers.error('departureTime.future');
  }

  return value;
}

function sameCityCheck(value, helpers) {
  const { origin_city: origin, destination_city: destination } = value;

  if (typeof origin !== 'string' || typeof destination !== 'string') {
    return value;
  }

  if (normalizeForComparison(origin) === normalizeForComparison(destination)) {
    return helpers.error('any.sameCity');
  }

  return value;
}

function citySchema(fieldName) {
  return Joi.string()
    .strict()
    .custom(collapseSpaces)
    .min(1)
    .max(CITY_MAX_LENGTH)
    .required()
    .messages({
      'any.required': `${fieldName} es obligatorio`,
      'string.base': `${fieldName} debe ser texto`,
      'string.empty': `${fieldName} es obligatorio`,
      'string.min': `${fieldName} es obligatorio`,
      'string.max': `${fieldName} no puede superar los ${CITY_MAX_LENGTH} caracteres`,
    });
}

// .strict() desactiva la conversión de esta regla: un string numérico ("3",
// "1e3") se rechaza aunque validate() use convert: true para el resto del body.
const totalSeatsSchema = Joi.number()
  .strict()
  .integer()
  .min(MIN_SEATS)
  .max(MAX_SEATS)
  .required()
  .messages({
    'any.required': 'La cantidad de asientos es obligatoria',
    'number.base': 'La cantidad de asientos debe ser un número entero',
    'number.integer': 'La cantidad de asientos debe ser un número entero',
    'number.min': `Debe haber al menos ${MIN_SEATS} asiento`,
    'number.max': `No se pueden ofrecer más de ${MAX_SEATS} asientos`,
  });

const pricePerSeatSchema = Joi.number()
  .strict()
  .integer()
  .min(1)
  .max(MAX_PRICE_PER_SEAT)
  .required()
  .messages({
    'any.required': 'El precio por asiento es obligatorio',
    'number.base': 'El precio por asiento debe ser un número entero',
    'number.integer': 'El precio por asiento debe ser un número entero',
    'number.min': 'El precio por asiento debe ser mayor que 0',
    'number.max': `El precio por asiento no puede superar los ${MAX_PRICE_PER_SEAT}`,
  });

export const createTripSchema = Joi.object({
  origin_city: citySchema('El origen'),
  destination_city: citySchema('El destino'),
  departure_time: Joi.string()
    .strict()
    .custom(validateDepartureTime)
    .required()
    .messages({
      'any.required': 'La fecha de salida es obligatoria',
      'string.base': 'La fecha de salida debe ser texto',
      'string.empty': 'La fecha de salida es obligatoria',
      'departureTime.format':
        'La fecha de salida debe ser una fecha y hora ISO 8601 con zona horaria (por ejemplo 2030-01-01T10:00:00-03:00)',
      'departureTime.future': 'La fecha de salida debe ser futura',
    }),
  total_seats: totalSeatsSchema,
  price_per_seat: pricePerSeatSchema,
})
  .unknown(false)
  .custom(sameCityCheck)
  .messages({
    'object.base': 'El cuerpo de la solicitud debe ser un objeto JSON',
    'object.unknown': 'El campo {{#label}} no está permitido',
    'any.sameCity': 'El origen y el destino no pueden ser iguales',
  });
