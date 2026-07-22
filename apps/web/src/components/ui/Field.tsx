import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Props = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function Field({ label, htmlFor, error, hint, required, children, className }: Props) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
        {label}
        {required && (
          <span className="ml-0.5 font-normal text-status-reprovado" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {hint && !error && <p className="-mt-1 text-xs text-ink-muted">{hint}</p>}
      {children}
      {error && (
        <p role="alert" className="text-xs font-medium text-status-reprovado">
          {error}
        </p>
      )}
    </div>
  );
}
