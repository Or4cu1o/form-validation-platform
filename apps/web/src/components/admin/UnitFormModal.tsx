import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUnit, updateUnit } from '../../api/units';
import { Button, Field, Input, Modal, Select, useToast } from '../ui';
import { UNIT_LEVEL_LABEL } from '../../lib/status';
import type { FormTemplate, Unit, UnitLevel } from '../../types/api';

const LEVELS = Object.keys(UNIT_LEVEL_LABEL) as UnitLevel[];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  formTemplates: FormTemplate[];
  unit?: Unit;
};

export function UnitFormModal({ isOpen, onClose, formTemplates, unit }: Props) {
  const isEditing = Boolean(unit);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [sigla, setSigla] = useState(unit?.sigla ?? '');
  const [nome, setNome] = useState(unit?.nome ?? '');
  const [logoUrl, setLogoUrl] = useState(unit?.logoUrl ?? '');
  const [level, setLevel] = useState<UnitLevel>(unit?.level ?? 'C');
  const [formTemplateId, setFormTemplateId] = useState(unit?.formTemplateId ?? '');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      const input = { sigla, nome, logoUrl: logoUrl || undefined, level, formTemplateId: formTemplateId || undefined };
      return isEditing ? updateUnit(unit!.id, input) : createUnit(input);
    },
    onSuccess: () => {
      showToast(isEditing ? 'Unidade atualizada.' : 'Unidade criada.', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-units'] });
      onClose();
    },
    onError: () => setError('Não foi possível salvar a unidade.'),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sigla.trim() || !nome.trim()) {
      setError('Preencha sigla e nome.');
      return;
    }
    setError(null);
    mutation.mutate();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar unidade' : 'Nova unidade'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Field label="Sigla" htmlFor="sigla" required>
          <Input id="sigla" value={sigla} onChange={(event) => setSigla(event.target.value)} />
        </Field>

        <Field label="Nível do relatório" htmlFor="level" required>
          <Select id="level" value={level} onChange={(event) => setLevel(event.target.value as UnitLevel)}>
            {LEVELS.map((value) => (
              <option key={value} value={value}>
                {UNIT_LEVEL_LABEL[value]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Nome" htmlFor="nome" required>
          <Input id="nome" value={nome} onChange={(event) => setNome(event.target.value)} />
        </Field>

        <Field label="URL do logotipo" htmlFor="logoUrl" hint="PNG hospedado externamente (opcional).">
          <Input id="logoUrl" value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} />
        </Field>

        <Field label="Formulário associado" htmlFor="formTemplateId" hint="Pode ser definido depois, na Engine No-Code.">
          <Select id="formTemplateId" value={formTemplateId} onChange={(event) => setFormTemplateId(event.target.value)}>
            <option value="">Nenhum</option>
            {formTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </Select>
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
            {isEditing ? 'Salvar' : 'Criar unidade'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
