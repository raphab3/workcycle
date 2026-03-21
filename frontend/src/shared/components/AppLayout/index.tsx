import type { ReactNode } from 'react';

import { AppNavigation } from '@/shared/components/AppNavigation/index';

import { appLayoutStyles } from './styles';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={appLayoutStyles.shell}>
      <a className={appLayoutStyles.skipLink} href="#main-content">
        Pular para o conteudo
      </a>

      <header className={appLayoutStyles.topBar}>
        <div className={appLayoutStyles.topBarContent}>
          <div className={appLayoutStyles.brand}>
            <div aria-hidden="true" className={appLayoutStyles.brandMark}>W</div>
            <div>
              <p className={appLayoutStyles.brandName}>WorkCycle</p>
              <p className={appLayoutStyles.brandDescription}>frontend scaffold</p>
            </div>
          </div>

          <AppNavigation />

          <div aria-live="polite" className={appLayoutStyles.status} role="status">Cycle 6 · hardening UX</div>
        </div>
      </header>

      <div className={appLayoutStyles.content} id="main-content" tabIndex={-1}>{children}</div>
    </div>
  );
}