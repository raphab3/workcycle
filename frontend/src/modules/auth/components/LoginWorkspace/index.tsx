'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CalendarClock, KeyRound, ShieldCheck, Sparkles, Workflow } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useLoginMutation } from '@/modules/auth/queries/useLoginMutation';
import { useRegisterMutation } from '@/modules/auth/queries/useRegisterMutation';
import { useAuthStatusQuery } from '@/modules/auth/queries/useAuthStatusQuery';
import { loginFormSchema, registerFormSchema, type LoginFormValues, type RegisterFormValues } from '@/modules/auth/schema';
import { authService } from '@/modules/auth/services/authService';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { Button } from '@/shared/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';
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

export function LoginWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signIn = useAuthStore((state) => state.signIn);
  const authStatusQuery = useAuthStatusQuery();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const authStatus = authStatusQuery.data;
  const oauthConfigured = authStatus?.oauthConfigured ?? false;

  const loginForm = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(loginFormSchema),
  });

  const registerForm = useForm<RegisterFormValues>({
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
    resolver: zodResolver(registerFormSchema),
  });

  useEffect(() => {
    const authToken = searchParams?.get('authToken');
    const authUserId = searchParams?.get('authUserId');
    const authEmail = searchParams?.get('authEmail');
    const authDisplayName = searchParams?.get('authDisplayName');
    const authProvider = searchParams?.get('authProvider');
    const authHasGoogleLinked = searchParams?.get('authHasGoogleLinked');
    const authHasPassword = searchParams?.get('authHasPassword');

    if (!authToken || !authUserId || !authEmail || !authDisplayName || !authProvider) {
      return;
    }

    signIn({
      token: authToken,
      user: {
        authProvider: authProvider as 'email' | 'google' | 'hybrid',
        displayName: authDisplayName,
        email: authEmail,
        hasGoogleLinked: authHasGoogleLinked === 'true',
        hasPassword: authHasPassword === 'true',
        id: authUserId,
      },
    });

    router.replace('/dashboard');
  }, [router, searchParams, signIn]);

  function handleGoogleLogin() {
    window.location.assign(authService.getGoogleLoginUrl());
  }

  async function handleLogin(values: LoginFormValues) {
    const session = await loginMutation.mutateAsync(values);

    signIn(session);
    router.replace('/dashboard');
  }

  async function handleRegister(values: RegisterFormValues) {
    const session = await registerMutation.mutateAsync(values);

    signIn(session);
    router.replace('/dashboard');
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
                <span className={loginWorkspaceStyles.metricLabel}>email e senha</span>
                <strong className={loginWorkspaceStyles.metricValue}>{authStatus?.emailPasswordEnabled ? 'ativo' : 'desligado'}</strong>
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
                title="Email e senha primeiro, Google quando fizer sentido"
                description="O fluxo principal agora cria e autentica usuarios por email. O Google continua disponivel como entrada opcional e como integracao complementar dentro das configuracoes."
              />

              {authStatusQuery.isError && (
                <StateNotice
                  eyebrow="Falha na leitura do backend"
                  title="Nao foi possivel verificar o estado da autenticacao"
                  description="A API de auth nao respondeu corretamente. Resolva isso antes de confiar no login desta sessao."
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

              <div className={loginWorkspaceStyles.actions}>
                <Button onClick={() => setAuthMode('login')} size="sm" type="button" variant={authMode === 'login' ? 'default' : 'outline'}>
                  Entrar
                </Button>
                <Button onClick={() => setAuthMode('register')} size="sm" type="button" variant={authMode === 'register' ? 'default' : 'outline'}>
                  Criar conta
                </Button>
              </div>

              {authMode === 'login' ? (
                <form className={loginWorkspaceStyles.stack} onSubmit={loginForm.handleSubmit(handleLogin)}>
                  <label className={loginWorkspaceStyles.accountIdentity}>
                    <span className={loginWorkspaceStyles.accountMeta}>Email</span>
                    <input {...loginForm.register('email')} className={loginWorkspaceStyles.accountButton} placeholder="voce@workcycle.dev" type="email" />
                  </label>
                  {loginForm.formState.errors.email && <p className={loginWorkspaceStyles.accountEmail}>{loginForm.formState.errors.email.message}</p>}

                  <label className={loginWorkspaceStyles.accountIdentity}>
                    <span className={loginWorkspaceStyles.accountMeta}>Senha</span>
                    <input {...loginForm.register('password')} className={loginWorkspaceStyles.accountButton} placeholder="Digite sua senha" type="password" />
                  </label>
                  {loginForm.formState.errors.password && <p className={loginWorkspaceStyles.accountEmail}>{loginForm.formState.errors.password.message}</p>}

                  {loginMutation.isError && (
                    <p className={loginWorkspaceStyles.accountEmail}>Nao foi possivel autenticar com este email e senha.</p>
                  )}

                  <Button disabled={loginMutation.isPending} size="lg" type="submit">
                    <KeyRound aria-hidden="true" className="mr-2 h-4.5 w-4.5" />
                    Entrar com email
                  </Button>
                </form>
              ) : (
                <form className={loginWorkspaceStyles.stack} onSubmit={registerForm.handleSubmit(handleRegister)}>
                  <label className={loginWorkspaceStyles.accountIdentity}>
                    <span className={loginWorkspaceStyles.accountMeta}>Nome</span>
                    <input {...registerForm.register('displayName')} className={loginWorkspaceStyles.accountButton} placeholder="Seu nome no workspace" type="text" />
                  </label>
                  {registerForm.formState.errors.displayName && <p className={loginWorkspaceStyles.accountEmail}>{registerForm.formState.errors.displayName.message}</p>}

                  <label className={loginWorkspaceStyles.accountIdentity}>
                    <span className={loginWorkspaceStyles.accountMeta}>Email</span>
                    <input {...registerForm.register('email')} className={loginWorkspaceStyles.accountButton} placeholder="voce@workcycle.dev" type="email" />
                  </label>
                  {registerForm.formState.errors.email && <p className={loginWorkspaceStyles.accountEmail}>{registerForm.formState.errors.email.message}</p>}

                  <label className={loginWorkspaceStyles.accountIdentity}>
                    <span className={loginWorkspaceStyles.accountMeta}>Senha</span>
                    <input {...registerForm.register('password')} className={loginWorkspaceStyles.accountButton} placeholder="Crie uma senha forte" type="password" />
                  </label>
                  {registerForm.formState.errors.password && <p className={loginWorkspaceStyles.accountEmail}>{registerForm.formState.errors.password.message}</p>}

                  {registerMutation.isError && (
                    <p className={loginWorkspaceStyles.accountEmail}>Nao foi possivel criar sua conta com esse email.</p>
                  )}

                  <Button disabled={registerMutation.isPending} size="lg" type="submit">
                    Criar conta com email
                  </Button>
                </form>
              )}

              <div className={loginWorkspaceStyles.actions}>
                <Button disabled={!oauthConfigured} onClick={handleGoogleLogin} size="lg" type="button">
                  <Sparkles aria-hidden="true" className="mr-2 h-4.5 w-4.5" />
                  Continuar com Google
                </Button>
                <Button asChild size="lg" type="button" variant="outline">
                  <a href="#auth-email-panel">
                    Preferir email e senha
                    <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <section className={loginWorkspaceStyles.helperCard}>
            <h2 className={loginWorkspaceStyles.helperTitle}>O que o frontend ja fecha agora</h2>
            <p className={loginWorkspaceStyles.helperCopy}>
              Protecao de rotas, token de sessao real, logout funcional, entrada por email/senha e ponte pronta para OAuth Google.
              Se a conta nascer por email, a vinculacao do Google fica disponivel nas configuracoes.
            </p>
          </section>
        </section>
      </div>
    </div>
  );
}