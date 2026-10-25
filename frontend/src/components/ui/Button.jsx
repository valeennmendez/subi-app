const VARIANTS = {
  primary:
    'min-h-[52px] w-full rounded-full bg-ink px-6 text-base font-bold text-canvas hover:bg-ink/90',
  dangerAction:
    'min-h-11 rounded-full px-0 text-base font-semibold text-error hover:underline',
};

export function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}) {
  const styles = VARIANTS[variant] ?? VARIANTS.primary;

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
      {...props}
    />
  );
}
