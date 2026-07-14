import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { UsersPanel } from '../components/admin/UsersPanel';
import { UnitsPanel } from '../components/admin/UnitsPanel';
import { cn } from '../lib/cn';

type Tab = 'users' | 'units';

export function AdminAccessPage() {
  const [tab, setTab] = useState<Tab>('users');

  return (
    <>
      <PageHeader title="Controle de Acesso" description="Gestão de usuários e unidades. Desligamentos usam soft delete." />

      <div className="px-8 pt-4">
        <div className="flex gap-1 border-b border-border">
          <button
            type="button"
            onClick={() => setTab('users')}
            className={cn(
              'border-b-2 px-4 py-2 text-sm font-medium',
              tab === 'users' ? 'border-accent text-ink' : 'border-transparent text-ink-faint hover:text-ink-muted',
            )}
          >
            Usuários
          </button>
          <button
            type="button"
            onClick={() => setTab('units')}
            className={cn(
              'border-b-2 px-4 py-2 text-sm font-medium',
              tab === 'units' ? 'border-accent text-ink' : 'border-transparent text-ink-faint hover:text-ink-muted',
            )}
          >
            Unidades
          </button>
        </div>
      </div>

      <div className="p-8 pt-6">{tab === 'users' ? <UsersPanel /> : <UnitsPanel />}</div>
    </>
  );
}
