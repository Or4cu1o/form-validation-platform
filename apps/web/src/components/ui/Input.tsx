import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { hasError = false, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-10 rounded border bg-paper-raised px-3 text-sm text-ink placeholder:text-ink-faint',
        'focus-visible:ring-2 focus-visible:ring-accent',
        hasError ? 'border-status-reprovado' : 'border-border-strong',
        className,
      )}
      {...rest}
    />
  );
});
