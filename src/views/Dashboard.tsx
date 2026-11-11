import type { CSSProperties } from 'react';
import { Bar, LevelBadge, ModuleGlyph, ProgressRing, SectionTitle, SourceBadge } from '../components/ui';
import { LessonTile } from '../components/LessonTile';
import {
  catalog, formatMinutes, lessons, lessonsById, modules, moduleProgress, phases,
  recommendedLessons, totalMinutes, trackLabel,
} from '../lib/content';
import { Icon } from '../lib/icons';
import { ROUTES, useNav } from '../lib/nav';
import { useProgress } from '../lib/progress';

function StatCard({ icon, label, value, sub, accent }: { icon: string; label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="stat-card">
      <span className="stat-icon" style={{ '--stat-color': accent } as CSSProperties}><Icon name={icon} size={19} /></span>
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNav();
  const { state, xp, level } = useProgress();
  const done = state.completed.length;
  const pct = Math.round((done / lessons.length) * 100);
  const resume = (state.lastLesson && lessonsById.get(state.lastLesson)) || recommendedLessons(state.completed, 1)[0] || lessons[0];
  const next = recommendedLessons(state.completed, 3);
  const minutesDone = lessons.filter((l) => state.completed.includes(l.id)).reduce((s, l) => s + l.minutes, 0);
  const phaseCounts = (phase: string) => modules.filter((m) => m.phase === phase).reduce((s, m) => s + m.lessonIds.length, 0);

  return (
    <div className="view dashboard">
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <span className="eyebrow"><Icon name="sparkles" size={13} /> PARCOURS COMPLET · 13 MODULES · 3 PHASES</span>
          <h2>La cybersécurité,<br /><span className="gradient-text">de A à Z.</span></h2>
          <p>
            Un parcours structuré qui part des fondamentaux réseau, traverse la méthodologie de test d'intrusion
            et finit par la défense, la conformité et la construction de votre lab. {modules.length} modules,{' '}
            {lessons.length} leçons, deux dépôts open source et des cours maison en français.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => navigate(ROUTES.lesson(resume.id))} type="button">
              <Icon name="play" size={16} /> {done ? 'Reprendre le parcours' : 'Commencer le parcours'}
            </button>
            <button className="btn btn-outline" onClick={() => navigate(ROUTES.curriculum)} type="button">
              Explorer le programme <Icon name="arrow-right" size={15} />
            </button>
          </div>
          <div className="hero-meta">
            <span><Icon name="book" size={14} /> {lessons.length} leçons</span>
            <span><Icon name="clock" size={14} /> {formatMinutes(totalMinutes)} de contenu</span>
            <span><Icon name="quiz" size={14} /> Quiz corrigés</span>
            <span><Icon name="zap" size={14} /> 100 % hors ligne</span>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="terminal-card">
            <div className="terminal-head"><i /><i /><i /><span>parcours.sh</span></div>
            <pre>{`$ ./academie --status
[+] Fondations ......... ${phaseCounts('fondations')} leçons
[+] Red Team ........... ${phaseCounts('redteam')} leçons
[+] Blue Team .......... ${phaseCounts('blueteam')} leçons
[+] Progression ........ ${pct}%
[+] Niveau ............. ${level}
[+] XP ................. ${xp}

$ _`}</pre>
          </div>
        </div>
      </section>

      <div className="stats-grid">
        <div className="stat-card ring-card">
          <ProgressRing value={pct} size={78} stroke={7} color="var(--accent)" />
          <div>
            <span className="stat-label">Progression globale</span>
            <strong>{done} / {lessons.length}</strong>
            <small>leçons terminées</small>
          </div>
        </div>
        <StatCard icon="check-circle" label="Leçons validées" value={`${done}`} sub={`${lessons.length - done} restantes`} accent="#4ade80" />
        <StatCard icon="zap" label="Expérience" value={`${xp} XP`} sub={`Niveau ${level} · ${Math.max(0, 100 - (xp % 100))} XP avant le suivant`} accent="#fbbf24" />
        <StatCard icon="clock" label="Temps de lecture" value={formatMinutes(minutesDone)} sub={`sur ${formatMinutes(totalMinutes)} au total`} accent="#a78bfa" />
      </div>

      <div className="two-col">
        <section className="panel resume-panel">
          <SectionTitle eyebrow="REPRENDRE" title="Là où vous en étiez" />
          {resume && (
            <div className="resume-card">
              <div className="resume-top">
                <ModuleGlyph icon={modules.find((m) => m.id === resume.moduleId)?.icon ?? 'book'} accent={modules.find((m) => m.id === resume.moduleId)?.accent ?? '#22d3ee'} />
                <div>
                  <span className="eyebrow">MODULE {String(modules.find((m) => m.id === resume.moduleId)?.n ?? 1).padStart(2, '0')} · {trackLabel(resume.track)}</span>
                  <h3>{resume.title}</h3>
                </div>
              </div>
              <p>{resume.brief}</p>
              <div className="resume-foot">
                <SourceBadge lesson={resume} />
                <span className="tile-meta"><Icon name="clock" size={13} /> {resume.minutes} min</span>
              </div>
              <button className="btn btn-primary full" onClick={() => navigate(ROUTES.lesson(resume.id))} type="button">
                Ouvrir la leçon <Icon name="arrow-right" size={15} />
              </button>
            </div>
          )}
        </section>

        <section className="panel">
          <SectionTitle eyebrow="FEUILLE DE ROUTE" title="Les trois phases" subtitle="Une progression pensée pour aller du vocabulaire à l'autonomie." />
          <div className="phase-list">
            {phases.map((p, i) => {
              const mods = modules.filter((m) => m.phase === p.id);
              const total = mods.reduce((s, m) => s + m.lessonIds.length, 0);
              const finished = mods.reduce((s, m) => s + moduleProgress(m.id, state.completed).done, 0);
              const value = total ? Math.round((finished / total) * 100) : 0;
              return (
                <button key={p.id} className="phase-row" onClick={() => navigate(ROUTES.curriculum)} type="button">
                  <span className="phase-num">0{i + 1}</span>
                  <span className="phase-info">
                    <strong>{p.title}</strong>
                    <small>{p.subtitle} · modules {p.range}</small>
                    <Bar value={value} color={i === 0 ? '#22d3ee' : i === 1 ? '#a78bfa' : '#4ade80'} />
                  </span>
                  <span className="phase-pct">{value}%</span>
                  <Icon name="chevron-right" size={16} />
                </button>
              );
            })}
          </div>
          <button className="btn btn-ghost full" onClick={() => navigate(ROUTES.quiz)} type="button">
            <Icon name="quiz" size={15} /> S'entraîner avec un quiz <Icon name="arrow-right" size={14} />
          </button>
        </section>
      </div>

      <section className="panel">
        <SectionTitle
          eyebrow="VOTRE PROCHAINE ÉTAPE"
          title="Leçons recommandées"
          subtitle="Sélectionnées dans l'ordre du parcours, en fonction de vos leçons déjà validées."
          action={<button className="btn btn-outline btn-sm" onClick={() => navigate(ROUTES.curriculum)} type="button">Tout voir <Icon name="arrow-right" size={14} /></button>}
        />
        <div className="tiles-grid">
          {next.map((l) => <LessonTile key={l.id} lesson={l} />)}
        </div>
      </section>

      <section className="panel sources-strip">
        <SectionTitle eyebrow="DEUX BIBLIOTHÈQUES, UN PARCOURS" title="Un contenu sourcé et attribué" />
        <div className="source-cards">
          {(['ejpt', 'cyber'] as const).map((key) => {
            const s = catalog.sources[key];
            return (
              <div className="source-card" key={key}>
                <div className="source-card-head">
                  <span className="source-card-icon"><Icon name="github" size={20} /></span>
                  <div>
                    <strong>{s.label}</strong>
                    <small>@{s.author} · licence {s.license} · {s.lang === 'fr' ? 'français' : 'anglais'}</small>
                  </div>
                  <span className="source-count">{s.count} leçons</span>
                </div>
                <p>
                  {key === 'ejpt'
                    ? 'Notes de préparation à la certification eJPT v2 : méthodologies d’audit, scan, Metasploit, privesc, post-exploitation et pentest web.'
                    : 'Cours français de défense en profondeur : kill chain, malwares, cryptographie, proxys, EDR/SIEM, Wazuh, Suricata et nftables.'}
                </p>
                <div className="source-card-foot">
                  <span className="tile-meta"><Icon name="link" size={13} /> {s.branch}</span>
                  <a href={s.url} target="_blank" rel="noreferrer noopener" className="text-link">Voir le dépôt <Icon name="arrow-up-right" size={13} /></a>
                  <button className="text-link" onClick={() => navigate(ROUTES.resources)} type="button">Crédits <Icon name="arrow-right" size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="disclaimer">
          <Icon name="shield" size={17} />
          <span>Les techniques offensives sont présentées à des fins pédagogiques. Ne les pratiquez que sur un lab isolé ou dans un périmètre explicitement autorisé.</span>
          <LevelBadge level="debutant" />
        </div>
      </section>
    </div>
  );
}
