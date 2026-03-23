'use client';

import { BellRing, CalendarClock, ShieldCheck } from 'lucide-react';
import { useId, useState } from 'react';

import { AccountSettingsWorkspace, GoogleCalendarSettingsWorkspace } from '@/modules/auth';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { cn } from '@/shared/utils/cn';

import { NotificationsSettingsWorkspace } from '../NotificationsSettingsWorkspace';

import { settingsWorkspaceStyles } from './styles';

type SettingsTabId = 'notifications' | 'account' | 'google-calendar';

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
    description: 'Sessao autenticada, origem do login e separacao entre acesso a conta e integracoes externas.',
    icon: ShieldCheck,
    id: 'account',
    label: 'Conta e acesso',
  },
  {
    description: 'Contas conectadas, reconexao OAuth e espaco dedicado para anexar mais contas Google Calendar.',
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
        description="Use abas separadas para ajustar notificacoes, revisar a conta autenticada e administrar o Google Calendar sem misturar login com integracoes operacionais."
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
        ) : activeTab === 'account' ? (
          <section
            aria-labelledby={`${tabListId}-account`}
            className={settingsWorkspaceStyles.panel}
            id={`${tabListId}-account-panel`}
            role="tabpanel"
          >
            <AccountSettingsWorkspace showIntro={false} />
          </section>
        ) : (
          <section
            aria-labelledby={`${tabListId}-google-calendar`}
            className={settingsWorkspaceStyles.panel}
            id={`${tabListId}-google-calendar-panel`}
            role="tabpanel"
          >
            <GoogleCalendarSettingsWorkspace showIntro={false} />
          </section>
        )}
      </div>
    </div>
  );
}