import { useEffect, useMemo, useRef, useState } from 'react';
import { lessonsById, modulesById, modules, recommendedLessons, searchLessons, trackLabel } from '../lib/content';
import { Icon } from '../lib/icons';
import { ROUTES, useNav } from '../lib/nav';
import { useProgress } from '../lib/progress';
import { SourceBadge } from './ui';
import type { Lesson } from '../types';

const QUICK = [
  { title: 'Tableau de bord', hint: 'Vue d’ensemble de votre progression', icon: 'home', to: ROUTES.dashboard },
  { title: 'Parcours A → Z', hint: 'Les 13 modules du programme', icon: 'path', to: ROUTES.curriculum },
  { title: 'Quiz & entraînement', hint: '45 questions corrigées', icon: 'quiz', to: ROUTES.quiz },
  { title: 'Mémos & commandes', hint: 'Anti-sèches par famille d’outils', icon: 'memos', to: ROUTES.cheatsheets },
  { title: 'Sources & crédits', hint: 'Les deux dépôts et leurs licences', icon: 'resources', to: ROUTES.resources },
];

type Entry = { kind: 'nav'; title: string; hint: string; icon: string; to: string } |
             { kind: 'lesson'; lesson: Lesson };

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNav();
  const { state } = useProgress();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const entries = useMemo<Entry[]>(() => {
    if (!query.trim()) {
      const recs: Entry[] = recommendedLessons(state.completed, 4).map((l) => ({ kind: 'lesson', lesson: l }));
      return [...QUICK.map((q) => ({ kind: 'nav' as const, ...q })), ...recs];
    }
    return searchLessons(query, 10).map((r) => ({ kind: 'lesson' as const, lesson: r.lesson }));
  }, [query, state.completed]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  const activate = (entry: Entry | undefined) => {
    if (!entry) return;
    navigate(entry.kind === 'nav' ? entry.to : ROUTES.lesson(entry.lesson.id));
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(entries.length - 1, i + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
      else if (e.key === 'Enter') { e.preventDefault(); activate(entries[active]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!open) return null;

  return (
    <div className="palette-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Recherche rapide">
        <div className="palette-input">
          <Icon name="search" size={19} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher : nmap, kill chain, XSS, Wazuh, eJPT…"
            aria-label="Rechercher dans le catalogue"
          />
          <button className="icon-btn" onClick={onClose} type="button" aria-label="Fermer"><Icon name="close" size={17} /></button>
        </div>
        <div className="palette-results">
          <div className="palette-group">
            {query.trim() ? `${entries.length} résultat${entries.length > 1 ? 's' : ''}` : 'Accès rapide & reprises'}
          </div>
          {entries.length === 0 && (
            <div className="palette-empty">
              <Icon name="search" size={24} />
              <p>Aucun résultat pour « {query} ».</p>
              <small>Essayez « scan », « proxy », « privesc », « OWASP »…</small>
            </div>
          )}
          {entries.map((entry, i) => (
            <button
              key={entry.kind === 'nav' ? entry.to : entry.lesson.id}
              className={`palette-item ${i === active ? 'active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => activate(entry)}
              type="button"
            >
              <span className="palette-item-icon">
                <Icon name={entry.kind === 'nav' ? entry.icon : 'file-text'} size={17} />
              </span>
              <span className="palette-item-text">
                <strong>{entry.kind === 'nav' ? entry.title : entry.lesson.title}</strong>
                <small>
                  {entry.kind === 'nav'
                    ? entry.hint
                    : `${modulesById.get(entry.lesson.moduleId)?.title ?? ''} · ${trackLabel(entry.lesson.track)} · ${entry.lesson.minutes} min`}
                </small>
              </span>
              {entry.kind === 'lesson' && <SourceBadge lesson={entry.lesson} />}
              <Icon name="arrow-up-right" size={15} className="palette-arrow" />
            </button>
          ))}
        </div>
        <div className="palette-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> naviguer</span>
          <span><kbd>↵</kbd> ouvrir</span>
          <span><kbd>esc</kbd> fermer</span>
          <span className="palette-count">{lessonsById.size} leçons · {modules.length} modules indexés</span>
        </div>
      </div>
    </div>
  );
}
