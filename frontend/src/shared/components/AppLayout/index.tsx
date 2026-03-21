import { Outlet } from 'react-router-dom';

import { appLayoutStyles } from './styles';

export function AppLayout() {
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
        </div>
      </header>

      <div className={appLayoutStyles.content}>
        <Outlet />
      </div>
    </div>
  );
}