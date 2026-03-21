import Link from 'next/link';

import { Button } from '@/shared/components/Button';

import { notFoundStateStyles } from './styles';

export function NotFoundState() {
  return (
    <main className={notFoundStateStyles.container}>
      <span className={notFoundStateStyles.badge}>404</span>
      <h1 className={notFoundStateStyles.title}>Pagina nao encontrada</h1>
      <p className={notFoundStateStyles.description}>
        A rota que voce tentou acessar ainda nao existe nesta base inicial.
      </p>
      <Button asChild>
        <Link href="/hoje">Voltar para o inicio</Link>
      </Button>
    </main>
  );
}