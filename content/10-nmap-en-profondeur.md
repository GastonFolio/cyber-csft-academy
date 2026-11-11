---
id: scan-nmap-approfondi
title: Nmap : du ping sweep au scan de services
module: M05
level: debutant
minutes: 13
order: 4
brief: Choisir le bon type de scan, lire les états de ports et enchaîner découverte, versions et scripts NSE.
tags: Nmap, scan, NSE, ports, cheatsheet
---

## Les trois phases

Un scan propre se déroule toujours dans cet ordre : **découverte d'hôtes** → **ports** → **versions/services**. Griller les étapes produit du bruit et des résultats incomplets.

```bash
# 1. Quelles machines répondent ? (sans scan de ports)
sudo nmap -sn 192.168.10.0/24 -oA scope-hosts

# 2. Quels ports sur les hôtes vivants ? (SYN scan, rapide, furtif)
sudo nmap -sS -sV -O --top-ports 1000 -T3 -iL hosts.txt -oA scope-ports

# 3. Tous les ports + scripts sûrs, uniquement sur les cibles retenues
sudo nmap -sS -p- -sC -sV --min-rate 1000 192.168.10.5 -oA scope-full
```

> [!ATTENTION] `-T5` et `--min-rate` élevés peuvent saturer un équipement ou déclencher un IPS. Sur une mission réelle, respectez la fenêtre de tir et la charge convenue dans les règles d'engagement. Dans votre lab, c'est le moment idéal pour observer les alertes Suricata.

## Choisir son type de scan

| Option | Mécanisme | Quand l'utiliser |
|:--|:--|:--|
| `-sS` | TCP SYN (half-open) | Défaut, nécessite root, rapide |
| `-sT` | Connexion TCP complète | Sans privilèges root, plus bruyant |
| `-sU` | UDP | DNS, SNMP, DHCP — lent, résultats ambigus |
| `-sV` | Détection de version | Après avoir trouvé les ports ouverts |
| `-sC` | Scripts NSE par défaut | Énumération complémentaire |
| `-O` | Fingerprinting OS | Quand la topologie importe |
| `-Pn` | Ignore le ping | Cible filtrant ICMP (hôte connu vivant) |
| `-6` | IPv6 | Ne pas oublier la double pile |

## Lire les états

`open` → service à l'écoute · `closed` → hôte joignable, rien ici · `filtered` → pare-feu · `unfiltered` → accessible mais état indéterminé (scan ACK) · `open|filtered` → typique de l'UDP.

Un rapport solide précise toujours : **port, protocole, service, version, état, source de l'information**. « Le port 80 est vulnérable » n'est pas une conclusion ; « Apache 2.4.49 sur 80/tcp, CVE-2021-41773 applicable » en est une.

## Exploiter la sortie

```bash
# Formats de sortie : normal (.nmap), greppable (.gnmap), XML (.xml)
nmap -sV -oX scan.xml 192.168.10.5

# Lister les hôtes avec un port ouvert depuis un grepable
grep 'open' scope-ports.gnmap | cut -d' ' -f2 | sort -u

# Scripts NSE ciblés (exemples)
nmap --script smb-enum-shares -p445 192.168.10.5
nmap --script http-enum -p80 192.168.10.5
nmap --script ssl-enum-ciphers -p443 192.168.10.5
```

## Détection côté défense

Un SYN scan génère une signature statistique : beaucoup de ports distincts depuis une même IP en peu de temps, souvent sans `ACK` final. Suricata, CrowdSec et un simple `journalctl` de pare-feu le voient très bien. C'est un excellent premier exercice de Blue Team : lancez un scan sur votre lab, puis retrouvez-le dans les logs.

## À retenir

Nmap ne « trouve pas des failles » : il **décrit une surface**. La valeur ajoutée du pentesteur est dans l'interprétation, la priorisation et la remédiation qu'il propose ensuite.
