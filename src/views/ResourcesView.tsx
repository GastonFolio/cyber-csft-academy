import type { CSSProperties } from 'react';
import { SectionTitle } from '../components/ui';
import { catalog, lessons, modules } from '../lib/content';
import { Icon } from '../lib/icons';
import { useProgress } from '../lib/progress';

const REFERENCES = [
  { name: 'OWASP Top 10', desc: 'Les dix familles de risques applicatifs', url: 'https://owasp.org/www-project-top-ten/', accent: '#34d399' },
  { name: 'MITRE ATT&CK', desc: 'Tactiques et techniques adversaires', url: 'https://attack.mitre.org/', accent: '#a78bfa' },
  { name: 'NIST CSF 2.0', desc: 'Cadre de gestion du risque cyber', url: 'https://www.nist.gov/cyberframework', accent: '#38bdf8' },
  { name: 'ANSSI', desc: 'Guides français de durcissement', url: 'https://cyber.gouv.fr/', accent: '#22d3ee' },
  { name: 'CISA KEV', desc: 'Vulnérabilités exploitées sur le terrain', url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog', accent: '#f472b6' },
  { name: 'PortSwigger Academy', desc: 'Labs web gratuits et documentés', url: 'https://portswigger.net/web-security', accent: '#4ade80' },
  { name: 'INE / eJPT', desc: 'Certification junior 100 % pratique', url: 'https://ine.com/', accent: '#fbbf24' },
  { name: 'Documentation Debian', desc: 'Référence systèmes et paquets', url: 'https://www.debian.org/doc/', accent: '#94a3b8' },
];

const ARCH = [
  { icon: 'git-branch', iconFallback: 'path', title: 'Contenu data-driven', text: 'Les dépôts Markdown sont ingérés par un script Python : nettoyage, métadonnées FR, index et catalogue JSON. La UI ne dépend d’aucun fichier source.' },
  { icon: 'zap', iconFallback: 'zap', title: 'Performance', text: 'React + Vite, zéro dépendance UI lourde, rendu Markdown en composants mémorisés, recherche sur index pré-calculé, vues chargées à la demande.' },
  { icon: 'layers', iconFallback: 'layers', title: 'Scalabilité', text: 'Ajouter un dépôt, un module ou une leçon = une ligne de configuration puis un build. Aucune page codée en dur ; le contenu peut être servi par une API plus tard.' },
  { icon: 'shield', iconFallback: 'shield', title: 'Sécurité', text: 'Aucun HTML injecté : le Markdown est parsé en nœuds React, les liens sont validés, la progression reste locale au navigateur, sans backend ni tracking.' },
];

export default function ResourcesView() {
  const { state, reset, xp } = useProgress();

  const exportProgress = () => {
    const data = { exportedAt: new Date().toISOString(), ...state, xp };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'cyber-academie-progression.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="view resources-view">
      <section className="page-intro">
        <div>
          <span className="eyebrow">SOURCES, CRÉDITS & ARCHITECTURE</span>
          <h2>Un parcours construit sur de l'open source</h2>
          <p>
            {lessons.length} leçons issues de deux dépôts publics sous licence MIT et de {lessons.filter((l) => l.origin === 'academy').length} cours maison
            rédigés pour combler les trous du parcours. Chaque leçon conserve un lien vers son fichier d'origine.
          </p>
        </div>
        <div className="intro-stats">
          <div><strong>{Object.values(catalog.sources).reduce((s, x) => s + x.count, 0)}</strong><span>fichiers sources</span></div>
          <div><strong>{modules.length}</strong><span>modules</span></div>
        </div>
      </section>

      <div className="repo-grid">
        {(['ejpt', 'cyber'] as const).map((key) => {
          const s = catalog.sources[key];
          const topics = key === 'ejpt'
            ? ['Assessment methodologies', 'Host & network auditing', 'System / host based attacks', 'Metasploit Framework', 'Exploitation & post-exploitation', 'Social engineering', 'Web & HTTP']
            : ['Fondamentaux & acronymes', 'Kill Chain & malwares', 'Cryptographie', 'Proxy & reverse proxy', 'Logs Squid & SquidAnalyzer', 'EPP / EDR / SIEM / SOAR / XDR', 'Wazuh, Suricata, CrowdSec, nftables'];
          return (
            <article className="repo-card" key={key}>
              <div className="repo-card-top">
                <span className="repo-icon"><Icon name="github" size={22} /></span>
                <div><span className="eyebrow">DÉPÔT SOURCE · {key === 'ejpt' ? 'ANGLAIS' : 'FRANÇAIS'}</span><h3>{s.label}</h3><small>@{s.author}</small></div>
              </div>
              <p>{key === 'ejpt'
                ? 'Notes communautaires de préparation à l’eJPT v2, organisées selon les 9 sections du parcours INE Penetration Testing Student. Idéales pour la méthodologie offensive junior.'
                : 'Atelier pédagogique français de cyberdéfense : cours structurés, encarts de synthèse, TP Debian 12/13/14 et architecture de détection active.'}
              </p>
              <div className="repo-topics">{topics.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
              <div className="repo-meta">
                <span><Icon name="file-text" size={14} /> {s.count} leçons intégrées</span>
                <span><Icon name="shield" size={14} /> Licence {s.license}</span>
                <span><Icon name="git-branch" size={14} /> {s.branch}</span>
              </div>
              <a className="btn btn-outline full" href={s.url} target="_blank" rel="noreferrer noopener">
                Ouvrir sur GitHub <Icon name="arrow-up-right" size={15} />
              </a>
            </article>
          );
        })}
      </div>

      <section className="panel">
        <SectionTitle eyebrow="SOUS LE CAPOT" title="Une architecture moderne, sobre et extensible" subtitle="Pensée pour grandir : du simple catalogue JSON à un backend de contenu, sans réécrire l'interface." />
        <div className="arch-grid">
          {ARCH.map((a, i) => (
            <div className="arch-card" key={a.title} style={{ '--arch-color': ['#22d3ee', '#fbbf24', '#a78bfa', '#4ade80'][i] } as CSSProperties}>
              <span className="arch-icon"><Icon name={a.iconFallback} size={20} /></span>
              <strong>{a.title}</strong>
              <p>{a.text}</p>
            </div>
          ))}
        </div>
        <div className="pipeline">
          <div className="pipeline-step"><Icon name="github" size={18} /><span>2 dépôts Git</span></div>
          <Icon name="arrow-right" size={16} />
          <div className="pipeline-step"><Icon name="code" size={18} /><span>build_content.py</span></div>
          <Icon name="arrow-right" size={16} />
          <div className="pipeline-step"><Icon name="file-text" size={18} /><span>catalog.json</span></div>
          <Icon name="arrow-right" size={16} />
          <div className="pipeline-step"><Icon name="zap" size={18} /><span>React + Vite</span></div>
          <Icon name="arrow-right" size={16} />
          <div className="pipeline-step"><Icon name="globe" size={18} /><span>Static / CDN</span></div>
        </div>
        <div className="code-block static-code">
          <div className="code-head"><span className="code-lang"><Icon name="terminal" size={13} /> bash</span></div>
          <pre><code>{`# Mettre à jour les dépôts et régénérer le catalogue
npm run sync:content

# Développement / build de production
npm run dev
npm run build

# Ajouter un cours maison : copier un .md dans content/ avec front matter
# puis relancer : python3 scripts/build_content.py`}</code></pre>
        </div>
      </section>

      <section className="panel">
        <SectionTitle eyebrow="POUR ALLER PLUS LOIN" title="Références officielles & terrains d'entraînement" />
        <div className="refs-grid">
          {REFERENCES.map((r) => (
            <a className="ref-card" key={r.name} href={r.url} target="_blank" rel="noreferrer noopener" style={{ '--ref-color': r.accent } as CSSProperties}>
              <span className="ref-icon"><Icon name="link" size={16} /></span>
              <span><strong>{r.name}</strong><small>{r.desc}</small></span>
              <Icon name="arrow-up-right" size={15} />
            </a>
          ))}
        </div>
      </section>

      <div className="two-col">
        <section className="panel data-panel">
          <SectionTitle eyebrow="DONNÉES LOCALES" title="Votre progression vous appartient" subtitle="Aucun compte, aucun serveur : tout est stocké dans localStorage sur cet appareil." />
          <div className="data-row"><Icon name="check-circle" size={16} /><span>{state.completed.length} leçons terminées · {xp} XP</span></div>
          <div className="data-row"><Icon name="trophy" size={16} /><span>{Object.keys(state.quizBest).length} sessions de quiz enregistrées</span></div>
          <div className="data-actions">
            <button className="btn btn-outline btn-sm" onClick={exportProgress} type="button"><Icon name="download" size={14} /> Exporter mes données</button>
            <button className="btn btn-ghost btn-sm danger" onClick={() => { if (window.confirm('Réinitialiser toute la progression ?')) reset(); }} type="button">
              <Icon name="refresh" size={14} /> Réinitialiser
            </button>
          </div>
        </section>

        <section className="panel ethics-panel">
          <SectionTitle eyebrow="CADRE LÉGAL" title="Apprendre, oui — sans déborder du périmètre" />
          <div className="callout callout-warning">
            <div className="callout-label"><Icon name="zap" size={15} /> Attention</div>
            <div className="callout-body">
              <p>Les techniques de scan, d'exploitation et de post-exploitation décrites dans ce parcours ne doivent être pratiquées que sur des systèmes vous appartenant, un lab isolé, ou un périmètre couvert par une autorisation écrite.</p>
            </div>
          </div>
          <p className="ethics-note">
            Les contenus des deux dépôts restent la propriété de leurs auteurs respectifs et sont reproduits ici sous licence MIT avec attribution.
            Les cours maison sont fournis à titre pédagogique, sans garantie d'exhaustivité.
          </p>
        </section>
      </div>
    </div>
  );
}
