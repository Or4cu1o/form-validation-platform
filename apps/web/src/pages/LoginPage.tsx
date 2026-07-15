import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api-error';
import { Button, Field, Input } from '../components/ui';

const logoUrl = '/logo-agir-branco.png';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    const from = (location.state as { from?: Location })?.from;
    return <Navigate to={from?.pathname ?? '/'} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError('Informe matrícula (ou e-mail) e senha.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(identifier.trim(), password);
      navigate('/', { replace: true });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-console px-16 py-12 text-white lg:flex">
        <p className="font-display text-2xl font-bold tracking-wider text-white">GCINFRA</p>
        <div>
          <div className="flex justify-center mb-10">
            <img src={logoUrl} alt="Agir Saúde Logo" className="w-full max-w-lg h-auto object-contain" />
          </div>
          <h1 className="font-display text-display-lg font-medium leading-tight text-white">
            Governança e automação de indicadores de TI.
          </h1>
          <p className="mt-4 max-w-md text-white/60">
            Elaboração, revisão e validação de relatórios com trilha de auditoria completa,
            do lançamento à aprovação final.
          </p>
        </div>
        <p className="text-xs text-white/40">GCINFRA — Gerência Corporativa de Infraestrutura | AGIR 2026</p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center bg-paper px-6 py-12 lg:w-1/2">
        <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-paper-raised p-8 shadow-panel">
          <h2 className="font-display text-display-sm font-medium text-ink">Entrar</h2>
          <p className="mt-1 text-sm text-ink-muted">Acesse com sua matrícula ou e-mail institucional.</p>

          <div className="mt-6 flex flex-col gap-4">
            <Field label="Matrícula ou e-mail" htmlFor="identifier" required>
              <Input
                id="identifier"
                name="identifier"
                autoComplete="username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                hasError={Boolean(error)}
              />
            </Field>

            <Field label="Senha" htmlFor="password" required>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                hasError={Boolean(error)}
              />
            </Field>

            {error && (
              <p role="alert" className="text-sm text-status-reprovado">
                {error}
              </p>
            )}

            <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
              Entrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
