import { vi } from 'vitest';

const redirectMock = vi.fn();

vi.mock('next/navigation', () => ({
  redirect: (target: string) => redirectMock(target),
}));

describe('RootPage', () => {
  it('redirects the product entry to the dashboard', async () => {
    const { default: RootPage } = await import('./page');

    RootPage();

    expect(redirectMock).toHaveBeenCalledWith('/dashboard');
  });
});