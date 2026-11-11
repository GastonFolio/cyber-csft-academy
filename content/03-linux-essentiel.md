---
id: fondations-linux
title: Linux en ligne de commande : les essentiels
module: M01
level: debutant
minutes: 12
order: 6
brief: Naviguer, inspecter, filtrer et automatiser dans un terminal — le vocabulaire indispensable avant tout lab de sécurité.
tags: Linux, shell, commandes, bash
---

## Pourquoi le terminal ?

La grande majorité des outils de sécurité (Nmap, Metasploit, Wazuh, Suricata) vivent sur Linux et s'y pilotent en ligne de commande. Le shell permet de **combiner** des outils, de journaliser une session et de rejouer exactement la même procédure — trois exigences d'une mission reproductible.

## Se repérer

```bash
pwd                      # où suis-je ?
ls -la                   # tout, y compris les fichiers cachés
cd /var/log && cd -      # revenir au dossier précédent
find / -type f -perm -4000 -ls 2>/dev/null   # binaires SUID (audit privesc)
```

## Lire sans modifier

```bash
cat /etc/passwd | head -20
less /var/log/auth.log
grep -RniE 'password|secret|token' ./projet --exclude-dir=.git
tail -f /var/log/syslog          # suivi temps réel
wc -l access.log ; du -sh /var/log
```

## La boîte à outils texte

Le vrai super-pouvoir du shell, ce sont les **tuyaux** : chaque commande fait une seule chose bien.

```bash
# Top 10 des IP dans un log Apache
awk '{print $1}' access.log | sort | uniq -c | sort -nr | head -10

# Extraire les lignes en échec d'authentification
journalctl -u ssh --since "1 hour ago" | grep -i 'failed password'

# Remplacer, découper, comparer
sed 's/http:/https:/g' urls.txt
cut -d: -f1,3 /etc/passwd
diff config.old config.new
```

## Permissions et processus

| Commande | Usage |
|:--|:--|
| `id` | identité, groupes effectifs |
| `stat fichier` | propriétaire, mode, horodatages |
| `chmod 600 id_rsa` | clé privée lisible uniquement par son propriétaire |
| `sudo -l` | **que peut-on exécuter en root ?** (réflexe privesc) |
| `ps auxww` / `pstree` | processus et arborescence |
| `ss -tulpn` | ports en écoute et PID associé |
| `ip -c a` / `ip route` | interfaces et table de routage |

> [!ATTENTION] Sur Debian 13 (Trixie) et 14, `ifconfig` et `netstat` sont remplacés par `iproute2` (`ip`, `ss`) et `iptables` par `nftables`. Utilisez les commandes modernes dans vos notes.

## Automatiser

```bash
#!/usr/bin/env bash
set -euo pipefail
for host in $(cat scope.txt); do
  ping -c1 -W1 "$host" >/dev/null && echo "[UP] $host" || echo "[--] $host"
done
```

`set -euo pipefail` fait échouer le script proprement plutôt que de continuer avec des valeurs vides — indispensable quand on traite un périmètre de test.

## À retenir

Apprenez `man`, `--help`, les redirections (`>`, `>>`, `2>&1`) et `Ctrl+R` (recherche d'historique). Avec une douzaine de commandes et des tuyaux, vous couvrez 80 % des besoins d'un lab.
