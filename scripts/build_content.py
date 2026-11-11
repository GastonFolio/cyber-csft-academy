#!/usr/bin/env python3
"""
Pipeline de contenu — Cyber Académie A→Z

Rôle : transformer les dépôts Markdown sources + les cours maison en un
catalogue JSON unique, consommé par le front-end React.

  python3 scripts/build_content.py            # rebuild depuis .sources/
  python3 scripts/build_content.py --sync     # git pull des dépôts d'abord

Le front-end ne parse jamais de Markdown brut à l'exécution : tout est
nettoyé, normalisé et indexé ici, au build. Ajouter un cours = ajouter un
.md dans content/ (ou un dépôt dans SOURCES) puis relancer ce script.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / ".sources"
CONTENT = ROOT / "content"
OUT = ROOT / "src" / "data"
OUT.mkdir(parents=True, exist_ok=True)

REPOS = {
    "ejpt": {
        "url": "https://github.com/skullhat/eJPT-v2-Certificate-Notes.git",
        "branch": "main",
        "label": "eJPT v2 — Certificate Notes",
        "author": "skullhat",
        "license": "MIT",
        "lang": "en",
    },
    "cyber": {
        "url": "https://github.com/0xCyberLiTech/Cybersecurite.git",
        "branch": "main",
        "label": "Cybersécurité — Atelier Défense Linux",
        "author": "0xCyberLiTech",
        "license": "MIT",
        "lang": "fr",
    },
}

# ---------------------------------------------------------------------------
# Parcours pédagogique : 13 modules, 3 phases, 4 filières
# ---------------------------------------------------------------------------
MODULES = [
    dict(id="M01", n=1, title="Fondations & vocabulaire", phase="fondations", track="fondations",
         level="debutant", icon="book", accent="#22d3ee",
         description="Les concepts, le lexique et le cadre légal. Point de départ absolu, sans prérequis.",
         objective="Savoir définir la cybersécurité, lire un acronyme et situer les acteurs d'un SI."),
    dict(id="M02", n=2, title="Menaces & modèles d'attaque", phase="fondations", track="fondations",
         level="debutant", icon="bug", accent="#f472b6",
         description="Kill Chain, malwares, MITRE ATT&CK, CVE/CVSS : penser comme l'attaquant pour mieux défendre.",
         objective="Décrire le cycle de vie d'une attaque et qualifier une menace."),
    dict(id="M03", n=3, title="Réseaux & systèmes", phase="fondations", track="fondations",
         level="debutant", icon="network", accent="#38bdf8",
         description="OSI/TCP-IP, adressage, ports, shell Linux et audit d'hôte : la couche sur laquelle tout repose.",
         objective="Lire une trame, calculer un sous-réseau et auditer une machine avec les commandes de base."),
    dict(id="M04", n=4, title="Reconnaissance & OSINT", phase="redteam", track="redteam",
         level="debutant", icon="search", accent="#a78bfa",
         description="Collecter l'information publiquement disponible, passivement puis activement, dans un cadre autorisé.",
         objective="Distinguer passif/actif et construire une fiche de cible à partir de sources ouvertes."),
    dict(id="M05", n=5, title="Scan & énumération", phase="redteam", track="redteam",
         level="debutant", icon="target", accent="#a78bfa",
         description="Footprinting, Nmap, énumération de services et boîte à outils du pentesteur junior.",
         objective="Cartographier les ports, versions et services d'une cible et interpréter les résultats."),
    dict(id="M06", n=6, title="Vulnérabilités & attaques système", phase="redteam", track="redteam",
         level="intermediaire", icon="shield", accent="#a78bfa",
         description="Évaluation de vulnérabilités, CVE connus, Windows/Linux, attaques réseau et pulvérisation de mots de passe.",
         objective="Prioriser une vulnérabilité et comprendre les faiblesses classiques d'un hôte."),
    dict(id="M07", n=7, title="Exploitation & Metasploit", phase="redteam", track="redteam",
         level="intermediaire", icon="terminal", accent="#a78bfa",
         description="Le framework Metasploit de A à Z : modules, payloads, scanners, automatisation et phase d'exploitation.",
         objective="Enchaîner recherche de module, configuration, exécution et validation d'une session."),
    dict(id="M08", n=8, title="Post-exploitation & privilèges", phase="redteam", track="redteam",
         level="avance", icon="key", accent="#a78bfa",
         description="Élévation de privilèges Windows/Linux, vol de secrets, pivot et post-exploitation.",
         objective="Comprendre ce qu'un attaquant cherche après le premier accès et comment le détecter."),
    dict(id="M09", n=9, title="Pentest Web & OWASP", phase="redteam", track="web",
         level="intermediaire", icon="globe", accent="#34d399",
         description="HTTP, énumération de répertoires, injections, XSS, SSRF, sessions et failles d'API.",
         objective="Tester manuellement une application web et expliquer la remédiation associée."),
    dict(id="M10", n=10, title="Ingénierie sociale", phase="redteam", track="redteam",
         level="intermediaire", icon="users", accent="#a78bfa",
         description="Le facteur humain : prétextes, hameçonnage, campagnes GoPhish et sensibilisation.",
         objective="Identifier les leviers psychologiques d'une campagne et mettre en place des contre-mesures."),
    dict(id="M11", n=11, title="Défense & Blue Team", phase="blueteam", track="blueteam",
         level="intermediaire", icon="shield", accent="#4ade80",
         description="Proxys Squid, reverse proxy, logs, EPP/EDR/SIEM/SOAR/XDR, Wazuh, Suricata, CrowdSec et nftables.",
         objective="Concevoir une architecture de détection et lire les journaux d'un incident."),
    dict(id="M12", n=12, title="Cryptographie & durcissement", phase="blueteam", track="blueteam",
         level="intermediaire", icon="lock", accent="#4ade80",
         description="Chiffrement symétrique/asymétrique, outils concrets, secrets, durcissement noyau et surface d'attaque.",
         objective="Choisir une primitive cryptographique et appliquer une baseline de durcissement."),
    dict(id="M13", n=13, title="Gouvernance, cloud & carrière", phase="blueteam", track="gouvernance",
         level="avance", icon="layers", accent="#fbbf24",
         description="Gestion des risques, ISO 27001, NIST, RGPD, cloud, conteneurs, DevSecOps, labs et certifications.",
         objective="Relier la technique aux exigences de conformité et construire son plan de progression."),
]

PHASES = [
    dict(id="fondations", title="Poser les bases", subtitle="Comprendre avant d'agir", range="01 → 03"),
    dict(id="redteam", title="Penser attaque", subtitle="Méthodologie de test d'intrusion", range="04 → 10"),
    dict(id="blueteam", title="Défendre & piloter", subtitle="Détection, conformité, carrière", range="11 → 13"),
]

# ---------------------------------------------------------------------------
# Métadonnées des fichiers sources (titre FR, module, ordre, résumé, tags)
# clé = chemin relatif dans le dépôt
# ---------------------------------------------------------------------------
# (titre, module, ordre, résumé FR, tags)
META = {
    # ---- 0xCyberLiTech / Cybersecurite -----------------------------------
    "CYBERSECURITE-01-FICHE-REFLEX.md": ("Fiche réflexe : la cybersécurité en un coup d'œil", "M01", 1.0, "La synthèse globale à garder sous les yeux : principes, vocabulaire et réflexes essentiels.", ["synthèse", "bases"]),
    "CYBERSECURITE-02-definition.md": ("Définition de la cybersécurité", "M01", 2.0, "Ce que recouvre réellement le terme, les objectifs de la sécurité de l'information et la triade CIA.", ["définition", "CIA"]),
    "CYBERSECURITE-03-ACRONYMES.md": ("Les acronymes clés du domaine", "M01", 3.0, "Un glossaire commenté des sigles incontournables : APT, DDoS, phishing, ransomware et bien d'autres.", ["glossaire", "vocabulaire"]),
    "CYBERSECURITE-04-KILL-CHAIN.md": ("La Cyber Kill Chain en 7 étapes", "M02", 10.0, "Le modèle Lockheed Martin, de la reconnaissance aux actions sur l'objectif, avec les défenses associées à chaque phase.", ["kill chain", "modèle", "détection"]),
    "CYBERSECURITE-05-LOGICIELS-MALVEILLANTS-introduction.md": ("Logiciels malveillants : introduction", "M02", 11.0, "Typologie des malwares, vecteurs de propagation et cycle d'infection, du virus au ransomware.", ["malware", "menaces"]),
    "CYBERSECURITE-06-LOGICIELS-MALVEILLANTS-techniques_de_protection.md": ("Se protéger contre les malwares", "M02", 12.0, "Les couches de protection complémentaires : prévention, détection, confinement et remédiation.", ["malware", "défense", "hygiène"]),
    "CYBERSECURITE-07-CRYPTOGRAPHIE-introduction.md": ("Cryptographie : les fondamentaux", "M12", 1.0, "Chiffrement symétrique et asymétrique, hachage, signature et échange de clés expliqués sans jargon inutile.", ["crypto", "chiffrement", "hash"]),
    "CYBERSECURITE-08-CRYPTOGRAPHIE-OUTILS-Mise-en-pratique-avec-des-outils-concrets.md": ("Cryptographie : mise en pratique avec des outils", "M12", 2.0, "Génération de clés, signatures, chiffrement de fichiers et TLS avec des commandes directement utilisables.", ["crypto", "openssl", "gpg", "TLS"]),
    "CYBERSECURITE-09-PROXY-INTRODUCTION-Le-rôle-du-proxy-sortant.md": ("Proxy sortant : principes et rôle", "M11", 1.0, "Pourquoi et comment un proxy sortant contrôle, journalise et filtre le trafic des postes vers Internet.", ["proxy", "squid", "réseau"]),
    "CYBERSECURITE-10-PROXY-INSTALLATION-Mise-en-œuvre-pratique.md": ("Proxy sortant : installation & configuration", "M11", 2.0, "Déploiement pas à pas d'un proxy Squid sur Debian, règles d'accès et validation.", ["squid", "debian", "TP"]),
    "CYBERSECURITE-11-REVERSE-PROXY-INTRODUCTION-Le-rôle-du-proxy-entrant.md": ("Reverse proxy : principes et rôle", "M11", 3.0, "Le proxy entrant comme point d'entrée unique : répartition, terminaison TLS et protection des backends.", ["reverse proxy", "nginx", "architecture"]),
    "CYBERSECURITE-12-REVERSE-PROXY-INSTALLATION-Mise-en-œuvre-pratique.md": ("Reverse proxy : mise en œuvre pratique", "M11", 4.0, "Configuration concrète d'un reverse proxy, en-têtes de sécurité et tests de bout en bout.", ["reverse proxy", "TLS", "TP"]),
    "CYBERSECURITE-12-1-PROXY_Suivi_&_Analyse_des_logs_Squid_sous_Debian_12_&_13.md": ("Suivi & analyse des logs Squid", "M11", 5.0, "Lire les journaux d'accès Squid, repérer les anomalies et construire des indicateurs simples.", ["logs", "squid", "détection"]),
    "CYBERSECURITE-12-2-Installation-&-Utilisation-de-SquidAnalyzer-Debian-12-&-13.md": ("SquidAnalyzer : installation & usage", "M11", 6.0, "Générer des rapports d'usage à partir des logs proxy pour faciliter l'investigation.", ["logs", "squid", "reporting"]),
    "CYBERSECURITE-13-EPP-EDR-SIEM-SOAR-et-XDR-comprendre-la-différence-entre-ces-acronymes.md": ("EPP, EDR, SIEM, SOAR, XDR : le comparatif", "M11", 7.0, "Enfin clair sur les plateformes de sécurité : périmètre, données collectées et cas d'usage de chacune.", ["EDR", "SIEM", "SOAR", "XDR", "SOC"]),
    "CYBERSECURITE-14-EDR.md": ("EDR : détection et réponse sur les postes", "M11", 8.0, "Télémétrie endpoint, règles de détection, investigation et isolation d'un hôte compromis.", ["EDR", "endpoint", "incident"]),
    "CYBERSECURITE-15-TP-install-Wazuh-Debian12-13.md": ("TP : déployer Wazuh sur Debian", "M11", 9.0, "Travaux pratiques : installer la plateforme Wazuh, connecter un agent et lire les premières alertes.", ["Wazuh", "SIEM", "TP", "debian"]),
    "CYBERSECURITE-SURICATA-CROWDSEC-NFTABLES-DEBIAN-13-14.md": ("IDS/IPS Suricata, CrowdSec & nftables", "M11", 10.0, "Architecture de cyberdéfense active : détection réseau, remédiation comportementale et bouncer pare-feu.", ["Suricata", "CrowdSec", "nftables", "IDS", "IPS"]),

    # ---- eJPT Section 1 --------------------------------------------------
    "Section 1 - Assessment Methodologies/00 - Information Gathering.md": ("Information gathering : les fondamentaux", "M04", 1.0, "Première phase d'un test d'intrusion : ce que l'on cherche et la différence entre collecte passive et active.", ["recon", "méthodologie"]),
    "Section 1 - Assessment Methodologies/01 - Passive Information Gathering.md": ("Collecte d'informations passive", "M04", 2.0, "Whois, DNS, moteurs de recherche et sources publiques sans jamais toucher à la cible.", ["OSINT", "passif", "DNS"]),
    "Section 1 - Assessment Methodologies/02 - Active Information Gathering.md": ("Collecte d'informations active", "M04", 3.0, "Interroger directement l'infrastructure cible : DNS, ports et bannières, toujours avec autorisation.", ["recon", "actif", "autorisation"]),
    "Section 1 - Assessment Methodologies/03 - Footprinting & Scanning.md": ("Footprinting & scanning réseau", "M05", 1.0, "Découverte d'hôtes, balayage de ports et profilage d'une surface d'attaque réseau.", ["scan", "footprinting", "nmap"]),
    "Section 1 - Assessment Methodologies/04 - Enumeration.md": ("Énumération des services", "M05", 2.0, "Tirer le maximum des services découverts : SMB, FTP, SSH, HTTP, SNMP et comptes associés.", ["énumération", "services", "SMB"]),
    "Section 1 - Assessment Methodologies/05 - Vulnerability Assessment.md": ("Évaluation des vulnérabilités", "M06", 1.0, "Méthodologie pour identifier, classifier et documenter les faiblesses d'un périmètre.", ["vulnérabilité", "VA", "scoring"]),
    "Section 1 - Assessment Methodologies/06  - Vulnerability Assessment Case Studies With Known CVEs.md": ("Études de cas : CVE connus", "M06", 2.0, "Cas pratiques d'exploitation de vulnérabilités référencées et lecture d'un avis CVE.", ["CVE", "cas pratique", "exploit"]),
    "Section 1 - Assessment Methodologies/07 - Password Spraying Attack.md": ("Password spraying", "M06", 3.0, "Attaque par mot de passe peu bruyante : principe, cibles privilégiées et détection côté défense.", ["password spraying", "authentification", "détection"]),
    "Section 1 - Assessment Methodologies/08 - DevSecOps.md": ("DevSecOps : intégrer la sécurité au pipeline", "M13", 5.0, "Déplacer la sécurité vers la gauche : SAST, DAST, analyse de dépendances et culture d'équipe.", ["DevSecOps", "CI/CD", "SAST"]),
    "Section 1 - Assessment Methodologies/09 - Tools Walkthroogh.md": ("Revue de la boîte à outils", "M05", 3.0, "Panorama commenté des outils utilisés pendant les phases de reconnaissance et de scan.", ["outils", "cheatsheet"]),

    # ---- eJPT Section 2 --------------------------------------------------
    "Section 2 - Host & Networking Auditing/Auditing.md": ("Audit d'hôtes & de réseaux", "M03", 4.0, "Notes eJPT sur l'audit de la configuration réseau et des hôtes : commandes et points de contrôle.", ["audit", "réseau", "hôte"]),

    # ---- eJPT Section 3 --------------------------------------------------
    "Section 3 - Host & Network Penetration Testing System-Host Based Attacks/01 - Introduction To System,Host Based Attacks.md": ("Introduction aux attaques basées sur l'hôte", "M06", 4.0, "Typologie des attaques visant le système d'exploitation et la machine locale.", ["hôte", "système", "attaque"]),
    "Section 3 - Host & Network Penetration Testing System-Host Based Attacks/02 - Windows Vulnrabilities.md": ("Vulnérabilités Windows", "M06", 5.0, "Faiblesses classiques d'un environnement Windows : services, privilèges et configuration.", ["Windows", "vulnérabilité"]),
    "Section 3 - Host & Network Penetration Testing System-Host Based Attacks/03 - Windows File System Vulnerabilities.md": ("Permissions & système de fichiers Windows", "M06", 6.0, "ACL, partages et chemins de recherche de DLL : ce qu'un testeur doit inspecter.", ["Windows", "ACL", "NTFS"]),
    "Section 3 - Host & Network Penetration Testing System-Host Based Attacks/04 - Windows Privilege Escalation.md": ("Élévation de privilèges Windows", "M08", 1.0, "Techniques et vecteurs courants pour passer d'un compte utilisateur à SYSTEM.", ["privesc", "Windows"]),
    "Section 3 - Host & Network Penetration Testing System-Host Based Attacks/05 - Windows Credential Dumping.md": ("Vol d'identifiants Windows", "M08", 2.0, "Où résident les secrets Windows (SAM, LSASS, cache) et pourquoi cela intéresse un attaquant.", ["credentials", "LSASS", "Windows"]),
    "Section 3 - Host & Network Penetration Testing System-Host Based Attacks/06 - Linux Vulnerabilities.md": ("Vulnérabilités Linux", "M06", 7.0, "Noyaux obsolètes, SUID, permissions et services mal configurés sur Linux.", ["Linux", "vulnérabilité", "SUID"]),
    "Section 3 - Host & Network Penetration Testing System-Host Based Attacks/07 - Linux Privilege Escalation.md": ("Élévation de privilèges Linux", "M08", 3.0, "SUID, sudo, cron, capabilities et chemins classiques vers root.", ["privesc", "Linux", "sudo"]),

    # ---- eJPT Section 4 --------------------------------------------------
    "Section 4 - Host & Network Penetration Testing Network-Based Attacks/Network-Based Attacks.md": ("Attaques basées sur le réseau", "M06", 8.0, "ARP, MITM, sniffing et attaques de couche réseau dans un LAN de test.", ["réseau", "MITM", "ARP"]),

    # ---- eJPT Section 5 --------------------------------------------------
    "Section 5 - Host & Network Penetration Testing -  The Metasploit Framework (MSF)/01 -Metasploit Fundamentals.md": ("Metasploit : fondamentaux", "M07", 1.0, "Architecture du framework, terminologie (exploit, payload, handler) et interface msfconsole.", ["Metasploit", "framework"]),
    "Section 5 - Host & Network Penetration Testing -  The Metasploit Framework (MSF)/02 - Practical Metasploit Framework Enumeration.md": ("Énumération avec Metasploit", "M07", 2.0, "Modules auxiliaires et scanners intégrés pour profiler une cible depuis msfconsole.", ["Metasploit", "énumération"]),
    "Section 5 - Host & Network Penetration Testing -  The Metasploit Framework (MSF)/03 - Metasploit Framework Vulnrabliliry Scanning.md": ("Scan de vulnérabilités avec Metasploit", "M07", 3.0, "Rechercher et valider des vulnérabilités connues directement dans le framework.", ["Metasploit", "scan", "CVE"]),
    "Section 5 - Host & Network Penetration Testing -  The Metasploit Framework (MSF)/04 - Client-Side Attacks Using Metasploit.md": ("Attaques côté client", "M07", 4.0, "Génération de charges utiles et scénarios où c'est l'utilisateur qui déclenche l'exécution.", ["Metasploit", "client-side", "payload"]),
    "Section 5 - Host & Network Penetration Testing -  The Metasploit Framework (MSF)/05 - WMAP WEB SCANNER.md": ("WMAP : scanner web de Metasploit", "M07", 5.0, "Utiliser le module WMAP pour cartographier rapidement une application web.", ["Metasploit", "WMAP", "web"]),
    "Section 5 - Host & Network Penetration Testing -  The Metasploit Framework (MSF)/06 - Automating Metasploit With Resource Scripts.md": ("Automatiser Metasploit avec des resource scripts", "M07", 6.0, "Industrialiser les tâches répétitives avec des scripts .rc et des handlers préconfigurés.", ["Metasploit", "automatisation", "rc"]),
    "Section 5 - Host & Network Penetration Testing -  The Metasploit Framework (MSF)/07 - Exploitation Phase Using Metasploit.md": ("Phase d'exploitation avec Metasploit", "M07", 7.0, "Choisir un exploit, configurer les options, lancer et valider une session.", ["Metasploit", "exploitation"]),
    "Section 5 - Host & Network Penetration Testing -  The Metasploit Framework (MSF)/08 - Windows & Linux Post Exploitation Using MSF.md": ("Post-exploitation Windows & Linux via MSF", "M07", 8.0, "Modules Meterpreter, collecte d'informations et actions post-exploitation courantes.", ["Metasploit", "Meterpreter", "post-exploitation"]),

    # ---- eJPT Section 6/7/8/9 --------------------------------------------
    "Section 6 - Host & Network Penetration Testing - Exploitation/Exploitation Phase.md": ("La phase d'exploitation", "M07", 9.0, " Synthèse eJPT de la phase d'exploitation : enchaînement, validation et documentation.", ["exploitation", "méthodologie"]),
    "Section 7 - Host & Network Penetration Testing - Post-Exploitation/Post-Exploitation Phase.md": ("La phase de post-exploitation", "M08", 4.0, "Après l'accès initial : collecte, maintien, mouvement latéral et préparation du rapport.", ["post-exploitation", "pivot"]),
    "Section 8 - Host & Network Penetration Testing - Social Engineering/0 - Social Engineering.md": ("Ingénierie sociale : introduction", "M10", 1.0, "Le facteur humain comme vecteur d'entrée : principes et grands scénarios.", ["social engineering", "humain"]),
    "Section 8 - Host & Network Penetration Testing - Social Engineering/1 - Social Engineering and Penetration Testing.md": ("Ingénierie sociale & test d'intrusion", "M10", 2.0, "Intégrer une campagne de sensibilisation ou de test dans une mission cadrée.", ["social engineering", "pentest", "cadre légal"]),
    "Section 8 - Host & Network Penetration Testing - Social Engineering/2 - GoPhish.md": ("GoPhish : campagne de simulation", "M10", 3.0, "Déployer une campagne de phishing simulé, suivre les indicateurs et restituer les résultats.", ["GoPhish", "phishing", "sensibilisation"]),
    "Section 9 - Web Application Penetration Testing - Introduction to the Web and HTTP Protocol/0 - Introduction to the Web and HTTP Protocol.md": ("Le Web & le protocole HTTP", "M09", 1.0, "Client/serveur, requêtes, méthodes, codes de statut, sessions et énumération de répertoires.", ["HTTP", "web", "curl", "gobuster"]),
    "Section 9 - Web Application Penetration Testing - Introduction to the Web and HTTP Protocol/1 - Web Application Penetration Testing.md": ("Test d'intrusion d'applications web", "M09", 2.0, "Notes eJPT sur la méthodologie de test web et les outils de première ligne.", ["pentest web", "OWASP", "méthodologie"]),
}


def slug(text: str) -> str:
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text[:70] or "lecon"


IMG_TAG = re.compile(r"<img[^>]*>", re.I)
HTML_TAG = re.compile(r"</?[a-zA-Z][^>]*>", re.I)
COMMENT = re.compile(r"<!--.*?-->", re.S)
WIKILINK = re.compile(r"!?\[\[([^\]]+)\]\]")
MD_IMAGE = re.compile(r"!\[[^\]]*\]\([^)]*\)")
ENTITIES = {"&nbsp;": " ", "&amp;": "&", "&rarr;": "→", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'"}


def clean_markdown(raw: str) -> str:
    """Normalise le Markdown des dépôts : supprime le HTML décoratif,
    conserve la structure pédagogique (titres, listes, tableaux, code)."""
    # Blocs d'habillage répétés en tête/pied des dépôts 0xCyberLiTech :
    # on les retire entièrement pour que la leçon commence par le vrai contenu.
    for marker in ("MASTER-HEADER", "DEBIAN-TRUTH", "CIEL-PEDAGOGY",
                   "MASTER-FOOTER", "DOC-HEADER", "DOC-FOOTER", "BANNER"):
        raw = re.sub(rf"<!--\s*{marker}-START\s*-->.*?<!--\s*{marker}-END\s*-->",
                     "", raw, flags=re.S | re.I)
    raw = COMMENT.sub("", raw)
    out: list[str] = []
    in_fence = False
    fence_lines = 0
    for line in raw.replace("\r\n", "\n").split("\n"):
        stripped = line.strip()
        if stripped.startswith("```"):
            in_fence = not in_fence
            fence_lines += 1
            if not in_fence:
                out.append("```")
            else:
                lang = stripped[3:].strip().split(" ")[0].lower()
                if lang in {"mermaid", "mermaidjs"}:
                    lang = "text"
                out.append("```" + (lang if re.fullmatch(r"[a-z0-9+#-]{1,15}", lang or "") else ""))
            continue
        if in_fence:
            out.append(line.rstrip())
            continue

        # Éléments purement décoratifs des dépôts GitHub
        if MD_IMAGE.fullmatch(stripped) or WIKILINK.fullmatch(stripped):
            continue
        if re.fullmatch(r"</?(div|p|a|details|summary|sub|sup|br|img|center|span|table|thead|tbody|tr|td|th|b|i|strong|em|hr|h\d)(\s[^>]*)?/?>", stripped, re.I):
            continue
        if re.match(r"^<(a|p|div|img|span)\b", stripped, re.I) and ">" in stripped and stripped.endswith(">"):
            continue
        if stripped.startswith("<!--") or stripped.startswith("-->") or stripped.startswith("<!-"):
            continue

        line = IMG_TAG.sub("", line)
        line = WIKILINK.sub(r"\1", line)
        line = MD_IMAGE.sub("", line)
        # Supprime le HTML résiduel mais garde le texte
        line = re.sub(r"</?(a|span|sub|sup|b|i|strong|em|code|div|p|details|summary)(\s[^>]*)?>", "", line, flags=re.I)
        line = re.sub(r"<br\s*/?>", " ", line, flags=re.I)
        line = HTML_TAG.sub("", line)
        for k, v in ENTITIES.items():
            line = line.replace(k, v)
        line = html.unescape(line)
        line = line.replace("&rarr;", "→").replace("\xa0", " ")

        if line.lstrip().startswith("#"):
            m = re.match(r"^(\s*)(#{1,6})\s+(.*)$", line)
            if m:
                level = min(4, max(2, len(m.group(2))))
                text = m.group(3).replace("**", "").replace("__", "").strip()
                text = re.sub(r"\s+", " ", text).strip(" .:-")
                line = "#" * level + " " + text if text else ""
        # GitHub callouts -> borne explicite pour le renderer
        line = re.sub(r"^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*",
                      lambda m: "> [!" + {"NOTE": "NOTE", "TIP": "CONSEIL", "IMPORTANT": "IMPORTANT",
                                          "WARNING": "ATTENTION", "CAUTION": "ATTENTION"}[m.group(1)] + "] ",
                      line.strip(), flags=re.I)
        line = line.rstrip()
        if not line.strip():
            if out and out[-1] == "":
                continue
            out.append("")
            continue
        if re.fullmatch(r"-{3,}|\*{3,}|_{3,}", line.strip()):
            if out and out[-1] == "---":
                continue
            out.append("---")
            continue
        out.append(line)

    if in_fence:  # fence non fermée dans la source
        out.append("```")
    text = "\n".join(out)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text


def stats(body: str) -> tuple[int, int]:
    words = len(re.findall(r"\w+", body))
    code = sum(1 for l in body.splitlines() if l.startswith("```")) // 2
    return words, code


def repo_lesson(repo: str, rel: str, raw: str) -> dict | None:
    meta = META.get(rel)
    if not meta:
        return None
    title, module, order, brief, tags = meta
    body = clean_markdown(raw)
    if len(body) < 80:
        return None
    words, code = stats(body)
    cfg = REPOS[repo]
    from urllib.parse import quote
    url = f"https://github.com/{'skullhat/eJPT-v2-Certificate-Notes' if repo == 'ejpt' else '0xCyberLiTech/Cybersecurite'}/blob/{cfg['branch']}/{quote(rel)}"
    mod = next(m for m in MODULES if m["id"] == module)
    return {
        "id": slug(f"{repo}-{title}")[:64],
        "title": title,
        "moduleId": module,
        "track": mod["track"],
        "level": mod["level"],
        "order": order,
        "origin": "repo",
        "repo": repo,
        "lang": cfg["lang"],
        "sourceUrl": url,
        "sourcePath": rel,
        "brief": brief,
        "tags": tags,
        "minutes": max(3, min(25, round(words / 170) + code)),
        "words": words,
        "codeBlocks": code,
        "body": body,
    }


def parse_front_matter(text: str) -> tuple[dict, str]:
    meta = {}
    if text.startswith("---\n"):
        end = text.find("\n---\n", 4)
        if end > 0:
            block = text[4:end]
            for line in block.splitlines():
                if ":" in line and not line.startswith("#"):
                    k, v = line.split(":", 1)
                    meta[k.strip()] = v.strip()
            text = text[end + 5:]
    return meta, text.strip()


def authored_lesson(path: Path) -> dict:
    meta, body = parse_front_matter(path.read_text(encoding="utf-8"))
    body = clean_markdown(body)
    words, code = stats(body)
    return {
        "id": meta.get("id") or slug(path.stem),
        "title": meta.get("title") or path.stem.replace("-", " ").title(),
        "moduleId": meta["module"],
        "track": next(m for m in MODULES if m["id"] == meta["module"])["track"],
        "level": meta.get("level", "debutant"),
        "order": float(meta.get("order", 90)),
        "origin": "academy",
        "repo": None,
        "lang": "fr",
        "sourceUrl": None,
        "sourcePath": f"content/{path.name}",
        "brief": meta.get("brief", ""),
        "tags": [t.strip() for t in meta.get("tags", "").split(",") if t.strip()],
        "minutes": int(meta.get("minutes") or max(4, round(words / 170) + code)),
        "words": words,
        "codeBlocks": code,
        "body": body,
    }


def sync() -> None:
    SOURCES.mkdir(exist_ok=True)
    for key, cfg in REPOS.items():
        dest = SOURCES / key
        if not (dest / ".git").exists():
            subprocess.run(["git", "clone", "--depth", "1", cfg["url"], str(dest)], check=True)
        else:
            subprocess.run(["git", "-C", str(dest), "pull", "--ff-only"], check=True)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sync", action="store_true", help="mettre à jour les dépôts avant le build")
    args = ap.parse_args()
    if args.sync:
        sync()

    lessons: list[dict] = []
    counts = {k: 0 for k in REPOS}
    skipped = []
    for repo in REPOS:
        base = SOURCES / repo
        if not base.exists():
            print(f"⚠  dépôt absent : {base} — lancez avec --sync", file=sys.stderr)
            continue
        for path in sorted(base.rglob("*.md")):
            if ".git" in path.parts or path.name.lower() in {"readme.md", "contributing.md", "changelog.md", "license.md"}:
                continue
            rel = path.relative_to(base).as_posix()
            obj = repo_lesson(repo, rel, path.read_text(encoding="utf-8", errors="replace"))
            if obj:
                lessons.append(obj)
                counts[repo] += 1
            else:
                skipped.append(f"{repo}/{rel}")

    for path in sorted(CONTENT.glob("*.md")):
        lessons.append(authored_lesson(path))

    seen: set[str] = set()
    for l in lessons:
        base_id = l["id"]
        i = 2
        while l["id"] in seen:
            l["id"] = f"{base_id}-{i}"
            i += 1
        seen.add(l["id"])

    lessons.sort(key=lambda l: (int(l["moduleId"][1:]), l["order"], l["title"]))
    curriculum = []
    for m in MODULES:
        ids = [l["id"] for l in lessons if l["moduleId"] == m["id"]]
        curriculum.append({**m, "lessonIds": ids,
                           "minutes": sum(l["minutes"] for l in lessons if l["moduleId"] == m["id"])})

    catalog = {
        "generatedAt": __import__("datetime").datetime.now().isoformat(timespec="seconds"),
        "sources": {k: {kk: vv for kk, vv in v.items() if kk != "url"} | {"url": v["url"], "count": counts[k]}
                    for k, v in REPOS.items()},
        "phases": PHASES,
        "modules": curriculum,
        "lessons": lessons,
    }
    (OUT / "catalog.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✓ {len(lessons)} leçons · {len(curriculum)} modules · "
          f"ejpt={counts['ejpt']} cyber={counts['cyber']} maison={len(list(CONTENT.glob('*.md')))}")
    print(f"✓ {OUT / 'catalog.json'} ({(OUT / 'catalog.json').stat().st_size // 1024} Ko)")
    if skipped:
        print("  ignorés (non mappés) :", ", ".join(skipped[:12]), "…" if len(skipped) > 12 else "")


if __name__ == "__main__":
    main()
