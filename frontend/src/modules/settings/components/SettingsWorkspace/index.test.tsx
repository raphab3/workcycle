import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SettingsWorkspace } from './index';

vi.mock('@/modules/auth', () => ({
  AuthSettingsWorkspace: ({ showIntro }: { showIntro?: boolean }) => (
    <div data-show-intro={String(showIntro)}>
      Google Calendar content
    </div>
  ),
}));

vi.mock('../NotificationsSettingsWorkspace', () => ({
  NotificationsSettingsWorkspace: ({ showIntro }: { showIntro?: boolean }) => (
    <div data-show-intro={String(showIntro)}>
      Notifications content
    </div>
  ),
}));

describe('SettingsWorkspace', () => {
  it('renders notifications as the default tab and switches to Google Calendar', async () => {
    const user = userEvent.setup();

    render(<SettingsWorkspace />);

    expect(screen.getByRole('heading', { name: 'Centro de configuracoes' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Notificacoes/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Notifications content')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /Google Calendar/i }));

    expect(screen.getByRole('tab', { name: /Google Calendar/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Google Calendar content')).toBeInTheDocument();
  });
});