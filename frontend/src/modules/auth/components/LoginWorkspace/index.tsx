'use client';

import { ArrowRight, CalendarClock, ShieldCheck, Sparkles, Workflow } from 'lucide-react';

import { useAuthStatusQuery } from '@/modules/auth/queries/useAuthStatusQuery';
import { useGoogleAccountsQuery } from '@/modules/auth/queries/useGoogleAccountsQuery';
import { authService } from '@/modules/auth/services/authService';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import type { GoogleAccountDTO } from '@/modules/auth/types';
import { Button } from '@/shared/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { SectionIntro } from '@/shared/components/SectionIntro';
import { StateNotice } from '@/shared/components/StateNotice';

import { loginWorkspaceStyles } from './styles';

const featureCards = [
  {
    description: 'Conecte contas Google, consolide calendarios e traga reunioes para a mesma operacao do ciclo.',
    icon: CalendarClock,
    title: 'Calendario conectado',
  },
  {
    description: 'A sessao local persiste no navegador para liberar o cockpit assim que voce voltar ao workspace.',
    icon: ShieldCheck,
    title: 'Acesso persistido',
  },
  {
    description: 'Auth, agenda e contabilizacao passam a dividir o mesmo contexto em vez de espalhar estado pela UI.',
    icon: Workflow,
    title: 'Fluxo unificado',
  },
] as const;

function buildConnectedSession(account: GoogleAccountDTO) {
  return {
    accountId: account.id,
    displayName: account.displayName,
    email: account.email,
    provider: 'google' as const,
    source: 'connected_account' as const,
  };
}

