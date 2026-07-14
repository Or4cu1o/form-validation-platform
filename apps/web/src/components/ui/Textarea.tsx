import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { hasError = false, className, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'rounded border bg-paper-raised px-3 py-2 text-sm text-ink placeholder:text-ink-faint',
        'focus-visible:ring-2 focus-visible:ring-accent',
        hasError ? 'border-status-reprovado' : 'border-border-strong',
        className,
      )}
      {...rest}
    />
  );
});
