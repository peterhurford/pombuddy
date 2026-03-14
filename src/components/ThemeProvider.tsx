'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type ThemeMode = 'light' | 'dark' | 'auto';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'auto',
  resolved: 'dark',
  setMode: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getAutoTheme(): ResolvedTheme {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [resolved, setResolved] = useState<ResolvedTheme>('dark');

  const resolve = useCallback((m: ThemeMode): ResolvedTheme => {
    if (m === 'auto') return getAutoTheme();
    return m;
  }, []);

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('pombuddy-theme') as ThemeMode | null;
    if (saved && ['light', 'dark', 'auto'].includes(saved)) {
      setModeState(saved);
      setResolved(resolve(saved));
    } else {
      setResolved(resolve('auto'));
    }
  }, [resolve]);

  // Re-check auto theme every minute
  useEffect(() => {
    if (mode !== 'auto') return;
    const interval = setInterval(() => {
      setResolved(getAutoTheme());
    }, 60_000);
    return () => clearInterval(interval);
  }, [mode]);

  // Apply data-theme attribute to html element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
  }, [resolved]);

  function setMode(m: ThemeMode) {
    setModeState(m);
    setResolved(resolve(m));
    localStorage.setItem('pombuddy-theme', m);
  }

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
