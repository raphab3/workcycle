'use client';

import { CalendarClock, Link2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { useAuthStatusQuery } from '@/modules/auth/queries/useAuthStatusQuery';
import { useGoogleAccountsQuery } from '@/modules/auth/queries/useGoogleAccountsQuery';
import { authService } from '@/modules/auth/services/authService';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { Button } from '@/shared/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { StateNotice } from '@/shared/components/StateNotice';

import { authSettingsWorkspaceStyles } from './styles';

export function AuthSettingsWorkspace() {
  const searchParams = useSearchParams();
  const session = useAuthStore((state) => state.session);
  const authStatusQuery = useAuthStatusQuery();
  const googleAccountsQuery = useGoogleAccountsQuery({ enabled: Boolean(session) });

  async function handleLinkGoogle() {
    const response = await authService.getGoogleLinkUrl();

    window.location.assign(response.url);
  }

  if (!session) {
    return null;
  }

  const googleAccounts = googleAccountsQuery.data ?? [];
  const googleWasLinkedNow = searchParams?.get('google') === 'linked';

  return (
    <div className={authSettingsWorkspaceStyles.container}>
      <SectionIntro
        eyebrow="Configuracoes"
        title="Conta, seguranca e integracao Google"
        description="Quem entrou por email continua operando normalmente e pode conectar o Google depois. Quem entrou por Google tambem enxerga o estado atual da vinculacao."
      />

      {googleWasLinkedNow && (
        <StateNotice
          eyebrow="Google conectado"
          title="Sua conta Google foi vinculada com sucesso"
          description="A sessao atual continua valida e o calendario ja pode ser tratado como extensao da sua conta WorkCycle."
          tone="info"
        />
      )}

      <div className={authSettingsWorkspaceStyles.cardStack}>
        <Card>
          <CardHeader>
            <CardDescription>Perfil</CardDescription>
            <CardTitle>Dados da sessao autenticada</CardTitle>
          </CardHeader>
          <CardContent className={authSettingsWorkspaceStyles.profileList}>
            <div className={authSettingsWorkspaceStyles.row}>
              <div>
                <p className={authSettingsWorkspaceStyles.label}>Nome</p>
                <p className={authSettingsWorkspaceStyles.value}>{session.user.displayName}</p>
              </div>
            </div>
            <div className={authSettingsWorkspaceStyles.row}>
              <div>
                <p className={authSettingsWorkspaceStyles.label}>Email</p>
                <p className={authSettingsWorkspaceStyles.value}>{session.user.email}</p>
              </div>
            </div>
            <div className={authSettingsWorkspaceStyles.row}>
              <div>
                <p className={authSettingsWorkspaceStyles.label}>Origem de auth</p>
                <p className={authSettingsWorkspaceStyles.value}>{session.user.authProvider}</p>
              </div>
            </div>
            <p className={authSettingsWorkspaceStyles.hint}>
              Se a conta nasceu por email, voce pode anexar o Google aqui sem recriar usuario nem perder historico.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Google</CardDescription>
            <CardTitle>Vincular Google a uma conta criada por email</CardTitle>
          </CardHeader>
          <CardContent className={authSettingsWorkspaceStyles.connections}>
            {!authStatusQuery.data?.oauthConfigured && (
              <StateNotice
                eyebrow="OAuth pendente"
                title="A configuracao Google ainda nao foi habilitada no backend"
                description="Assim que as credenciais OAuth estiverem preenchidas no ambiente, o botao abaixo passa a abrir o fluxo de conexao real."
                tone="warning"
              />
            )}

            {googleAccounts.length > 0 ? (
              <div className={authSettingsWorkspaceStyles.connections}>
                {googleAccounts.map((account) => (
                  <div className={authSettingsWorkspaceStyles.row} key={account.id}>
                    <div>
                      <p className={authSettingsWorkspaceStyles.label}>Conta vinculada</p>
                      <p className={authSettingsWorkspaceStyles.value}>{account.displayName}</p>
                      <p className={authSettingsWorkspaceStyles.hint}>{account.email}</p>
                    </div>
                    <CalendarClock aria-hidden="true" className="mt-1 h-5 w-5 text-cyan-700" />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                eyebrow="Nenhuma vinculacao"
                title="Sua conta ainda nao tem Google conectado"
                description="Conecte o Google para habilitar login opcional por OAuth e preparar integracao com calendarios."
                hint="O mesmo usuario continua sendo usado; a conexao so adiciona um provedor complementar."
              />
            )}

            <Button disabled={!authStatusQuery.data?.oauthConfigured} onClick={() => void handleLinkGoogle()} size="lg" type="button">
              <Link2 aria-hidden="true" className="mr-2 h-4.5 w-4.5" />
              Conectar Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}