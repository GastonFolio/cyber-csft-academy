import { useMemo, useState, type ReactNode } from 'react';
import { slugHeading } from './content';
import { Icon } from './icons';
import type { Heading } from '../types';

export type Block =
  | { type: 'heading'; level: number; text: string; id: string }
  | { type: 'code'; lang: string; code: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: { text: string; depth: number }[] }
  | { type: 'quote'; lines: string[]; kind: string | null }
  | { type: 'table'; rows: string[][] }
  | { type: 'hr' };

const LIST_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const HEAD_RE = /^(#{2,6})\s+(.*)$/;
const HR_RE = /^(-{3,}|\*{3,}|_{3,})$/;

function isStructural(line: string): boolean {
  const t = line.trim();
  return !t || t.startsWith('```') || HEAD_RE.test(t) || HR_RE.test(t) ||
    t.startsWith('|') || t.startsWith('>') || LIST_RE.test(line);
}

export function parseMarkdown(body: string): Block[] {
  const lines = body.split('\n');
  const blocks: Block[] = [];
  const usedIds = new Map<string, number>();
  let i = 0;

  const uniqueId = (text: string) => {
    const base = slugHeading(text) || 'section';
    const count = usedIds.get(base) ?? 0;
    usedIds.set(base, count + 1);
    return count ? `${base}-${count + 1}` : base;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim() || 'text';
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) { code.push(lines[i]); i++; }
      i++;
      blocks.push({ type: 'code', lang, code: code.join('\n').trimEnd() });
      continue;
    }

    const h = HEAD_RE.exec(line.trim());
    if (h) {
      const text = h[2].trim();
      blocks.push({ type: 'heading', level: h[1].length, text, id: uniqueId(text) });
      i++;
      continue;
    }

    if (HR_RE.test(line.trim())) { blocks.push({ type: 'hr' }); i++; continue; }

    if (line.trim().startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i].trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
        const isSeparator = cells.every((c) => /^:?-{2,}:?$/.test(c));
        if (!isSeparator) rows.push(cells);
        i++;
      }
      if (rows.length) blocks.push({ type: 'table', rows });
      continue;
    }

    if (line.trim().startsWith('>')) {
      const quoted: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoted.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      const first = quoted[0] ?? '';
      const cm = /^\[!(NOTE|CONSEIL|TIP|IMPORTANT|ATTENTION|WARNING|CAUTION)\]\s*/i.exec(first);
      let kind: string | null = null;
      if (cm) {
        const raw = cm[1].toUpperCase();
        kind = raw === 'CONSEIL' || raw === 'TIP' ? 'tip'
          : raw === 'IMPORTANT' ? 'important'
          : raw === 'ATTENTION' || raw === 'WARNING' || raw === 'CAUTION' ? 'warning' : 'note';
        quoted[0] = first.slice(cm[0].length);
      }
      blocks.push({ type: 'quote', lines: quoted.filter((l, idx) => idx !== 0 || l.trim() !== ''), kind });
      continue;
    }

    if (LIST_RE.test(line)) {
      const items: { text: string; depth: number }[] = [];
      let ordered = false;
      while (i < lines.length) {
        const m = LIST_RE.exec(lines[i]);
        if (m) {
          ordered = /^\d/.test(m[2]);
          items.push({ text: m[3].trim(), depth: Math.min(2, Math.floor(m[1].replace(/\t/g, '  ').length / 2)) });
          i++;
        } else if (lines[i].trim() && /^\s{2,}\S/.test(lines[i]) && !isStructural(lines[i]) && items.length) {
          items[items.length - 1].text += ' ' + lines[i].trim();
          i++;
        } else break;
      }
      if (items.length) blocks.push({ type: 'list', ordered, items });
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && !isStructural(lines[i])) { para.push(lines[i].trim()); i++; }
    const text = para.join(' ').trim();
    if (text) blocks.push({ type: 'paragraph', text });
    else i++;
  }
  return blocks;
}

