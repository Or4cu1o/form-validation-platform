import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '../../../api/users';
import { Button, Field, Input, Modal, useToast } from '../../ui';
import type { AdminUser } from '../../../types/api';

const MIN_PASSWORD_LENGTH = 8;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser;
};

export function ResetPasswordModal({ isOpen, onClose, user }: Props) {
  const { showToast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => resetPassword(user.id, newPassword),
    onSuccess: () => {
      showToast('Senha redefinida.', 'success');
      setNewPassword('');
      onClose();
    },
    onError: () => setError('Não foi possível redefinir a senha.'),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    setError(null);
    mutation.mutate();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Redefinir senha · ${user.nome} ${user.sobrenome}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nova senha provisória" htmlFor="newPassword" error={error ?? undefined} required>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            hasError={Boolean(error)}
          />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Redefinir
          </Button>
        </div>
      </form>
    </Modal>
  );
}
