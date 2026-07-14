import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Field, Modal, Textarea } from '../ui';
import type { ValidationVerdict } from '../../types/api';

const EVIDENCE_ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp';

type Props = {
  isOpen: boolean;
  verdict: ValidationVerdict;
  indicatorTitle: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (justification: string, evidenceFile: File | null) => Promise<void>;
};

export function ValidationVerdictModal({ isOpen, verdict, indicatorTitle, isSubmitting, onClose, onSubmit }: Props) {
  const [justification, setJustification] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleClose() {
    setJustification('');
    setError(null);
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!justification.trim()) {
      setError('A justificativa é obrigatória.');
      return;
    }
    setError(null);
    await onSubmit(justification.trim(), fileInputRef.current?.files?.[0] ?? null);
    setJustification('');
  }

  const title = verdict === 'APROVADO' ? 'Aprovar indicador' : 'Reprovar indicador';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-ink-muted">{indicatorTitle}</p>

        <Field label="Justificativa técnico-operacional" htmlFor="justification" error={error ?? undefined} required>
          <Textarea
            id="justification"
            rows={4}
            value={justification}
            onChange={(event) => setJustification(event.target.value)}
            hasError={Boolean(error)}
          />
        </Field>

        <Field label="Evidência da contraprova (opcional)" htmlFor="evidence">
          <input
            ref={fileInputRef}
            id="evidence"
            type="file"
            accept={EVIDENCE_ACCEPT}
            className="text-sm text-ink-muted file:mr-3 file:rounded file:border-0 file:bg-paper file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink-muted"
          />
        </Field>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant={verdict === 'APROVADO' ? 'primary' : 'danger'} isLoading={isSubmitting}>
            Confirmar {verdict === 'APROVADO' ? 'aprovação' : 'reprovação'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
