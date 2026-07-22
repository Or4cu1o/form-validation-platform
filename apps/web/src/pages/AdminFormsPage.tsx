import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PenSquare, Plus, Power, PowerOff } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { TemplateFormModal } from '../components/admin/forms/TemplateFormModal';
import { FormTemplateDetail } from '../components/admin/forms/FormTemplateDetail';
import { activateFormTemplate, deactivateFormTemplate, getFormTemplate, listFormTemplates } from '../api/forms';
import { getExportSettings, updateExportSettings } from '../api/export';
import { Button, EmptyState, Field, Input, Spinner, StatusBadge, useToast } from '../components/ui';
import { cn } from '../lib/cn';
import type { FormTemplate } from '../types/api';

type ModalState = { type: 'create' } | { type: 'edit'; template: FormTemplate } | null;

function ExportSettingsPanel() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { data: settings } = useQuery({ queryKey: ['export-settings'], queryFn: getExportSettings });
  const [pattern, setPattern] = useState('');

  const mutation = useMutation({
    mutationFn: (value: string) => updateExportSettings(value),
    onSuccess: () => {
      showToast('Padrão de nomenclatura atualizado.', 'success');
      queryClient.invalidateQueries({ queryKey: ['export-settings'] });
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

export function AdminFormsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['admin-form-templates-full'],
    queryFn: () => listFormTemplates(true),
  });

  const { data: selectedTemplate, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['admin-form-template', selectedId],
    queryFn: () => getFormTemplate(selectedId!, true),
    enabled: Boolean(selectedId),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (template: FormTemplate) =>
      template.isActive ? deactivateFormTemplate(template.id) : activateFormTemplate(template.id),
    onSuccess: () => {
      showToast('Status do formulário atualizado.', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-form-templates-full'] });
      queryClient.invalidateQueries({ queryKey: ['admin-form-template', selectedId] });
    },
    onError: () => showToast('Não foi possível atualizar o formulário.', 'error'),
  });

  return (
    <>
      <PageHeader
        eyebrow="Administração"
        title="Formulários"
        description="Engine no-code de templates, tópicos e indicadores. Alterações valem para relatórios futuros."
      />

      <div className="flex flex-col gap-6 p-8">
        <ExportSettingsPanel />

        <div className="grid grid-cols-[280px_1fr] gap-6">
          <div className="flex flex-col gap-3">
            <Button size="sm" onClick={() => setModal({ type: 'create' })}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Novo formulário
            </Button>

            {isLoading && <Spinner label="Carregando..." />}

            <div className="flex flex-col gap-1.5">
              {(templates ?? []).map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    'flex items-center justify-between rounded border px-3 py-2 text-sm transition-colors duration-fast ease-out-expo',
                    selectedId === template.id ? 'border-accent bg-accent-50' : 'border-border bg-paper-raised hover:bg-paper-sunken',
                  )}
                >
                  <button type="button" onClick={() => setSelectedId(template.id)} className="flex-1 truncate text-left text-ink">
                    {template.name}
                  </button>
                  <div className="flex items-center gap-1">
                    <StatusBadge tone={template.isActive ? 'concluido' : 'pendente'} label={template.isActive ? 'Ativo' : 'Inativo'} />
                    <button
                      type="button"
                      title="Editar"
                      onClick={() => setModal({ type: 'edit', template })}
                      className="rounded p-1 text-ink-faint hover:bg-paper hover:text-ink"
                    >
                      <PenSquare className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      title={template.isActive ? 'Desativar' : 'Ativar'}
                      onClick={() => toggleActiveMutation.mutate(template)}
                      className="rounded p-1 text-ink-faint hover:bg-paper hover:text-ink"
                    >
                      {template.isActive ? <PowerOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Power className="h-3.5 w-3.5" aria-hidden="true" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {!selectedId && <EmptyState title="Selecione um formulário" description="Escolha um formulário na lista para ver tópicos e indicadores." />}
            {selectedId && isLoadingDetail && <Spinner label="Carregando formulário..." />}
            {selectedId && selectedTemplate && <FormTemplateDetail template={selectedTemplate} />}
          </div>
        </div>
      </div>

      <TemplateFormModal isOpen={modal?.type === 'create'} onClose={() => setModal(null)} />
      {modal?.type === 'edit' && <TemplateFormModal isOpen onClose={() => setModal(null)} template={modal.template} />}
    </>
  );
}
