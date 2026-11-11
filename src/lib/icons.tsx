import type { ReactNode } from 'react';

const P: Record<string, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 21v-7h6v7" /></>,
  path: <><circle cx="6" cy="5" r="2" /><circle cx="18" cy="19" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 5h8M6 7v6a4 4 0 0 0 4 4h6M18 8v9" /></>,
  book: <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19a2 2 0 0 1 2-2h13" /></>,
  bug: <><rect x="8" y="7" width="8" height="13" rx="4" /><path d="M8 12H4m16 0h-4M9 7 7 4m8 3 2-3M9 20 6 22m9-2 3 2M8 15h8" /></>,
  network: <><circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" /><path d="M12 7v5M12 12 6 17m6-5 6 5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" /></>,
  shield: <><path d="M12 3 20 6v6c0 5-3.4 8.2-8 9.5C7.4 20.2 4 17 4 12V6z" /><path d="m9 12 2 2 4-4" /></>,
  terminal: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3m6 0h4" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9 2 2-2 2 1 1-2 2-2-1-2 2" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v1" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
  quiz: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.9-.9 1.7M12 17h.01" /></>,
  memos: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  resources: <><path d="M4 6h16M4 12h16M4 18h10" /><circle cx="19" cy="18" r="2" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 5l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2m16 0h2M4.9 19l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5" />,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  'check-circle': <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  'arrow-right': <><path d="M4 12h16m-6-6 6 6-6 6" /></>,
  'arrow-left': <><path d="M20 12H4m6-6-6 6 6 6" /></>,
  'arrow-up-right': <><path d="M7 17 17 7M8 7h9v9" /></>,
  external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M15 5H6a1 1 0 0 0-1 1v9" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8z" />,
  sparkles: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="m18 16 .8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8z" /></>,
  github: <path d="M9 19c-4 1.5-4-2-6-2.5m12 4v-3a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6A4.6 4.6 0 0 0 18.4 6a4.3 4.3 0 0 0-.1-3.2s-1-.3-3.3 1.2a11 11 0 0 0-6 0C6.7 2.5 5.7 2.8 5.7 2.8A4.3 4.3 0 0 0 5.6 6 4.6 4.6 0 0 0 4.3 9.2c0 4.7 2.8 5.7 5.5 6A3 3 0 0 0 9 17.5v3" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  play: <path d="m8 5 11 7-11 7z" />,
  trophy: <><path d="M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M7 6H4v1a4 4 0 0 0 3 4m10-5h3v1a4 4 0 0 1-3 4M12 14v4m-4 2h8" /></>,
  flame: <path d="M12 22c4 0 7-2.7 7-6.5 0-3-1.5-5-3.5-7-.3 2-1.2 3-2.3 3.5.3-3.5-1.2-6.5-3.7-9 .2 3-1.3 4.5-2.5 6.5C5.7 11.4 5 13 5 15.5 5 19.3 8 22 12 22" />,
  refresh: <><path d="M20 11a8 8 0 0 0-14-5L4 8" /><path d="M4 4v4h4M4 13a8 8 0 0 0 14 5l2-2" /><path d="M20 20v-4h-4" /></>,
  star: <path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1.1 6.4L12 17.4 6.4 20.5l1.1-6.4L3 9.7l6.2-.9z" />,
  code: <><path d="m8 8-4 4 4 4m8-8 4 4-4 4M14 5l-4 14" /></>,
  alert: <><path d="M12 4 2 20h20z" /><path d="M12 10v4m0 3h.01" /></>,
  zap: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15 9-2 5-4 1 2-5z" /></>,
  award: <><circle cx="12" cy="9" r="5" /><path d="m9 13-1 8 4-2 4 2-1-8" /></>,
  list: <><path d="M9 6h12M9 12h12M9 18h12" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
  eye: <><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6" /><circle cx="12" cy="12" r="2.5" /></>,
  'file-text': <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>,
  download: <><path d="M12 3v12m-4-4 4 4 4-4M4 19h16" /></>,
  command: <><path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z" /></>,
  server: <><rect x="3" y="4" width="18" height="7" rx="2" /><rect x="3" y="13" width="18" height="7" rx="2" /><path d="M7 7.5h.01M7 16.5h.01" /></>,
  link: <><path d="M10 13a4 4 0 0 0 6 .5l2-2a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 11a4 4 0 0 0-6-.5l-2 2A4 4 0 0 0 11.7 18l1-1" /></>,
  graduation: <><path d="m2 9 10-5 10 5-10 5z" /><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6" /></>,
  'git-branch': <><circle cx="6" cy="5" r="2" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="8" r="2" /><path d="M6 7v10M18 10a6 6 0 0 1-6 6H8" /></>,
};

export type IconName = keyof typeof P | string;

export function Icon({ name, size = 18, className = '', strokeWidth = 1.8 }: {
  name: IconName; size?: number; className?: string; strokeWidth?: number;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {P[name] ?? P.circle ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}
