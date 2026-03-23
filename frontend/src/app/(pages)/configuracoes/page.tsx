import { AuthSettingsWorkspace } from '@/modules/auth';
import { NotificationsSettingsWorkspace } from '@/modules/settings';

export default function SettingsRoutePage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8">
      <NotificationsSettingsWorkspace />
      <AuthSettingsWorkspace />
    </div>
  );
}