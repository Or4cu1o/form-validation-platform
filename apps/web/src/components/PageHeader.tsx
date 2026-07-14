import type { ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-8 py-6">
      <div>
        <h1 className="font-display text-display-sm font-medium text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
