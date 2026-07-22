import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { listReportInstances } from '../api/reports';
import { exportReportInstance } from '../api/export';
import { triggerBlobDownload } from '../lib/download';
import { formatDateTime, formatReferenceMonth } from '../lib/format';
import { REPORT_STATUS_LABEL, REPORT_STATUS_TONE } from '../lib/status';
import { cn } from '../lib/cn';
import { useToast } from '../components/ui';
import { Button, EmptyState, Input, Select, Spinner, StatusBadge, Table, TBody, TD, TH, THead, TR } from '../components/ui';
import type { ReportInstance, ReportStatus, RoleName, UnitSummary } from '../types/api';

const REPORT_DETAIL_ROLES: RoleName[] = ['ELABORADOR', 'REVISOR', 'ADMINISTRADOR'];
const SEARCH_DEBOUNCE_MS = 350;

type SortBy = 'referenceMonth' | 'status';
type SortOrder = 'asc' | 'desc';

function getRelevantDeadline(report: ReportInstance): { label: string; value: string } {
  switch (report.status) {
    case 'PENDENTE':
      return { label: 'Prazo de elaboração', value: formatDateTime(report.elaborationDueDate) };
    case 'EM_REVISAO':
      return report.slaExtensionDueDate
        ? { label: 'Prazo prorrogado', value: formatDateTime(report.slaExtensionDueDate) }
        : { label: 'Prazo de revisão', value: formatDateTime(report.reviewDueDate) };
    case 'PENDENTE_APROVACAO':
      return { label: 'Prazo de aprovação', value: formatDateTime(report.approvalDueDate) };
    case 'CONCLUIDO':
      return { label: 'Concluído em', value: formatDateTime(report.concludedAt) };
    default:
      return { label: '—', value: '—' };
  }
}

function monthInputToIsoDate(value: string): string | undefined {
  return value ? `${value}-01` : undefined;
}

function ExportButtons({ report }: { report: ReportInstance }) {
  const { showToast } = useToast();
  const [pendingFormat, setPendingFormat] = useState<'csv' | 'json' | null>(null);

  async function handleExport(format: 'csv' | 'json') {
    setPendingFormat(format);
    try {
      const { blob, filename } = await exportReportInstance(report.id, format);
      triggerBlobDownload(blob, filename ?? `relatorio-${report.unit.sigla}-${report.referenceMonth}.${format}`);
    } catch {
      showToast('Não foi possível exportar o relatório.', 'error');
    } finally {
      setPendingFormat(null);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="sm"
        isLoading={pendingFormat === 'csv'}
        onClick={() => handleExport('csv')}
        aria-label={`Exportar relatório de ${report.unit.sigla} em CSV`}
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        CSV
      </Button>
      <Button
        variant="ghost"
        size="sm"
        isLoading={pendingFormat === 'json'}
        onClick={() => handleExport('json')}
        aria-label={`Exportar relatório de ${report.unit.sigla} em JSON`}
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        JSON
      </Button>
    </div>
  );
}

function SortableHeader({
  label,
  column,
  sortBy,
  sortOrder,
  onSort,
}: {
  label: string;
  column: SortBy;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSort: (column: SortBy) => void;
}) {
  const isActive = sortBy === column;
  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={cn(
        'flex items-center gap-1 uppercase tracking-wide transition-colors duration-fast ease-out-expo hover:text-ink',
        isActive ? 'text-ink' : 'text-ink-faint',
      )}
    >
      {label}
      {isActive &&
        (sortOrder === 'asc' ? (
          <ArrowUp className="h-3 w-3" aria-hidden="true" />
        ) : (
          <ArrowDown className="h-3 w-3" aria-hidden="true" />
        ))}
    </button>
  );
}

