import { DashboardWorkspace } from '@/modules/dashboard';

import { pageStyles } from './styles';

export default function DashboardRoutePage() {
  return (
    <main className={pageStyles.container}>
      <DashboardWorkspace />
    </main>
  );
}