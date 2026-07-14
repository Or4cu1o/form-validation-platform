import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Layers, PenSquare, Power, PowerOff } from 'lucide-react';
import { listUsers, activateUser, deactivateUser } from '../../api/users';
import { listUnits } from '../../api/units';
import { Button, EmptyState, Spinner, StatusBadge, Table, TBody, TD, TH, THead, TR, useToast } from '../ui';
import { ROLE_LABEL } from '../../lib/status';
import { UserFormModal } from './UserFormModal';
import { UnitAccessModal } from './UnitAccessModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import type { AdminUser } from '../../types/api';

type ModalState = { type: 'create' } | { type: 'edit'; user: AdminUser } | { type: 'access'; user: AdminUser } | { type: 'reset'; user: AdminUser } | null;

export function UsersPanel() {
  const [includeInactive, setIncludeInactive] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['admin-users', includeInactive],
    queryFn: () => listUsers(includeInactive),
  });

  const { data: units } = useQuery({ queryKey: ['admin-units'], queryFn: () => listUnits(false) });

  const toggleActiveMutation = useMutation({
    mutationFn: (user: AdminUser) => (user.isActive ? deactivateUser(user.id) : activateUser(user.id)),
    onSuccess: () => {
      showToast('Status do usuário atualizado.', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
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
          Mostrar inativos
        </label>
        <Button size="sm" onClick={() => setModal({ type: 'create' })}>
          Novo usuário
        </Button>
      </div>

      {isLoading && <Spinner label="Carregando usuários..." />}
      {isError && <EmptyState title="Falha ao carregar" description="Não foi possível carregar os usuários." />}
      {!isLoading && !isError && (users ?? []).length === 0 && (
        <EmptyState title="Nenhum usuário encontrado" description="Ajuste os filtros ou crie um novo usuário." />
      )}

      {!isLoading && !isError && (users ?? []).length > 0 && (
        <Table>
          <THead>
            <TR>
              <TH>Matrícula</TH>
              <TH>Nome</TH>
              <TH>E-mail</TH>
              <TH>Role</TH>
              <TH>Unidade primária</TH>
              <TH>Status</TH>
              <TH>Ações</TH>
            </TR>
          </THead>
          <TBody>
            {(users ?? []).map((user) => (
              <TR key={user.id}>
                <TD className="data-figure">{user.matricula}</TD>
                <TD>
                  {user.nome} {user.sobrenome}
                </TD>
                <TD className="text-ink-muted">{user.email}</TD>
                <TD>{ROLE_LABEL[user.role]}</TD>
                <TD>{user.primaryUnit.sigla}</TD>
                <TD>
                  <StatusBadge tone={user.isActive ? 'concluido' : 'pendente'} label={user.isActive ? 'Ativo' : 'Inativo'} />
                </TD>
                <TD>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      title="Editar"
                      onClick={() => setModal({ type: 'edit', user })}
                      className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-ink"
                    >
                      <PenSquare className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      title="Acessos extras"
                      onClick={() => setModal({ type: 'access', user })}
                      className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-ink"
                    >
                      <Layers className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      title="Redefinir senha"
                      onClick={() => setModal({ type: 'reset', user })}
                      className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-ink"
                    >
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      title={user.isActive ? 'Desativar' : 'Ativar'}
                      onClick={() => toggleActiveMutation.mutate(user)}
                      className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-ink"
                    >
                      {user.isActive ? <PowerOff className="h-4 w-4" aria-hidden="true" /> : <Power className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <UserFormModal
        isOpen={modal?.type === 'create'}
        onClose={() => setModal(null)}
        units={units ?? []}
      />
      {modal?.type === 'edit' && (
        <UserFormModal isOpen onClose={() => setModal(null)} units={units ?? []} user={modal.user} />
      )}
      {modal?.type === 'access' && (
        <UnitAccessModal isOpen onClose={() => setModal(null)} user={modal.user} units={units ?? []} />
      )}
      {modal?.type === 'reset' && <ResetPasswordModal isOpen onClose={() => setModal(null)} user={modal.user} />}
    </div>
  );
}
