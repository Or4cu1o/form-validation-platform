import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../components/PageHeader';
import { ValidationIndicatorCard } from '../components/validation/ValidationIndicatorCard';
import { useAuth } from '../context/AuthContext';
import { finalizeReportInstance, getReportInstance } from '../api/reports';
import { formatReferenceMonth } from '../lib/format';
import { REPORT_STATUS_LABEL, REPORT_STATUS_TONE } from '../lib/status';
import { Button, EmptyState, Spinner, StatusBadge, useToast } from '../components/ui';

export function ValidationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['report-instance', id],
    queryFn: () => getReportInstance(id!),
    enabled: Boolean(id),
  });

  const finalizeMutation = useMutation({
    mutationFn: () => finalizeReportInstance(id!),
    onSuccess: (updated) => {
      showToast(
        updated.status === 'CONCLUIDO' ? 'Relatório concluído.' : 'Relatório reprovado e devolvido para revisão.',
        updated.status === 'CONCLUIDO' ? 'success' : 'info',
      );
      queryClient.invalidateQueries({ queryKey: ['report-instance', id] });
    },
    onError: () => showToast('Não foi possível finalizar o relatório.', 'error'),
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
        <EmptyState title="Relatório não encontrado" description="Verifique se o link está correto ou volte à mesa de validação." />
      </div>
    );
  }

  const isValidatable = report.status === 'PENDENTE_APROVACAO' && user.role === 'APROVADOR';
  const responses = report.indicatorResponses ?? [];
  const hasPendingValidation = responses.some((response) => response.validationStatus === 'PENDENTE_VALIDACAO');
  const canFinalize = isValidatable && responses.length > 0 && !hasPendingValidation;

  return (
    <>
      <PageHeader
        title={`${report.unit.sigla} · ${formatReferenceMonth(report.referenceMonth)}`}
        description={report.unit.nome}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge tone={REPORT_STATUS_TONE[report.status]} label={REPORT_STATUS_LABEL[report.status]} />
            {isValidatable && (
              <Button
                isLoading={finalizeMutation.isPending}
                disabled={!canFinalize}
                onClick={() => finalizeMutation.mutate()}
                title={!canFinalize ? 'Valide todos os indicadores antes de finalizar' : undefined}
              >
                Finalizar relatório
              </Button>
            )}
          </div>
        }
      />

      <div className="flex flex-col gap-5 p-8">
        {responses.map((response) => (
          <ValidationIndicatorCard key={response.id} response={response} reportInstanceId={report.id} isValidatable={isValidatable} />
        ))}

        {responses.length === 0 && (
          <EmptyState title="Sem indicadores" description="Este relatório ainda não possui indicadores associados." />
        )}
      </div>
    </>
  );
}
