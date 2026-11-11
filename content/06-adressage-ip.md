---
id: reseaux-adressage-ip
title: Adressage IP, sous-réseaux & routage
module: M03
level: debutant
minutes: 12
order: 1
brief: Lire une adresse IPv4, calculer un masque CIDR et comprendre comment un paquet trouve son chemin.
tags: IPv4, CIDR, subnetting, routage, ARP
---

## IPv4 et CIDR

Une adresse IPv4 fait 32 bits, écrite en 4 octets. Le suffixe CIDR (`/24`) indique combien de bits décrivent le **réseau** ; le reste identifie l'**hôte**.

```text
192.168.10.37/24
Réseau  : 192.168.10.0   (24 bits)
Hôtes   : 192.168.10.1 → 192.168.10.254
Diffusion (broadcast) : 192.168.10.255
Masque  : 255.255.255.0
```

| CIDR | Masque | Hôtes utilisables | Usage courant |
|:--|:--|:--|:--|
| `/30` | 255.255.255.252 | 2 | Lien point à point |
| `/24` | 255.255.255.0 | 254 | LAN classique |
| `/16` | 255.255.0.0 | 65 534 | Grand site privé |
| `/8` | 255.0.0.0 | 16,7 M | Très gros réseau |

Réseaux privés RFC 1918 : `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`. Ils ne sont pas routables sur Internet : un **NAT** traduit les adresses privées en adresse publique au niveau de la box ou du pare-feu.

## Le trajet d'un paquet

1. La machine compare l'adresse de destination à son propre réseau.
2. **Même réseau** → elle résout l'adresse MAC du voisin via **ARP** (`qui a 192.168.10.5 ?`) et envoie la trame directement.
3. **Réseau distant** → elle envoie la trame à la **passerelle par défaut**, qui consulte sa table de routage.
4. Chaque routeur répète l'opération jusqu'au réseau de destination (le champ TTL empêche les boucles infinies).

```bash
ip -c addr show                 # adresses et masques
ip route show                   # table de routage + passerelle
ip neigh show                   # cache ARP
traceroute 8.8.8.8              # sauts successifs
ping -c 3 192.168.10.1          # test ICMP de bout en bout
```

> [!ATTENTION] ARP n'authentifie pas les réponses : n'importe quelle machine du LAN peut répondre « c'est moi la passerelle ». C'est le principe de l'**ARP spoofing / MITM**, abordé dans le module sur les attaques réseau. À n'expérimenter que sur un lab isolé.

## IPv6 en bref

128 bits, notation hexadécimale (`2001:db8::1/64`), plus de NAT nécessaire en théorie, **NDP** remplace ARP, et l'auto-configuration SLAAC est activée par défaut. Conséquence pratique : un durcissement qui ne couvre que IPv4 laisse une surface ouverte. Pensez à `nftables` **et** `ip6tables`/`nft` en famille `inet`.

## À retenir

Savoir calculer un `/26`, lire `ip route` et expliquer le rôle d'ARP suffit à comprendre 90 % des scénarios eJPT de découverte réseau — et à ne pas confondre « la machine ne répond pas » avec « le service n'écoute pas ».
