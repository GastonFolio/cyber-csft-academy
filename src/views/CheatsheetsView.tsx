import { useMemo, useState, type CSSProperties } from 'react';
import { EmptyState, SectionTitle } from '../components/ui';
import { cheatCategories, cheatsheetTips, normalize } from '../lib/content';
import { Icon } from '../lib/icons';

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch { return false; }
  }
}

export default function CheatsheetsView() {
  const [active, setActive] = useState(cheatCategories[0].id);
  const [q, setQ] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const nq = normalize(q.trim());

  const cat = cheatCategories.find((c) => c.id === active) ?? cheatCategories[0];
  const commands = useMemo(
    () => (nq ? cheatCategories.flatMap((c) => c.commands.map((cmd) => ({ ...cmd, category: c.title, accent: c.accent })))
      .filter((c) => normalize(`${c.cmd} ${c.desc} ${c.category}`).includes(nq))
      : cat.commands.map((cmd) => ({ ...cmd, category: cat.title, accent: cat.accent }))),
    [cat, nq],
  );

  const doCopy = async (cmd: string) => {
    const ok = await copyText(cmd);
    if (ok) { setCopied(cmd); window.setTimeout(() => setCopied(null), 1500); }
  };

  const download = () => {
    const text = [
      '# Cyber Académie — Mémos & commandes',
      '',
      '> Uniquement sur un lab isolé ou un périmètre explicitement autorisé.',
      '',
      ...cheatCategories.flatMap((c) => [
        `## ${c.title}`, '', c.description, '',
        ...c.commands.map((cmd) => `- \`${cmd.cmd}\` — ${cmd.desc}`), '',
      ]),
      '## Règles', '', ...cheatsheetTips.map((t) => `- ${t}`), '',
    ].join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'cyber-academie-memos.md';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="view cheatsheets-view">
      <section className="page-intro">
        <div>
          <span className="eyebrow">ANTI-SÈCHES · {cheatCategories.length} FAMILLES</span>
          <h2>Mémos & commandes</h2>
          <p>Les commandes à portée de main, classées par famille d'outils. Copie en un clic, export Markdown, recherche plein texte.</p>
        </div>
        <button className="btn btn-outline" onClick={download} type="button"><Icon name="download" size={16} /> Télécharger le mémo</button>
      </section>

      <div className="cheat-search">
        <label className="filter-search">
          <Icon name="search" size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une commande : nmap, ss, curl, nft, trivy…" />
          {q && <button type="button" onClick={() => setQ('')} aria-label="Effacer"><Icon name="close" size={14} /></button>}
        </label>
        <span>{commands.length} commande{commands.length > 1 ? 's' : ''}</span>
      </div>

      {!nq && (
        <div className="cheat-tabs">
          {cheatCategories.map((c) => (
            <button key={c.id} className={`cheat-tab ${active === c.id ? 'active' : ''}`} onClick={() => setActive(c.id)} type="button"
              style={{ '--tab-color': c.accent } as CSSProperties}>
              <Icon name={c.icon} size={16} /> <span>{c.title}</span>
            </button>
          ))}
        </div>
      )}

      {commands.length === 0 ? (
        <EmptyState title="Aucune commande trouvée" hint="Essayez « nmap », « journalctl », « curl » ou « trivy »." />
      ) : (
        <>
          {!nq && (
            <div className="cheat-heading">
              <span className="cheat-heading-icon" style={{ '--glyph-color': cat.accent } as CSSProperties}><Icon name={cat.icon} size={22} /></span>
              <div><h3>{cat.title}</h3><p>{cat.description}</p></div>
            </div>
          )}
          <div className="command-list">
            {commands.map((cmd, i) => (
              <div className="command-row" key={`${cmd.cmd}-${i}`}>
                <span className="command-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="command-main">
                  <code>{cmd.cmd}</code>
                  <small>{cmd.desc}</small>
                  {nq && <span className="command-cat">{cmd.category}</span>}
                </div>
                <button className={`command-copy ${copied === cmd.cmd ? 'ok' : ''}`} onClick={() => doCopy(cmd.cmd)} type="button" aria-label="Copier la commande">
                  <Icon name={copied === cmd.cmd ? 'check' : 'copy'} size={15} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <section className="panel tips-panel">
        <SectionTitle eyebrow="RÈGLES D'OR" title="Avant de copier une commande" />
        <div className="tips-grid">
          {cheatsheetTips.map((t, i) => (
            <div className="tip" key={i}><span className="tip-num">0{i + 1}</span><p>{t}</p></div>
          ))}
        </div>
      </section>
    </div>
  );
}
