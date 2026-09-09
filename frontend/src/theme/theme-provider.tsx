'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  CssBaseline,
  ThemeProvider,
} from '@mui/material';

import {
  AppRouterCacheProvider,
} from '@mui/material-nextjs/v15-appRouter';

import { createHarmonyTheme } from './theme';

import {
  DARK_HARMONY_THEMES,
  DEFAULT_HARMONY_THEME,
  HARMONY_THEME_GROUND,
  HARMONY_THEMES,
  THEME_STORAGE_KEY,
  type HarmonyThemeName,
} from './theme-tokens';

/* =========================================================
   THEME CONTEXT
========================================================= */

type HarmonyThemeContextValue = {
  themeName: HarmonyThemeName;
  setThemeName: (themeName: HarmonyThemeName) => void;
  themes: typeof HARMONY_THEMES;
};

const HarmonyThemeContext =
  createContext<HarmonyThemeContextValue | null>(null);

/* =========================================================
   VALIDATION
========================================================= */

function isHarmonyThemeName(
  value: string,
): value is HarmonyThemeName {
  return value in HARMONY_THEMES;
}

function applyThemeGround(themeName: HarmonyThemeName) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  root.setAttribute('data-theme', themeName);
  root.style.colorScheme = DARK_HARMONY_THEMES.has(themeName)
    ? 'dark'
    : 'light';
  root.style.backgroundColor =
    HARMONY_THEME_GROUND[themeName].background;
}

/* =========================================================
   PROVIDER
========================================================= */

type ThemeRegistryProps = {
  children: ReactNode;
};

export default function ThemeRegistry({
  children,
}: ThemeRegistryProps) {
  const [themeName, setThemeNameState] =
    useState<HarmonyThemeName>(DEFAULT_HARMONY_THEME);

  /*
   * Restore the saved theme once, on the client. The server and
   * first client render always use the default theme to stay in
   * sync; the update is deferred to a microtask so it lands after
   * hydration rather than synchronously inside the effect.
   */
  useEffect(() => {
    let cancelled = false;

    let savedTheme: string | null = null;

    try {
      savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      savedTheme = null;
    }

    if (savedTheme && isHarmonyThemeName(savedTheme)) {
      const nextTheme = savedTheme;

      queueMicrotask(() => {
        if (!cancelled) {
          setThemeNameState(nextTheme);
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  /* Keep <html> ground attributes in sync with the active theme. */
  useEffect(() => {
    applyThemeGround(themeName);
  }, [themeName]);

  const setThemeName = useCallback(
    (nextTheme: HarmonyThemeName) => {
      setThemeNameState(nextTheme);

      try {
        window.localStorage.setItem(
          THEME_STORAGE_KEY,
          nextTheme,
        );
      } catch {
        /*
         * Theme switching should still work for the current
         * session when storage is unavailable.
         */
      }
    },
    [],
  );

  const activeTheme = useMemo(
    () => createHarmonyTheme(themeName),
    [themeName],
  );

  const contextValue = useMemo<HarmonyThemeContextValue>(
    () => ({
      themeName,
      setThemeName,
      themes: HARMONY_THEMES,
    }),
    [themeName, setThemeName],
  );

  return (
    <AppRouterCacheProvider>
      <HarmonyThemeContext.Provider value={contextValue}>
        <ThemeProvider theme={activeTheme}>
          <CssBaseline />

          {children}
        </ThemeProvider>
      </HarmonyThemeContext.Provider>
    </AppRouterCacheProvider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useHarmonyTheme() {
  const context = useContext(HarmonyThemeContext);

  if (!context) {
    throw new Error(
      'useHarmonyTheme must be used inside ThemeRegistry.',
    );
  }

  return context;
}
