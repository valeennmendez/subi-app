import Joi from 'joi';

const emailSchema = Joi.string()
  .trim()
  .lowercase()
  .email()
  .max(255)
  .required()
  .messages({
    'any.required': 'El email es obligatorio',
    'string.base': 'El email debe ser texto',
    'string.empty': 'El email es obligatorio',
    'string.email': 'El email no es válido',
    'string.max': 'El email no puede superar los 255 caracteres',
  });

const passwordBytes = (value, helpers) => {
  if (Buffer.byteLength(value, 'utf8') > 72) {
    return helpers.error('string.passwordBytes');
  }

  return value;
};

const registerPasswordSchema = Joi.string()
  .min(8)
  .custom(passwordBytes)
  .required()
  .messages({
    'any.required': 'La contraseña es obligatoria',
    'string.base': 'La contraseña debe ser texto',
    'string.empty': 'La contraseña es obligatoria',
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'string.passwordBytes': 'La contraseña no puede superar los 72 bytes',
  });

const loginPasswordSchema = Joi.string()
  .min(1)
  .custom(passwordBytes)
  .required()
  .messages({
    'any.required': 'La contraseña es obligatoria',
    'string.base': 'La contraseña debe ser texto',
    'string.empty': 'La contraseña es obligatoria',
    'string.min': 'La contraseña es obligatoria',
    'string.passwordBytes': 'La contraseña no puede superar los 72 bytes',
  });

const nameSchema = Joi.string()
  .trim()
  .min(1)
  .max(120)
  .required()
  .messages({
    'any.required': 'El nombre es obligatorio',
    'string.base': 'El nombre debe ser texto',
    'string.empty': 'El nombre es obligatorio',
    'string.min': 'El nombre es obligatorio',
    'string.max': 'El nombre no puede superar los 120 caracteres',
  });

const phoneSchema = Joi.string()
  .trim()
  .max(30)
  .pattern(/^[0-9+\-()\s]+$/)
  .custom((value, helpers) => {
    const digitCount = value.replace(/\D/g, '').length;

    if (digitCount < 8 || digitCount > 20) {
      return helpers.error('string.phoneDigits');
    }

    return value;
  })
  .required()
  .messages({
    'any.required': 'El teléfono es obligatorio',
    'string.base': 'El teléfono debe ser texto',
    'string.empty': 'El teléfono es obligatorio',
    'string.max': 'El teléfono no puede superar los 30 caracteres',
    'string.pattern.base':
      'El teléfono solo puede contener números, espacios, +, - y paréntesis',
    'string.phoneDigits': 'El teléfono debe tener entre 8 y 20 dígitos',
  });

const schemaMessages = {
  'object.base': 'El cuerpo de la solicitud debe ser un objeto JSON',
  'object.unknown': 'El campo {{#label}} no está permitido',
};

export const registerSchema = Joi.object({
  email: emailSchema,
  password: registerPasswordSchema,
  name: nameSchema,
  phone: phoneSchema,
})
  .unknown(false)
  .messages(schemaMessages);

export const loginSchema = Joi.object({
  email: emailSchema,
  password: loginPasswordSchema,
})
  .unknown(false)
  .messages(schemaMessages);
