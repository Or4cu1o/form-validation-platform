import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-strong bg-paper-raised px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-sunken text-ink-faint" aria-hidden="true">
        <Inbox className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <p className="font-display text-display-xs font-semibold text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
      {action}
    </div>
  );
}
