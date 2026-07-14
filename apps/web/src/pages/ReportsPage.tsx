import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { listReportInstances } from '../api/reports';
import { formatDateTime, formatReferenceMonth } from '../lib/format';
import { REPORT_STATUS_LABEL, REPORT_STATUS_TONE } from '../lib/status';
import { Button, EmptyState, Select, Spinner, StatusBadge, Table, TBody, TD, TH, THead, TR } from '../components/ui';
import type { ReportStatus } from '../types/api';

export function ReportsPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<ReportStatus | ''>('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-report-instances', user?.primaryUnitId, status],
    queryFn: () =>
      listReportInstances({
        unitId: user!.primaryUnitId,
        status: status || undefined,
        sortBy: 'referenceMonth',
        sortOrder: 'desc',
      }),
    enabled: Boolean(user),
  });

  const reports = useMemo(() => data ?? [], [data]);

  const actionableReport = useMemo(() => {
    if (!user) return undefined;
    return reports.find(
      (report) =>
        (report.status === 'PENDENTE' && user.role === 'ELABORADOR') ||
        (report.status === 'EM_REVISAO' && user.role === 'REVISOR'),
    );
  }, [reports, user]);

  return (
    <>
      <PageHeader
        title="Elaboração e Revisão"
        description="Relatórios da sua unidade em aberto para lançamento de dados e revisão colaborativa."
      />

      <div className="flex flex-col gap-5 p-8">
        {actionableReport && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent/40 bg-accent/10 px-5 py-4">
            <div>
              <p className="text-sm font-medium text-accent-ink">
                Relatório de {formatReferenceMonth(actionableReport.referenceMonth)} aguarda sua ação.
              </p>
              <p className="text-xs text-ink-muted">
                Status atual: {REPORT_STATUS_LABEL[actionableReport.status]}
              </p>
            </div>
            <Link to={`/relatorios/${actionableReport.id}`}>
              <Button>Abrir relatório</Button>
            </Link>
          </div>
        )}

        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="text-xs font-medium text-ink-muted">
              Status
            </label>
            <Select id="status" value={status} onChange={(event) => setStatus(event.target.value as ReportStatus | '')}>
              <option value="">Todos</option>
              {(Object.keys(REPORT_STATUS_LABEL) as ReportStatus[]).map((value) => (
                <option key={value} value={value}>
                  {REPORT_STATUS_LABEL[value]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {isLoading && <Spinner label="Carregando relatórios..." />}
        {isError && <EmptyState title="Falha ao carregar" description="Não foi possível carregar os relatórios da sua unidade." />}
        {!isLoading && !isError && reports.length === 0 && (
          <EmptyState title="Nenhum relatório encontrado" description="Ainda não há relatórios para os filtros selecionados." />
        )}

        {!isLoading && !isError && reports.length > 0 && (
          <Table>
            <THead>
              <TR>
                <TH>Período</TH>
                <TH>Status</TH>
                <TH>Enviado para revisão em</TH>
                <TH>Enviado para aprovação em</TH>
                <TH>Ações</TH>
              </TR>
            </THead>
            <TBody>
              {reports.map((report) => (
                <TR key={report.id}>
                  <TD className="data-figure">{formatReferenceMonth(report.referenceMonth)}</TD>
                  <TD>
                    <StatusBadge tone={REPORT_STATUS_TONE[report.status]} label={REPORT_STATUS_LABEL[report.status]} />
                  </TD>
                  <TD className="data-figure text-sm">{formatDateTime(report.submittedForReviewAt)}</TD>
                  <TD className="data-figure text-sm">{formatDateTime(report.submittedForApprovalAt)}</TD>
                  <TD>
                    <Link to={`/relatorios/${report.id}`} className="text-sm font-medium text-accent-ink hover:underline">
                      Ver
                    </Link>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </>
  );
}
