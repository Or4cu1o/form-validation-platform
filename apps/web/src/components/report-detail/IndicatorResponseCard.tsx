import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Paperclip, UploadCloud, XCircle } from 'lucide-react';
import { updateIndicatorResponseValues, uploadIndicatorEvidence } from '../../api/indicator-responses';
import { getEvidenceDownloadUrl } from '../../api/evidence';
import { Button, Input, StatusBadge, useToast } from '../ui';
import { formatBytes, formatDateTime, formatNumber } from '../../lib/format';
import { GOAL_OPERATOR_SYMBOL, INDICATOR_VALIDATION_LABEL, INDICATOR_VALIDATION_TONE, VALIDATION_VERDICT_LABEL, VARIABLE_LABELS } from '../../lib/status';
import { cn } from '../../lib/cn';
import type { IndicatorResponse } from '../../types/api';

const EVIDENCE_ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp';

type Props = {
  response: IndicatorResponse;
  reportInstanceId: string;
  isEditable: boolean;
};

export function IndicatorResponseCard({ response, reportInstanceId, isEditable }: Props) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const initialValues = useMemo(() => {
    const entries = response.snapshotVariableKeys.map((key) => [key, response.variableValues?.[key]?.toString() ?? '']);
    return Object.fromEntries(entries) as Record<string, string>;
  }, [response.snapshotVariableKeys, response.variableValues]);

  const [draftValues, setDraftValues] = useState<Record<string, string>>(initialValues);
  const [draftCriticalAnalysis, setDraftCriticalAnalysis] = useState<string>(response.criticalAnalysis ?? '');
  const [draftActionPlan, setDraftActionPlan] = useState<string>(response.actionPlan ?? '');

  useEffect(() => {
    setDraftValues(initialValues);
    setDraftCriticalAnalysis(response.criticalAnalysis ?? '');
    setDraftActionPlan(response.actionPlan ?? '');
  }, [response, initialValues]);

  const isDirty =
    response.snapshotVariableKeys.some((key) => draftValues[key] !== initialValues[key]) ||
    draftCriticalAnalysis !== (response.criticalAnalysis ?? '') ||
    draftActionPlan !== (response.actionPlan ?? '');

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['report-instance', reportInstanceId] });
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const changed: Record<string, number> = {};
      for (const key of response.snapshotVariableKeys) {
        const raw = draftValues[key];
        if (raw === '' || raw === undefined) continue;
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) changed[key] = parsed;
      }
      return updateIndicatorResponseValues(response.id, changed, draftCriticalAnalysis, draftActionPlan);
    },
    onSuccess: () => {
      showToast('Valores salvos.', 'success');
      invalidate();
    },
    onError: () => showToast('Não foi possível salvar os valores.', 'error'),
  });

  async function handleEvidenceChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadIndicatorEvidence(response.id, file);
      showToast('Evidência enviada.', 'success');
      invalidate();
    } catch {
      showToast('Não foi possível enviar a evidência.', 'error');
    } finally {
      setIsUploading(false);
    }
  }

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
          {response.isCompliant === null && <span className="text-ink-faint">Aguardando valores</span>}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 max-w-2xl">
        {response.snapshotVariableKeys.map((key) => (
          <div key={key} className="flex flex-col gap-2">
            <label htmlFor={`${response.id}-${key}`} className="text-sm font-semibold text-ink">
              {VARIABLE_LABELS[key] ?? key}
            </label>
            <Input
              id={`${response.id}-${key}`}
              type="number"
              inputMode="decimal"
              className="data-figure bg-paper h-11 border-border shadow-none focus-visible:ring-accent transition-all duration-200"
              value={draftValues[key] ?? ''}
              disabled={!isEditable}
              onChange={(event) => setDraftValues((current) => ({ ...current, [key]: event.target.value }))}
            />
          </div>
        ))}

        <div className="flex flex-col gap-2 border-t border-border pt-4 mt-2">
          <label htmlFor={`${response.id}-criticalAnalysis`} className="text-sm font-semibold text-ink">
            Análise Crítica
          </label>
          <p className="text-xs text-ink-muted -mt-1">
            Descreva as causas, justificativas ou fatores que influenciaram o resultado deste indicador no mês.
          </p>
          <textarea
            id={`${response.id}-criticalAnalysis`}
            className="w-full rounded border border-border-strong bg-paper px-3 py-2 text-sm text-ink outline-none transition-all focus:ring-2 focus:ring-accent disabled:bg-paper-flat disabled:text-ink-muted min-h-[80px]"
            value={draftCriticalAnalysis}
            disabled={!isEditable}
            onChange={(event) => setDraftCriticalAnalysis(event.target.value)}
            placeholder="Preencher análise crítica..."
          />
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <label htmlFor={`${response.id}-actionPlan`} className="text-sm font-semibold text-ink">
            Plano de ação para alcançar a meta
          </label>
          <p className="text-xs text-ink-muted -mt-1">
            Caso o resultado esteja fora da meta, detalhe o plano de ação corretivo.
          </p>
          <textarea
            id={`${response.id}-actionPlan`}
            className="w-full rounded border border-border-strong bg-paper px-3 py-2 text-sm text-ink outline-none transition-all focus:ring-2 focus:ring-accent disabled:bg-paper-flat disabled:text-ink-muted min-h-[80px]"
            value={draftActionPlan}
            disabled={!isEditable}
            onChange={(event) => setDraftActionPlan(event.target.value)}
            placeholder="Preencher plano de ação..."
          />
        </div>
      </div>

      {isEditable && (
        <div className="mt-4">
          <Button size="sm" onClick={() => saveMutation.mutate()} isLoading={saveMutation.isPending} disabled={!isDirty}>
            Salvar valores
          </Button>
        </div>
      )}

      <div className="mt-5 border-t border-border pt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">Evidências</p>
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
              <span className="text-ink-faint">({formatBytes(evidence.sizeBytes)})</span>
            </button>
          ))}
          {(response.evidenceFiles ?? []).length === 0 && <p className="text-xs text-ink-faint">Nenhuma evidência enviada.</p>}
        </div>

        {isEditable && (
          <div className="mt-3">
            <input ref={fileInputRef} type="file" accept={EVIDENCE_ACCEPT} className="hidden" onChange={handleEvidenceChange} />
            <Button variant="secondary" size="sm" isLoading={isUploading} onClick={() => fileInputRef.current?.click()}>
              <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" />
              Enviar evidência
            </Button>
          </div>
        )}
      </div>

      {(response.validationRecords ?? []).length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">Histórico de validação</p>
          <div className="flex flex-col gap-2">
            {response.validationRecords!.map((record) => (
              <div key={record.id} className={cn('rounded border px-3 py-2 text-sm', 'border-border bg-paper')}>
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