export function getHeadings(blocks: Block[]): Heading[] {
  return blocks
    .filter((b): b is Extract<Block, { type: 'heading' }> => b.type === 'heading')
    .map((b) => ({ level: b.level, text: b.text, id: b.id }));
}

// Rendu inline sûr : aucune injection HTML, uniquement des nœuds React.
const TOKEN_RE = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|\[[^\]]+\]\([^)\s]+\))/g;

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('`')) {
      out.push(<code className="inline-code" key={key++}>{tok.slice(1, -1)}</code>);
    } else if (tok.startsWith('**') || tok.startsWith('__')) {
      out.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith('*')) {
      out.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    } else {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok);
      if (link) {
        const url = link[2];
        const safe = /^(https?:\/\/|mailto:|#|\/)/i.test(url);
        out.push(safe
          ? <a key={key++} href={url} target={url.startsWith('http') ? '_blank' : undefined} rel="noreferrer noopener">{link[1]}</a>
          : <span key={key++}>{link[1]}</span>);
      } else out.push(tok);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch { /* presse-papiers indisponible dans l'aperçu */ }
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="code-block">
      <div className="code-head">
        <span className="code-lang"><Icon name="terminal" size={13} /> {lang}</span>
        <button className={`code-copy ${copied ? 'ok' : ''}`} onClick={copy} type="button" aria-label="Copier le code">
          <Icon name={copied ? 'check' : 'copy'} size={13} /> {copied ? 'Copié' : 'Copier'}
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

const CALLOUTS: Record<string, { label: string; icon: string }> = {
  tip: { label: 'Conseil', icon: 'sparkles' },
  important: { label: 'Important', icon: 'alert' },
  warning: { label: 'Attention', icon: 'zap' },
  note: { label: 'Note', icon: 'book' },
};

function renderBlock(block: Block, key: number): ReactNode {
  switch (block.type) {
    case 'heading': {
      const Tag = (`h${Math.min(4, block.level)}`) as 'h2' | 'h3' | 'h4';
      return (
        <Tag key={key} id={block.id} className="md-heading">
          <button
            type="button"
            className="heading-anchor"
            aria-label="Aller à cette section"
            onClick={() => document.getElementById(block.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >#</button>
          {inline(block.text)}
        </Tag>
      );
    }
    case 'paragraph': return <p key={key}>{inline(block.text)}</p>;
    case 'code': return <CodeBlock key={key} lang={block.lang} code={block.code} />;
    case 'hr': return <hr key={key} />;
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag key={key} className="md-list">
          {block.items.map((item, j) => (
            <li key={j} className={item.depth ? `depth-${item.depth}` : undefined}>{inline(item.text)}</li>
          ))}
        </Tag>
      );
    }
    case 'table':
      return (
        <div className="table-wrap" key={key}>
          <table>
            <thead><tr>{block.rows[0].map((cell, j) => <th key={j}>{inline(cell)}</th>)}</tr></thead>
            <tbody>
              {block.rows.slice(1).map((row, j) => (
                <tr key={j}>{row.map((cell, k) => <td key={k}>{inline(cell)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'quote': {
      if (!block.kind) {
        return <blockquote key={key}>{block.lines.map((l, j) => <p key={j}>{inline(l)}</p>)}</blockquote>;
      }
      const meta = CALLOUTS[block.kind] ?? CALLOUTS.note;
      return (
        <div className={`callout callout-${block.kind}`} key={key}>
          <div className="callout-label"><Icon name={meta.icon} size={15} /> {meta.label}</div>
          <div className="callout-body">
            {block.lines.filter((l) => l.trim()).map((l, j) => <p key={j}>{inline(l)}</p>)}
          </div>
        </div>
      );
    }
  }
}

export function Markdown({ blocks }: { blocks: Block[] }) {
  const content = useMemo(() => blocks.map((b, i) => renderBlock(b, i)), [blocks]);
  return <div className="markdown">{content}</div>;
}
