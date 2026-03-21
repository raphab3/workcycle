'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { designSystemTheme, getOppositeThemeMode, themeStorageKey, type ThemeMode } from './theme';

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

function getPreferredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedThemeMode = window.localStorage.getItem(themeStorageKey);

  if (storedThemeMode === 'light' || storedThemeMode === 'dark') {
    return storedThemeMode;
  }

  if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  useEffect(() => {
    setThemeMode(getPreferredThemeMode());
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.theme = themeMode;
    root.style.colorScheme = themeMode;
    window.localStorage.setItem(themeStorageKey, themeMode);
  }, [themeMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeMode,
      setThemeMode,
      toggleThemeMode: () => setThemeMode((currentMode) => getOppositeThemeMode(currentMode)),
    }),
    [themeMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider.');
  }

  return {
    ...context,
    meta: designSystemTheme.modes[context.themeMode],
  };
}