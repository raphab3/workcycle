import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginWorkspace } from './index';

const signInMock = vi.fn();
const loginMutateAsyncMock = vi.fn();
const registerMutateAsyncMock = vi.fn();
const replaceMock = vi.fn();
let searchParamsMock = new URLSearchParams();

vi.mock('@/modules/auth/queries/useLoginMutation', () => ({
  useLoginMutation: () => ({
    isError: false,
    isPending: false,
    mutateAsync: loginMutateAsyncMock,
  }),
}));

vi.mock('@/modules/auth/queries/useRegisterMutation', () => ({
  useRegisterMutation: () => ({
    isError: false,
    isPending: false,
    mutateAsync: registerMutateAsyncMock,
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
  useSearchParams: () => searchParamsMock,
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
    searchParamsMock = new URLSearchParams();
    signInMock.mockReset();
    loginMutateAsyncMock.mockReset();
    registerMutateAsyncMock.mockReset();
    replaceMock.mockReset();
  });

  it('logs into the email flow', async () => {
    const user = userEvent.setup();

    loginMutateAsyncMock.mockResolvedValue({
      token: 'auth-token',
      user: {
        authProvider: 'email',
        displayName: 'Rafa',
        email: 'rafa@example.com',
        hasGoogleLinked: false,
        hasPassword: true,
        id: 'user-1',
      },
    });

    render(<LoginWorkspace />);

    await user.type(screen.getByPlaceholderText('voce@workcycle.dev'), 'rafa@example.com');
    await user.type(screen.getByPlaceholderText('Digite sua senha'), '12345678');
    await user.click(screen.getByRole('button', { name: 'Entrar com email' }));

    expect(signInMock).toHaveBeenCalledWith({
      token: 'auth-token',
      user: {
        authProvider: 'email',
        displayName: 'Rafa',
        email: 'rafa@example.com',
        hasGoogleLinked: false,
        hasPassword: true,
        id: 'user-1',
      },
    });
    expect(replaceMock).toHaveBeenCalledWith('/dashboard');
  });

  it('registers a new email account', async () => {
    const user = userEvent.setup();

    registerMutateAsyncMock.mockResolvedValue({
      token: 'auth-token',
      user: {
        authProvider: 'email',
        displayName: 'Rafa Barros',
        email: 'rafa@example.com',
        hasGoogleLinked: false,
        hasPassword: true,
        id: 'user-2',
      },
    });

    render(<LoginWorkspace />);

    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    await user.type(screen.getByPlaceholderText('Seu nome no workspace'), 'Rafa Barros');
    await user.type(screen.getByPlaceholderText('voce@workcycle.dev'), 'rafa@example.com');
    await user.type(screen.getByPlaceholderText('Crie uma senha forte'), '12345678');
    await user.click(screen.getByRole('button', { name: 'Criar conta com email' }));

    expect(signInMock).toHaveBeenCalledWith({
      token: 'auth-token',
      user: {
        authProvider: 'email',
        displayName: 'Rafa Barros',
        email: 'rafa@example.com',
        hasGoogleLinked: false,
        hasPassword: true,
        id: 'user-2',
      },
    });
    expect(replaceMock).toHaveBeenCalledWith('/dashboard');
  });

  it('clears the logout marker before processing auth params again', () => {
    searchParamsMock = new URLSearchParams('logout=1&authToken=stale-token&authUserId=user-1&authEmail=rafa@example.com&authDisplayName=Rafa&authProvider=email');

    render(<LoginWorkspace />);

    expect(signInMock).not.toHaveBeenCalled();
    expect(replaceMock).toHaveBeenCalledWith('/login');
  });
});