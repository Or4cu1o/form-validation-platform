type Props = {
  /** Quantidade de itens já concluídos (preenchidos/validados). */
  completed: number;
  /** Total de itens do relatório. */
  total: number;
  /** Rótulo curto após a contagem, ex.: "indicadores preenchidos". */
  label: string;
};

/**
 * Indicador compacto de progresso/contexto para formulários longos —
 * "X de Y indicadores preenchidos" com uma barra proporcional. Pensado para
 * viver dentro de um cabeçalho fixo (`PageHeader`), então nunca deve ocupar
 * mais do que uma linha estreita.
 */
export function ProgressMeter({ completed, total, label }: Props) {
  if (total === 0) return null;

  const percent = Math.round((completed / total) * 100);
  const isComplete = completed >= total;

  return (
    <div className="flex items-center gap-2.5" role="status" aria-live="polite">
      <div className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-paper-sunken" aria-hidden="true">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-normal ease-out-expo"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="data-figure whitespace-nowrap text-xs font-medium text-ink-muted">
        <span className={isComplete ? 'text-status-concluido' : 'text-ink'}>{completed}</span>
        {' de '}
        {total} {label}
      </span>
    </div>
  );
}
