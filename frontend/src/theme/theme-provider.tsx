'use client';

import {
  createContext,
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

import {
  createHarmonyTheme,
  DEFAULT_HARMONY_THEME,
  HARMONY_THEMES,
  type HarmonyThemeName,
} from './theme';

/* =========================================================
   STORAGE KEY

   Browser reload हुँदा पनि selected theme सम्झिन्छ.
========================================================= */

const THEME_STORAGE_KEY =
  'harmony-theme';

/* =========================================================
   THEME CONTEXT
========================================================= */

type HarmonyThemeContextValue = {
  themeName: HarmonyThemeName;
  setThemeName: (
    themeName: HarmonyThemeName,
  ) => void;
  themes: typeof HARMONY_THEMES;
};

const HarmonyThemeContext =
  createContext<HarmonyThemeContextValue | null>(
    null,
  );

/* =========================================================
   VALIDATION

   localStorage मा invalid value भए fallback theme use गर्छ.
========================================================= */

function isHarmonyThemeName(
  value: string,
): value is HarmonyThemeName {
  return value in HARMONY_THEMES;
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
    useState<HarmonyThemeName>(
      DEFAULT_HARMONY_THEME,
    );

  /* =======================================================
     RESTORE SAVED THEME
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    let savedTheme: string | null = null;

    try {
      savedTheme =
        window.localStorage.getItem(
          THEME_STORAGE_KEY,
        );
    } catch {
      savedTheme = null;
    }

    if (
      savedTheme &&
      isHarmonyThemeName(savedTheme)
    ) {
      queueMicrotask(() => {
        if (!cancelled) {
          setThemeNameState(savedTheme);
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     UPDATE THEME
  ======================================================= */

  const setThemeName = (
    nextTheme: HarmonyThemeName,
  ) => {
    setThemeNameState(nextTheme);

    try {
      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        nextTheme,
      );
    } catch {
      /*
       * Theme switching should still work for the
       * current session when storage is unavailable.
       */
    }
  };

  /* =======================================================
     CREATE ACTIVE MUI THEME

     Theme object only recreates when themeName changes.
  ======================================================= */

  const activeTheme = useMemo(
    () => createHarmonyTheme(themeName),
    [themeName],
  );

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const contextValue =
    useMemo<HarmonyThemeContextValue>(
      () => ({
        themeName,
        setThemeName,
        themes: HARMONY_THEMES,
      }),
      [themeName],
    );

  return (
    <AppRouterCacheProvider>
      <HarmonyThemeContext.Provider
        value={contextValue}
      >
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

   Theme switch button बाट use गर्छौं.
========================================================= */

export function useHarmonyTheme() {
  const context = useContext(
    HarmonyThemeContext,
  );

  if (!context) {
    throw new Error(
      'useHarmonyTheme must be used inside ThemeRegistry.',
    );
  }

  return context;
}