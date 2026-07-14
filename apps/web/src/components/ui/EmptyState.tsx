import type { ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-paper-raised px-6 py-12 text-center">
      <p className="font-display text-display-sm text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink-faint">{description}</p>}
      {action}
    </div>
  );
}
