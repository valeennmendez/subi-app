import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { ApiError } from '../api/client.js';
import { useAuth } from '../auth/AuthProvider.jsx';
import { AuthLayout } from '../components/ui/AuthLayout.jsx';
import { Button } from '../components/ui/Button.jsx';
import {
  LockIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from '../components/ui/icons.jsx';
import { PasswordField } from '../components/ui/PasswordField.jsx';
import { TextField } from '../components/ui/TextField.jsx';
import {
  REGISTER_FIELDS,
  validateRegisterField,
  validateRegisterForm,
} from '../utils/registerValidation.js';

const INITIAL_VALUES = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  age: false,
};

export function RegisterPage() {
  const { register } = useAuth();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const ageRef = useRef(null);

  const fieldRefs = {
    name: nameRef,
    email: emailRef,
    phone: phoneRef,
    password: passwordRef,
    confirmPassword: confirmPasswordRef,
    age: ageRef,
  };

  function setFieldError(field, message) {
    setErrors((current) => {
      const next = { ...current };

      if (message) {
        next[field] = message;
      } else {
        delete next[field];
      }

      return next;
    });
  }

  function handleChange(event) {
    const { name, type, value, checked } = event.target;

    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setErrors((current) => {
      const next = { ...current };
      delete next[name];

      if (name === 'password') delete next.confirmPassword;

      return next;
    });

    setFormError('');
  }

  function handleBlur(event) {
    const { name } = event.target;
    const message = validateRegisterField(name, values);

    // Si el campo es válido no borramos un error del servidor (por ejemplo, 409).
    if (message) setFieldError(name, message);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submittingRef.current) return;

    const normalizedValues = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
    };
    const nextErrors = validateRegisterForm(normalizedValues);

    setValues(normalizedValues);
    setErrors(nextErrors);
    setFormError('');

    const firstInvalidField = REGISTER_FIELDS.find(
      (field) => nextErrors[field],
    );

    if (firstInvalidField) {
      fieldRefs[firstInvalidField].current?.focus();
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      await register({
        email: normalizedValues.email,
        password: normalizedValues.password,
        name: normalizedValues.name,
        phone: normalizedValues.phone,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErrors((current) => ({ ...current, email: error.message }));
      } else {
        setFormError(
          error instanceof ApiError
            ? error.message
            : 'No pudimos crear tu cuenta. Intentá de nuevo.',
        );
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Creá tu cuenta"
      subtitle="Sumate a la comunidad que comparte viajes en toda la Argentina."
      footer={
        <>
          ¿Ya tenés cuenta?{' '}
          <Link
            to="/login"
            className="inline-flex min-h-11 items-center font-semibold text-brand-strong hover:underline"
          >
            Iniciá sesión.
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-[18px]">
          <TextField
            id="register-name"
            name="name"
            label="Nombre completo"
            icon={UserIcon}
            type="text"
            autoComplete="name"
            placeholder="Ej.: Martín Gómez"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            inputRef={nameRef}
            error={errors.name}
            required
          />

          <TextField
            id="register-email"
            name="email"
            label="Correo electrónico"
            icon={MailIcon}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="tu@email.com"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            inputRef={emailRef}
            error={errors.email}
            required
          />

          <TextField
            id="register-phone"
            name="phone"
            label="Teléfono"
            icon={PhoneIcon}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Ej.: +54 9 11 2345-6789"
            helpText="Entre 8 y 20 dígitos. Podés usar +, espacios, guiones y paréntesis."
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            inputRef={phoneRef}
            error={errors.phone}
            required
          />

          <PasswordField
            id="register-password"
            name="password"
            label="Contraseña"
            icon={LockIcon}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            inputRef={passwordRef}
            error={errors.password}
            required
          />

          <PasswordField
            id="register-confirm-password"
            name="confirmPassword"
            label="Confirmar contraseña"
            autoComplete="new-password"
            placeholder="Repetí tu contraseña"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            inputRef={confirmPasswordRef}
            error={errors.confirmPassword}
            required
          />
        </div>

        <div>
          <div className="flex items-center gap-3">
            <input
              id="register-age"
              name="age"
              type="checkbox"
              checked={values.age}
              onChange={handleChange}
              aria-invalid={errors.age ? 'true' : undefined}
              aria-describedby={errors.age ? 'register-age-error' : undefined}
              className="size-6 shrink-0 accent-brand-strong"
              ref={ageRef}
              required
            />
            <label
              htmlFor="register-age"
              className="flex min-h-11 items-center text-sm text-muted"
            >
              Soy mayor de 18 años.
            </label>
          </div>

          {errors.age ? (
            <p id="register-age-error" role="alert" className="mt-1 text-sm text-error">
              {errors.age}
            </p>
          ) : null}
        </div>

        {formError ? (
          <p
            role="alert"
            className="rounded-field border border-error px-4 py-3 text-sm text-error"
          >
            {formError}
          </p>
        ) : null}

        <Button type="submit" disabled={submitting} aria-busy={submitting}>
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthLayout>
  );
}
