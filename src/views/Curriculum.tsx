import { useMemo, useState, type CSSProperties } from 'react';
import { Bar, EmptyState, LevelBadge, ModuleGlyph, SourceBadge, TrackBadge } from '../components/ui';
import {
  formatMinutes, lessons, lessonsById, modules, moduleProgress, normalize, phases,
  LEVELS, TRACKS,
} from '../lib/content';
import { Icon } from '../lib/icons';
import { ROUTES, useNav } from '../lib/nav';
import { useProgress } from '../lib/progress';
import type { Level, TrackId } from '../types';

export default function Curriculum() {
  const navigate = useNav();
  const { state, isComplete, toggleComplete } = useProgress();
  const [track, setTrack] = useState<TrackId | 'all'>('all');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ M01: true });

  const nq = normalize(q.trim());
  const filtered = useMemo(() => modules.filter((m) => {
    if (track !== 'all' && m.track !== track && m.phase !== track) return false;
    if (level !== 'all' && m.level !== level) return false;
    if (!nq) return true;
    if (normalize(`${m.title} ${m.description} ${m.objective}`).includes(nq)) return true;
    return m.lessonIds.some((id) => {
      const l = lessonsById.get(id);
      return l && normalize(`${l.title} ${l.tags.join(' ')} ${l.brief}`).includes(nq);
    });
  }), [track, level, nq]);

  const allExpanded = filtered.length > 0 && filtered.every((m) => !!expanded[m.id]);
  const toggleAll = () => {
    const next: Record<string, boolean> = { ...expanded };
    filtered.forEach((m) => { next[m.id] = !allExpanded; });
    setExpanded(next);
  };

  const visibleLessons = (moduleId: string) => {
    const mod = modules.find((m) => m.id === moduleId)!;
    const list = mod.lessonIds.map((id) => lessonsById.get(id)).filter(Boolean);
    if (!nq) return list;
    if (normalize(`${mod.title} ${mod.description}`).includes(nq)) return list;
    return list.filter((l) => l && normalize(`${l.title} ${l.tags.join(' ')} ${l.brief}`).includes(nq));
  };

  return (
    <div className="view curriculum">
      <section className="page-intro">
        <div>
          <span className="eyebrow">PROGRAMME · {modules.length} MODULES · {lessons.length} LEÇONS</span>
          <h2>Le parcours A → Z</h2>
          <p>
            Trois phases, quatre filières, une progression continue. Chaque leçon est sourcée,
            datable et reliée à son dépôt d'origine. Cochez vos leçons au fur et à mesure : votre
            progression est sauvegardée localement dans le navigateur.
          </p>
        </div>
        <div className="intro-stats">
          <div><strong>{formatMinutes(modules.reduce((s, m) => s + m.minutes, 0))}</strong><span>de contenu</span></div>
          <div><strong>{state.completed.length}</strong><span>leçons validées</span></div>
          <div><strong>{phases.length}</strong><span>phases</span></div>
        </div>
      </section>

      <div className="filters">
        <label className="filter-search">
          <Icon name="search" size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer : nmap, Wazuh, privesc, XSS…" />
          {q && <button onClick={() => setQ('')} type="button" aria-label="Effacer"><Icon name="close" size={14} /></button>}
        </label>
        <div className="filter-chips">
          <button className={`chip ${track === 'all' ? 'active' : ''}`} onClick={() => setTrack('all')} type="button">Toutes filières</button>
          {TRACKS.map((t) => (
            <button key={t.id} className={`chip ${track === t.id ? 'active' : ''}`} onClick={() => setTrack(t.id)} type="button"
              style={{ '--chip-color': t.color } as CSSProperties}>{t.label}</button>
          ))}
        </div>
        <div className="filter-chips">
          <button className={`chip ${level === 'all' ? 'active' : ''}`} onClick={() => setLevel('all')} type="button">Tous niveaux</button>
          {LEVELS.map((l) => (
            <button key={l.id} className={`chip ${level === l.id ? 'active' : ''}`} onClick={() => setLevel(l.id)} type="button"
              style={{ '--chip-color': l.color } as CSSProperties}>{l.label}</button>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={toggleAll} type="button">
          <Icon name="list" size={15} /> {allExpanded ? 'Tout replier' : 'Tout déplier'}
        </button>
      </div>

      {filtered.length === 0 && <EmptyState title="Aucun module ne correspond" hint="Essayez un autre mot-clé ou réinitialisez les filtres." />}

      {phases.map((phase) => {
        const mods = filtered.filter((m) => m.phase === phase.id);
        if (!mods.length) return null;
        return (
          <section className="phase-section" key={phase.id}>
            <div className="phase-header">
              <span className="phase-badge">{phase.range}</span>
              <div><h3>{phase.title}</h3><p>{phase.subtitle}</p></div>
              <span className="phase-total">{mods.reduce((s, m) => s + m.lessonIds.length, 0)} leçons</span>
            </div>
            <div className="module-list">
              {mods.map((m) => {
                const prog = moduleProgress(m.id, state.completed);
                const open = !!expanded[m.id] || !!nq;
                const list = visibleLessons(m.id);
                return (
                  <article className={`module-card ${open ? 'open' : ''}`} key={m.id} style={{ '--module-accent': m.accent } as CSSProperties}>
                    <button className="module-head" onClick={() => setExpanded((s) => ({ ...s, [m.id]: !s[m.id] }))} type="button">
                      <ModuleGlyph icon={m.icon} accent={m.accent} size={22} />
                      <div className="module-head-text">
                        <div className="module-head-top">
                          <span className="module-index">MODULE {String(m.n).padStart(2, '0')}</span>
                          <LevelBadge level={m.level} />
                          <TrackBadge track={m.track} />
                        </div>
                        <h4>{m.title}</h4>
                        <p>{m.description}</p>
                      </div>
                      <div className="module-head-progress">
                        <span className="module-progress-num">{prog.done}/{prog.total}</span>
                        <Bar value={prog.pct} color={m.accent} />
                        <small><Icon name="clock" size={12} /> {formatMinutes(m.minutes)}</small>
                      </div>
                      <Icon name="chevron-down" size={18} className="module-chevron" />
                    </button>
                    {open && (
                      <div className="module-body">
                        <div className="module-objective"><Icon name="target" size={15} /><span><strong>Objectif :</strong> {m.objective}</span></div>
                        <div className="lesson-rows">
                          {list.map((l, idx) => {
                            if (!l) return null;
                            const complete = isComplete(l.id);
                            return (
                              <div className={`lesson-row ${complete ? 'done' : ''}`} key={l.id}>
                                <button
                                  className={`check-btn ${complete ? 'checked' : ''}`}
                                  onClick={() => toggleComplete(l.id)}
                                  type="button"
                                  aria-label={complete ? 'Marquer comme non terminé' : 'Marquer comme terminé'}
                                  title={complete ? 'Marquer comme non terminé' : 'Marquer comme terminé'}
                                >
                                  {complete && <Icon name="check" size={13} strokeWidth={2.6} />}
                                </button>
                                <span className="lesson-row-num">{String(idx + 1).padStart(2, '0')}</span>
                                <button className="lesson-row-main" onClick={() => navigate(ROUTES.lesson(l.id))} type="button">
                                  <strong>{l.title}</strong>
                                  <small>{l.brief}</small>
                                </button>
                                <div className="lesson-row-meta">
                                  <SourceBadge lesson={l} />
                                  <span className="tile-meta"><Icon name="clock" size={12} /> {l.minutes} min</span>
                                  <Icon name="arrow-right" size={15} />
                                </div>
                              </div>
                            );
                          })}
                          {list.length === 0 && <div className="module-empty">Aucune leçon ne correspond à ce filtre dans ce module.</div>}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="curriculum-footer">
        <Icon name="graduation" size={18} />
        <span>Un parcours = une boucle : lire → pratiquer en lab → valider avec le quiz → documenter.</span>
        <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.quiz)} type="button">Passer un quiz <Icon name="arrow-right" size={14} /></button>
      </div>
    </div>
  );
}
