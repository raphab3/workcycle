import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';

import { AppProviders } from '@/providers';
import { AppLayout } from '@/shared/components/AppLayout';
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
  title: 'WorkCycle',
  description: 'Gestao de tempo proporcional por ciclos.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${manrope.variable}`}>
        <AppProviders>
          <AppLayout>{children}</AppLayout>
        </AppProviders>
      </body>
    </html>
  );
}