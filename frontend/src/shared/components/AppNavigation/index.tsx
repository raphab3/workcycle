'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';

import { cn } from '@/shared/utils/cn';

import { appNavigationStyles } from './styles';

const navigationItems = [
  { href: '/hoje', label: 'Hoje' },
  { href: '/semana', label: 'Semana' },
  { href: '/tarefas', label: 'Tarefas' },
  { href: '/projetos', label: 'Projetos' },
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegacao principal" className={appNavigationStyles.nav}>
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(appNavigationStyles.link, isActive && appNavigationStyles.linkActive)}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}