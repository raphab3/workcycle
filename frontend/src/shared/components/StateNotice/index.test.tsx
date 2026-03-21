import { render, screen } from '@testing-library/react';

import { StateNotice } from './index';

describe('StateNotice', () => {
  it('renders an accessible status notice', () => {
    render(
      <StateNotice
        eyebrow="Estado local"
        title="Dados ainda nao persistidos"
        description="As alteracoes ficam apenas no mock atual."
      />,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Dados ainda nao persistidos')).toBeInTheDocument();
  });
});