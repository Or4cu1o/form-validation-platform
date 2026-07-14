import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { grantUnitAccess, revokeUnitAccess } from '../../api/users';
import { Button, Modal, Select, useToast } from '../ui';
import type { AdminUser, UnitSummary } from '../../types/api';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser;
  units: UnitSummary[];
};

export function UnitAccessModal({ isOpen, onClose, user, units }: Props) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const grantedIds = new Set(user.unitAccesses.map((access) => access.unitId));
  const grantableUnits = units.filter((unit) => unit.id !== user.primaryUnitId && !grantedIds.has(unit.id));
  const [selectedUnitId, setSelectedUnitId] = useState(grantableUnits[0]?.id ?? '');

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  }

  const grantMutation = useMutation({
    mutationFn: (unitId: string) => grantUnitAccess(user.id, unitId),
    onSuccess: () => {
      showToast('Acesso concedido.', 'success');
      invalidate();
    },
    onError: () => showToast('Não foi possível conceder o acesso.', 'error'),
  });

  const revokeMutation = useMutation({
    mutationFn: (unitId: string) => revokeUnitAccess(user.id, unitId),
    onSuccess: () => {
      showToast('Acesso revogado.', 'success');
      invalidate();
    },
    onError: () => showToast('Não foi possível revogar o acesso.', 'error'),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Acessos extras · ${user.nome} ${user.sobrenome}`}>
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">Unidades liberadas</p>
          <div className="flex flex-col gap-2">
            {user.unitAccesses.length === 0 && <p className="text-sm text-ink-faint">Nenhum acesso extra concedido.</p>}
            {user.unitAccesses.map((access) => (
              <div key={access.unitId} className="flex items-center justify-between rounded border border-border px-3 py-2 text-sm">
                <span>
                  {access.unit.sigla} — {access.unit.nome}
                </span>
                <button
                  type="button"
                  onClick={() => revokeMutation.mutate(access.unitId)}
                  disabled={revokeMutation.isPending}
                  className="text-ink-faint hover:text-status-reprovado"
                  aria-label={`Revogar acesso a ${access.unit.sigla}`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {grantableUnits.length > 0 && (
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="grant-unit" className="text-xs font-medium text-ink-muted">
                Conceder acesso a
              </label>
              <Select id="grant-unit" value={selectedUnitId} onChange={(event) => setSelectedUnitId(event.target.value)} className="mt-1.5 w-full">
                {grantableUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.sigla} — {unit.nome}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              size="sm"
              isLoading={grantMutation.isPending}
              disabled={!selectedUnitId}
              onClick={() => grantMutation.mutate(selectedUnitId)}
            >
              Conceder
            </Button>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
