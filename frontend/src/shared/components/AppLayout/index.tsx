'use client';

import { Bell, LogOut, Menu, MonitorCog, MoonStar, PanelLeftClose, PanelLeftOpen, Plus, Search, Settings, SunMedium, UserCircle2, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, type ReactNode } from 'react';

import { AppNavigation } from '@/shared/components/AppNavigation/index';
import { useWorkspaceStore } from '@/shared/store/useWorkspaceStore';
import { cn } from '@/shared/utils/cn';
import { designSystemTheme, useTheme } from '@/shared/theme';

import { appLayoutStyles } from './styles';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { themeMode, setThemeMode, toggleThemeMode, meta } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpenPath, setMobileSidebarOpenPath] = useState<string | null>(null);
  const projects = useWorkspaceStore((state) => state.projects);
  const isMobileSidebarOpen = mobileSidebarOpenPath === pathname;
  const activeAllocationPct = useMemo(
    () => projects.filter((project) => project.status === 'active').reduce((total, project) => total + project.allocationPct, 0),
    [projects],
  );

  return (
    <div className={appLayoutStyles.shell}>
      <a className={appLayoutStyles.skipLink} href="#main-content">
        Pular para o conteudo
      </a>

      {isMobileSidebarOpen && <button aria-label="Fechar navegacao" className={appLayoutStyles.backdrop} onClick={() => setMobileSidebarOpenPath(null)} type="button" />}

      <div className={appLayoutStyles.frame}>
        <aside
          className={cn(
            appLayoutStyles.sidebar,
            isMobileSidebarOpen ? appLayoutStyles.sidebarOpen : appLayoutStyles.sidebarClosed,
            isSidebarCollapsed ? appLayoutStyles.sidebarCollapsed : appLayoutStyles.sidebarExpanded,
          )}
        >
          <div className={appLayoutStyles.sidebarInner}>
            <div className={appLayoutStyles.sidebarTop}>
              <div className={cn(appLayoutStyles.brand, isSidebarCollapsed && appLayoutStyles.brandCollapsed)}>
                <div aria-hidden="true" className={appLayoutStyles.brandMark}>W</div>
                {!isSidebarCollapsed && (
                  <div>
                    <p className={appLayoutStyles.brandName}>WorkCycle</p>
                    <p className={appLayoutStyles.brandDescription}>The Architectural Editor</p>
                  </div>
                )}
              </div>

              <button
                aria-label={isSidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
                className={appLayoutStyles.sidebarCollapseButton}
                onClick={() => setIsSidebarCollapsed((currentValue) => !currentValue)}
                type="button"
              >
                {isSidebarCollapsed ? <PanelLeftOpen className="h-4.5 w-4.5" aria-hidden="true" /> : <PanelLeftClose className="h-4.5 w-4.5" aria-hidden="true" />}
              </button>
            </div>

            <div className={appLayoutStyles.sidebarBody}>
              <AppNavigation variant="sidebar" collapsed={isSidebarCollapsed} onNavigate={() => setMobileSidebarOpenPath(null)} />

              <Link className={cn(appLayoutStyles.primaryAction, isSidebarCollapsed && appLayoutStyles.primaryActionCollapsed)} href="/hoje#cycle-available-hours">
                <Plus className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                {!isSidebarCollapsed && <span>Adicionar Horas</span>}
              </Link>
            </div>

            <div className={appLayoutStyles.sidebarFooter}>
              <div className={cn(appLayoutStyles.themePanel, isSidebarCollapsed && appLayoutStyles.themePanelCollapsed)}>
                {!isSidebarCollapsed && (
                  <div className={appLayoutStyles.themeCopy}>
                    <p className={appLayoutStyles.themeLabel}>Tema</p>
                    <p className={appLayoutStyles.themeDescription}>{meta.description}</p>
                  </div>
                )}
                <div className={cn(appLayoutStyles.themeControls, isSidebarCollapsed && appLayoutStyles.themeControlsCollapsed)}>
                  <button
                    aria-label="Usar tema claro"
                    aria-pressed={themeMode === 'light'}
                    className={cn(appLayoutStyles.themeButton, themeMode === 'light' && appLayoutStyles.themeButtonActive)}
                    onClick={() => setThemeMode('light')}
                    type="button"
                  >
                    <SunMedium className="h-4.5 w-4.5" aria-hidden="true" />
                    {!isSidebarCollapsed && <span>{designSystemTheme.modes.light.label}</span>}
                  </button>
                  <button
                    aria-label="Usar tema escuro"
                    aria-pressed={themeMode === 'dark'}
                    className={cn(appLayoutStyles.themeButton, themeMode === 'dark' && appLayoutStyles.themeButtonActive)}
                    onClick={() => setThemeMode('dark')}
                    type="button"
                  >
                    <MoonStar className="h-4.5 w-4.5" aria-hidden="true" />
                    {!isSidebarCollapsed && <span>{designSystemTheme.modes.dark.label}</span>}
                  </button>
                </div>
              </div>

              <div className={appLayoutStyles.secondaryActions}>
                <button className={cn(appLayoutStyles.secondaryAction, isSidebarCollapsed && appLayoutStyles.secondaryActionCollapsed)} type="button">
                  <Settings className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                  {!isSidebarCollapsed && <span>Configuracoes</span>}
                </button>
                <button className={cn(appLayoutStyles.secondaryAction, isSidebarCollapsed && appLayoutStyles.secondaryActionCollapsed)} type="button">
                  <LogOut className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                  {!isSidebarCollapsed && <span>Sair</span>}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className={appLayoutStyles.mainColumn}>
          <header className={appLayoutStyles.topBar}>
            <div className={appLayoutStyles.topBarContent}>
              <div className={appLayoutStyles.headerLeft}>
                <button aria-label="Abrir navegacao" className={appLayoutStyles.mobileMenuButton} onClick={() => setMobileSidebarOpenPath(pathname)} type="button">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>

                <div className={appLayoutStyles.headerMetric}>
                  <span className={appLayoutStyles.headerMetricLabel}>Alocacao Total: {activeAllocationPct}%</span>
                </div>
              </div>

              <AppNavigation variant="header" />

              <div className={appLayoutStyles.headerRight}>
                <label className={appLayoutStyles.searchField}>
                  <Search className="h-4 w-4" aria-hidden="true" />
                  <input aria-label="Buscar projeto" className={appLayoutStyles.searchInput} placeholder="Buscar projeto..." type="search" />
                </label>

                <button aria-label={meta.actionLabel} className={appLayoutStyles.iconButton} onClick={toggleThemeMode} type="button">
                  <MonitorCog className="h-4.5 w-4.5" aria-hidden="true" />
                </button>
                <button aria-label="Notificacoes" className={appLayoutStyles.iconButton} type="button">
                  <Bell className="h-4.5 w-4.5" aria-hidden="true" />
                </button>
                <button aria-label="Conta do usuario" className={appLayoutStyles.iconButton} type="button">
                  <UserCircle2 className="h-4.5 w-4.5" aria-hidden="true" />
                </button>
                {isMobileSidebarOpen && (
                  <button aria-label="Fechar menu lateral" className={appLayoutStyles.iconButtonMobileOnly} onClick={() => setMobileSidebarOpenPath(null)} type="button">
                    <X className="h-4.5 w-4.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </header>

          <main className={appLayoutStyles.content} id="main-content" tabIndex={-1}>{children}</main>
        </div>
      </div>
    </div>
  );
}