import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPlatformSettings, updatePlatformSettings } from '../../../api/settings';
import { Button, Field, Input, useToast } from '../../ui';

export function PlatformNamingPanel() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { data: settings } = useQuery({ queryKey: ['platform-settings'], queryFn: getPlatformSettings });
  const [pattern, setPattern] = useState('');

  const mutation = useMutation({
    mutationFn: (value: string) => updatePlatformSettings({ exportNamingPattern: value }),
    onSuccess: () => {
      showToast('Padrão de nomenclatura atualizado.', 'success');
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
    },
    onError: () => showToast('Não foi possível atualizar o padrão.', 'error'),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate(pattern || settings?.exportNamingPattern || '');
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 rounded-lg border border-border bg-paper-raised p-5 shadow-panel">
      <div className="flex-1">
        <Field
          label="Padrão de nomenclatura de exportação"
          htmlFor="pattern"
          hint="Placeholders: {SIGLA UNIDADE} e {data iso}."
        >
          <Input
            id="pattern"
            placeholder={settings?.exportNamingPattern ?? 'Relatório Operacional de Tecnologia da Informação - {SIGLA UNIDADE} - {data iso}'}
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
          />
        </Field>
      </div>
      <Button type="submit" size="sm" isLoading={mutation.isPending}>
        Salvar
      </Button>
    </form>
  );
}
