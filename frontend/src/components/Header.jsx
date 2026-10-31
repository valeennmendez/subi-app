import { Link, NavLink } from 'react-router';
import { useAuth } from '../auth/AuthProvider.jsx';
import { getFirstName, getInitials } from '../utils/user.js';
import { Avatar } from './ui/Avatar.jsx';
import { Logo } from './ui/Logo.jsx';

function HeaderLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `inline-flex min-h-11 items-center text-base text-ink hover:underline ${
          isActive ? 'font-bold' : 'font-medium'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export function Header() {
  const { status, user } = useAuth();

  return (
    <header className="h-[72px] border-b border-line bg-canvas">
      <div className="mx-auto flex h-full w-full max-w-[1120px] items-center justify-between px-4 min-[800px]:px-10">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            aria-label="Subi, ir al inicio"
            className="inline-flex min-h-11 items-center"
          >
            <Logo size="bar" />
          </Link>

          {status === 'authenticated' ? (
            <nav
              aria-label="Viajes"
              className="hidden items-center gap-6 min-[800px]:flex"
            >
              <HeaderLink to="/viajes/nuevo">Publicar viaje</HeaderLink>
              <HeaderLink to="/viajes/mios">Mis viajes</HeaderLink>
            </nav>
          ) : null}
        </div>

        {status === 'authenticated' && user ? (
          <Link
            to="/cuenta"
            aria-label="Mi cuenta"
            className="inline-flex min-h-11 items-center gap-3"
          >
            <span className="hidden text-base font-medium text-ink min-[800px]:inline">
              {getFirstName(user.name)}
            </span>
            <Avatar initials={getInitials(user.name)} size="sm" />
          </Link>
        ) : status === 'anonymous' ? (
          <Link
            to="/login"
            className="inline-flex min-h-11 items-center text-base font-semibold text-brand-strong hover:underline"
          >
            Ingresar
          </Link>
        ) : null}
      </div>
    </header>
  );
}
