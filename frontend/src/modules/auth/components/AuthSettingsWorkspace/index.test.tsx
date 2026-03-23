import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AuthSettingsWorkspace } from './index';

vi.mock('@/modules/auth/components/AccountSettingsWorkspace', () => ({
  AccountSettingsWorkspace: ({ showIntro }: { showIntro?: boolean }) => (
    <div data-show-intro={String(showIntro)}>Account settings content</div>
  ),
}));

vi.mock('@/modules/auth/components/GoogleCalendarSettingsWorkspace', () => ({
  GoogleCalendarSettingsWorkspace: ({ showIntro }: { showIntro?: boolean }) => (
    <div data-show-intro={String(showIntro)}>Google Calendar settings content</div>
  ),
}));

describe('AuthSettingsWorkspace', () => {
  it('composes account and Google Calendar settings workspaces', () => {
    render(<AuthSettingsWorkspace />);

    expect(screen.getByText('Account settings content')).toBeInTheDocument();
    expect(screen.getByText('Google Calendar settings content')).toBeInTheDocument();
  });
});