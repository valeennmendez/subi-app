import { useEffect, useState } from 'react';
import { AlertIcon, CheckIcon, CloseIcon } from '../components/ui/icons.jsx';

const AUTO_CLOSE_MS = 5000;

const VARIANTS = {
  success: {
    role: 'status',
    label: 'Listo',
    icon: CheckIcon,
    iconName: 'check',
    box: 'border-brand-line bg-brand-soft',
    iconBox: 'bg-brand text-ink',
  },
  error: {
    role: 'alert',
    label: 'Error',
    icon: AlertIcon,
    iconName: 'alert',
    box: 'border-error-line bg-error-soft',
    iconBox: 'bg-error text-canvas',
  },
};

export function Toast({ toast, onDismiss }) {
  const [paused, setPaused] = useState(false);
  const variant = VARIANTS[toast.type] ?? VARIANTS.success;
  const Icon = variant.icon;

  useEffect(() => {
    if (paused) {
      return undefined;
    }

    const timer = setTimeout(() => onDismiss(toast.id), AUTO_CLOSE_MS);

    return () => clearTimeout(timer);
  }, [paused, toast.id, onDismiss]);

  return (
    <div
      role={variant.role}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-toast border p-4 motion-safe:animate-toast-in ${variant.box}`}
    >
      <span
        aria-hidden="true"
        data-icon={variant.iconName}
        className={`flex size-7 shrink-0 items-center justify-center rounded-full ${variant.iconBox}`}
      >
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-ink">{variant.label}</p>
        <p className="mt-1 text-sm text-ink">{toast.message}</p>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar notificación"
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink hover:bg-ink/5"
      >
        <CloseIcon className="size-5" />
      </button>
    </div>
  );
}
