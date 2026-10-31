const STATUSES = {
  scheduled: {
    label: 'Programado',
    styles: 'border-line bg-surface text-ink',
  },
  completed: {
    label: 'Completado',
    styles: 'border-brand-soft bg-brand-soft text-brand-deep',
  },
  cancelled: {
    label: 'Cancelado',
    styles: 'border-error-line bg-error-soft text-error',
  },
};

export function StatusBadge({ status }) {
  const statusInfo = STATUSES[status] ?? STATUSES.scheduled;

  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-full border px-3 text-sm font-semibold ${statusInfo.styles}`}
    >
      {statusInfo.label}
    </span>
  );
}
