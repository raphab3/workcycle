import type { ReactNode } from 'react';

import { AppNavigation } from '@/shared/components/AppNavigation/index';

import { appLayoutStyles } from './styles';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={appLayoutStyles.shell}>
      <header className={appLayoutStyles.topBar}>
        <div className={appLayoutStyles.topBarContent}>
          <div className={appLayoutStyles.brand}>
            <div className={appLayoutStyles.brandMark}>W</div>
            <div>
              <p className={appLayoutStyles.brandName}>WorkCycle</p>
              <p className={appLayoutStyles.brandDescription}>frontend scaffold</p>
            </div>
          </div>

          <AppNavigation />

          <div className={appLayoutStyles.status}>Cycle 1 em andamento</div>
        </div>
      </header>

      <div className={appLayoutStyles.content}>{children}</div>
    </div>
  );
}