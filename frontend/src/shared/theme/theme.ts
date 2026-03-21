export type ThemeMode = 'light' | 'dark';

export const themeStorageKey = 'workcycle-theme-mode';

export const designSystemTheme = {
  layout: {
    sidebarExpandedWidth: '17.5rem',
    sidebarCollapsedWidth: '5.5rem',
    headerHeight: '5.5rem',
  },
  modes: {
    light: {
      label: 'Claro',
      actionLabel: 'Ativar modo escuro',
      description: 'Superficies claras para leitura ampla do workspace.',
    },
    dark: {
      label: 'Escuro',
      actionLabel: 'Ativar modo claro',
      description: 'Contraste alto para sessoes prolongadas.',
    },
  },
} as const;

export function getOppositeThemeMode(mode: ThemeMode): ThemeMode {
  return mode === 'light' ? 'dark' : 'light';
}