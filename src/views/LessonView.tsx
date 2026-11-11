import { useEffect, useMemo } from 'react';
import { Bar, EmptyState, LevelBadge, ModuleGlyph, SourceBadge, TrackBadge } from '../components/ui';
import { LessonTile } from '../components/LessonTile';
import {
  formatMinutes, lessonsById, moduleOf, moduleProgress, neighborLesson, trackLabel,
} from '../lib/content';
import { Icon } from '../lib/icons';
import { getHeadings, Markdown, parseMarkdown } from '../lib/markdown';
import { ROUTES, useNav } from '../lib/nav';
import { useProgress } from '../lib/progress';

export default function LessonView({ id }: { id: string }) {
  const navigate = useNav();
  const { state, isComplete, toggleComplete, setLastLesson, toggleFavorite } = useProgress();
  const lesson = lessonsById.get(id);
  const blocks = useMemo(() => (lesson ? parseMarkdown(lesson.body) : []), [lesson]);
  const headings = useMemo(() => getHeadings(blocks), [blocks]);

  useEffect(() => { if (lesson) setLastLesson(lesson.id); }, [lesson, setLastLesson]);
  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!lesson) {
    return (
      <div className="view">
        <EmptyState icon="alert" title="Leçon introuvable" hint="Le lien est peut-être obsolète. Retrouvez le contenu dans le parcours." />
        <button className="btn btn-primary" onClick={() => navigate(ROUTES.curriculum)} type="button">Retour au parcours</button>
      </div>
    );
  }

  const mod = moduleOf(lesson);
  const prog = moduleProgress(mod.id, state.completed);
  const prev = neighborLesson(lesson.id, -1);
  const next = neighborLesson(lesson.id, 1);
  const complete = isComplete(lesson.id);
  const favorite = state.favorites.includes(lesson.id);
  const related = mod.lessonIds.filter((x) => x !== lesson.id).slice(0, 3).map((x) => lessonsById.get(x)).filter(Boolean);

  return (
    <div className="view lesson-view">
      <div className="lesson-breadcrumb">
        <button onClick={() => navigate(ROUTES.curriculum)} type="button"><Icon name="arrow-left" size={14} /> Parcours</button>
        <Icon name="chevron-right" size={13} />
        <span>Module {String(mod.n).padStart(2, '0')} · {mod.title}</span>
        <Icon name="chevron-right" size={13} />
        <strong>Leçon</strong>
      </div>

      <header className="lesson-header">
        <div className="lesson-header-top">
          <ModuleGlyph icon={mod.icon} accent={mod.accent} size={26} />
          <div className="lesson-badges">
            <TrackBadge track={lesson.track} />
            <LevelBadge level={lesson.level} />
            <SourceBadge lesson={lesson} />
          </div>
          <button className={`icon-btn fav-btn ${favorite ? 'on' : ''}`} onClick={() => toggleFavorite(lesson.id)} type="button" aria-label="Ajouter aux favoris">
            <Icon name="star" size={17} />
          </button>
        </div>
        <h2>{lesson.title}</h2>
        <p className="lesson-lead">{lesson.brief}</p>
        <div className="lesson-meta">
          <span><Icon name="clock" size={14} /> {lesson.minutes} min de lecture</span>
          <span><Icon name="file-text" size={14} /> {lesson.words.toLocaleString('fr-FR')} mots</span>
          <span><Icon name="code" size={14} /> {lesson.codeBlocks} blocs de code</span>
          <span><Icon name="layers" size={14} /> {trackLabel(lesson.track)}</span>
          {lesson.lang === 'en' && <span className="lang-note"><Icon name="globe" size={14} /> Texte source en anglais</span>}
        </div>
      </header>

      <div className="lesson-layout">
        <article className="lesson-article">
          {lesson.origin === 'repo' && (
            <div className="brief-callout">
              <div className="brief-icon"><Icon name="compass" size={18} /></div>
              <div>
                <strong>En bref — synthèse en français</strong>
                <p>{lesson.brief}</p>
                <small>
                  {lesson.repo === 'ejpt'
                    ? 'Cette leçon reprend les notes communautaires eJPT v2, rédigées en anglais. La synthèse ci-dessus et le parcours sont en français.'
                    : 'Cette leçon est extraite du cours français 0xCyberLiTech, nettoyée des éléments décoratifs du dépôt.'}
                </small>
              </div>
            </div>
          )}

          <Markdown blocks={blocks} />

          <div className="lesson-source">
            <Icon name="github" size={17} />
            <div>
              <strong>{lesson.origin === 'academy' ? 'Cours maison · Cyber Académie' : lesson.repo === 'ejpt' ? 'eJPT v2 Certificate Notes · skullhat' : 'Cybersecurite · 0xCyberLiTech'}</strong>
              <small>{lesson.sourcePath} · contenu sous licence MIT, attribution conservée</small>
            </div>
            {lesson.sourceUrl && (
              <a href={lesson.sourceUrl} target="_blank" rel="noreferrer noopener" className="btn btn-outline btn-sm">
                Voir le fichier source <Icon name="arrow-up-right" size={14} />
              </a>
            )}
          </div>

          <div className={`complete-bar ${complete ? 'done' : ''}`}>
            <div>
              <Icon name={complete ? 'check-circle' : 'circle'} size={20} />
              <span>
                <strong>{complete ? 'Leçon terminée' : 'Terminer cette leçon'}</strong>
                <small>{complete ? 'Progression enregistrée dans ce navigateur.' : '+10 XP · votre progression est sauvegardée automatiquement.'}</small>
              </span>
            </div>
            <button className={`btn ${complete ? 'btn-outline' : 'btn-primary'}`} onClick={() => toggleComplete(lesson.id)} type="button">
              {complete ? <>Marquer comme à revoir <Icon name="refresh" size={14} /></> : <>Valider <Icon name="check" size={15} /></>}
            </button>
          </div>

          <nav className="lesson-nav">
            {prev ? (
              <button onClick={() => navigate(ROUTES.lesson(prev.id))} type="button" className="lesson-nav-btn">
                <Icon name="arrow-left" size={16} /><span><small>Précédent</small><strong>{prev.title}</strong></span>
              </button>
            ) : <span />}
            {next ? (
              <button onClick={() => navigate(ROUTES.lesson(next.id))} type="button" className="lesson-nav-btn next">
                <span><small>Suivant</small><strong>{next.title}</strong></span><Icon name="arrow-right" size={16} />
              </button>
            ) : <span />}
          </nav>
        </article>

        <aside className="lesson-aside">
          <div className="aside-card">
            <span className="eyebrow">DANS CE MODULE</span>
            <h4>{mod.title}</h4>
            <div className="aside-progress">
              <span>{prog.done} / {prog.total} leçons</span>
              <strong>{prog.pct}%</strong>
            </div>
            <Bar value={prog.pct} color={mod.accent} />
            <small className="aside-hint"><Icon name="clock" size={12} /> {formatMinutes(mod.minutes)} au total</small>
          </div>

          {headings.length > 0 && (
            <div className="aside-card toc-card">
              <span className="eyebrow">SOMMAIRE</span>
              <nav>
                {headings.slice(0, 22).map((h) => (
                  <button
                    key={h.id}
                    className={`toc-item level-${h.level}`}
                    onClick={() => document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    type="button"
                  >{h.text}</button>
                ))}
              </nav>
            </div>
          )}

          {lesson.tags.length > 0 && (
            <div className="aside-card">
              <span className="eyebrow">MOTS-CLÉS</span>
              <div className="tag-cloud">
                {lesson.tags.map((t) => <span className="tag" key={t}>#{t}</span>)}
              </div>
            </div>
          )}

          <button className="aside-quiz" onClick={() => navigate(ROUTES.quiz)} type="button">
            <Icon name="quiz" size={19} />
            <span><strong>Tester mes connaissances</strong><small>Quiz du module {String(mod.n).padStart(2, '0')}</small></span>
            <Icon name="arrow-right" size={15} />
          </button>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="lesson-related">
          <div className="section-title"><div><span className="eyebrow">POURSUIVRE</span><h2>Dans le même module</h2></div></div>
          <div className="tiles-grid">
            {related.map((l) => l && <LessonTile key={l.id} lesson={l} compact />)}
          </div>
        </section>
      )}
    </div>
  );
}
