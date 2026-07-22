import { cn } from '../../lib/cn';
import type { StatusTone } from '../../lib/status';

const toneClasses: Record<StatusTone, string> = {
  pendente: 'bg-status-pendente/10 text-status-pendente border-status-pendente/25',
  revisao: 'bg-status-revisao/10 text-status-revisao border-status-revisao/25',
  aprovacao: 'bg-status-aprovacao/10 text-status-aprovacao border-status-aprovacao/25',
  concluido: 'bg-status-concluido/10 text-status-concluido border-status-concluido/25',
  reprovado: 'bg-status-reprovado/10 text-status-reprovado border-status-reprovado/25',
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
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-tight',
        toneClasses[tone],
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotClasses[tone])} aria-hidden="true" />
      {label}
    </span>
  );
}
