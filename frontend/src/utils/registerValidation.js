const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\-()\s]+$/;

export const REGISTER_FIELDS = [
  'name',
  'email',
  'phone',
  'password',
  'confirmPassword',
  'age',
];

export const PASSWORD_MAX_BYTES = 72;

export function getPasswordByteLength(value) {
  return new TextEncoder().encode(value).length;
}

function validateName(value) {
  const name = value.trim();

  if (!name) return 'Ingresá tu nombre completo.';
  if (name.length > 120) return 'El nombre no puede superar los 120 caracteres.';

  return '';
}

function validateEmail(value) {
  const email = value.trim();

  if (!email) return 'Ingresá tu correo electrónico.';
  if (!EMAIL_PATTERN.test(email)) return 'Ingresá un correo válido.';
  if (email.length > 255) return 'El correo no puede superar los 255 caracteres.';

  return '';
}

function validatePhone(value) {
  const phone = value.trim();

  if (!phone) return 'Ingresá tu teléfono.';
  if (phone.length > 30) return 'El teléfono no puede superar los 30 caracteres.';
  if (!PHONE_PATTERN.test(phone)) {
    return 'El teléfono solo puede contener números, espacios, +, - y paréntesis.';
  }

  const digitCount = phone.replace(/\D/g, '').length;

  if (digitCount < 8 || digitCount > 20) {
    return 'El teléfono debe tener entre 8 y 20 dígitos.';
  }

  return '';
}

function validatePassword(value) {
  if (!value) return 'Ingresá una contraseña.';
  if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (getPasswordByteLength(value) > PASSWORD_MAX_BYTES) {
    return `La contraseña no puede superar los ${PASSWORD_MAX_BYTES} bytes.`;
  }

  return '';
}

function validateConfirmPassword(value, password) {
  if (!value) return 'Repetí tu contraseña.';
  if (value !== password) return 'Las contraseñas no coinciden.';

  return '';
}

function validateAge(accepted) {
  if (!accepted) return 'Tenés que confirmar que sos mayor de 18 años.';

  return '';
}

export function validateRegisterField(field, values) {
  switch (field) {
    case 'name':
      return validateName(values.name);
    case 'email':
      return validateEmail(values.email);
    case 'phone':
      return validatePhone(values.phone);
    case 'password':
      return validatePassword(values.password);
    case 'confirmPassword':
      return validateConfirmPassword(values.confirmPassword, values.password);
    case 'age':
      return validateAge(values.age);
    default:
      return '';
  }
}

export function validateRegisterForm(values) {
  const errors = {};

  for (const field of REGISTER_FIELDS) {
    const message = validateRegisterField(field, values);

    if (message) errors[field] = message;
  }

  return errors;
}
