'use client';

import { useEffect, type ReactNode } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { AppLayout } from '@/shared/components/AppLayout';

import { authShellStyles } from './styles';

interface AuthShellProps {
  children: ReactNode;
}

interface AuthShellSplashProps {
  description: string;
  title: string;
}

function AuthShellSplash({ description, title }: AuthShellSplashProps) {
  return (
    <div className={authShellStyles.viewport}>
      <section className={authShellStyles.panel}>
        <p className={authShellStyles.eyebrow}>Workspace access</p>
        <h1 className={authShellStyles.title}>{title}</h1>
        <p className={authShellStyles.description}>{description}</p>
      </section>
    </div>
  );
}

export function AuthShell({ children }: AuthShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);

  const isLoginRoute = pathname === '/login';
  const isAuthenticated = sessionStatus === 'authenticated';

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated && !isLoginRoute) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && isLoginRoute) {
      router.replace('/dashboard');
    }
  }, [hasHydrated, isAuthenticated, isLoginRoute, router]);

  if (!hasHydrated || sessionStatus === 'loading') {
    return (
      <AuthShellSplash
        title="Preparando seu acesso"
        description="Estamos recuperando a sessao local e organizando a entrada no workspace."
      />
    );
  }

  if (!isAuthenticated && !isLoginRoute) {
    return (
      <AuthShellSplash
        title="Redirecionando para o login"
        description="O workspace exige autenticacao ativa antes de liberar os fluxos operacionais."
      />
    );
  }

  if (isAuthenticated && isLoginRoute) {
    return (
      <AuthShellSplash
        title="Sessao ativa encontrada"
        description="Seu acesso ja esta liberado. Estamos abrindo o cockpit principal."
      />
    );
  }

  if (isLoginRoute) {
    return <>{children}</>;
  }

  return <AppLayout>{children}</AppLayout>;
}