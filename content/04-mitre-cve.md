---
id: menaces-mitre-cve
title: MITRE ATT&CK, CVE et score CVSS
module: M02
level: debutant
minutes: 10
order: 13
brief: Les trois langages communs de la menace : qui attaque et comment (ATT&CK), quelle faiblesse (CVE), quelle gravité (CVSS).
tags: MITRE, ATT&CK, CVE, CVSS, veille
---

## Trois questions, trois référentiels

| Question | Référentiel | Réponse produite |
|:--|:--|:--|
| **Comment** l'attaquant opère-t-il ? | MITRE ATT&CK | Tactiques & techniques (T1059, T1021…) |
| **Quelle** faiblesse est exploitée ? | CVE / CWE | Identifiant `CVE-2021-44228`, type CWE-502 |
| **Quelle** gravité ? | CVSS | Score 0–10 et vecteur `AV:N/AC:L/…` |

## ATT&CK : lire une matrice

ATT&CK classe les comportements observés en **tactiques** (objectif : *Reconnaissance*, *Initial Access*, *Privilege Escalation*, *Exfiltration*…) et en **techniques** (méthode : *Phishing*, *Valid Accounts*, *OS Credential Dumping*). Une technique peut contenir des sous-techniques, avec des exemples de groupes d'attaquants et de logiciels.

> [!CONSEIL] En défense, une règle SIEM doit toujours référencer une technique ATT&CK. On ne détecte pas « un méchant », on détecte **T1110 Brute Force** ou **T1059.001 PowerShell**.

Exemple de chaîne logique : `T1595 Active Scanning` → `T1190 Exploit Public-Facing Application` → `T1059 Command and Scripting` → `T1003 OS Credential Dumping` → `T1021 Lateral Movement`. Chaque transition est un endroit où placer un capteur.

## CVE et CWE

- **CVE** : identifiant unique d'une vulnérabilité publique, géré par MITRE et alimenté par les éditeurs (*CNA*).
- **NVD** : base NIST qui enrichit les CVE avec les scores CVSS, les CPE (produits affectés) et les références.
- **CWE** : la *classe* de faiblesse (ex. CWE-89 injection SQL). Un CVE est une occurrence ; un CWE est la cause.
- **CISA KEV** : catalogue des vulnérabilités **effectivement exploitées** sur le terrain — la meilleure liste de priorisation.

## Lire un score CVSS v3.1

```text
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H  →  9.8 Critique
        │     │     │    │    │   │  │  └ Disponibilité
        │     │     │    │    │   │  └ Intégrité
        │     │     │    │    │   └ Confidentialité
        │     │     │    │    └ Scope (changement de périmètre)
        │     │     │    └ Interaction utilisateur requise
        │     │     └ Privilèges requis
        │     └ Complexité d'attaque
        └ Vecteur d'attaque (N = réseau)
```

Un 9.8 exploitable à distance sans compte ni clic est une urgence ; un 7.8 nécessitant un clic utilisateur se traite différemment. **Le score seul ne décide pas** : croisez-le avec l'exposition réelle, la criticité de l'actif et la présence dans le KEV.

## Veille opérationnelle

```bash
# Interroger l'API NVD pour un CVE précis (exemple)
curl -s "https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2021-44228" | jq '.vulnerabilities[0].cve.metrics'
```

## À retenir

ATT&CK décrit le **comportement** (détection), CVE la **faiblesse** (correction), CVSS la **gravité** (priorisation). Un bon rapport de pentest ou une bonne alerte SOC cite les trois.
