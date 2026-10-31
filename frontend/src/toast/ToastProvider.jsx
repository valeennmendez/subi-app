import { useCallback, useMemo, useRef, useState } from 'react';
import { Toast } from './Toast.jsx';
import { ToastContext } from './ToastContext.js';

const TOAST_TYPES = ['success', 'error'];

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(({ type = 'success', message } = {}) => {
    if (!message) {
      throw new Error('El toast necesita un mensaje');
    }

    if (!TOAST_TYPES.includes(type)) {
      throw new Error(`Tipo de toast no soportado: ${type}`);
    }

    nextId.current += 1;
    const id = nextId.current;

    setToasts((current) => [{ id, type, message }, ...current]);

    return id;
  }, []);

  const value = useMemo(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-[88px] z-50 flex flex-col gap-3 min-[800px]:left-auto min-[800px]:right-10 min-[800px]:w-[400px]">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
