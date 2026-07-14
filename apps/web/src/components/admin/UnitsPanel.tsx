import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PenSquare, Power, PowerOff } from 'lucide-react';
import { listUnits, activateUnit, deactivateUnit } from '../../api/units';
import { listFormTemplates } from '../../api/forms';
import { Button, EmptyState, Spinner, StatusBadge, Table, TBody, TD, TH, THead, TR, useToast } from '../ui';
import { UNIT_LEVEL_LABEL } from '../../lib/status';
import { UnitFormModal } from './UnitFormModal';
import type { Unit } from '../../types/api';

type ModalState = { type: 'create' } | { type: 'edit'; unit: Unit } | null;

export function UnitsPanel() {
  const [includeInactive, setIncludeInactive] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: units, isLoading, isError } = useQuery({
    queryKey: ['admin-units', includeInactive],
    queryFn: () => listUnits(includeInactive),
  });

  const { data: formTemplates } = useQuery({ queryKey: ['admin-form-templates'], queryFn: () => listFormTemplates(false) });

  const toggleActiveMutation = useMutation({
    mutationFn: (unit: Unit) => (unit.isActive ? deactivateUnit(unit.id) : activateUnit(unit.id)),
    onSuccess: () => {
      showToast('Status da unidade atualizado.', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-units'] });
    },
    onError: () => showToast('Não foi possível atualizar o status.', 'error'),
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(event) => setIncludeInactive(event.target.checked)}
            className="h-4 w-4 rounded border-border-strong accent-accent"
          />
          Mostrar inativas
        </label>
        <Button size="sm" onClick={() => setModal({ type: 'create' })}>
          Nova unidade
        </Button>
      </div>

      {isLoading && <Spinner label="Carregando unidades..." />}
      {isError && <EmptyState title="Falha ao carregar" description="Não foi possível carregar as unidades." />}
      {!isLoading && !isError && (units ?? []).length === 0 && (
        <EmptyState title="Nenhuma unidade encontrada" description="Ajuste os filtros ou crie uma nova unidade." />
      )}

      {!isLoading && !isError && (units ?? []).length > 0 && (
        <Table>
          <THead>
            <TR>
              <TH>Sigla</TH>
              <TH>Nome</TH>
              <TH>Nível</TH>
              <TH>Formulário</TH>
              <TH>Status</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {(units ?? []).map((unit) => (
              <TR key={unit.id}>
                <TD className="font-medium text-ink">{unit.sigla}</TD>
                <TD className="text-ink-muted">{unit.nome}</TD>
                <TD>{UNIT_LEVEL_LABEL[unit.level]}</TD>
                <TD className="text-ink-muted">{unit.formTemplate?.name ?? '—'}</TD>
                <TD>
                  <StatusBadge tone={unit.isActive ? 'concluido' : 'pendente'} label={unit.isActive ? 'Ativa' : 'Inativa'} />
                </TD>
                <TD>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      title="Editar"
                      onClick={() => setModal({ type: 'edit', unit })}
                      className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-ink"
                    >
                      <PenSquare className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      title={unit.isActive ? 'Desativar' : 'Ativar'}
                      onClick={() => toggleActiveMutation.mutate(unit)}
                      className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-ink"
                    >
                      {unit.isActive ? <PowerOff className="h-4 w-4" aria-hidden="true" /> : <Power className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <UnitFormModal isOpen={modal?.type === 'create'} onClose={() => setModal(null)} formTemplates={formTemplates ?? []} />
      {modal?.type === 'edit' && (
        <UnitFormModal isOpen onClose={() => setModal(null)} formTemplates={formTemplates ?? []} unit={modal.unit} />
      )}
    </div>
  );
}
