import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api-error';
import { Button, Field, Input } from '../components/ui';
import { brand } from '../config/brand';

/**
 * A API retorna algumas mensagens de erro sem acentuação. Normalizamos aqui
 * (camada de apresentação) para manter o padrão de português correto do
 * restante do produto, sem depender de uma mudança de contrato da API.
 */
const ERROR_MESSAGE_OVERRIDES: Record<string, string> = {
  'Credenciais invalidas': 'Credenciais inválidas.',
};

function displayErrorMessage(message: string): string {
  return ERROR_MESSAGE_OVERRIDES[message] ?? message;
}

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
      setError(caught instanceof ApiError ? displayErrorMessage(caught.message) : 'Não foi possível entrar. Tente novamente.');
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

        <img
          src={brand.logo.dark}
          alt={`${brand.organizationName} — ${brand.departmentFullName}`}
          className="relative h-10 w-auto object-contain"
        />

        <div className="relative max-w-lg">
          <h1 className="font-display text-display-lg font-bold leading-[1.05] text-white">
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
          <h2 className="font-display text-display-sm font-semibold text-ink">Entrar</h2>
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