function StatusOverview({ reports }: { reports: ReportInstance[] }) {
  const counts = useMemo(() => {
    const byStatus = new Map<ReportStatus, number>();
    for (const report of reports) {
      byStatus.set(report.status, (byStatus.get(report.status) ?? 0) + 1);
    }
    return byStatus;
  }, [reports]);

  const statuses = Object.keys(REPORT_STATUS_LABEL) as ReportStatus[];

  return (
    <div className="flex flex-wrap items-stretch gap-x-10 gap-y-4 border-b border-border bg-paper-raised px-8 py-6">
      <div className="pr-10">
        <p className="font-display text-display font-semibold text-ink">{reports.length}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-faint">Relatórios no período</p>
      </div>
      {statuses.map((statusKey, index) => (
        <div
          key={statusKey}
          className={cn('pl-0', index > 0 && 'border-l border-border pl-10')}
        >
          <p className={cn('data-figure text-3xl font-medium', `text-status-${REPORT_STATUS_TONE[statusKey]}`)}>
            {counts.get(statusKey) ?? 0}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
            {REPORT_STATUS_LABEL[statusKey]}
          </p>
        </div>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ReportStatus | ''>('');
  const [unitId, setUnitId] = useState('');
  const [referenceMonthFrom, setReferenceMonthFrom] = useState('');
  const [referenceMonthTo, setReferenceMonthTo] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('referenceMonth');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      'report-instances',
      { status, search, referenceMonthFrom, referenceMonthTo, sortBy, sortOrder },
    ],
    queryFn: () =>
      listReportInstances({
        status: status || undefined,
        search: search || undefined,
        referenceMonthFrom: monthInputToIsoDate(referenceMonthFrom),
        referenceMonthTo: monthInputToIsoDate(referenceMonthTo),
        sortBy,
        sortOrder,
      }),
  });

  const reports = useMemo(() => data ?? [], [data]);

  const units = useMemo<UnitSummary[]>(() => {
    const byId = new Map<string, UnitSummary>();
    for (const report of reports) {
      byId.set(report.unit.id, { id: report.unit.id, sigla: report.unit.sigla, nome: report.unit.nome });
    }
    return Array.from(byId.values()).sort((a, b) => a.sigla.localeCompare(b.sigla));
  }, [reports]);

  const visibleReports = useMemo(
    () => (unitId ? reports.filter((report) => report.unitId === unitId) : reports),
    [reports, unitId],
  );

  function handleSort(column: SortBy) {
    if (sortBy === column) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  }

  const canOpenDetail = user ? REPORT_DETAIL_ROLES.includes(user.role) : false;

  return (
    <>
      <PageHeader
        eyebrow="Visão consolidada"
        title="Painel Central"
        description="Histórico de relatórios da(s) unidade(s) com filtros, ordenação e exportação rápida."
      />

      <StatusOverview reports={reports} />

      <div className="flex flex-wrap items-end gap-3 border-b border-border bg-paper-raised px-8 py-4">
        <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
          <label htmlFor="search" className="text-xs font-medium text-ink-muted">
            Busca por unidade
          </label>
          <Input
            id="search"
            placeholder="Sigla ou nome da unidade"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="unit" className="text-xs font-medium text-ink-muted">
            Unidade
          </label>
          <Select id="unit" value={unitId} onChange={(event) => setUnitId(event.target.value)}>
            <option value="">Todas</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.sigla}
              </option>
            ))}
          </Select>
        </div>

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

        <div className="flex flex-col gap-1.5">
          <label htmlFor="from" className="text-xs font-medium text-ink-muted">
            Período de
          </label>
          <Input
            id="from"
            type="month"
            value={referenceMonthFrom}
            onChange={(event) => setReferenceMonthFrom(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="to" className="text-xs font-medium text-ink-muted">
            até
          </label>
          <Input
            id="to"
            type="month"
            value={referenceMonthTo}
            onChange={(event) => setReferenceMonthTo(event.target.value)}
          />
        </div>
      </div>

      <div className="p-8 pt-6">
        {isLoading && <Spinner label="Carregando relatórios..." />}

        {isError && (
          <EmptyState title="Falha ao carregar" description="Não foi possível carregar os relatórios. Tente novamente." />
        )}

        {!isLoading && !isError && visibleReports.length === 0 && (
          <EmptyState title="Nenhum relatório encontrado" description="Ajuste os filtros para ver outros períodos ou unidades." />
        )}

        {!isLoading && !isError && visibleReports.length > 0 && (
          <Table>
            <THead>
              <TR>
                <TH>Unidade</TH>
                <TH>
                  <SortableHeader label="Período" column="referenceMonth" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </TH>
                <TH>
                  <SortableHeader label="Status" column="status" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </TH>
                <TH>Prazo</TH>
                <TH>Ações</TH>
              </TR>
            </THead>
            <TBody>
              {visibleReports.map((report) => {
                const deadline = getRelevantDeadline(report);
                return (
                  <TR key={report.id}>
                    <TD>
                      <p className="font-medium text-ink">{report.unit.sigla}</p>
                      <p className="text-xs text-ink-faint">{report.unit.nome}</p>
                    </TD>
                    <TD className="data-figure">{formatReferenceMonth(report.referenceMonth)}</TD>
                    <TD>
                      <StatusBadge tone={REPORT_STATUS_TONE[report.status]} label={REPORT_STATUS_LABEL[report.status]} />
                    </TD>
                    <TD>
                      <p className="text-xs text-ink-faint">{deadline.label}</p>
                      <p className="data-figure text-sm">{deadline.value}</p>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-3">
                        {canOpenDetail && (
                          <Link to={`/relatorios/${report.id}`} className="text-sm font-medium text-accent hover:text-accent-hover hover:underline">
                            Ver
                          </Link>
                        )}
                        <ExportButtons report={report} />
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </div>
    </>
  );
}
