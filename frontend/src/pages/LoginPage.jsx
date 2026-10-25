import { useState } from 'react';
import { Link } from 'react-router';
import { ApiError } from '../api/client.js';
import { useAuth } from '../auth/AuthProvider.jsx';
import { AuthLayout } from '../components/ui/AuthLayout.jsx';
import { Button } from '../components/ui/Button.jsx';
import { MailIcon } from '../components/ui/icons.jsx';
import { PasswordField } from '../components/ui/PasswordField.jsx';
import { TextField } from '../components/ui/TextField.jsx';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function clearFieldError(field) {
    setErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
    clearFieldError('email');
    setFormError('');
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
    clearFieldError('password');
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const normalizedEmail = email.trim();
    const nextErrors = {};

    if (!normalizedEmail) {
      nextErrors.email = 'Ingresá tu correo electrónico.';
    } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
      nextErrors.email = 'Ingresá un correo válido.';
    }

    if (!password) {
      nextErrors.password = 'Ingresá tu contraseña.';
    }

    setEmail(normalizedEmail);
    setErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);

    try {
      await login({ email: normalizedEmail, password });
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'No pudimos iniciar sesión. Intentá de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Iniciá sesión"
      subtitle="Ingresá para viajar o publicar tus salidas."
      footer={
        <>
          ¿Aún no tenés cuenta?{' '}
          <Link
            to="/register"
            className="inline-flex min-h-11 items-center font-semibold text-brand-strong hover:underline"
          >
            Registrate gratis.
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-[18px]">
          <TextField
            id="login-email"
            name="email"
            label="Correo electrónico"
            icon={MailIcon}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="tu@email.com"
            value={email}
            onChange={handleEmailChange}
            error={errors.email}
            required
          />

          <PasswordField
            id="login-password"
            name="password"
            label="Contraseña"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            value={password}
            onChange={handlePasswordChange}
            error={errors.password}
            required
          />
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
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
    </AuthLayout>
  );
}
