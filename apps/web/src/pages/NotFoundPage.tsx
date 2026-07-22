import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-5 overflow-hidden bg-console px-6 text-center text-white">
      <div className="blueprint-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <p className="relative font-display text-display-lg font-bold text-white/90">404</p>
      <p className="relative max-w-sm text-sm text-white/60">
        A página que você procura não existe ou foi movida. Volte ao painel para continuar.
      </p>
      <Link to="/" className="relative">
        <Button variant="secondary" className="bg-white text-ink hover:bg-white/90">
          Voltar ao painel
        </Button>
      </Link>
    </div>
  );
}
