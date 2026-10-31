const ICON_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
};

export function UserIcon({ className = 'size-5', ...props }) {
  return (
    <svg {...ICON_PROPS} className={className} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function MailIcon({ className = 'size-5', ...props }) {
  return (
    <svg {...ICON_PROPS} className={className} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

export function LockIcon({ className = 'size-5', ...props }) {
  return (
    <svg {...ICON_PROPS} className={className} {...props}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function PhoneIcon({ className = 'size-5', ...props }) {
  return (
    <svg {...ICON_PROPS} className={className} {...props}>
      <path d="M5 4h3l1.5 4-2 1.5a12 12 0 0 0 7 7l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function CheckIcon({ className = 'size-5', ...props }) {
  return (
    <svg {...ICON_PROPS} className={className} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function AlertIcon({ className = 'size-5', ...props }) {
  return (
    <svg {...ICON_PROPS} className={className} {...props}>
      <path d="M12 6.5v7" />
      <path d="M12 17.5h.01" />
    </svg>
  );
}

export function CloseIcon({ className = 'size-5', ...props }) {
  return (
    <svg {...ICON_PROPS} className={className} {...props}>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export function EyeIcon({ className = 'size-5', ...props }) {
  return (
    <svg {...ICON_PROPS} className={className} {...props}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export function EyeOffIcon({ className = 'size-5', ...props }) {
  return (
    <svg {...ICON_PROPS} className={className} {...props}>
      <path d="m3 3 18 18" />
      <path d="M10.6 6.2A10.9 10.9 0 0 1 12 6c6.5 0 10 6 10 6a17.4 17.4 0 0 1-3.2 3.9" />
      <path d="M6.7 6.7C3.8 8.4 2 12 2 12s3.5 6 10 6a10.8 10.8 0 0 0 5.3-1.4" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

export function OriginIcon({ className = 'size-5', ...props }) {
  return (
    <svg {...ICON_PROPS} className={className} {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PinIcon({ className = 'size-5', ...props }) {
  return (
    <svg {...ICON_PROPS} className={className} {...props}>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function CalendarIcon({ className = 'size-5', ...props }) {
  return (
    <svg {...ICON_PROPS} className={className} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

export function UsersIcon({ className = 'size-5', ...props }) {
  return (
    <svg {...ICON_PROPS} className={className} {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20.5a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.2a3.5 3.5 0 0 1 0 5.6" />
      <path d="M18 14.6a6.5 6.5 0 0 1 3.5 5.9" />
    </svg>
  );
}

export function PriceIcon({ className = 'size-5', ...props }) {
  return (
    <svg {...ICON_PROPS} className={className} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.5v11" />
      <path d="M14.5 9.3c-.5-.6-1.4-1-2.5-1-1.5 0-2.5.7-2.5 1.8 0 2.4 5 1.2 5 3.6 0 1.1-1 1.8-2.5 1.8-1.1 0-2-.4-2.5-1" />
    </svg>
  );
}
