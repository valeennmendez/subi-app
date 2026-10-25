import { Button } from './Button.jsx';
import { Logo } from './Logo.jsx';

export function SessionErrorScreen({ onRetry }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-4 py-8">
      <section className="w-full max-w-[480px] rounded-panel border border-line bg-canvas p-6 text-center min-[800px]:p-10">
        <div className="flex justify-center">
          <Logo size="auth" />
        </div>

        <h1 className="mt-7 text-[28px] font-extrabold leading-tight text-ink">
          No pudimos cargar tu sesión
        </h1>
        <p className="mt-3 text-base text-muted">
          Revisá tu conexión e intentá de nuevo.
        </p>

        <Button className="mt-8" onClick={onRetry}>
          Reintentar
        </Button>
      </section>
    </main>
  );
}
