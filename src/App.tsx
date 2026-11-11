import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CommandPalette } from './components/CommandPalette';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { catalog, lessonsById } from './lib/content';
import { NavContext } from './lib/nav';
import { Icon } from './lib/icons';

const Dashboard = lazy(() => import('./views/Dashboard'));
const Curriculum = lazy(() => import('./views/Curriculum'));
const LessonView = lazy(() => import('./views/LessonView'));
const QuizView = lazy(() => import('./views/QuizView'));
const CheatsheetsView = lazy(() => import('./views/CheatsheetsView'));
const ResourcesView = lazy(() => import('./views/ResourcesView'));

type Route = { name: string; id?: string };

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean);
  if (!parts.length) return { name: 'dashboard' };
  switch (parts[0]) {
    case 'parcours': return { name: 'parcours' };
    case 'lecon': return { name: 'lecon', id: decodeURIComponent(parts[1] ?? '') };
    case 'quiz': return { name: 'quiz' };
    case 'memos': return { name: 'memos' };
    case 'ressources': return { name: 'ressources' };
    default: return { name: 'dashboard' };
  }
}

const TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Tableau de bord', subtitle: 'VUE D’ENSEMBLE' },
  parcours: { title: 'Le parcours A → Z', subtitle: 'PROGRAMME' },
  quiz: { title: 'Quiz & entraînement', subtitle: 'VALIDATION' },
  memos: { title: 'Mémos & commandes', subtitle: 'ANTI-SÈCHES' },
  ressources: { title: 'Sources & crédits', subtitle: 'OPEN SOURCE' },
  lecon: { title: 'Leçon', subtitle: 'PARCOURS' },
};

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onHash = () => { setRoute(parseHash()); setMenuOpen(false); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen((o) => !o); }
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault(); setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const navigate = useCallback((to: string) => {
    if (window.location.hash === to) { window.scrollTo(0, 0); setRoute(parseHash()); }
    else window.location.hash = to;
    setPaletteOpen(false);
  }, []);

  const active = route.name === 'lecon' ? 'parcours' : route.name;
  const head = useMemo(() => {
    if (route.name === 'lecon') {
      const lesson = lessonsById.get(route.id ?? '');
      return { title: lesson?.title ?? 'Leçon', subtitle: 'LEÇON' };
    }
    return TITLES[route.name] ?? TITLES.dashboard;
  }, [route]);

  let view: ReactNode;
  switch (route.name) {
    case 'parcours': view = <Curriculum />; break;
    case 'lecon': view = <LessonView id={route.id ?? ''} />; break;
    case 'quiz': view = <QuizView />; break;
    case 'memos': view = <CheatsheetsView />; break;
    case 'ressources': view = <ResourcesView />; break;
    default: view = <Dashboard />;
  }

  return (
    <NavContext.Provider value={navigate}>
      <div className="app-shell">
        <Sidebar active={active} open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="app-main">
          <Topbar title={head.title} subtitle={head.subtitle} onSearch={() => setPaletteOpen(true)} onMenu={() => setMenuOpen(true)} />
          <main className="app-content">
            <Suspense fallback={<div className="view-loading"><span className="spinner" /> Chargement de la vue…</div>}>
              {view}
            </Suspense>
            <footer className="app-footer">
              <span><Icon name="shield" size={14} /> Cyber Académie A→Z · contenu sous licence MIT, attribution conservée</span>
              <span>Catalogue généré le {new Date(catalog.generatedAt).toLocaleDateString('fr-FR')} · {catalog.lessons.length} leçons</span>
            </footer>
          </main>
        </div>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </NavContext.Provider>
  );
}
