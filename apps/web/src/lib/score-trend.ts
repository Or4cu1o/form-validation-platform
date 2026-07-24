import type { ReportInstance } from '../types/api';
import type { ScoreTrendPoint } from '../components/reports/ScoreTrendChart';

const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const TREND_WINDOW_MONTHS = 6;

// Constroi uma janela fixa dos ultimos 6 meses (mes corrente inclusive),
// preenchendo com null quando o mes nao teve relatorio concluido/pontuado —
// mantem os "buracos" visiveis no grafico em vez de pular direto para o
// proximo relatorio existente.
export function buildLastSixMonthsScoreTrend(reports: ReportInstance[], referenceDate = new Date()): ScoreTrendPoint[] {
  const scoreByMonthKey = new Map<string, number>();
  for (const report of reports) {
    if (report.status !== 'CONCLUIDO' || report.totalScore === null) {
      continue;
    }
    scoreByMonthKey.set(report.referenceMonth.slice(0, 7), Number(report.totalScore));
  }

  const points: ScoreTrendPoint[] = [];
  for (let offset = TREND_WINDOW_MONTHS - 1; offset >= 0; offset--) {
    const date = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() - offset, 1));
    const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    points.push({ label: MONTH_LABELS[date.getUTCMonth()], value: scoreByMonthKey.get(monthKey) ?? null });
  }
  return points;
}
