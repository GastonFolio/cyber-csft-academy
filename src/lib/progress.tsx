import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ProgressState } from '../types';

const STORAGE_KEY = 'cyber-academie-az:v1';

const DEFAULT_STATE: ProgressState = {
  completed: [],
  lastLesson: null,
  quizBest: {},
  favorites: [],
  theme: 'dark',
};

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      lastLesson: typeof parsed.lastLesson === 'string' ? parsed.lastLesson : null,
      quizBest: parsed.quizBest && typeof parsed.quizBest === 'object' ? parsed.quizBest : {},
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      theme: parsed.theme === 'light' ? 'light' : 'dark',
    };
  } catch {
    return DEFAULT_STATE;
  }
}

interface ProgressContextValue {
  state: ProgressState;
  isComplete: (id: string) => boolean;
  toggleComplete: (id: string) => void;
  setLastLesson: (id: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  toggleFavorite: (id: string) => void;
  saveQuiz: (key: string, score: number) => void;
  reset: () => void;
  xp: number;
  level: number;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(load);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* stockage indisponible */ }
    document.documentElement.dataset.theme = state.theme;
  }, [state]);

  const isComplete = useCallback((id: string) => state.completed.includes(id), [state.completed]);

  const toggleComplete = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      completed: s.completed.includes(id) ? s.completed.filter((x) => x !== id) : [...s.completed, id],
      lastLesson: id,
    }));
  }, []);

  const setLastLesson = useCallback((id: string) => setState((s) => ({ ...s, lastLesson: id })), []);
  const setTheme = useCallback((theme: 'dark' | 'light') => setState((s) => ({ ...s, theme })), []);
  const toggleTheme = useCallback(() => setState((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' })), []);

  const toggleFavorite = useCallback((id: string) => {
    setState((s) => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id] }));
  }, []);

  const saveQuiz = useCallback((key: string, score: number) => {
    setState((s) => ({ ...s, quizBest: { ...s.quizBest, [key]: Math.max(s.quizBest[key] ?? 0, score) } }));
  }, []);

  const reset = useCallback(() => setState(DEFAULT_STATE), []);

  const xp = useMemo(
    () => state.completed.length * 10 + Object.values(state.quizBest).reduce((a, b) => a + b, 0),
    [state.completed, state.quizBest],
  );

  const value = useMemo<ProgressContextValue>(() => ({
    state, isComplete, toggleComplete, setLastLesson, setTheme, toggleTheme,
    toggleFavorite, saveQuiz, reset, xp, level: Math.floor(xp / 100) + 1,
  }), [state, isComplete, toggleComplete, setLastLesson, setTheme, toggleTheme, toggleFavorite, saveQuiz, reset, xp]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress doit être utilisé dans ProgressProvider');
  return ctx;
}
