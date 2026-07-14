import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { Select } from './Select';

describe('Select', () => {
  it('renders provided options and responds to selection', () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="Status" value="" onChange={onChange}>
        <option value="">Todos</option>
        <option value="PENDENTE">Pendente</option>
      </Select>,
    );

    const select = screen.getByLabelText('Status');
    fireEvent.change(select, { target: { value: 'PENDENTE' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('applies the error border class when hasError is true', () => {
    render(
      <Select aria-label="Status" hasError value="" onChange={() => {}}>
        <option value="">Todos</option>
      </Select>,
    );
    expect(screen.getByLabelText('Status').className).toContain('border-status-reprovado');
  });
});
