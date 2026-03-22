import type { Metadata, Viewport } from 'next';
import { Inter, Manrope } from 'next/font/google';

import { AuthShell } from '@/modules/auth';
import { AppProviders } from '@/providers';
import '@/shared/styles/global.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: {
    default: 'WorkCycle',
    template: '%s | WorkCycle',
  },
  description: 'Gestao de tempo proporcional por ciclos com carteira, backlog, contexto diario e leitura semanal.',
  applicationName: 'WorkCycle',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'WorkCycle',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/pwa/icon-192.svg', type: 'image/svg+xml', sizes: '192x192' },
      { url: '/pwa/icon-512.svg', type: 'image/svg+xml', sizes: '512x512' },
    ],
    apple: '/pwa/apple-touch-icon.svg',
    shortcut: '/favicon.svg',
  },
  category: 'productivity',
  keywords: ['workcycle', 'planejamento', 'projetos', 'tarefas', 'tempo'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f6fb' },
    { media: '(prefers-color-scheme: dark)', color: '#08111f' },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${manrope.variable}`}>
        <AppProviders>
          <AuthShell>{children}</AuthShell>
        </AppProviders>
      </body>
    </html>
  );
}