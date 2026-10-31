import { BrowserRouter, Route, Routes } from 'react-router';
import { AuthProvider } from './auth/AuthProvider.jsx';
import { GuestOnly, RequireAuth } from './auth/guards.jsx';
import { AccountPage } from './pages/AccountPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { ToastProvider } from './toast/ToastProvider.jsx';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={
                <GuestOnly>
                  <LoginPage />
                </GuestOnly>
              }
            />
            <Route
              path="/register"
              element={
                <GuestOnly>
                  <RegisterPage />
                </GuestOnly>
              }
            />
            <Route
              path="/cuenta"
              element={
                <RequireAuth>
                  <AccountPage />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ToastProvider>
  );
}
