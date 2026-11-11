---
id: defense-forensics
title: Forensic & analyse de journaux : premiers réflexes
module: M11
level: avance
minutes: 10
order: 12
brief: Préserver la preuve, construire une chronologie et correler les sources sans altérer la scène d'incident.
tags: forensic, logs, timeline, incident, volatilité
---

## L'ordre de volatilité

En analyse d'incident, on collecte **du plus volatile au plus persistant** : une mémoire vive perdue ne se récupère pas, un fichier sur disque si.

```text
1. Registres CPU / cache, connexions réseau actives
2. Mémoire vive (RAM), processus, clés de chiffrement en clair
3. État réseau : connexions, tables ARP, sessions
4. Disque : fichiers, journaux, métadonnées
5. Sauvegardes, journaux centralisés, archives hors ligne
```

> [!IMPORTANT] Avant toute action sur une machine compromise : ne pas redémarrer, ne pas « nettoyer », ne pas lancer d'antivirus en mode suppression. Isoler le réseau si la procédure l'autorise, photographier l'état, consigner l'heure UTC et la personne présente. La **chaîne de custody** commence à la première commande.

## Construire une timeline

Une chronologie exploitable croise au moins trois sources : journaux système, journaux applicatifs et télémétrie réseau/EDR. Elle se construit autour d'un **événement pivot** (première alerte) puis s'étend en amont (comment l'accès a été obtenu) et en aval (quelles actions ont suivi).

```bash
# Copie de travail, jamais d'analyse directement sur l'original
sha256sum evidence.img | tee evidence.sha256

# Journal système : erreurs et authentifications sur la fenêtre d'intérêt
journalctl --since "2026-11-10 08:00" --until "2026-11-10 10:00" --utc --no-pager

# Fichiers modifiés dans les deux dernières heures
find / -xdev -mmin -120 -type f -printf '%TY-%Tm-%Td %TH:%TM %u %p\n' 2>/dev/null | sort

# Connexions encore établies au moment du prélèvement
ss -tunap ; ip neigh show ; arp -an 2>/dev/null
```

## Corrélation : exemple minimal

| Heure UTC | Source | Événement | Hypothèse |
|:--|:--|:--|:--|
| 08:12:04 | auth.log | 42 échecs puis 1 succès `deploy` | Force brute réussie |
| 08:12:31 | auditd | `execve("/bin/sh")` par `deploy` | Shell interactif |
| 08:13:02 | cron | Nouvelle entrée dans `/etc/cron.d/` | Persistance |
| 08:14:47 | pare-feu | Connexion sortante vers IP inconnue | C2 ou exfiltration |

Une seule ligne ne prouve rien ; **la séquence** raconte l'attaque. C'est aussi ce qui permet de qualifier le périmètre : quels autres hôtes le compte `deploy` peut-il atteindre ?

## Pièges fréquents

- Fuseaux horaires mélangés (local vs UTC) et horloges non synchronisées → fausse chronologie.
- Journaux rotationnés ou effacés : penser aux copies centralisées et aux sauvegardes.
- Confondre horodatage de modification `mtime` et de création : sous Linux, `ctime` n'est pas la création.
- Analyser une image montée en lecture/écriture : toujours monter `ro,loop,noatime`.
- Oublier les artefacts « négatifs » : l'absence de log après 08:14 est elle-même un indice.

## À retenir

Le forensic est une discipline de **méthode** : préserver, horodater, corréler, documenter, ne jamais conclure au-delà des preuves. Les TP Wazuh et Suricata du parcours sont d'excellents générateurs de scénarios à analyser.
