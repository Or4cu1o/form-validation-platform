import { cn } from '../../lib/cn';
import type { StatusTone } from '../../lib/status';

const toneClasses: Record<StatusTone, string> = {
  pendente: 'bg-status-pendente/15 text-ink-muted',
  revisao: 'bg-status-revisao/20 text-accent-ink',
  aprovacao: 'bg-status-aprovacao/15 text-status-aprovacao',
  concluido: 'bg-status-concluido/15 text-status-concluido',
  reprovado: 'bg-status-reprovado/15 text-status-reprovado',
};

const dotClasses: Record<StatusTone, string> = {
  pendente: 'bg-status-pendente',
  revisao: 'bg-status-revisao',
  aprovacao: 'bg-status-aprovacao',
  concluido: 'bg-status-concluido',
  reprovado: 'bg-status-reprovado',
};

type Props = {
  tone: StatusTone;
  label: string;
  className?: string;
};

export function StatusBadge({ tone, label, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotClasses[tone])} aria-hidden="true" />
      {label}
    </span>
  );
}
