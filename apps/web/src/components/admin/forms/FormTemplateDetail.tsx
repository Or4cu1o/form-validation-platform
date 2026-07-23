import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PenSquare, Plus, Power, PowerOff } from 'lucide-react';
import {
  activateFormIndicator,
  activateFormTopic,
  deactivateFormIndicator,
  deactivateFormTopic,
} from '../../../api/forms';
import { Button, EmptyState, StatusBadge, Table, TBody, TD, TH, THead, TR, useToast } from '../../ui';
import { GOAL_OPERATOR_SYMBOL } from '../../../lib/status';
import { formatNumber } from '../../../lib/format';
import { TopicFormModal } from './TopicFormModal';
import { IndicatorFormModal } from './IndicatorFormModal';
import { IndicatorScorePanel } from './IndicatorScorePanel';
import type { FormIndicator, FormTemplate, FormTopic } from '../../../types/api';

type TopicModalState = { type: 'create' } | { type: 'edit'; topic: FormTopic } | null;
type IndicatorModalState = { type: 'create'; topicId: string } | { type: 'edit'; topicId: string; indicator: FormIndicator } | null;

type Props = {
  template: FormTemplate;
};

export function FormTemplateDetail({ template }: Props) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [topicModal, setTopicModal] = useState<TopicModalState>(null);
  const [indicatorModal, setIndicatorModal] = useState<IndicatorModalState>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-form-template', template.id] });
  }

  const toggleTopicMutation = useMutation({
    mutationFn: (topic: FormTopic) => (topic.isActive ? deactivateFormTopic(topic.id) : activateFormTopic(topic.id)),
    onSuccess: () => {
      showToast('Status do tópico atualizado.', 'success');
      invalidate();
    },
    onError: () => showToast('Não foi possível atualizar o tópico.', 'error'),
  });

  const toggleIndicatorMutation = useMutation({
    mutationFn: (indicator: FormIndicator) =>
      indicator.isActive ? deactivateFormIndicator(indicator.id) : activateFormIndicator(indicator.id),
    onSuccess: () => {
      showToast('Status do indicador atualizado.', 'success');
      invalidate();
    },
    onError: () => showToast('Não foi possível atualizar o indicador.', 'error'),
  });

  const topics = template.topics ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">{template.name}</h2>
          {template.description && <p className="text-sm text-ink-muted">{template.description}</p>}
        </div>
        <Button size="sm" onClick={() => setTopicModal({ type: 'create' })}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Novo tópico
        </Button>
      </div>

      {topics.length === 0 && <EmptyState title="Sem tópicos" description="Crie o primeiro tópico deste formulário." />}

      <IndicatorScorePanel templateId={template.id} />

      {topics
        .sort((a, b) => a.order - b.order)
        .map((topic) => (
          <div key={topic.id} className="rounded-lg border border-border bg-paper-raised p-5 shadow-panel">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-ink">{topic.title}</h3>
                <StatusBadge tone={topic.isActive ? 'concluido' : 'pendente'} label={topic.isActive ? 'Ativo' : 'Inativo'} />
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" onClick={() => setIndicatorModal({ type: 'create', topicId: topic.id })}>
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Indicador
                </Button>
                <button
                  type="button"
                  title="Editar tópico"
                  onClick={() => setTopicModal({ type: 'edit', topic })}
                  className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-ink"
                >
                  <PenSquare className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  title={topic.isActive ? 'Desativar tópico' : 'Ativar tópico'}
                  onClick={() => toggleTopicMutation.mutate(topic)}
                  className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-ink"
                >
                  {topic.isActive ? <PowerOff className="h-4 w-4" aria-hidden="true" /> : <Power className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {(topic.indicators ?? []).length === 0 ? (
              <p className="mt-3 text-sm text-ink-faint">Nenhum indicador neste tópico.</p>
            ) : (
              <Table className="mt-4">
                <THead>
                  <TR>
                    <TH>Indicador</TH>
                    <TH>Chaves</TH>
                    <TH>Fórmula</TH>
                    <TH>Meta</TH>
                    <TH>Status</TH>
                    <TH>Ações</TH>
                  </TR>
                </THead>
                <TBody>
                  {[...(topic.indicators ?? [])]
                    .sort((a, b) => a.order - b.order)
                    .map((indicator) => (
                      <TR key={indicator.id}>
                        <TD className="max-w-xs">
                          <p className="font-medium text-ink">{indicator.title}</p>
                          {indicator.isResidentState && <p className="text-xs text-ink-faint">Estado residente</p>}
                        </TD>
                        <TD className="font-mono text-xs text-ink-muted">{indicator.variableKeys.join(', ')}</TD>
                        <TD className="font-mono text-xs text-ink-muted">{indicator.formulaExpression}</TD>
                        <TD className="data-figure text-sm">
                          {GOAL_OPERATOR_SYMBOL[indicator.goalOperator]} {formatNumber(indicator.goalValue)}
                        </TD>
                        <TD>
                          <StatusBadge tone={indicator.isActive ? 'concluido' : 'pendente'} label={indicator.isActive ? 'Ativo' : 'Inativo'} />
                        </TD>
                        <TD>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              title="Editar indicador"
                              onClick={() => setIndicatorModal({ type: 'edit', topicId: topic.id, indicator })}
                              className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-ink"
                            >
                              <PenSquare className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              title={indicator.isActive ? 'Desativar indicador' : 'Ativar indicador'}
                              onClick={() => toggleIndicatorMutation.mutate(indicator)}
                              className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-ink"
                            >
                              {indicator.isActive ? (
                                <PowerOff className="h-4 w-4" aria-hidden="true" />
                              ) : (
                                <Power className="h-4 w-4" aria-hidden="true" />
                              )}
                            </button>
                          </div>
                        </TD>
                      </TR>
                    ))}
                </TBody>
              </Table>
            )}
          </div>
        ))}

      <TopicFormModal
        isOpen={topicModal?.type === 'create'}
        onClose={() => setTopicModal(null)}
        templateId={template.id}
      />
      {topicModal?.type === 'edit' && (
        <TopicFormModal isOpen onClose={() => setTopicModal(null)} templateId={template.id} topic={topicModal.topic} />
      )}

      {indicatorModal?.type === 'create' && (
        <IndicatorFormModal
          isOpen
          onClose={() => setIndicatorModal(null)}
          templateId={template.id}
          topicId={indicatorModal.topicId}
        />
      )}
      {indicatorModal?.type === 'edit' && (
        <IndicatorFormModal
          isOpen
          onClose={() => setIndicatorModal(null)}
          templateId={template.id}
          topicId={indicatorModal.topicId}
          indicator={indicatorModal.indicator}
        />
      )}
    </div>
  );
}
