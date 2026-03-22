'use client';

import { BarChart3, CalendarDays, FolderKanban, LayoutDashboard, ListTodo } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';

import { cn } from '@/shared/utils/cn';

import { appNavigationStyles } from './styles';

export const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hoje', label: 'Hoje', icon: CalendarDays },
  { href: '/semana', label: 'Semana', icon: BarChart3 },
  { href: '/tarefas', label: 'Tarefas', icon: ListTodo },
  { href: '/projetos', label: 'Projetos', icon: FolderKanban },
] as const satisfies ReadonlyArray<{ href: Route; label: string; icon: typeof CalendarDays }>;

interface AppNavigationProps {
  variant?: 'header' | 'sidebar';
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function AppNavigation({ variant = 'header', collapsed = false, onNavigate }: AppNavigationProps) {
  const pathname = usePathname();
  const isSidebar = variant === 'sidebar';

  return (
    <nav aria-label="Navegacao principal" className={cn(appNavigationStyles.nav, isSidebar ? appNavigationStyles.navSidebar : appNavigationStyles.navHeader)}>
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        const isDashboardItem = item.href === '/dashboard';
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            onClick={onNavigate}
            className={cn(
              appNavigationStyles.link,
              isSidebar ? appNavigationStyles.linkSidebar : appNavigationStyles.linkHeader,
              isDashboardItem && (isSidebar ? appNavigationStyles.linkSidebarPrimary : appNavigationStyles.linkHeaderPrimary),
              collapsed && isSidebar && appNavigationStyles.linkSidebarCollapsed,
              isActive && (isSidebar
                ? (isDashboardItem ? appNavigationStyles.linkSidebarPrimaryActive : appNavigationStyles.linkSidebarActive)
                : (isDashboardItem ? appNavigationStyles.linkHeaderPrimaryActive : appNavigationStyles.linkHeaderActive)),
            )}
          >
            <Icon className={cn(appNavigationStyles.icon, isActive && appNavigationStyles.iconActive)} aria-hidden="true" />
            <span className={cn(collapsed && isSidebar && 'sr-only')}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}