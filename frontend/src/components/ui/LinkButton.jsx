import { Link } from 'react-router';
import { BUTTON_BASE, BUTTON_VARIANTS } from './buttonStyles.js';

export function LinkButton({
  to,
  variant = 'primary',
  className = '',
  ...props
}) {
  const styles = BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.primary;

  return <Link to={to} className={`${BUTTON_BASE} ${styles} ${className}`} {...props} />;
}
