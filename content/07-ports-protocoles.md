---
id: reseaux-ports-protocoles
title: Ports, protocoles & services incontournables
module: M03
level: debutant
minutes: 10
order: 2
brief: La carte des ports à connaître, ce qu'ils révèlent lors d'un scan et les réflexes d'énumération associés.
tags: ports, TCP, UDP, services, énumération
---

## Port, socket, service

Un **port** est un numéro (0–65535) qui identifie un service sur une machine. Une socket est le couple `(adresse IP, port, protocole)`. Les ports **well-known** (0–1023) sont attribués par l'IANA ; les ports enregistrés (1024–49151) et dynamiques complètent la plage.

> [!CONSEIL] « Port ouvert » signifie qu'un processus écoute. Cela ne dit pas s'il est vulnérable : il faut ensuite identifier la **version** exacte (`nmap -sV`) puis la confronter aux bases CVE.

## La carte mentale du pentesteur junior

| Port | Service | Ce qu'on cherche | Outil |
|:--|:--|:--|:--|
| 21 | FTP | anonymous login, version vsftpd | `ftp`, `nmap -sV` |
| 22 | SSH | version OpenSSH, auth par clé | `ssh -v`, `ssh-audit` |
| 23 | Telnet | trafic en clair, bannière | `nc` |
| 25/587 | SMTP | `VRFY`, open relay | `nc`, `swaks` |
| 53 | DNS | transfert de zone AXFR | `dig axfr` |
| 80/443 | HTTP(S) | vhost, headers, TLS, chemins | `curl`, `gobuster` |
| 110/143 | POP3/IMAP | bannières, comptes | `openssl s_client` |
| 139/445 | SMB | partages, version SMB, null session | `smbclient`, `enum4linux` |
| 161 | SNMP | community string publique | `snmpwalk` |
| 389/636 | LDAP | annuaire, base DN | `ldapsearch` |
| 3306 | MySQL | accès anonyme, version | `mysql`, `nmap -sV` |
| 3389 | RDP | version, NLA, BlueKeep | `nmap`, `rdesktop` |
| 5985/5986 | WinRM | accès distant PowerShell | `evil-winrm` |

## Trois états, trois interprétations

Avec un scan TCP SYN, Nmap distingue :

- **open** → `SYN/ACK` reçu : un service écoute ;
- **closed** → `RST` reçu : hôte joignable, rien sur ce port ;
- **filtered** → pas de réponse ou `ICMP unreachable` : un pare-feu interfère.

```bash
sudo nmap -sS -sV -p 21,22,80,139,445 192.168.10.0/24
curl -I http://cible.local             # en-têtes et serveur
dig +short cible.local ; dig axfr @dns cible.local
smbclient -L //192.168.10.5 -N        # liste des partages, sans mot de passe
```

## Bonnes pratiques côté défense

- Inventaire régulier des ports exposés (`ss` local + scan externe autorisé) — l'écart entre les deux est instructif.
- Fermeture par défaut, ouverture sur justification, journalisation des flux refusés.
- TLS partout où des identifiants transitent ; désactiver Telnet, FTP anonyme, SMBv1, SNMPv1/v2c.
- Segmentation réseau : un serveur web n'a pas besoin d'atteindre le contrôleur de domaine en direct.

## À retenir

Le port donne la **porte**, la bannière donne la **serrure**, la version donne le **modèle**. Un bon rapport distingue toujours ces trois niveaux de certitude.
