import { useAuth } from '../auth/AuthProvider.jsx';
import { Header } from '../components/Header.jsx';
import { LinkButton } from '../components/ui/LinkButton.jsx';
import { LoadingScreen } from '../components/ui/LoadingScreen.jsx';
import { SessionErrorScreen } from '../components/ui/SessionErrorScreen.jsx';
import { getFirstName } from '../utils/user.js';

function GuestHome() {
  return (
    <section className="max-w-[640px]">
      <h1 className="text-[32px] font-bold leading-[1.2] text-ink min-[800px]:text-[36px]">
        Viajá compartiendo por toda la Argentina
      </h1>
      <p className="mt-3 text-base text-muted">
        Sumate a la comunidad que comparte viajes de larga distancia en todo el
        país.
      </p>

      <div className="mt-8 flex flex-col gap-3 min-[800px]:flex-row">
        <LinkButton
          to="/register"
          className="w-full min-[800px]:w-auto"
        >
          Crear cuenta
        </LinkButton>
        <LinkButton
          to="/login"
          variant="secondary"
          className="w-full min-[800px]:w-auto"
        >
          Ingresar
        </LinkButton>
      </div>
    </section>
  );
}

function AuthenticatedHome({ user }) {
  return (
    <>
      <section>
        <h1 className="text-[36px] font-bold leading-[1.2] text-ink">
          Hola, {getFirstName(user.name)}
        </h1>
        <p className="mt-2 text-base text-muted">¿A dónde viajás esta vez?</p>
      </section>

      <section
        aria-labelledby="home-coming-soon-title"
        className="mt-10 max-w-[720px] rounded-card border border-line bg-canvas p-6"
      >
        <h2
          id="home-coming-soon-title"
          className="text-xl font-bold leading-[1.3] text-ink"
        >
          La búsqueda y reserva de viajes llega pronto
        </h2>
        <p className="mt-2 text-base text-muted">
          Todavía no podés buscar ni reservar viajes desde Subi. Estamos
          trabajando para habilitarlo en la próxima etapa.
        </p>
      </section>
    </>
  );
}

export function HomePage() {
  const { status, user, retry } = useAuth();

  if (status === 'loading') return <LoadingScreen />;
  if (status === 'error') return <SessionErrorScreen onRetry={retry} />;

  return (
    <div className="min-h-dvh bg-canvas">
      <Header />

      <main className="mx-auto w-full max-w-[1120px] px-4 py-8 min-[800px]:px-10 min-[800px]:pt-12 min-[800px]:pb-16">
        {status === 'authenticated' && user ? (
          <AuthenticatedHome user={user} />
        ) : (
          <GuestHome />
        )}
      </main>
    </div>
  );
}
