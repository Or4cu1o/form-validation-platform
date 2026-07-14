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
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-muted">
        {label}
        {required && <span className="ml-0.5 text-status-reprovado">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-faint">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-status-reprovado">
          {error}
        </p>
      )}
    </div>
  );
}
