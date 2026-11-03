const SIZES = {
  sm: 'size-11 text-base',
  md: 'size-14 text-lg',
  lg: 'size-20 text-2xl',
};

export function Avatar({ initials, size = 'sm', className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-surface font-semibold text-ink ${SIZES[size] ?? SIZES.sm} ${className}`}
    >
      {initials}
    </span>
  );
}
