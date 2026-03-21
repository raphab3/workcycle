import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/Button';

import { pageStyles } from './styles';

export function NotFoundPage() {
  return (
    <main className={pageStyles.container}>
      <span className={pageStyles.badge}>404</span>
      <h1 className={pageStyles.title}>Pagina nao encontrada</h1>
      <p className={pageStyles.description}>
        A rota que voce tentou acessar ainda nao existe nesta base inicial.
      </p>
      <Button asChild>
        <Link to="/">Voltar para o inicio</Link>
      </Button>
    </main>
  );
}