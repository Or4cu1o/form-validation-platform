import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Paperclip, ThumbsDown, ThumbsUp, XCircle } from 'lucide-react';
import { validateIndicator, uploadValidationEvidence } from '../../api/validation';
import { getEvidenceDownloadUrl } from '../../api/evidence';
import { Button, StatusBadge, useToast } from '../ui';
import { ValidationVerdictModal } from './ValidationVerdictModal';
import { formatDateTime, formatNumber } from '../../lib/format';
import { GOAL_OPERATOR_SYMBOL, INDICATOR_VALIDATION_LABEL, INDICATOR_VALIDATION_TONE, VALIDATION_VERDICT_LABEL, VARIABLE_LABELS } from '../../lib/status';
import { cn } from '../../lib/cn';
import type { IndicatorResponse, ValidationVerdict } from '../../types/api';

type Props = {
  response: IndicatorResponse;
  reportInstanceId: string;
  isValidatable: boolean;
};

export function ValidationIndicatorCard({ response, reportInstanceId, isValidatable }: Props) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [pendingVerdict, setPendingVerdict] = useState<ValidationVerdict | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['report-instance', reportInstanceId] });
  }

  const validateMutation = useMutation({
    mutationFn: async ({ verdict, justification, evidenceFile }: { verdict: ValidationVerdict; justification: string; evidenceFile: File | null }) => {
      const record = await validateIndicator(response.id, verdict, justification);
      if (evidenceFile) {
        await uploadValidationEvidence(record.id, evidenceFile);
      }
      return record;
    },
    onSuccess: () => {
      showToast('Veredito registrado.', 'success');
      invalidate();
      setPendingVerdict(null);
    },
    onError: () => showToast('Não foi possível registrar o veredito.', 'error'),
  });

  async function handleDownload(evidenceFileId: string) {
    try {
      const { url } = await getEvidenceDownloadUrl(evidenceFileId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      showToast('Não foi possível gerar o link de download.', 'error');
    }
  }

  const goalLabel = `${GOAL_OPERATOR_SYMBOL[response.snapshotGoalOperator]} ${formatNumber(response.snapshotGoalValue)}`;

  return (
    <div className="rounded-lg border border-border bg-paper-raised p-6 shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-medium text-ink">{response.snapshotTitle}</h3>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">{response.snapshotObjective}</p>
        </div>
        <StatusBadge
          tone={INDICATOR_VALIDATION_TONE[response.validationStatus]}
          label={INDICATOR_VALIDATION_LABEL[response.validationStatus]}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
        <div>
          <p className="text-xs text-ink-faint">Meta</p>
          <p className="data-figure font-medium text-ink">{goalLabel}</p>
        </div>
        <div>
          <p className="text-xs text-ink-faint">Valor calculado</p>
          <p className="data-figure font-medium text-ink">{formatNumber(response.calculatedValue)}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {response.isCompliant === true && (
            <span className="flex items-center gap-1 text-status-concluido">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Dentro da meta
            </span>
          )}
          {response.isCompliant === false && (
            <span className="flex items-center gap-1 text-status-reprovado">
              <XCircle className="h-4 w-4" aria-hidden="true" /> Fora da meta
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-5 max-w-2xl">
        {response.snapshotVariableKeys.map((key) => (
          <div key={key} className="flex flex-col gap-1 border-b border-border/40 pb-2">
            <p className="text-xs font-semibold text-ink-muted">{VARIABLE_LABELS[key] ?? key}</p>
            <p className="data-figure text-sm text-ink mt-0.5">{formatNumber(response.variableValues?.[key])}</p>
          </div>
        ))}

        {response.criticalAnalysis && (
          <div className="flex flex-col gap-1 border-t border-border pt-4 mt-2">
            <p className="text-xs font-semibold text-ink">Análise Crítica</p>
            <p className="text-sm text-ink-muted mt-1 whitespace-pre-wrap bg-paper px-3 py-2.5 rounded border border-border">
              {response.criticalAnalysis}
            </p>
          </div>
        )}

        {response.actionPlan && (
          <div className="flex flex-col gap-1 mt-2">
            <p className="text-xs font-semibold text-ink">Plano de ação para alcançar a meta</p>
            <p className="text-sm text-ink-muted mt-1 whitespace-pre-wrap bg-paper px-3 py-2.5 rounded border border-border">
              {response.actionPlan}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">Evidências da unidade</p>
        <div className="flex flex-wrap gap-2">
          {(response.evidenceFiles ?? []).map((evidence) => (
            <button
              key={evidence.id}
              type="button"
              onClick={() => handleDownload(evidence.id)}
              className="flex items-center gap-1.5 rounded border border-border-strong bg-paper px-2.5 py-1.5 text-xs text-ink-muted hover:text-ink"
            >
              <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
              {evidence.fileName}
            </button>
          ))}
          {(response.evidenceFiles ?? []).length === 0 && <p className="text-xs text-ink-faint">Nenhuma evidência enviada.</p>}
        </div>
      </div>

      {isValidatable && (
        <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
          <Button variant="secondary" size="sm" onClick={() => setPendingVerdict('APROVADO')}>
            <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
            Aprovar
          </Button>
          <Button variant="danger" size="sm" onClick={() => setPendingVerdict('REPROVADO')}>
            <ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />
            Reprovar
          </Button>
        </div>
      )}

      {(response.validationRecords ?? []).length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">Histórico de validação</p>
          <div className="flex flex-col gap-2">
            {response.validationRecords!.map((record) => (
              <div key={record.id} className="rounded border border-border bg-paper px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'font-medium',
                      record.verdict === 'APROVADO' ? 'text-status-concluido' : 'text-status-reprovado',
                    )}
                  >
                    {VALIDATION_VERDICT_LABEL[record.verdict]}
                  </span>
                  <span className="text-xs text-ink-faint">{formatDateTime(record.createdAt)}</span>
                </div>
                <p className="mt-1 text-ink-muted">{record.justification}</p>
                {(record.evidenceFiles ?? []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {record.evidenceFiles!.map((evidence) => (
                      <button
                        key={evidence.id}
                        type="button"
                        onClick={() => handleDownload(evidence.id)}
                        className="flex items-center gap-1.5 rounded border border-border-strong bg-paper-raised px-2 py-1 text-xs text-ink-muted hover:text-ink"
                      >
                        <Paperclip className="h-3 w-3" aria-hidden="true" />
                        {evidence.fileName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <ValidationVerdictModal
        isOpen={pendingVerdict !== null}
        verdict={pendingVerdict ?? 'APROVADO'}
        indicatorTitle={response.snapshotTitle}
        isSubmitting={validateMutation.isPending}
        onClose={() => setPendingVerdict(null)}
        onSubmit={async (justification, evidenceFile) => {
          await validateMutation.mutateAsync({ verdict: pendingVerdict ?? 'APROVADO', justification, evidenceFile });
        }}
      />
    </div>
  );
}
