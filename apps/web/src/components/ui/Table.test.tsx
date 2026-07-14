import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table, TBody, TD, TH, THead, TR } from './Table';

describe('Table', () => {
  it('renders a full table structure with headers and rows', () => {
    render(
      <Table>
        <THead>
          <TR>
            <TH>Unidade</TH>
          </TR>
        </THead>
        <TBody>
          <TR>
            <TD>TI</TD>
          </TR>
        </TBody>
      </Table>,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Unidade' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'TI' })).toBeInTheDocument();
  });
});
