import { useId } from 'react';

export function TextField({
  id,
  label,
  icon: Icon,
  helpText,
  error,
  trailing,
  className = '',
  inputClassName = '',
  ...inputProps
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const messageId = `${fieldId}-message`;
  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={fieldId} className="text-sm font-semibold text-ink">
        {label}
      </label>

      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-neutral" />
        ) : null}

        <input
          id={fieldId}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={error || helpText ? messageId : undefined}
          className={`h-[52px] w-full rounded-full border bg-surface text-base text-ink placeholder:text-muted focus-visible:bg-canvas ${
            Icon ? 'pl-12' : 'pl-4'
          } ${trailing ? 'pr-14' : 'pr-4'} ${
            hasError ? 'border-error' : 'border-neutral'
          } ${inputClassName}`}
          {...inputProps}
        />

        {trailing ? (
          <div className="absolute inset-y-0 right-1 flex items-center">
            {trailing}
          </div>
        ) : null}
      </div>

      {hasError ? (
        <p id={messageId} role="alert" className="text-sm text-error">
          {error}
        </p>
      ) : helpText ? (
        <p id={messageId} className="text-sm text-muted">
          {helpText}
        </p>
      ) : null}
    </div>
  );
}
