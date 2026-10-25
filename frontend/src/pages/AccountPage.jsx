import { useState } from 'react';
import { ApiError } from '../api/client.js';
import { useAuth } from '../auth/AuthProvider.jsx';
import { Header } from '../components/Header.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { Button } from '../components/ui/Button.jsx';
import {
  formatMemberSince,
  formatRating,
  getInitials,
} from '../utils/user.js';

function DataRow({ label, value }) {
  return (
    <div className="flex min-h-16 flex-col justify-center border-b border-line py-3 last:border-b-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="break-words text-base text-ink">{value}</dd>
    </div>
  );
}

export function AccountPage() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  if (!user) return null;

  const rating = formatRating(user.rating_average);
  const memberSince = formatMemberSince(user.created_at);
  const ratingText = rating
    ? `${rating} de calificación`
    : 'Sin calificaciones todavía';
  const meta = memberSince
    ? `${ratingText} · Miembro desde ${memberSince}`
    : ratingText;

  async function handleLogout() {
    if (loggingOut) return;

    setLogoutError('');
    setLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      setLogoutError(
        error instanceof ApiError
          ? error.message
          : 'No pudimos cerrar sesión. Intentá de nuevo.',
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <Header />

      <main className="mx-auto w-full max-w-[1120px] px-4 py-8 min-[800px]:px-10 min-[800px]:pt-12 min-[800px]:pb-16">
        <div className="mx-auto w-full max-w-[832px]">
          <section className="flex items-center gap-4 min-[800px]:gap-5">
            <Avatar initials={getInitials(user.name)} size="lg" />
            <div className="min-w-0">
              <h1 className="break-words text-[32px] font-bold leading-tight text-ink">
                {user.name}
              </h1>
              <p className="mt-1 text-base text-muted">{meta}</p>
            </div>
          </section>

          <section
            aria-labelledby="account-data-title"
            className="mt-10 rounded-card border border-line bg-canvas p-6"
          >
            <h2
              id="account-data-title"
              className="text-xl font-bold text-ink"
            >
              Datos personales
            </h2>

            <dl className="mt-2">
              <DataRow label="Nombre" value={user.name} />
              <DataRow label="Email" value={user.email} />
              <DataRow label="Teléfono" value={user.phone} />
            </dl>
          </section>

          <div className="mt-6">
            <Button
              variant="dangerAction"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-busy={loggingOut}
            >
              {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </Button>

            {logoutError ? (
              <p role="alert" className="mt-2 text-sm text-error">
                {logoutError}
              </p>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
