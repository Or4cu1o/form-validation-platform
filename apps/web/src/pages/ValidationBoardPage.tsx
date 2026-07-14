import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { listReportInstances } from '../api/reports';
import { formatReferenceMonth } from '../lib/format';
import { REPORT_STATUS_LABEL, REPORT_STATUS_TONE } from '../lib/status';
import { EmptyState, Select, Spinner, StatusBadge, Table, TBody, TD, TH, THead, TR } from '../components/ui';
import type { ReportInstance, ReportStatus } from '../types/api';

export function ValidationBoardPage() {
  const [status, setStatus] = useState<ReportStatus | ''>('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['validation-board', status],
    queryFn: () =>
      listReportInstances({
        status: status || undefined,
        sortBy: 'referenceMonth',
        sortOrder: 'desc',
      }),
  });

  const latestPerUnit = useMemo(() => {
    const byUnit = new Map<string, ReportInstance>();
    for (const report of data ?? []) {
      if (!byUnit.has(report.unitId)) byUnit.set(report.unitId, report);
    }
    return Array.from(byUnit.values()).sort((a, b) => a.unit.sigla.localeCompare(b.unit.sigla));
  }, [data]);

  const pendingApprovalCount = latestPerUnit.filter((report) => report.status === 'PENDENTE_APROVACAO').length;

  return (
    <>
      <PageHeader
        title="Mesa de Validação Técnica"
        description="Progresso mais recente de cada unidade e fila de contraprova da Matriz."
      />

      <div className="flex flex-col gap-5 p-8">
        {pendingApprovalCount > 0 && (
          <div className="rounded-lg border border-accent/40 bg-accent/10 px-5 py-3 text-sm text-accent-ink">
            {pendingApprovalCount} unidade(s) aguardando contraprova da Matriz.
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

        {isLoading && <Spinner label="Carregando unidades..." />}
        {isError && <EmptyState title="Falha ao carregar" description="Não foi possível carregar o painel de validação." />}
        {!isLoading && !isError && latestPerUnit.length === 0 && (
          <EmptyState title="Nenhuma unidade encontrada" description="Ajuste o filtro de status para ver outras unidades." />
        )}

        {!isLoading && !isError && latestPerUnit.length > 0 && (
          <Table>
            <THead>
              <TR>
                <TH>Unidade</TH>
                <TH>Período mais recente</TH>
                <TH>Status</TH>
                <TH>Ações</TH>
              </TR>
            </THead>
            <TBody>
              {latestPerUnit.map((report) => (
                <TR key={report.unitId}>
                  <TD>
                    <p className="font-medium text-ink">{report.unit.sigla}</p>
                    <p className="text-xs text-ink-faint">{report.unit.nome}</p>
                  </TD>
                  <TD className="data-figure">{formatReferenceMonth(report.referenceMonth)}</TD>
                  <TD>
                    <StatusBadge tone={REPORT_STATUS_TONE[report.status]} label={REPORT_STATUS_LABEL[report.status]} />
                  </TD>
                  <TD>
                    <Link to={`/validacao/${report.id}`} className="text-sm font-medium text-accent-ink hover:underline">
                      {report.status === 'PENDENTE_APROVACAO' ? 'Validar' : 'Ver'}
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
