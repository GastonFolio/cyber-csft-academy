---
id: fondations-osi-tcpip
title: Le modèle OSI et la suite TCP/IP
module: M01
level: debutant
minutes: 11
order: 4
brief: Comprendre les 7 couches OSI, leur correspondance TCP/IP et où se placent les attaques et les défenses.
tags: OSI, TCP/IP, réseau, encapsulation
---

## Pourquoi un modèle en couches ?

Un réseau est un empilement de services : chaque couche rend un service à celle du dessus et ignore les détails de celle du dessous. Ce découpage permet de **raisonner localement** : quand un site ne répond pas, on vérifie d'abord la couche 1 (câble/Wi-Fi), puis l'adressage IP, puis la session TCP, puis HTTP. C'est la base de tout diagnostic — et de toute attaque réseau.

> [!CONSEIL] En pentest, un problème de connectivité se diagnostique toujours **du bas vers le haut** : `ip link` → `ip addr` → `ping` → `ss` → `curl`.

## Les 7 couches OSI

| N° | Couche | Unité | Protocoles / exemples | Risque typique |
|:--|:--|:--|:--|:--|
| 7 | Application | Données | HTTP, DNS, SSH, SMTP | Injection SQL, XSS, phishing |
| 6 | Présentation | Données | TLS, JSON, ASN.1 | Chiffrement faible, désérialisation |
| 5 | Session | Données | Sessions, cookies, NetBIOS | Vol de session, fixation |
| 4 | Transport | Segment | TCP, UDP | Scan de ports, SYN flood |
| 3 | Réseau | Paquet | IP, ICMP, ARP*, routage | IP spoofing, MITM ARP |
| 2 | Liaison | Trame | Ethernet, Wi-Fi, VLAN | VLAN hopping, sniffing |
| 1 | Physique | Bit | Cuivre, fibre, radio | Écoute, brouillage |

\* ARP est techniquement à cheval entre les couches 2 et 3 — c'est précisément pour cela qu'il est intéressant à attaquer.

## Correspondance avec TCP/IP

Le modèle réel d'Internet est plus compact : **Application (5-7) / Transport / Internet / Accès réseau (1-2)**. Retenez surtout l'**encapsulation** : à l'émission, chaque couche ajoute son en-tête ; à la réception, elle le retire.

```text
[ HTTP GET / ]                      ← couche 7
[ TCP src:51544 dst:80 SYN ]        ← couche 4
[ IP src:192.168.1.10 dst:10.0.0.5 ]← couche 3
[ Ethernet src:aa:bb dst:cc:dd ]    ← couche 2
```

## TCP vs UDP en une minute

- **TCP** : connexion en trois temps (`SYN` → `SYN/ACK` → `ACK`), numéros de séquence, retransmission. Fiable, mais observable : c'est ce que Nmap exploite avec un `SYN scan`.
- **UDP** : sans connexion, sans accusé de réception. Rapide (DNS, DHCP, SNMP, VoIP) mais les scans UDP sont lents et ambigus : l'absence de réponse peut vouloir dire « ouvert » ou « filtré ».

```bash
# Observer les trois temps d'une connexion TCP
sudo tcpdump -ni any 'tcp port 443 and tcp[tcpflags] & tcp-syn != 0'

# Lister les connexions établies (remplace netstat sur Debian 13+)
ss -tunap
```

## À retenir

1. Toute donnée traversant le réseau est **encapsulée** puis désencapsulée.
2. Une attaque se rattache presque toujours à une couche : ARP (2), IP spoofing (3), SYN flood (4), HTTP (7).
3. Une défense aussi : VLAN (2), ACL/pare-feu (3-4), WAF/TLS (6-7).
4. Savoir situer une couche fait gagner des heures en diagnostic et en analyse d'incident.
