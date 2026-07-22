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
        'h-11 rounded border bg-paper-raised px-3.5 text-[15px] text-ink',
        'transition-[border-color,box-shadow] duration-normal ease-out-expo',
        'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30',
        'disabled:cursor-not-allowed disabled:bg-paper-sunken disabled:text-ink-faint',
        hasError ? 'border-status-reprovado' : 'border-border-strong',
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
});
