import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Salvar</Button>);
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Salvar</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and does not fire onClick while isLoading', () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} isLoading>
        Salvar
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Salvar' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('respects an explicit disabled prop', () => {
    render(<Button disabled>Salvar</Button>);
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });
});
