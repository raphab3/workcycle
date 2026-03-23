'use client';

import { AccountSettingsWorkspace } from '@/modules/auth/components/AccountSettingsWorkspace';
import { GoogleCalendarSettingsWorkspace } from '@/modules/auth/components/GoogleCalendarSettingsWorkspace';

import { authSettingsWorkspaceStyles } from './styles';

interface AuthSettingsWorkspaceProps {
  showIntro?: boolean;
}

export function AuthSettingsWorkspace({ showIntro = true }: AuthSettingsWorkspaceProps) {
  return (
    <div className={authSettingsWorkspaceStyles.container}>
      <AccountSettingsWorkspace showIntro={showIntro} />
      <GoogleCalendarSettingsWorkspace showIntro={false} />
    </div>
  );
}