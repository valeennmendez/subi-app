export const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60';

export const BUTTON_VARIANTS = {
  primary:
    'min-h-[52px] rounded-full bg-ink px-6 text-base font-bold text-canvas hover:bg-ink/90',
  secondary:
    'min-h-[52px] rounded-full border border-line bg-canvas px-6 text-base font-bold text-ink hover:bg-surface',
  dangerAction:
    'min-h-11 rounded-full px-0 text-base font-semibold text-error hover:underline',
};
