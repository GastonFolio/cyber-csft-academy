import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '../lib/icons';
import { levelColor, levelLabel, trackColor, trackLabel } from '../lib/content';
import type { Lesson, Level, TrackId } from '../types';

export function ProgressRing({ value, size = 84, stroke = 7, color = 'var(--accent)', label }: {
  value: number; size?: number; stroke?: number; color?: string; label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ring-track)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      <div className="progress-ring-label">
        <strong>{value}%</strong>
        {label && <span>{label}</span>}
      </div>
    </div>
  );
}

export function LevelBadge({ level }: { level: Level }) {
  return <span className="badge" style={{ '--badge-color': levelColor(level) } as CSSProperties}>{levelLabel(level)}</span>;
}

export function TrackBadge({ track }: { track: TrackId }) {
  return <span className="badge" style={{ '--badge-color': trackColor(track) } as CSSProperties}>{trackLabel(track)}</span>;
}

export function SourceBadge({ lesson }: { lesson: Lesson }) {
  if (lesson.origin === 'academy') {
    return <span className="source-badge academy"><Icon name="sparkles" size={12} /> Cours maison</span>;
  }
  const label = lesson.repo === 'ejpt' ? 'eJPT v2 · EN' : '0xCyberLiTech · FR';
  return (
    <span className={`source-badge ${lesson.repo ?? ''}`}>
      <Icon name="github" size={12} /> {label}
    </span>
  );
}

export function ModuleGlyph({ icon, accent, size = 20 }: { icon: string; accent: string; size?: number }) {
  return (
    <span className="module-glyph" style={{ '--glyph-color': accent } as CSSProperties}>
      <Icon name={icon} size={size} />
    </span>
  );
}

export function SectionTitle({ eyebrow, title, subtitle, action }: {
  eyebrow?: string; title: string; subtitle?: string; action?: ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Bar({ value, color = 'var(--accent)' }: { value: number; color?: string }) {
  return (
    <div className="bar"><div className="bar-fill" style={{ width: `${Math.min(100, value)}%`, background: color }} /></div>
  );
}

export function EmptyState({ icon = 'search', title, hint }: { icon?: string; title: string; hint?: string }) {
  return (
    <div className="empty-state">
      <Icon name={icon} size={28} />
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
    </div>
  );
}
