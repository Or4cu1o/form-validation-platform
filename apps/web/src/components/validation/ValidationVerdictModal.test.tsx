import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { ValidationVerdictModal } from './ValidationVerdictModal';

describe('ValidationVerdictModal', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <ValidationVerdictModal
        isOpen={false}
        verdict="APROVADO"
        indicatorTitle="Disponibilidade"
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the approval title and confirm label for an APROVADO verdict', () => {
    render(
      <ValidationVerdictModal
        isOpen
        verdict="APROVADO"
        indicatorTitle="Disponibilidade"
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByText('Aprovar indicador')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar aprovação' })).toBeInTheDocument();
  });

  it('shows the reproval title and confirm label for a REPROVADO verdict', () => {
    render(
      <ValidationVerdictModal
        isOpen
        verdict="REPROVADO"
        indicatorTitle="Disponibilidade"
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByText('Reprovar indicador')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar reprovação' })).toBeInTheDocument();
  });

  it('blocks submission and shows an error when justification is empty', async () => {
    const onSubmit = vi.fn();
    render(
      <ValidationVerdictModal
        isOpen
        verdict="APROVADO"
        indicatorTitle="Disponibilidade"
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Confirmar aprovação' }));
    });

    expect(screen.getByText('A justificativa é obrigatória.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the trimmed justification and no file when none is selected', async () => {
    const onSubmit = vi.fn().mockResolvedValueOnce(undefined);
    render(
      <ValidationVerdictModal
        isOpen
        verdict="APROVADO"
        indicatorTitle="Disponibilidade"
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Justificativa técnico-operacional/), {
      target: { value: '  Dentro da meta, sem ressalvas.  ' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Confirmar aprovação' }));
    });

    expect(onSubmit).toHaveBeenCalledWith('Dentro da meta, sem ressalvas.', null);
  });

  it('calls onClose and resets state when Cancelar is clicked', () => {
    const onClose = vi.fn();
    render(
      <ValidationVerdictModal
        isOpen
        verdict="REPROVADO"
        indicatorTitle="Disponibilidade"
        isSubmitting={false}
        onClose={onClose}
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
