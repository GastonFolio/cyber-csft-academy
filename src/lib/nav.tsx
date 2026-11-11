import { createContext, useContext } from 'react';

export type Navigate = (to: string) => void;
export const NavContext = createContext<Navigate>(() => {});
export const useNav = () => useContext(NavContext);

export const ROUTES = {
  dashboard: '#/',
  curriculum: '#/parcours',
  lesson: (id: string) => `#/lecon/${encodeURIComponent(id)}`,
  quiz: '#/quiz',
  cheatsheets: '#/memos',
  resources: '#/ressources',
} as const;
