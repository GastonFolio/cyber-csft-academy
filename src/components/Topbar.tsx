import { Icon } from '../lib/icons';
import { useProgress } from '../lib/progress';

export function Topbar({ title, subtitle, onSearch, onMenu }: {
  title: string; subtitle?: string; onSearch: () => void; onMenu: () => void;
}) {
  const { state, toggleTheme, level, xp } = useProgress();
  return (
    <header className="topbar">
      <button className="icon-btn mobile-only" onClick={onMenu} type="button" aria-label="Ouvrir le menu">
        <Icon name="menu" size={20} />
      </button>
      <div className="topbar-title">
        <span className="topbar-eyebrow">CYBER ACADÉMIE / {subtitle ?? 'A → Z'}</span>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <button className="search-trigger" onClick={onSearch} type="button">
          <Icon name="search" size={16} />
          <span>Rechercher une leçon, un outil…</span>
          <kbd>⌘ K</kbd>
        </button>
        <div className="xp-chip" title={`${xp} points d'expérience`}>
          <Icon name="zap" size={14} /> <strong>{xp}</strong><span>XP</span>
        </div>
        <button className="icon-btn" onClick={toggleTheme} type="button" aria-label="Changer de thème">
          <Icon name={state.theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>
        <div className="level-chip" title={`Niveau ${level}`}>N{level}</div>
      </div>
    </header>
  );
}
