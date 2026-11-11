import { lessons, modules } from '../lib/content';
import { Icon } from '../lib/icons';
import { ROUTES, useNav } from '../lib/nav';
import { useProgress } from '../lib/progress';
import { ProgressRing } from './ui';

const NAV = [
  { id: 'dashboard', label: 'Tableau de bord', icon: 'home', to: ROUTES.dashboard, hint: '' },
  { id: 'parcours', label: 'Parcours A → Z', icon: 'path', to: ROUTES.curriculum, hint: '' },
  { id: 'quiz', label: 'Quiz & entraînement', icon: 'quiz', to: ROUTES.quiz, hint: '' },
  { id: 'memos', label: 'Mémos & commandes', icon: 'memos', to: ROUTES.cheatsheets, hint: '' },
  { id: 'ressources', label: 'Sources & crédits', icon: 'resources', to: ROUTES.resources, hint: '' },
];

export function Sidebar({ active, open, onClose }: { active: string; open: boolean; onClose: () => void }) {
  const navigate = useNav();
  const { state, xp, level } = useProgress();
  const pct = Math.round((state.completed.length / lessons.length) * 100);

  const go = (to: string) => { navigate(to); onClose(); };

  return (
    <>
      <div className={`sidebar-backdrop ${open ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <button className="brand" onClick={() => go(ROUTES.dashboard)} type="button">
          <span className="brand-mark"><Icon name="shield" size={22} strokeWidth={2} /></span>
          <span className="brand-text">
            <strong>CYBER<span>·</span>ACADÉMIE</strong>
            <small>Apprendre la sécurité de A à Z</small>
          </span>
        </button>

        <div className="sidebar-scroll">
          <div className="nav-group">
            <span className="nav-label">Navigation</span>
            {NAV.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${active === item.id ? 'active' : ''}`}
                onClick={() => go(item.to)}
                type="button"
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
                {active === item.id && <span className="nav-active-dot" />}
              </button>
            ))}
          </div>

          <div className="nav-group">
            <span className="nav-label">Parcours · {modules.length} modules</span>
            <div className="phase-mini">
              {[
                { id: 'fondations', label: 'Poser les bases', range: '01 — 03' },
                { id: 'redteam', label: 'Penser attaque', range: '04 — 10' },
                { id: 'blueteam', label: 'Défendre & piloter', range: '11 — 13' },
              ].map((p, i) => (
                <button key={p.id} className="phase-mini-item" onClick={() => go(ROUTES.curriculum)} type="button">
                  <span className="phase-mini-num">0{i + 1}</span>
                  <span><strong>{p.label}</strong><small>{p.range}</small></span>
                  <Icon name="chevron-right" size={14} />
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-progress">
            <div className="sidebar-progress-head">
              <ProgressRing value={pct} size={62} stroke={6} />
              <div>
                <span className="eyebrow">Votre progression</span>
                <strong>{state.completed.length} / {lessons.length} leçons</strong>
                <small>Niveau {level} · {xp} XP</small>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm full" onClick={() => go(ROUTES.curriculum)} type="button">
              Continuer le parcours <Icon name="arrow-right" size={14} />
            </button>
          </div>
        </div>

        <div className="sidebar-footer">
          <span className="kbd-hint"><kbd>⌘</kbd><kbd>K</kbd> recherche rapide</span>
          <span className="sidebar-version">v1.0 · contenu MIT</span>
        </div>
      </aside>
    </>
  );
}
