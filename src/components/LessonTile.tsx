import { moduleOf, trackLabel } from '../lib/content';
import { Icon } from '../lib/icons';
import { ROUTES, useNav } from '../lib/nav';
import { useProgress } from '../lib/progress';
import { SourceBadge } from './ui';
import type { Lesson } from '../types';

export function LessonTile({ lesson, compact = false }: { lesson: Lesson; compact?: boolean }) {
  const navigate = useNav();
  const { isComplete } = useProgress();
  const mod = moduleOf(lesson);
  const done = isComplete(lesson.id);
  return (
    <button className={`lesson-tile ${compact ? 'compact' : ''}`} onClick={() => navigate(ROUTES.lesson(lesson.id))} type="button">
      <div className="lesson-tile-top">
        <span className="lesson-tile-mod"><span className="mod-num">{String(mod.n).padStart(2, '0')}</span> {mod.title}</span>
        {done && <span className="done-dot"><Icon name="check" size={12} /></span>}
      </div>
      <h3>{lesson.title}</h3>
      {!compact && <p>{lesson.brief}</p>}
      <div className="lesson-tile-foot">
        <SourceBadge lesson={lesson} />
        <span className="tile-meta"><Icon name="clock" size={12} /> {lesson.minutes} min</span>
        <span className="tile-meta hide-sm"><Icon name="layers" size={12} /> {trackLabel(lesson.track)}</span>
        <Icon name="arrow-up-right" size={15} className="tile-arrow" />
      </div>
    </button>
  );
}
