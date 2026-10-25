import { useState } from 'react';
import { EyeIcon, EyeOffIcon, LockIcon } from './icons.jsx';
import { TextField } from './TextField.jsx';

export function PasswordField({ icon = LockIcon, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      icon={icon}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          className="flex size-11 items-center justify-center rounded-full text-neutral hover:text-ink"
        >
          {visible ? (
            <EyeOffIcon className="size-5" />
          ) : (
            <EyeIcon className="size-5" />
          )}
        </button>
      }
    />
  );
}
