import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { distributeIndicatorScores, getIndicatorScores, updateIndicatorScores } from '../../../api/forms';
import { Button, Spinner, useToast } from '../../ui';
import { cn } from '../../../lib/cn';

const SCORE_TARGET = 10;
const SCORE_SUM_TOLERANCE = 0.01;

type Props = {
  templateId: string;
};

export function IndicatorScorePanel({ templateId }: Props) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [weights, setWeights] = useState<Record<string, string>>({});

  const queryKey = ['indicator-scores', templateId];
  const { data: summary, isLoading } = useQuery({
    queryKey,
    queryFn: () => getIndicatorScores(templateId),
  });

  useEffect(() => {
    if (!summary) {
      return;
    }
    setWeights(Object.fromEntries(summary.items.map((item) => [item.id, String(item.scoreWeight)])));
  }, [summary]);

  const saveMutation = useMutation({
    mutationFn: (payload: Array<{ indicatorId: string; scoreWeight: number }>) =>
      updateIndicatorScores(templateId, payload),
    onSuccess: () => {
      showToast('Pontuação dos indicadores salva.', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => showToast('Não foi possível salvar a pontuação.', 'error'),
  });

  const distributeMutation = useMutation({
    mutationFn: () => distributeIndicatorScores(templateId),
    onSuccess: () => {
      showToast('Pontuação distribuída igualmente.', 'success');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => showToast('Não foi possível distribuir a pontuação.', 'error'),
  });

  if (isLoading) {
    return <Spinner label="Carregando pontuação..." />;
  }
  if (!summary || summary.items.length === 0) {
    return null;
  }

  const sum = summary.items.reduce((total, item) => total + (Number(weights[item.id]) || 0), 0);
  const isBalanced = Math.abs(sum - SCORE_TARGET) <= SCORE_SUM_TOLERANCE;

  function handleWeightChange(indicatorId: string, value: string) {
    setWeights((prev) => ({ ...prev, [indicatorId]: value }));
  }

  function handleSave() {
    const payload = summary!.items.map((item) => ({
      indicatorId: item.id,
      scoreWeight: Number(weights[item.id]) || 0,
    }));
    saveMutation.mutate(payload);
  }

  return (
    <div className="rounded-lg border border-border bg-paper-raised p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-ink">Pontuação dos indicadores</h3>
        <span
          className={cn(
            'rounded px-2 py-0.5 text-xs font-semibold data-figure',
            isBalanced ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
          )}
        >
          Soma: {sum.toFixed(2)} / {SCORE_TARGET}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {summary.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex-1 truncate text-ink">{item.title}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              max={SCORE_TARGET}
              value={weights[item.id] ?? ''}
              onChange={(event) => handleWeightChange(item.id, event.target.value)}
              className="w-24 rounded border border-border bg-paper px-2 py-1 text-right data-figure text-ink"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => distributeMutation.mutate()} isLoading={distributeMutation.isPending}>
          Distribuir igualmente
        </Button>
        <Button size="sm" onClick={handleSave} isLoading={saveMutation.isPending} disabled={!isBalanced}>
          Salvar pontuação
        </Button>
      </div>
    </div>
  );
}
