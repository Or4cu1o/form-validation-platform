import { cn } from '../../lib/cn';

type Props = {
  className?: string;
  label?: string;
};

export function Spinner({ className, label = 'Carregando...' }: Props) {
  return (
    <div role="status" className={cn('flex items-center justify-center gap-2 py-8 text-ink-faint', className)}>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
