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
        'h-11 rounded border bg-paper-raised px-3.5 text-[15px] text-ink placeholder:text-ink-faint',
        'transition-[border-color,box-shadow] duration-normal ease-out-expo',
        'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30',
        'disabled:cursor-not-allowed disabled:bg-paper-sunken disabled:text-ink-faint',
        hasError ? 'border-status-reprovado' : 'border-border-strong',
        className,
      )}
      {...rest}
    />
  );
});
