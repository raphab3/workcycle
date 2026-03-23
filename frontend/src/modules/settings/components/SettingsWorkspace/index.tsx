'use client';

import { BellRing, CalendarClock } from 'lucide-react';
import { useId, useState } from 'react';

import { AuthSettingsWorkspace } from '@/modules/auth';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { cn } from '@/shared/utils/cn';

import { NotificationsSettingsWorkspace } from '../NotificationsSettingsWorkspace';

import { settingsWorkspaceStyles } from './styles';

type SettingsTabId = 'notifications' | 'google-calendar';

const settingsTabs: Array<{
  description: string;
  icon: typeof BellRing;
  id: SettingsTabId;
  label: string;
}> = [
  {
    description: 'Timezone, revisao diaria, preview e capacidade do motor operacional.',
    icon: BellRing,
    id: 'notifications',
    label: 'Notificacoes',
  },
  {
    description: 'Contas conectadas, reconexao OAuth e calendarios incluidos na agenda.',
    icon: CalendarClock,
    id: 'google-calendar',
    label: 'Google Calendar',
  },
];

export function SettingsWorkspace() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('notifications');
  const tabListId = useId();

  return (
    <div className={settingsWorkspaceStyles.container}>
      <SectionIntro
        eyebrow="Configuracoes"
        title="Centro de configuracoes"
        description="Use abas separadas para ajustar notificacoes operacionais e a integracao com Google Calendar sem comprimir o restante da tela."
      />

      <div className={settingsWorkspaceStyles.shell}>
        <div aria-label="Areas de configuracao" className={settingsWorkspaceStyles.tabsList} id={tabListId} role="tablist">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const tabId = `${tabListId}-${tab.id}`;
            const panelId = `${tabId}-panel`;

            return (
              <button
                aria-controls={panelId}
                aria-selected={isActive}
                className={cn(settingsWorkspaceStyles.tabButton, isActive && settingsWorkspaceStyles.tabButtonActive)}
                id={tabId}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                type="button"
              >
                <span className={settingsWorkspaceStyles.tabIconWrap}>
                  <Icon aria-hidden="true" className="h-4.5 w-4.5" />
                </span>
                <span className={settingsWorkspaceStyles.tabCopy}>
                  <span className={settingsWorkspaceStyles.tabLabel}>{tab.label}</span>
                  <span className={settingsWorkspaceStyles.tabDescription}>{tab.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        {activeTab === 'notifications' ? (
          <section
            aria-labelledby={`${tabListId}-notifications`}
            className={settingsWorkspaceStyles.panel}
            id={`${tabListId}-notifications-panel`}
            role="tabpanel"
          >
            <NotificationsSettingsWorkspace showIntro={false} />
          </section>
        ) : (
          <section
            aria-labelledby={`${tabListId}-google-calendar`}
            className={settingsWorkspaceStyles.panel}
            id={`${tabListId}-google-calendar-panel`}
            role="tabpanel"
          >
            <AuthSettingsWorkspace showIntro={false} />
          </section>
        )}
      </div>
    </div>
  );
}