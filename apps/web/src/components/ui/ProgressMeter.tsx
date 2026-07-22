export type ProgressMeterSegment = {
  /** Chave estável para `key` de lista — normalmente o nome do estado. */
  key: string;
  /** Quantidade de itens nesse estado. Segmentos com `count === 0` não são renderizados. */
  count: number;
  /** Rótulo do estado, usado no detalhamento acessível (`title`/`aria-label`). */
  label: string;
  /** Classe Tailwind `bg-status-*` (ou equivalente) para colorir o segmento. */
  toneClassName: string;
};

type Props = {
  /** Segmentos que compõem a parcela já processada da barra (soma = completos). */
  segments: ProgressMeterSegment[];
  /** Total de itens do relatório (inclui os ainda pendentes, não presentes em `segments`). */
  total: number;
  /** Rótulo curto após a contagem, ex.: "indicadores preenchidos". */
  label: string;
};

/**
 * Indicador compacto de progresso/contexto para formulários longos —
 * "X de Y indicadores preenchidos/validados" com uma barra segmentada por
 * estado (ex.: dentro da meta / fora da meta / pendente), em vez de um
 * preenchimento binário genérico. Pensado para viver dentro de um cabeçalho
 * fixo (`PageHeader`), então nunca deve ocupar mais do que uma linha estreita
 * — o detalhamento por estado fica disponível via `title` (hover) e
 * `aria-label` (leitor de tela), não como texto extra na linha.
 */
export function ProgressMeter({ segments, total, label }: Props) {
  if (total === 0) return null;

  const completed = segments.reduce((sum, segment) => sum + segment.count, 0);
  const percent = Math.round((completed / total) * 100);
  const isComplete = completed >= total;
  const visibleSegments = segments.filter((segment) => segment.count > 0);

  const detail = visibleSegments.map((segment) => `${segment.count} ${segment.label.toLowerCase()}`).join(', ');
  const accessibleLabel = `${completed} de ${total} ${label}${detail ? ` (${detail})` : ''}`;

  return (
    <div className="flex items-center gap-2.5" role="status" aria-live="polite" aria-label={accessibleLabel}>
      <div
        className="flex h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-paper-sunken"
        aria-hidden="true"
        title={detail || undefined}
      >
        <div
          className="flex h-full overflow-hidden rounded-full transition-[width] duration-normal ease-out-expo"
          style={{ width: `${percent}%` }}
        >
          {visibleSegments.map((segment) => (
            <div
              key={segment.key}
              className={`h-full ${segment.toneClassName}`}
              style={{ width: `${(segment.count / completed) * 100}%` }}
            />
          ))}
        </div>
      </div>
      <span className="data-figure whitespace-nowrap text-xs font-medium text-ink-muted">
        <span className={isComplete ? 'text-status-concluido' : 'text-ink'}>{completed}</span>
        {' de '}
        {total} {label}
      </span>
    </div>
  );
}
