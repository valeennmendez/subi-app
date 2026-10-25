import { Logo } from './Logo.jsx';
import { RouteBackdrop } from './RouteBackdrop.jsx';

export function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface">
      <RouteBackdrop className="hidden min-[800px]:block" />

      <main className="relative z-10 flex min-h-dvh items-start justify-center px-4 py-8 min-[800px]:items-center min-[800px]:px-10 min-[800px]:py-12">
        <section className="w-full max-w-[480px] rounded-panel border border-line bg-canvas p-6 min-[800px]:p-10">
          <div className="flex justify-center">
            <Logo size="auth" />
          </div>

          <h1 className="mt-7 text-center text-[28px] font-extrabold leading-tight text-ink">
            {title}
          </h1>

          {subtitle ? (
            <p className="mt-3 text-center text-base text-muted">{subtitle}</p>
          ) : null}

          <div className="mt-8">{children}</div>

          {footer ? (
            <footer className="mt-6 border-t border-line pt-6 text-center text-base text-muted">
              {footer}
            </footer>
          ) : null}
        </section>
      </main>
    </div>
  );
}
