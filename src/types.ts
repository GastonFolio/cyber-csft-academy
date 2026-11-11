export type Level = 'debutant' | 'intermediaire' | 'avance';
export type TrackId = 'fondations' | 'redteam' | 'web' | 'blueteam' | 'gouvernance';
export type PhaseId = 'fondations' | 'redteam' | 'blueteam';

export interface Lesson {
  id: string;
  title: string;
  moduleId: string;
  track: TrackId;
  level: Level;
  order: number;
  origin: 'repo' | 'academy';
  repo: 'ejpt' | 'cyber' | null;
  lang: 'fr' | 'en';
  sourceUrl: string | null;
  sourcePath: string;
  brief: string;
  tags: string[];
  minutes: number;
  words: number;
  codeBlocks: number;
  body: string;
}

export interface Module {
  id: string;
  n: number;
  title: string;
  phase: PhaseId;
  track: TrackId;
  level: Level;
  icon: string;
  accent: string;
  description: string;
  objective: string;
  lessonIds: string[];
  minutes: number;
}

export interface Phase {
  id: PhaseId;
  title: string;
  subtitle: string;
  range: string;
}

export interface SourceInfo {
  url: string;
  branch: string;
  label: string;
  author: string;
  license: string;
  lang: string;
  count: number;
}

export interface Catalog {
  generatedAt: string;
  sources: Record<'ejpt' | 'cyber', SourceInfo>;
  phases: Phase[];
  modules: Module[];
  lessons: Lesson[];
}

export interface QuizQuestion {
  id: string;
  moduleId: string;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
}

export interface CheatCommand {
  cmd: string;
  desc: string;
}

export interface CheatCategory {
  id: string;
  title: string;
  icon: string;
  accent: string;
  description: string;
  commands: CheatCommand[];
}

export interface Heading {
  level: number;
  text: string;
  id: string;
}

export interface ProgressState {
  completed: string[];
  lastLesson: string | null;
  quizBest: Record<string, number>;
  favorites: string[];
  theme: 'dark' | 'light';
}
