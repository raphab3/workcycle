import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginWorkspace } from './index';

const signInMock = vi.fn();
const useAuthStatusQueryMock = vi.fn();
const useGoogleAccountsQueryMock = vi.fn();

vi.mock('@/modules/auth/queries/useAuthStatusQuery', () => ({
  useAuthStatusQuery: () => useAuthStatusQueryMock(),
}));

vi.mock('@/modules/auth/queries/useGoogleAccountsQuery', () => ({
  useGoogleAccountsQuery: () => useGoogleAccountsQueryMock(),
}));

vi.mock('@/modules/auth/services/authService', () => ({
  authService: {
    getGoogleLoginUrl: () => 'http://localhost:3333/api/auth/google',
  },
}));

vi.mock('@/modules/auth/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: { signIn: typeof signInMock }) => unknown) => selector({ signIn: signInMock }),
}));

describe('LoginWorkspace', () => {
  beforeEach(() => {
    signInMock.mockReset();
    useAuthStatusQueryMock.mockReset();
    useGoogleAccountsQueryMock.mockReset();

    useAuthStatusQueryMock.mockReturnValue({
      data: { oauthConfigured: false, provider: 'google', status: 'pending' },
      isError: false,
    });

    useGoogleAccountsQueryMock.mockReturnValue({
      data: [],
      isError: false,
    });
  });

  it('logs into the local fallback flow', async () => {
    const user = userEvent.setup();

    render(<LoginWorkspace />);

    await user.click(screen.getByRole('button', { name: 'Entrar em modo local' }));

    expect(signInMock).toHaveBeenCalledWith({
      displayName: 'Workspace Local',
      email: 'local@workcycle.dev',
      provider: 'local',
      source: 'local_fallback',
    });
  });

  it('logs into a connected google account when available', async () => {
    const user = userEvent.setup();

    useGoogleAccountsQueryMock.mockReturnValue({
      data: [
        {
          displayName: 'Rafa Barros',
          email: 'rafa@example.com',
          id: 'acc-1',
          isActive: true,
          tokenExpiresAt: '2026-03-23T10:00:00.000Z',
          updatedAt: '2026-03-22T10:00:00.000Z',
        },
      ],
      isError: false,
    });

    render(<LoginWorkspace />);

    await user.click(screen.getByRole('button', { name: /Rafa Barros/i }));

    expect(signInMock).toHaveBeenCalledWith({
      accountId: 'acc-1',
      displayName: 'Rafa Barros',
      email: 'rafa@example.com',
      provider: 'google',
      source: 'connected_account',
    });
  });
});