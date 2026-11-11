---
id: defense-soc-incident
title: SOC, triage d'alertes & réponse à incident
module: M11
level: intermediaire
minutes: 11
order: 11
brief: Transformer des logs en décisions : niveaux de triage, cycle de réponse à incident et indicateurs de qualité d'un SOC.
tags: SOC, incident, triage, logs, Wazuh, détection
---

## Du log à la décision

Une alerte n'est pas un incident. Le rôle du SOC est de transformer un flot d'événements en **décisions qualifiées** : ignorer (bruit), investiguer, contenir, escalader.

```text
Collecte (agents, syslog, NetFlow, EDR)
   → Normalisation (schéma commun, horodatage UTC, enrichment)
   → Corrélation (règles / UEBA / MITRE ATT&CK)
   → Alerte → Triage N1 → Investigation N2 → Remédiation / escalade
   → Retour d'expérience → amélioration des règles
```

> [!CONSEIL] Horodatage UTC partout, NTP sur tous les hôtes. Sans chronologie fiable, reconstituer une attaque devient impossible — et c'est souvent la première cause d'un incident mal compris.

## Triage : les 5 questions

1. **Quoi** : quelle règle a déclenché, quelle technique ATT&CK est visée ?
2. **Qui / où** : quel compte, quel hôte, quelle criticité d'actif ?
3. **Quand** : premier événement, fenêtre temporelle, récurrence ?
4. **Contexte** : changement prévu, déploiement, utilisateur en déplacement, faux positif connu ?
5. **Et ensuite** : y a-t-il des événements **en aval** (création de processus, connexion latérale, exfiltration) ?

Un bruit de scan isolé et un scan suivi d'une authentification réussie sur le même hôte n'ont pas du tout la même priorité : c'est la **corrélation** qui crée le signal.

## Réponse à incident (cycle NIST)

| Phase | Actions concrètes |
|:--|:--|
| Préparation | Inventaire, baseline, playbooks, sauvegardes, contacts, exercices |
| Détection & analyse | Qualification, périmètre, timeline, prélèvement de preuves |
| Confinement | Isolation réseau de l'hôte, révocation des tokens, blocage IP |
| Éradication | Suppression de la persistance, patch de la cause racine, rotation des secrets |
| Récupération | Restauration contrôlée, surveillance renforcée, validation métier |
| Retour d'expérience | Causes profondes, nouvelles règles de détection, mesures correctives suivies |

## Ce qu'on surveille en premier

- Authentifications : échecs massifs, connexions à des heures atypiques, nouveaux comptes privilégiés (Windows 4624/4672/4720, Linux `auth.log`).
- Exécution : PowerShell encodé, `curl|sh`, binaire dans `/tmp`, nouveaux services (4688, 7045, auditd/eBPF).
- Réseau : pics de connexions sortantes, DNS vers des domaines récents, beaconing régulier, scans internes.
- Intégrité : modifications de GPO, de `crontab`, de clés SSH autorisées, de règles pare-feu.
- Cloud : nouvelles clés d'accès, modifications de politiques IAM, désactivation de la journalisation.

```bash
# Premiers réflexes sur un hôte Linux suspect (à faire sur une copie / avec procédure)
ss -tunap ; ps auxww ; last -a | head -20
journalctl --since "2 hours ago" -p warning --no-pager
sudo find /etc -mmin -120 -type f -ls
```

## Qualité d'un SOC

Indicateurs utiles : taux de faux positifs par règle, **MTTD** (détection) et **MTTR** (remédiation), couverture ATT&CK des règles, proportion d'alertes avec décision documentée, délai de déploiement d'une nouvelle détection. Un SOC qui mesure seulement « le nombre d'alertes traitées » optimise le bruit.

## À retenir

La valeur d'un SOC ne vient pas du SIEM mais de la **boucle d'amélioration** : chaque incident doit produire une règle, un playbook ou un contrôle préventif. Les modules Wazuh, Suricata et CrowdSec du parcours fournissent la mise en pratique.
