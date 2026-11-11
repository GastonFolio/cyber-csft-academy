---
id: vuln-wifi-sans-fil
title: Sécurité Wi-Fi & attaques sans fil
module: M06
level: intermediaire
minutes: 9
order: 10
brief: WPA2/WPA3, handshake, Evil Twin et raisons pour lesquelles le sans-fil exige un cadre d'autorisation strict.
tags: Wi-Fi, WPA2, WPA3, Evil Twin, 802.11
---

## Ce qui change par rapport au réseau filaire

Le médium est **partagé et diffusé** : toute station à portée radio peut écouter les trames (hors chiffrement), et il n'existe pas de « port » physique à contrôler. L'authentification et la confidentialité reposent donc entièrement sur la couche 2 et sur le protocole de sécurité choisi.

| Protocole | État | Ce qu'il faut retenir |
|:--|:--|:--|
| WEP | Obsolète | IV faibles, cassable en minutes — à proscrire |
| WPA/TKIP | Obsolète | Héritage, à proscrire |
| **WPA2-PSK (CCMP/AES)** | Acceptable si passphrase longue | Le 4-way handshake permet une validation hors ligne de la passphrase |
| **WPA2-Enterprise (802.1X/EAP)** | Recommandé en entreprise | Identités individuelles, RADIUS, certificats serveur |
| **WPA3-SAE / OWE** | Recommandé | Résiste mieux aux attaques par dictionnaire hors ligne, PMF obligatoire |

## Le 4-way handshake, conceptuellement

Le point d'accès et le client dérivent une clé de session à partir de la passphrase, du SSID et de nonces échangés en clair. Un observateur qui capture ces quatre messages peut **tester des candidats de passphrase hors ligne** — d'où l'importance d'une passphrase longue, aléatoire et unique. WPA3-SAE corrige précisément cette faiblesse.

> [!ATTENTION] Capturer un handshake ou créer un point d'accès leur n'est légal que sur **votre propre réseau** ou dans le périmètre explicite d'une mission. Le voisinage Wi-Fi n'est pas un lab.

## Vecteurs à connaître (pour la défense)

- **Evil Twin / SSID homonyme** : un AP plus puissant pousse les clients à s'y connecter. Défense : validation du certificat en 802.1X, WPA3, détection des AP rogue (WIDS), sensibilisation.
- **Deauthentication** : trames de gestion non authentifiées (avant PMF) pour forcer une reconnexion. Défense : *Protected Management Frames* (802.11w), obligatoires en WPA3.
- **KRACK / fragmentations** : faiblesses de protocole corrigées par patch — d'où l'importance du firmware des AP et des clients.
- **WPS PIN** : surface d'attaque classique, à désactiver.
- **Réseau invité mal isolé** : pont vers le LAN de production, le vrai risque en entreprise.

## Durcissement concret

```text
1. WPA3-SAE (ou WPA2-Enterprise 802.1X avec EAP-TLS) — jamais de PSK partagé en entreprise
2. PMF activé, WPS désactivé, firmware des AP à jour
3. SSID invité isolé (VLAN dédié, pas de route vers le LAN, portail captif)
4. Segmentation : Wi-Fi → pare-feu → ressources autorisées uniquement
5. Inventaire radio périodique pour repérer les AP non autorisés
6. Journalisation des authentifications RADIUS et alertes sur les échecs massifs
```

## À retenir

Le sans-fil déplace la frontière de confiance **dans l'air**. On le sécurise par des identités fortes, des trames de gestion protégées, une segmentation stricte et la détection des points d'accès fantômes — pas par le simple fait de « cacher » le SSID, qui n'est pas un contrôle de sécurité.
