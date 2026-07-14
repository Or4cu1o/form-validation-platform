import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper text-center">
      <p className="font-display text-display-lg text-ink">404</p>
      <p className="text-ink-muted">A página que você procura não existe.</p>
      <Link to="/">
        <Button variant="secondary">Voltar ao painel</Button>
      </Link>
    </div>
  );
}
