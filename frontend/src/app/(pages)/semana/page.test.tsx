import { render, screen } from '@testing-library/react';

import SemanaRoutePage from './page';

describe('SemanaRoutePage', () => {
  it('renders the weekly balance heading and board headers', () => {
    render(<SemanaRoutePage />);

    expect(screen.getByRole('heading', { name: /Leitura semanal de desvios usando horas previstas e horas ajustadas/i })).toBeInTheDocument();
    expect(screen.getByText('Projeto')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});