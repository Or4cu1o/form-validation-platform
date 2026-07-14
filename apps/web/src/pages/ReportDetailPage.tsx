import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { IndicatorResponseCard } from '../components/report-detail/IndicatorResponseCard';
import { useAuth } from '../context/AuthContext';
import { getReportInstance, submitForApproval, submitForReview } from '../api/reports';
import { formatDateTime, formatReferenceMonth } from '../lib/format';
import { REPORT_STATUS_LABEL, REPORT_STATUS_TONE } from '../lib/status';
import { Button, EmptyState, Spinner, StatusBadge, useToast } from '../components/ui';

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['report-instance', id],
    queryFn: () => getReportInstance(id!),
    enabled: Boolean(id),
  });

  const submitReviewMutation = useMutation({
    mutationFn: () => submitForReview(id!),
    onSuccess: () => {
      showToast('Relatório enviado para revisão.', 'success');
      queryClient.invalidateQueries({ queryKey: ['report-instance', id] });
    },
    onError: () => showToast('Não foi possível enviar para revisão.', 'error'),
  });

  const submitApprovalMutation = useMutation({
    mutationFn: () => submitForApproval(id!),
    onSuccess: () => {
      showToast('Relatório enviado para aprovação.', 'success');
      queryClient.invalidateQueries({ queryKey: ['report-instance', id] });
    },
    onError: () => showToast('Não foi possível enviar para aprovação.', 'error'),
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <Spinner label="Carregando relatório..." />
      </div>
    );
  }

  if (isError || !report || !user) {
    return (
      <div className="p-8">
        <EmptyState title="Relatório não encontrado" description="Verifique se o link está correto ou volte ao painel." />
      </div>
    );
  }

  const sameUnit = user.primaryUnitId === report.unitId;
  const canSubmitForReview = sameUnit && report.status === 'PENDENTE' && user.role === 'ELABORADOR';
  const canSubmitForApproval = sameUnit && report.status === 'EM_REVISAO' && user.role === 'REVISOR';
  const isEditable = canSubmitForReview || canSubmitForApproval;
  const wasReproved = report.status === 'EM_REVISAO' && report.reprovalCount > 0;

  return (
    <>
      <PageHeader
        title={`${report.unit.sigla} · ${formatReferenceMonth(report.referenceMonth)}`}
        description={report.unit.nome}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge tone={REPORT_STATUS_TONE[report.status]} label={REPORT_STATUS_LABEL[report.status]} />
            {canSubmitForReview && (
              <Button isLoading={submitReviewMutation.isPending} onClick={() => submitReviewMutation.mutate()}>
                Enviar para revisão
              </Button>
            )}
            {canSubmitForApproval && (
              <Button isLoading={submitApprovalMutation.isPending} onClick={() => submitApprovalMutation.mutate()}>
                Enviar para aprovação
              </Button>
            )}
          </div>
        }
      />

      <div className="flex flex-col gap-5 p-8">
        {wasReproved && (
          <div className="flex items-start gap-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent-ink">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              Este relatório foi reprovado pela Matriz e retornou para revisão colaborativa.
              {report.slaExtensionDueDate && (
                <> Prazo prorrogado até <span className="data-figure font-medium">{formatDateTime(report.slaExtensionDueDate)}</span>.</>
              )}
            </p>
          </div>
        )}

        {(report.indicatorResponses ?? []).map((response) => (
          <IndicatorResponseCard key={response.id} response={response} reportInstanceId={report.id} isEditable={isEditable} />
        ))}

        {(report.indicatorResponses ?? []).length === 0 && (
          <EmptyState title="Sem indicadores" description="Este relatório ainda não possui indicadores associados." />
        )}
      </div>
    </>
  );
}
