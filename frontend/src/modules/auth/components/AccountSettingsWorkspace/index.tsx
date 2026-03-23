'use client';

import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { SectionIntro } from '@/shared/components/SectionIntro';

import { accountSettingsWorkspaceStyles } from './styles';

interface AccountSettingsWorkspaceProps {
  showIntro?: boolean;
}

export function AccountSettingsWorkspace({ showIntro = true }: AccountSettingsWorkspaceProps) {
  const session = useAuthStore((state) => state.session);

  if (!session) {
    return (
      <EmptyState
        eyebrow="Sessao indisponivel"
        title="Nao foi possivel identificar a sessao autenticada"
        description="Ajustes de conta e acesso exigem uma sessao valida antes de expor os provedores conectados."
      />
    );
  }

  return (
    <div className={accountSettingsWorkspaceStyles.container}>
      {showIntro && (
        <SectionIntro
          eyebrow="Conta"
          title="Conta e acesso"
          description="Aqui ficam os dados da sessao autenticada e a origem do login. A integracao com Google Calendar agora vive em uma aba separada."
        />
      )}

      <Card>
        <CardHeader>
          <CardDescription>Perfil</CardDescription>
          <CardTitle>Dados da sessao autenticada</CardTitle>
        </CardHeader>
        <CardContent className={accountSettingsWorkspaceStyles.profileList}>
          <div className={accountSettingsWorkspaceStyles.row}>
            <div>
              <p className={accountSettingsWorkspaceStyles.label}>Nome</p>
              <p className={accountSettingsWorkspaceStyles.value}>{session.user.displayName}</p>
            </div>
          </div>
          <div className={accountSettingsWorkspaceStyles.row}>
            <div>
              <p className={accountSettingsWorkspaceStyles.label}>Email</p>
              <p className={accountSettingsWorkspaceStyles.value}>{session.user.email}</p>
            </div>
          </div>
          <div className={accountSettingsWorkspaceStyles.row}>
            <div>
              <p className={accountSettingsWorkspaceStyles.label}>Origem de auth</p>
              <p className={accountSettingsWorkspaceStyles.value}>{session.user.authProvider}</p>
            </div>
          </div>
          <p className={accountSettingsWorkspaceStyles.hint}>
            O login continua independente das integracoes operacionais. Voce pode entrar por email e conectar calendarios Google depois, sem recriar usuario.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}