export function LoginWorkspace() {
  const signIn = useAuthStore((state) => state.signIn);
  const authStatusQuery = useAuthStatusQuery();
  const googleAccountsQuery = useGoogleAccountsQuery();

  const authStatus = authStatusQuery.data;
  const googleAccounts = googleAccountsQuery.data ?? [];
  const oauthConfigured = authStatus?.oauthConfigured ?? false;

  function handleGoogleLogin() {
    window.location.assign(authService.getGoogleLoginUrl());
  }

  function handleLocalLogin() {
    signIn({
      displayName: 'Workspace Local',
      email: 'local@workcycle.dev',
      provider: 'local',
      source: 'local_fallback',
    });
  }

  function handleConnectedAccountLogin(account: GoogleAccountDTO) {
    signIn(buildConnectedSession(account));
  }

  return (
    <div className={loginWorkspaceStyles.shell}>
      <div className={loginWorkspaceStyles.frame}>
        <section className={loginWorkspaceStyles.stack}>
          <div className={loginWorkspaceStyles.hero}>
            <div aria-hidden="true" className={loginWorkspaceStyles.heroGlow} />
            <div className={loginWorkspaceStyles.heroCopy}>
              <p className={loginWorkspaceStyles.eyebrow}>WorkCycle access layer</p>
              <h1 className={loginWorkspaceStyles.title}>Entre no cockpit operacional sem quebrar o contexto do seu dia.</h1>
              <p className={loginWorkspaceStyles.description}>
                O login agora organiza acesso, calendario e identidade do workspace em um fluxo unico. Quando houver conta Google conectada,
                ela vira a porta de entrada. Enquanto o OAuth backend fecha, o frontend continua liberando um modo local controlado.
              </p>
            </div>

            <div className={loginWorkspaceStyles.metrics}>
              <div className={loginWorkspaceStyles.metricCard}>
                <span className={loginWorkspaceStyles.metricLabel}>provider alvo</span>
                <strong className={loginWorkspaceStyles.metricValue}>{authStatus?.provider ?? 'google'}</strong>
              </div>
              <div className={loginWorkspaceStyles.metricCard}>
                <span className={loginWorkspaceStyles.metricLabel}>contas conectadas</span>
                <strong className={loginWorkspaceStyles.metricValue}>{googleAccounts.length}</strong>
              </div>
              <div className={loginWorkspaceStyles.metricCard}>
                <span className={loginWorkspaceStyles.metricLabel}>estado oauth</span>
                <strong className={loginWorkspaceStyles.metricValue}>{authStatus?.status ?? 'carregando'}</strong>
              </div>
            </div>
          </div>

          <div className={loginWorkspaceStyles.featureGrid}>
            {featureCards.map(({ description, icon: Icon, title }) => (
              <article className={loginWorkspaceStyles.featureCard} key={title}>
                <Icon aria-hidden="true" className="h-5 w-5 text-cyan-700" />
                <h2 className={loginWorkspaceStyles.featureTitle}>{title}</h2>
                <p className={loginWorkspaceStyles.featureDescription}>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={loginWorkspaceStyles.stack}>
          <Card>
            <CardHeader>
              <CardDescription>Autenticacao</CardDescription>
              <CardTitle>Escolha como entrar no workspace</CardTitle>
            </CardHeader>
            <CardContent className={loginWorkspaceStyles.stack}>
              <SectionIntro
                eyebrow="Workspace access"
                title="Liberacao por conta conectada ou acesso local"
                description="As contas Google ja vinculadas aparecem como atalho de entrada. Se o backend ainda estiver sem OAuth pronto, o acesso local segura o frontend operavel."
              />

              {authStatusQuery.isError && (
                <StateNotice
                  eyebrow="Falha na leitura do backend"
                  title="Nao foi possivel verificar o estado da autenticacao"
                  description="O frontend continua funcional com o modo local, mas a conexao com o backend de auth precisa ser retomada para liberar o fluxo Google."
                  tone="warning"
                />
              )}

              {!authStatusQuery.isError && !oauthConfigured && (
                <StateNotice
                  eyebrow="OAuth pendente"
                  title="Google login ainda depende da conclusao do backend"
                  description="O frontend ja esta pronto para consumir o endpoint de OAuth assim que ele existir. Ate la, contas conectadas entram direto e o modo local cobre o restante."
                  tone="info"
                />
              )}

              {googleAccountsQuery.isError ? (
                <EmptyState
                  eyebrow="Contas indisponiveis"
                  title="Nao conseguimos carregar as contas conectadas"
                  description="A API respondeu com erro ao buscar os acessos Google ja vinculados ao workspace."
                  hint="Valide a disponibilidade do backend e repita o login."
                />
              ) : googleAccounts.length > 0 ? (
                <div className={loginWorkspaceStyles.accountList}>
                  {googleAccounts.map((account) => (
                    <Button className={loginWorkspaceStyles.accountButton} key={account.id} onClick={() => handleConnectedAccountLogin(account)} type="button" variant="outline">
                      <span className={loginWorkspaceStyles.accountIdentity}>
                        <span className={loginWorkspaceStyles.accountName}>{account.displayName}</span>
                        <span className={loginWorkspaceStyles.accountEmail}>{account.email}</span>
                      </span>
                      <span className={loginWorkspaceStyles.accountMeta}>
                        Entrar
                        <ArrowRight aria-hidden="true" className="ml-2 inline h-4 w-4" />
                      </span>
                    </Button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  eyebrow="Nenhuma conta conectada"
                  title="Ainda nao existe uma identidade Google pronta para este workspace"
                  description="Assim que o backend concluir o fluxo OAuth, as contas conectadas passam a aparecer aqui como ponto de entrada."
                  hint="Enquanto isso, use o acesso local para continuar navegando e validar o restante da interface."
                />
              )}

              <div className={loginWorkspaceStyles.actions}>
                <Button disabled={!oauthConfigured} onClick={handleGoogleLogin} size="lg" type="button">
                  <Sparkles aria-hidden="true" className="mr-2 h-4.5 w-4.5" />
                  Continuar com Google
                </Button>
                <Button onClick={handleLocalLogin} size="lg" type="button" variant="outline">
                  Entrar em modo local
                </Button>
              </div>
            </CardContent>
          </Card>

          <section className={loginWorkspaceStyles.helperCard}>
            <h2 className={loginWorkspaceStyles.helperTitle}>O que o frontend ja fecha agora</h2>
            <p className={loginWorkspaceStyles.helperCopy}>
              Protecao de rotas, sessao persistida, logout funcional e ponto unico de entrada. Quando o endpoint real de OAuth estiver pronto,
              o botao Google passa a usar o backend sem precisar reestruturar a UI.
            </p>
          </section>
        </section>
      </div>
    </div>
  );
}