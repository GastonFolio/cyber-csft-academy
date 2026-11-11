import catalogJson from '../data/catalog.json';
import quizJson from '../data/quizzes.json';
import cheatJson from '../data/cheatsheets.json';
import type { Catalog, CheatCategory, Lesson, Level, Module, QuizQuestion, TrackId } from '../types';

export const catalog = catalogJson as unknown as Catalog;
export const questions: QuizQuestion[] = quizJson.questions;
export const cheatCategories: CheatCategory[] = cheatJson.categories;
export const cheatsheetTips: string[] = cheatJson.tips;

export const lessons: Lesson[] = catalog.lessons;
export const modules: Module[] = catalog.modules;
export const phases = catalog.phases;

export const lessonsById = new Map(lessons.map((l) => [l.id, l]));
export const modulesById = new Map(modules.map((m) => [m.id, m]));
export const lessonIndex = new Map(lessons.map((l, i) => [l.id, i]));

export const TRACKS: { id: TrackId; label: string; color: string; description: string }[] = [
  { id: 'fondations', label: 'Fondations', color: '#22d3ee', description: 'Concepts, réseau, systèmes' },
  { id: 'redteam', label: 'Red Team', color: '#a78bfa', description: 'Reconnaissance, exploitation' },
  { id: 'web', label: 'Pentest Web', color: '#34d399', description: 'OWASP, API, sessions' },
  { id: 'blueteam', label: 'Blue Team', color: '#4ade80', description: 'Détection, défense, durcissement' },
  { id: 'gouvernance', label: 'Gouvernance', color: '#fbbf24', description: 'Risques, conformité, cloud' },
];

export const LEVELS: { id: Level; label: string; color: string }[] = [
  { id: 'debutant', label: 'Débutant', color: '#4ade80' },
  { id: 'intermediaire', label: 'Intermédiaire', color: '#fbbf24' },
  { id: 'avance', label: 'Avancé', color: '#f472b6' },
];

export function levelLabel(id: Level): string {
  return LEVELS.find((l) => l.id === id)?.label ?? id;
}
export function levelColor(id: Level): string {
  return LEVELS.find((l) => l.id === id)?.color ?? '#94a3b8';
}
export function trackLabel(id: TrackId): string {
  return TRACKS.find((t) => t.id === id)?.label ?? id;
}
export function trackColor(id: TrackId): string {
  return TRACKS.find((t) => t.id === id)?.color ?? '#94a3b8';
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m.toString().padStart(2, '0')}` : `${h} h`;
}

export function moduleOf(lesson: Lesson): Module {
  return modulesById.get(lesson.moduleId) ?? modules[0];
}

export function neighborLesson(id: string, direction: 1 | -1): Lesson | null {
  const i = lessonIndex.get(id);
  if (i === undefined) return null;
  return lessons[i + direction] ?? null;
}

export function moduleProgress(moduleId: string, completed: string[]): { done: number; total: number; pct: number } {
  const mod = modulesById.get(moduleId);
  if (!mod) return { done: 0, total: 0, pct: 0 };
  const done = mod.lessonIds.filter((id) => completed.includes(id)).length;
  return { done, total: mod.lessonIds.length, pct: mod.lessonIds.length ? Math.round((done / mod.lessonIds.length) * 100) : 0 };
}

// ---------------------------------------------------------------------------
// Recherche plein texte : index construit une seule fois au chargement du module.
// ---------------------------------------------------------------------------
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.]/g, ' ');
}

interface SearchEntry {
  id: string;
  title: string;
  tags: string;
  brief: string;
  body: string;
  context: string;
}

const searchIndex: SearchEntry[] = lessons.map((l) => ({
  id: l.id,
  title: normalize(l.title),
  tags: normalize(l.tags.join(' ')),
  brief: normalize(l.brief),
  body: normalize(l.body.replace(/```[\s\S]*?```/g, ' ')).slice(0, 1800),
  context: normalize(modulesById.get(l.moduleId)?.title ?? ''),
}));

export interface SearchResult {
  lesson: Lesson;
  score: number;
  snippet: string;
}

export function searchLessons(query: string, limit = 12): SearchResult[] {
  const q = normalize(query.trim());
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const results: SearchResult[] = [];
  for (const entry of searchIndex) {
    let score = 0;
    for (const term of terms) {
      const inTitle = entry.title.includes(term);
      const inTags = entry.tags.includes(term);
      const inBrief = entry.brief.includes(term);
      const inBody = entry.body.includes(term);
      const inContext = entry.context.includes(term);
      if (!inTitle && !inTags && !inBrief && !inBody && !inContext) {
        score = -1;
        break;
      }
      score += (inTitle ? 8 : 0) + (inTags ? 5 : 0) + (inBrief ? 3 : 0) +
               (inContext ? 2 : 0) + (inBody ? 1 : 0);
    }
    if (score < 0) continue;
    const lesson = lessonsById.get(entry.id);
    if (!lesson) continue;
    const plain = lesson.body.replace(/[#>*`|\[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
    const pos = terms.length ? normalize(plain).indexOf(terms[0]) : -1;
    const start = Math.max(0, pos - 40);
    const snippet = (pos >= 0 ? '…' : '') + plain.slice(start, start + 150).trim() + '…';
    results.push({ lesson, score, snippet });
  }
  return results.sort((a, b) => b.score - a.score || a.lesson.title.localeCompare(b.lesson.title)).slice(0, limit);
}

export function recommendedLessons(completed: string[], limit = 3): Lesson[] {
  const out: Lesson[] = [];
  for (const mod of modules) {
    for (const id of mod.lessonIds) {
      if (!completed.includes(id)) {
        const l = lessonsById.get(id);
        if (l) out.push(l);
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}

export function slugHeading(text: string): string {
  return normalize(text).trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 64);
}

export const totalMinutes = modules.reduce((sum, m) => sum + m.minutes, 0);
