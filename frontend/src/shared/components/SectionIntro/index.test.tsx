import { render, screen } from '@testing-library/react';

import { SectionIntro } from './index';

describe('SectionIntro', () => {
  it('renders eyebrow, title and description', () => {
    render(<SectionIntro eyebrow="Hoje" title="Planejamento do ciclo" description="Defina horas e acompanhe a escala." />);

    expect(screen.getByText('Hoje')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Planejamento do ciclo' })).toBeInTheDocument();
    expect(screen.getByText('Defina horas e acompanhe a escala.')).toBeInTheDocument();
  });
});