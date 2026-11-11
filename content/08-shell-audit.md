---
id: reseaux-audit-hote
title: Audit express d'un hôte Linux
module: M03
level: debutant
minutes: 9
order: 3
brief: Une checklist reproductible pour dresser l'état d'une machine en cinq minutes, côté attaque comme côté défense.
tags: audit, Linux, hardening, checklist, commandes
---

## Objectif

Avant toute exploitation — et au quotidien en défense — on établit une **photographie** de la machine : identité, réseau, services, comptes, privilèges, journaux. Cette routine est la même pour un lab eJPT et pour un audit de conformité.

## La checklist en 6 blocs

```bash
# 1. Identité et noyau
hostname; uname -a; cat /etc/os-release; uptime

# 2. Réseau
ip -c a; ip route; ss -tulpn; cat /etc/resolv.conf

# 3. Comptes et privilèges
id; sudo -l; getent passwd | awk -F: '$3==0 {print $1}'
awk -F: '($2==""){print $1}' /etc/shadow 2>/dev/null || echo "shadow protégé"

# 4. Services et tâches planifiées
systemctl list-units --type=service --state=running
crontab -l; ls -la /etc/cron.*

# 5. Points sensibles
find / -xdev -perm -4000 -type f -ls 2>/dev/null
find / -xdev -type f -name '*.pem' -o -name 'id_rsa' 2>/dev/null

# 6. Journaux
journalctl -p warning --since "24 hours ago" --no-pager | tail -30
last -a | head -15
```

## Lire le résultat

| Observation | Ce que ça signifie | Suite logique |
|:--|:--|:--|
| Port 0.0.0.0:3306 | Base accessible depuis tout le réseau | Vérifier `bind-address` et pare-feu |
| Binaire SUID inhabituel | Vecteur d'élévation potentiel | Identifier le propriétaire et la version |
| `sudo -l` → `(ALL) NOPASSWD: ALL` | Équivalent root immédiat | Restreindre la règle |
| Cron exécutant un script writable | Persistance / privesc triviale | Corriger les permissions |
| Journal SSH plein de `Failed password` | Tentatives de force brute | Fail2ban / CrowdSec, MFA, clés |

> [!CONSEIL] Enregistrez toujours la sortie dans un fichier horodaté (`script -q audit-$(date +%F).log`) : en mission, la traçabilité est aussi importante que la découverte.

## Côté défense : baseline minimale

1. Mises à jour automatiques de sécurité et inventaire des paquets.
2. `nftables` actif avec politique par défaut `drop` en entrée ; SSH limité aux IP d'administration.
3. SSH : `PermitRootLogin no`, `PasswordAuthentication no`, clés + MFA si possible.
4. `auditd` ou règles eBPF pour tracer les changements de fichiers sensibles.
5. Centralisation des journaux hors de l'hôte (Wazuh, syslog, SIEM) : un attaquant qui efface `/var/log` ne doit pas effacer la preuve.

## À retenir

Un audit n'est pas une collection de commandes : c'est une **boucle** — observer, comparer à une baseline, prioriser l'écart, corriger, revérifier. C'est exactement la logique du module Défense & Blue Team.
