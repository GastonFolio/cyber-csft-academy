import { useEffect, useMemo, useState } from 'react';
import { Bar, EmptyState, ProgressRing, SectionTitle } from '../components/ui';
import { modules, questions } from '../lib/content';
import { Icon } from '../lib/icons';
import { ROUTES, useNav } from '../lib/nav';
import { useProgress } from '../lib/progress';
import type { QuizQuestion } from '../types';

type Phase = 'setup' | 'playing' | 'result';

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizView() {
  const navigate = useNav();
  const { state, saveQuiz } = useProgress();
  const [scope, setScope] = useState('all');
  const [count, setCount] = useState(10);
  const [phase, setPhase] = useState<Phase>('setup');
  const [deck, setDeck] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const pool = useMemo(
    () => (scope === 'all' ? questions : questions.filter((q) => q.moduleId === scope)),
    [scope],
  );
  const key = `${scope}:${count}`;
  const best = state.quizBest[key] ?? 0;

  const start = () => {
    setDeck(shuffle(pool).slice(0, Math.min(count, pool.length)));
    setIndex(0); setPicked(null); setScore(0); setAnswers([]);
    setPhase('playing');
  };

  const answer = (choice: number) => {
    if (picked !== null || !deck[index]) return;
    setPicked(choice);
    const correct = choice === deck[index].answer;
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, correct]);
  };

  const advance = () => {
    if (index + 1 >= deck.length) {
      const pct = Math.round((score / deck.length) * 100);
      saveQuiz(key, pct);
      setPhase('result');
    } else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      if (/^[1-4]$/.test(e.key) && picked === null) answer(Number(e.key) - 1);
      if (e.key === 'Enter' && picked !== null) advance();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const current = deck[index];

  return (
    <div className="view quiz-view">
      <section className="page-intro">
        <div>
          <span className="eyebrow">ENTRAÎNEMENT · {questions.length} QUESTIONS CORRIGÉES</span>
          <h2>Quiz & validation des acquis</h2>
          <p>Chaque réponse est expliquée. Choisissez un module pour réviser ciblé, ou lancez un tirage sur tout le parcours.</p>
        </div>
        <div className="intro-stats">
          <div><strong>{Object.keys(state.quizBest).length}</strong><span>sessions jouées</span></div>
          <div><strong>{Object.values(state.quizBest).filter((x) => x >= 80).length}</strong><span>scores ≥ 80 %</span></div>
        </div>
      </section>

      {phase === 'setup' && (
        <div className="quiz-setup">
          <section className="panel">
            <SectionTitle eyebrow="CONFIGURATION" title="Prêt à tester vos connaissances ?" subtitle="Les questions sont tirées aléatoirement et notées immédiatement." />
            <div className="quiz-config">
              <label className="field">
                <span>Périmètre</span>
                <select value={scope} onChange={(e) => setScope(e.target.value)}>
                  <option value="all">Tout le parcours ({questions.length} questions)</option>
                  {modules.map((m) => {
                    const n = questions.filter((q) => q.moduleId === m.id).length;
                    return n ? <option value={m.id} key={m.id}>{String(m.n).padStart(2, '0')} · {m.title} ({n})</option> : null;
                  })}
                </select>
              </label>
              <div className="field">
                <span>Nombre de questions</span>
                <div className="count-picker">
                  {[5, 10, 20].map((n) => (
                    <button key={n} className={`chip ${count === n ? 'active' : ''}`} onClick={() => setCount(n)} type="button">{n}</button>
                  ))}
                </div>
              </div>
              <div className="field">
                <span>Meilleur score sur cette configuration</span>
                <strong className="best-score">{best ? `${best} %` : '—'}</strong>
              </div>
            </div>
            <div className="quiz-setup-actions">
              <button className="btn btn-primary btn-lg" onClick={start} disabled={pool.length === 0} type="button">
                <Icon name="play" size={17} /> Lancer le quiz ({Math.min(count, pool.length)} questions)
              </button>
              <button className="btn btn-outline" onClick={() => navigate(ROUTES.curriculum)} type="button">Revoir le parcours</button>
            </div>
          </section>

          <section className="panel quiz-rules">
            <SectionTitle eyebrow="COMMENT ÇA MARCHE" title="Trois règles simples" />
            <div className="rule-grid">
              <div><Icon name="quiz" size={20} /><strong>Une question à la fois</strong><p>Répondez avec les touches 1–4 ou en cliquant.</p></div>
              <div><Icon name="book" size={20} /><strong>Explication systématique</strong><p>Bonne ou mauvaise réponse, le pourquoi est toujours affiché.</p></div>
              <div><Icon name="trophy" size={20} /><strong>Meilleur score conservé</strong><p>Vos records sont stockés localement et ajoutent de l'XP.</p></div>
            </div>
          </section>
        </div>
      )}

      {phase === 'playing' && current && (
        <div className="quiz-session">
          <div className="quiz-progress">
            <div><span className="eyebrow">{scope === 'all' ? 'TOUT LE PARCOURS' : modules.find((m) => m.id === scope)?.title}</span>
              <strong>Question {index + 1} / {deck.length}</strong></div>
            <div className="quiz-score"><Icon name="zap" size={15} /> {score} bonne{score > 1 ? 's' : ''}</div>
          </div>
          <Bar value={((index + (picked !== null ? 1 : 0)) / deck.length) * 100} color="var(--accent)" />
          <div className="quiz-card">
            <span className="quiz-card-label"><Icon name="quiz" size={14} /> Question {index + 1}</span>
            <h3>{current.question}</h3>
            <div className="quiz-choices">
              {current.choices.map((choice, i) => {
                const isAnswer = i === current.answer;
                const isPicked = i === picked;
                const cls = picked === null ? '' : isAnswer ? 'correct' : isPicked ? 'wrong' : 'dimmed';
                return (
                  <button key={i} className={`quiz-choice ${cls}`} onClick={() => answer(i)} disabled={picked !== null} type="button">
                    <span className="choice-key">{i + 1}</span>
                    <span>{choice}</span>
                    {picked !== null && isAnswer && <Icon name="check-circle" size={18} />}
                    {picked !== null && isPicked && !isAnswer && <Icon name="close" size={18} />}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <div className={`quiz-feedback ${picked === current.answer ? 'good' : 'bad'}`}>
                <Icon name={picked === current.answer ? 'check-circle' : 'alert'} size={19} />
                <div>
                  <strong>{picked === current.answer ? 'Bonne réponse !' : 'Pas tout à fait.'}</strong>
                  <p>{current.explanation}</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={advance} type="button">
                  {index + 1 >= deck.length ? 'Voir le résultat' : 'Question suivante'} <Icon name="arrow-right" size={14} />
                </button>
              </div>
            )}
          </div>
          <div className="quiz-dots">
            {answers.map((ok, i) => <span key={i} className={ok ? 'ok' : 'ko'} />)}
            {Array.from({ length: Math.max(0, deck.length - answers.length) }, (_, i) => <span key={`p${i}`} />)}
          </div>
          {pool.length === 0 && <EmptyState title="Aucune question disponible" hint="Choisissez un autre périmètre." />}
        </div>
      )}

      {phase === 'result' && (
        <section className="panel quiz-result">
          <ProgressRing value={Math.round((score / deck.length) * 100)} size={132} stroke={10} color={score / deck.length >= 0.7 ? '#4ade80' : '#fbbf24'} />
          <span className="eyebrow">SESSION TERMINÉE</span>
          <h2>{score} / {deck.length} bonnes réponses</h2>
          <p>
            {score / deck.length >= 0.8
              ? 'Excellent. Le socle est solide : passez à la pratique en lab, puis rejouez un tirage sur un autre module.'
              : score / deck.length >= 0.5
                ? 'Bonne base. Reprenez les leçons des questions manquées, puis relancez un tirage.'
                : 'C’est le moment idéal pour revoir les fondamentaux : chaque explication pointe vers la notion à retravailler.'}
          </p>
          <div className="result-actions">
            <button className="btn btn-primary" onClick={start} type="button"><Icon name="refresh" size={15} /> Rejouer</button>
            <button className="btn btn-outline" onClick={() => setPhase('setup')} type="button">Changer de périmètre</button>
            <button className="btn btn-ghost" onClick={() => navigate(ROUTES.curriculum)} type="button">Retour au parcours</button>
          </div>
          <div className="result-review">
            {deck.map((q, i) => (
              <div className={`review-row ${answers[i] ? 'ok' : 'ko'}`} key={q.id}>
                <Icon name={answers[i] ? 'check' : 'close'} size={14} />
                <span>{q.question}</span>
                <small>{modules.find((m) => m.id === q.moduleId)?.title}</small>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
