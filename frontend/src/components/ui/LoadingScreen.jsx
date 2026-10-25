import { Logo } from './Logo.jsx';

export function LoadingScreen() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="flex min-h-dvh items-center justify-center bg-canvas px-4"
    >
      <div className="flex flex-col items-center gap-5">
        <Logo size="auth" />
        <span
          aria-hidden="true"
          className="size-6 animate-spin rounded-full border-2 border-line border-t-ink motion-reduce:animate-none"
        />
        <span className="sr-only">Cargando</span>
      </div>
    </main>
  );
}
