'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useLoginMutation } from '@/modules/auth/queries/useLoginMutation';
import { useRegisterMutation } from '@/modules/auth/queries/useRegisterMutation';
import { loginFormSchema, registerFormSchema, type LoginFormValues, type RegisterFormValues } from '@/modules/auth/schema';
import { authService } from '@/modules/auth/services/authService';
import { firebaseAuthService } from '@/modules/auth/services/firebaseAuthService';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { Button } from '@/shared/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/Card';

import { loginWorkspaceStyles } from './styles';

export function LoginWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signIn = useAuthStore((state) => state.signIn);
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const isFirebaseEnabled = firebaseAuthService.isEnabled();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'login' | 'register' | 'google' | null>(null);

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
    if (searchParams?.get('logout') === '1') {
      router.replace('/login');
      return;
    }

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

  async function handleGoogleLogin() {
    setAuthErrorMessage(null);

    if (!isFirebaseEnabled) {
      window.location.assign(authService.getGoogleLoginUrl());
      return;
    }

    try {
      setPendingAction('google');

      const idToken = await firebaseAuthService.loginWithGoogle();
      const session = await authService.exchangeFirebaseIdToken(idToken);

      signIn(session);
      router.replace('/dashboard');
    } catch {
      setAuthErrorMessage('Nao foi possivel autenticar com Google via Firebase.');
    } finally {
      setPendingAction(null);
    }
  }

  async function handleLogin(values: LoginFormValues) {
    setAuthErrorMessage(null);

    try {
      setPendingAction('login');

      const session = isFirebaseEnabled
        ? await authService.exchangeFirebaseIdToken(await firebaseAuthService.loginWithEmail(values))
        : await loginMutation.mutateAsync(values);

      signIn(session);
      router.replace('/dashboard');
    } catch {
      setAuthErrorMessage(
        isFirebaseEnabled
          ? 'Nao foi possivel autenticar com Firebase usando este email e senha.'
          : 'Nao foi possivel autenticar com este email e senha.',
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleRegister(values: RegisterFormValues) {
    setAuthErrorMessage(null);

    try {
      setPendingAction('register');

      const session = isFirebaseEnabled
        ? await authService.exchangeFirebaseIdToken(await firebaseAuthService.registerWithEmail(values))
        : await registerMutation.mutateAsync(values);

      signIn(session);
      router.replace('/dashboard');
    } catch {
      setAuthErrorMessage(
        isFirebaseEnabled
          ? 'Nao foi possivel criar a conta no Firebase com esse email.'
          : 'Nao foi possivel criar sua conta com esse email.',
      );
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className={loginWorkspaceStyles.shell}>
      <div className={loginWorkspaceStyles.frame}>
        <section className={loginWorkspaceStyles.brandColumn}>
          <div className={loginWorkspaceStyles.brandPanel}>
            <div className={loginWorkspaceStyles.brandMark}>
              <Image
                alt="WorkCycle"
                className={loginWorkspaceStyles.logo}
                height={220}
                priority
                src="/images/logo/logo.png"
                width={480}
              />
            </div>
            <div className={loginWorkspaceStyles.brandCopy}>
              <p className={loginWorkspaceStyles.eyebrow}>Acesso ao workspace</p>
              <h1 className={loginWorkspaceStyles.title}>Entre para continuar seu ciclo de trabalho.</h1>
              <p className={loginWorkspaceStyles.description}>
                Use sua conta para abrir o ambiente, recuperar sua sessao local e seguir direto para o painel principal.
              </p>
            </div>
          </div>
        </section>

        <section className={loginWorkspaceStyles.formColumn}>
          <Card className={loginWorkspaceStyles.authCard}>
            <CardHeader>
              <CardDescription>Autenticacao</CardDescription>
              <CardTitle>{authMode === 'login' ? 'Entrar no WorkCycle' : 'Criar conta para entrar'}</CardTitle>
            </CardHeader>
            <CardContent className={loginWorkspaceStyles.formStack}>
              <p className={loginWorkspaceStyles.formLead}>
                {authMode === 'login'
                  ? (isFirebaseEnabled ? 'Use seu email e senha do Firebase para acessar o painel.' : 'Use seu email e senha para acessar o painel.')
                  : (isFirebaseEnabled ? 'Crie sua conta no Firebase e entre no workspace imediatamente.' : 'Crie uma conta local para comecar a usar o workspace imediatamente.')}
              </p>

              <div className={loginWorkspaceStyles.modeSwitch}>
                <Button onClick={() => {
                  setAuthErrorMessage(null);
                  setAuthMode('login');
                }} size="sm" type="button" variant={authMode === 'login' ? 'default' : 'outline'}>
                  Entrar
                </Button>
                <Button onClick={() => {
                  setAuthErrorMessage(null);
                  setAuthMode('register');
                }} size="sm" type="button" variant={authMode === 'register' ? 'default' : 'outline'}>
                  Criar conta
                </Button>
              </div>

              {authMode === 'login' ? (
                <form className={loginWorkspaceStyles.formStack} onSubmit={loginForm.handleSubmit(handleLogin)}>
                  <label className={loginWorkspaceStyles.fieldGroup}>
                    <span className={loginWorkspaceStyles.fieldLabel}>Email</span>
                    <input {...loginForm.register('email')} className={loginWorkspaceStyles.fieldInput} placeholder="voce@workcycle.dev" type="email" />
                  </label>
                  {loginForm.formState.errors.email && <p className={loginWorkspaceStyles.fieldError}>{loginForm.formState.errors.email.message}</p>}

                  <label className={loginWorkspaceStyles.fieldGroup}>
                    <span className={loginWorkspaceStyles.fieldLabel}>Senha</span>
                    <input {...loginForm.register('password')} className={loginWorkspaceStyles.fieldInput} placeholder="Digite sua senha" type="password" />
                  </label>
                  {loginForm.formState.errors.password && <p className={loginWorkspaceStyles.fieldError}>{loginForm.formState.errors.password.message}</p>}

                  {authErrorMessage && authMode === 'login' && (
                    <p className={loginWorkspaceStyles.fieldError}>{authErrorMessage}</p>
                  )}

                  <Button className={loginWorkspaceStyles.primarySubmit} disabled={loginMutation.isPending || pendingAction === 'login'} size="lg" type="submit">
                    <KeyRound aria-hidden="true" className="mr-2 h-4.5 w-4.5" />
                    Entrar com email
                  </Button>
                </form>
              ) : (
                <form className={loginWorkspaceStyles.formStack} onSubmit={registerForm.handleSubmit(handleRegister)}>
                  <label className={loginWorkspaceStyles.fieldGroup}>
                    <span className={loginWorkspaceStyles.fieldLabel}>Nome</span>
                    <input {...registerForm.register('displayName')} className={loginWorkspaceStyles.fieldInput} placeholder="Seu nome no workspace" type="text" />
                  </label>
                  {registerForm.formState.errors.displayName && <p className={loginWorkspaceStyles.fieldError}>{registerForm.formState.errors.displayName.message}</p>}

                  <label className={loginWorkspaceStyles.fieldGroup}>
                    <span className={loginWorkspaceStyles.fieldLabel}>Email</span>
                    <input {...registerForm.register('email')} className={loginWorkspaceStyles.fieldInput} placeholder="voce@workcycle.dev" type="email" />
                  </label>
                  {registerForm.formState.errors.email && <p className={loginWorkspaceStyles.fieldError}>{registerForm.formState.errors.email.message}</p>}

                  <label className={loginWorkspaceStyles.fieldGroup}>
                    <span className={loginWorkspaceStyles.fieldLabel}>Senha</span>
                    <input {...registerForm.register('password')} className={loginWorkspaceStyles.fieldInput} placeholder="Crie uma senha forte" type="password" />
                  </label>
                  {registerForm.formState.errors.password && <p className={loginWorkspaceStyles.fieldError}>{registerForm.formState.errors.password.message}</p>}

                  {authErrorMessage && authMode === 'register' && (
                    <p className={loginWorkspaceStyles.fieldError}>{authErrorMessage}</p>
                  )}

                  <Button className={loginWorkspaceStyles.primarySubmit} disabled={registerMutation.isPending || pendingAction === 'register'} size="lg" type="submit">
                    Criar conta com email
                  </Button>
                </form>
              )}

              <div className={loginWorkspaceStyles.divider}>
                <span>ou</span>
              </div>

              <div className={loginWorkspaceStyles.oauthStack}>
                <Button className={loginWorkspaceStyles.primarySubmit} disabled={pendingAction === 'google'} onClick={() => void handleGoogleLogin()} size="lg" type="button" variant="outline">
                  <Sparkles aria-hidden="true" className="mr-2 h-4.5 w-4.5" />
                  {isFirebaseEnabled ? 'Continuar com Google via Firebase' : 'Continuar com Google'}
                </Button>
              </div>

              {authErrorMessage && pendingAction === null && (
                <p className={loginWorkspaceStyles.fieldError}>{authErrorMessage}</p>
              )}
            </CardContent>
          </Card>

          <div className={loginWorkspaceStyles.helperInline}>
            <span className={loginWorkspaceStyles.helperPill}>Sessao persistida no navegador</span>
            <span className={loginWorkspaceStyles.helperPill}>
              {isFirebaseEnabled ? 'Firebase pronto para emitir sessao WorkCycle' : 'Entrada por email pronta para uso'}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}