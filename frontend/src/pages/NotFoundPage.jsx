import { Link } from 'react-router';
import { Logo } from '../components/ui/Logo.jsx';

export function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-canvas px-4 py-12 text-center">
      <Logo size="auth" />

      <div>
        <h1 className="text-[28px] font-extrabold leading-tight text-ink">
          Página no encontrada
        </h1>
        <p className="mt-3 max-w-md text-base text-muted">
          La página que buscás no existe o cambió de dirección.
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex min-h-11 items-center text-base font-semibold text-brand-strong hover:underline"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
