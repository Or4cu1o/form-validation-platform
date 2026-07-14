import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { hasError = false, className, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        'h-10 rounded border bg-paper-raised px-3 text-sm text-ink',
        'focus-visible:ring-2 focus-visible:ring-accent',
        hasError ? 'border-status-reprovado' : 'border-border-strong',
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
});
