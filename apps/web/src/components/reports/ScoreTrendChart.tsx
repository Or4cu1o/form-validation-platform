import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/cn';

const CHART_WIDTH = 320;
const CHART_HEIGHT = 72;
const CHART_PADDING_X = 10;
const CHART_PADDING_Y = 10;
const SCORE_MAX = 10;

export type ScoreTrendPoint = {
  label: string;
  value: number | null;
};

type Props = {
  points: ScoreTrendPoint[];
};

function toCoordinates(points: ScoreTrendPoint[]) {
  const usableWidth = CHART_WIDTH - CHART_PADDING_X * 2;
  const usableHeight = CHART_HEIGHT - CHART_PADDING_Y * 2;
  const step = points.length > 1 ? usableWidth / (points.length - 1) : 0;

  return points.map((point, index) => {
    const x = CHART_PADDING_X + step * index;
    const y =
      point.value === null
        ? null
        : CHART_PADDING_Y + usableHeight * (1 - Math.min(point.value, SCORE_MAX) / SCORE_MAX);
    return { x, y, value: point.value, label: point.label };
  });
}

export function ScoreTrendChart({ points }: Props) {
  const coords = toCoordinates(points);
  const withValue = coords.filter((point) => point.y !== null) as Array<{ x: number; y: number; value: number; label: string }>;

  if (withValue.length === 0) {
    return <p className="text-sm text-ink-faint">Sem histórico de notas nos últimos meses.</p>;
  }

  const first = withValue[0].value;
  const last = withValue[withValue.length - 1].value;
  const isRising = last >= first;
  const lineColor = isRising ? 'stroke-emerald-500' : 'stroke-status-reprovado';
  const fillColor = isRising ? 'fill-emerald-500/10' : 'fill-status-reprovado/10';
  const dotColor = isRising ? 'fill-emerald-500' : 'fill-status-reprovado';

  const linePath = withValue.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = `${linePath} L ${withValue[withValue.length - 1].x} ${CHART_HEIGHT - CHART_PADDING_Y} L ${withValue[0].x} ${CHART_HEIGHT - CHART_PADDING_Y} Z`;

  return (
    <div className="flex items-center gap-4">
      <div className="shrink-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Nota atual</p>
        <div className="flex items-baseline gap-1.5">
          <p className="data-figure font-display text-2xl font-semibold text-ink">{last.toFixed(1)}</p>
          <span className={cn('flex items-center gap-0.5 text-xs font-medium', isRising ? 'text-emerald-600' : 'text-status-reprovado')}>
            {isRising ? <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />}
            {Math.abs(last - first).toFixed(1)}
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="h-16 w-full max-w-xs"
        role="img"
        aria-label={`Tendência da nota nos últimos ${points.length} meses, de ${first.toFixed(1)} para ${last.toFixed(1)}`}
      >
        <path d={areaPath} className={fillColor} stroke="none" />
        <path d={linePath} className={lineColor} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {withValue.map((point) => (
          <circle key={point.label} cx={point.x} cy={point.y} r={2.5} className={dotColor} />
        ))}
      </svg>
    </div>
  );
}
