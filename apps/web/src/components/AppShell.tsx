import { NavLink, Outlet } from 'react-router-dom';
import { ClipboardList, LayoutDashboard, LogOut, ShieldCheck, Sliders, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABEL } from '../lib/status';
import { cn } from '../lib/cn';
import type { RoleName } from '../types/api';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: RoleName[];
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Painel Central',
    icon: LayoutDashboard,
    roles: ['OBSERVADOR', 'ELABORADOR', 'REVISOR', 'APROVADOR', 'ADMINISTRADOR'],
  },
  {
    to: '/relatorios',
    label: 'Elaboração e Revisão',
    icon: ClipboardList,
    roles: ['ELABORADOR', 'REVISOR', 'ADMINISTRADOR'],
  },
  {
    to: '/validacao',
    label: 'Mesa de Validação',
    icon: ShieldCheck,
    roles: ['APROVADOR', 'ADMINISTRADOR'],
  },
  {
    to: '/admin/acessos',
    label: 'Controle de Acesso',
    icon: Users,
    roles: ['ADMINISTRADOR'],
  },
  {
    to: '/admin/formularios',
    label: 'Formulários',
    icon: Sliders,
    roles: ['ADMINISTRADOR'],
  },
];

export function AppShell() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="flex w-64 shrink-0 flex-col bg-console text-white">
        <div className="border-b border-console-border px-6 py-5">
          <p className="font-display text-lg font-bold tracking-wider text-accent">GCINFRA</p>
          <p className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">Gerência de Infraestrutura</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-console-raised text-accent' : 'text-white/70 hover:bg-console-raised hover:text-white',
                )
              }
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-console-border px-3 py-4">
          <div className="mb-2 px-3">
            <p className="truncate text-sm font-medium text-white">
              {user.nome} {user.sobrenome}
            </p>
            <p className="text-xs text-white/50">{ROLE_LABEL[user.role]}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-console-raised hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex flex-col justify-between">
        <div className="flex-1">
          <Outlet />
        </div>
        <footer className="border-t border-border px-8 py-4 bg-paper-raised text-center text-xs text-ink-faint">
          GCINFRA — Gerência Corporativa de Infraestrutura | © 2026 AGIR - Associação de Gestão, Inovação e Resultados em Saúde
        </footer>
      </main>
    </div>
  );
}
