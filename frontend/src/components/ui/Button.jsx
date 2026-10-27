import { BUTTON_BASE, BUTTON_VARIANTS } from './buttonStyles.js';

export function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}) {
  const styles = BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.primary;

  return (
    <button
      type={type}
      className={`${BUTTON_BASE} ${styles} ${className}`}
      {...props}
    />
  );
}
