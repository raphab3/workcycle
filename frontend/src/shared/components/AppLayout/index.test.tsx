import { render, screen } from '@testing-library/react';

import { AppLayout } from './index';

describe('AppLayout', () => {
  it('renders the brand and nested content', () => {
    render(
      <AppLayout>
        <div>Conteudo do ciclo</div>
      </AppLayout>,
    );

    expect(screen.getByText('WorkCycle')).toBeInTheDocument();
    expect(screen.getByText('Conteudo do ciclo')).toBeInTheDocument();
  });
});