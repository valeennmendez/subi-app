import { Navigate, useLocation } from 'react-router';
import { LoadingScreen } from '../components/ui/LoadingScreen.jsx';
import { SessionErrorScreen } from '../components/ui/SessionErrorScreen.jsx';
import { useAuth } from './AuthProvider.jsx';
import { getSafeRedirectPath } from './redirect.js';

export function RequireAuth({ children }) {
  const { status, retry } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingScreen />;
  if (status === 'error') return <SessionErrorScreen onRetry={retry} />;

  if (status === 'anonymous') {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return children;
}

export function GuestOnly({ children }) {
  const { status, retry } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingScreen />;
  if (status === 'error') return <SessionErrorScreen onRetry={retry} />;

  if (status === 'authenticated') {
    return <Navigate to={getSafeRedirectPath(location.state)} replace />;
  }

  return children;
}
