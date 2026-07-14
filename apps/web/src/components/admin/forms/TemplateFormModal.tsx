import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFormTemplate, updateFormTemplate } from '../../../api/forms';
import { Button, Field, Input, Modal, Textarea, useToast } from '../../ui';
import type { FormTemplate } from '../../../types/api';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  template?: FormTemplate;
};

export function TemplateFormModal({ isOpen, onClose, template }: Props) {
  const isEditing = Boolean(template);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [name, setName] = useState(template?.name ?? '');
  const [description, setDescription] = useState(template?.description ?? '');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      isEditing
        ? updateFormTemplate(template!.id, { name, description: description || undefined })
        : createFormTemplate({ name, description: description || undefined }),
    onSuccess: () => {
      showToast(isEditing ? 'Formulário atualizado.' : 'Formulário criado.', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-form-templates'] });
      onClose();
    },
    onError: () => setError('Não foi possível salvar o formulário.'),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Informe o nome do formulário.');
      return;
    }
    setError(null);
    mutation.mutate();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar formulário' : 'Novo formulário'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nome" htmlFor="name" required>
          <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="Descrição" htmlFor="description">
          <Textarea id="description" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
        </Field>
        {error && (
          <p role="alert" className="text-sm text-status-reprovado">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEditing ? 'Salvar' : 'Criar formulário'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
