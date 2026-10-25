import { BrowserRouter, Link, Route, Routes } from 'react-router';
import { HomePage } from './pages/HomePage.jsx';

function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-start gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">
        Página no encontrada
      </h1>
      <Link className="text-base font-medium text-blue-700 underline" to="/">
        Volver al inicio
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
