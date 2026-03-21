import { render, screen } from '@testing-library/react';

import HojeRoutePage from './page';

describe('HojeRoutePage', () => {
  it('renders the kickoff copy for the today route', () => {
    render(<HojeRoutePage />);

    expect(screen.getByText(/Kickoff do projeto/i)).toBeInTheDocument();
    expect(screen.getByText(/Base React \+ TypeScript pronta/i)).toBeInTheDocument();
  });
});