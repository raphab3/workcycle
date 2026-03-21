import { render, screen } from '@testing-library/react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './index';

describe('Card', () => {
  it('renders title, description and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Resumo</CardDescription>
          <CardTitle>Horas da semana</CardTitle>
        </CardHeader>
        <CardContent>Conteudo principal</CardContent>
      </Card>,
    );

    expect(screen.getByText('Resumo')).toBeInTheDocument();
    expect(screen.getByText('Horas da semana')).toBeInTheDocument();
    expect(screen.getByText('Conteudo principal')).toBeInTheDocument();
  });
});