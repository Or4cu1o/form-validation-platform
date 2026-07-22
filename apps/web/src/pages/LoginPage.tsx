import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api-error';
import { Button, Field, Input } from '../components/ui';
import { brand } from '../config/brand';

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
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-console px-16 py-14 text-white lg:flex">
        <div className="blueprint-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded bg-accent text-sm font-bold text-accent-ink">
            {brand.departmentAcronym.charAt(0)}
          </span>
          <p className="font-display text-xl font-medium tracking-wide text-white">{brand.departmentAcronym}</p>
        </div>

        <div className="relative max-w-lg">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-accent-200">
            {brand.systemName}
          </p>
          <h1 className="font-display text-display-lg font-medium italic leading-[1.05] text-white">
            Governança de indicadores, do lançamento à aprovação final.
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/60">{brand.systemPurposeShort}</p>
        </div>

        <p className="relative text-xs text-white/40">{brand.copyrightLine}</p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center bg-paper px-6 py-12 lg:w-1/2">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm animate-rise-in rounded-lg border border-border bg-paper-raised p-8 shadow-raised"
        >
          <h2 className="font-display text-display-sm font-medium text-ink">Entrar</h2>
          <p className="mt-1.5 text-sm text-ink-muted">Acesse com sua matrícula ou e-mail institucional.</p>

          <div className="mt-8 flex flex-col gap-5">
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
