import type { ReactNode } from 'react';

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <div className="sticky top-0 z-30 flex items-start justify-between gap-4 border-b border-border bg-paper-raised px-8 py-7 shadow-panel">
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
        )}
        <h1 className="font-display text-display-sm font-semibold text-ink">{title}</h1>
        {description && <p className="mt-1.5 max-w-xl text-sm text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 pt-1">{actions}</div>}
    </div>
  );
}
