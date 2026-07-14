import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFormTopic, updateFormTopic } from '../../../api/forms';
import { Button, Field, Input, Modal, useToast } from '../../ui';
import type { FormTopic } from '../../../types/api';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  topic?: FormTopic;
};

export function TopicFormModal({ isOpen, onClose, templateId, topic }: Props) {
  const isEditing = Boolean(topic);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [title, setTitle] = useState(topic?.title ?? '');
  const [order, setOrder] = useState(String(topic?.order ?? 0));
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      isEditing
        ? updateFormTopic(topic!.id, { title, order: Number(order) })
        : createFormTopic(templateId, { title, order: Number(order) }),
    onSuccess: () => {
      showToast(isEditing ? 'Tópico atualizado.' : 'Tópico criado.', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-form-template', templateId] });
      onClose();
    },
    onError: () => setError('Não foi possível salvar o tópico.'),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError('Informe o título do tópico.');
      return;
    }
    setError(null);
    mutation.mutate();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar tópico' : 'Novo tópico'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Título" htmlFor="title" required>
          <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </Field>
        <Field label="Ordem" htmlFor="order" hint="Posição de exibição dentro do formulário.">
          <Input id="order" type="number" min={0} value={order} onChange={(event) => setOrder(event.target.value)} />
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
            {isEditing ? 'Salvar' : 'Criar tópico'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
