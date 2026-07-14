import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { AdminAccessPage } from './AdminAccessPage';
import { renderWithProviders } from '../test/render-with-providers';
import * as usersApi from '../api/users';
import * as unitsApi from '../api/units';
import * as formsApi from '../api/forms';

vi.mock('../api/users');
vi.mock('../api/units');
vi.mock('../api/forms');

describe('AdminAccessPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the users panel by default and switches to the units panel on tab click', async () => {
    vi.mocked(usersApi.listUsers).mockResolvedValue([]);
    vi.mocked(unitsApi.listUnits).mockResolvedValue([]);
    vi.mocked(formsApi.listFormTemplates).mockResolvedValue([]);

    renderWithProviders(<AdminAccessPage />);

    expect(await screen.findByRole('button', { name: 'Novo usuário' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Unidades' }));

    expect(await screen.findByRole('button', { name: 'Nova unidade' })).toBeInTheDocument();
  });
});
