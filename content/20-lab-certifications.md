---
id: carrieres-lab-certifications
title: Construire son lab & choisir sa certification
module: M13
level: avance
minutes: 10
order: 6
brief: Un plan de progression concret, du premier VM isolé aux certifications pratiques, avec des jalons mesurables.
tags: lab, eJPT, OSCP, parcours, pratique
---

## Le lab : votre terrain d'entraînement légal

```text
Hyperviseur      : VirtualBox / VMware / Proxmox
Réseau           : « host-only » ou NAT isolé, SANS pont vers le LAN domestique
Attaquant        : Kali Linux ou Parrot OS (VM, snapshots)
Cibles           : Metasploitable 2/3, DVWA, Juice Shop, VulnHub, HTB/TryHackMe
Défense          : VM Debian + Wazuh / Suricata / CrowdSec pour voir les traces
Documentation    : Obsidian / Markdown versionné dans un dépôt privé
```

> [!CONSEIL] Prenez un **snapshot propre** avant chaque exercice et tenez un carnet de bord : objectif, commandes, résultat, ce qui a échoué, correction. Ce carnet devient votre meilleure fiche de révision — et un portfolio présentable.

## Plan de progression en 6 jalons

| Jalon | Objectif mesurable | Modules du parcours |
|:--|:--|:--|
| 1 | Expliquer OSI/TCP-IP, calculer un /26, utiliser 15 commandes Linux | M01, M03 |
| 2 | Cartographier une cible de lab : OSINT passif + `nmap` complet + énumération | M04, M05 |
| 3 | Rédiger un rapport de vulnérabilités avec gravité et remédiation | M06, M02 |
| 4 | Obtenir une session Metasploit, puis élever les privilèges Windows **et** Linux | M07, M08 |
| 5 | Trouver et corriger une injection SQL, une XSS et un IDOR sur Juice Shop | M09 |
| 6 | Déployer Wazuh + Suricata et **retrouver vos propres attaques** dans les logs | M11, M12 |

Le jalon 6 est le plus formateur : voir son propre scan depuis le point de vue du défenseur fait comprendre la détection mieux que n'importe quel cours.

## Choisir sa certification

| Certification | Niveau | Format | Pour qui |
|:--|:--|:--|:--|
| **eJPT** (INE) | Junior | 100 % pratique, réseau simulé | Premier objectif concret après les bases — c'est exactement le contenu du dépôt eJPT de ce parcours |
| Security+ / ISC² CC | Débutant | QCM, vocabulaire large | Valider les fondamentaux et la gouvernance |
| eCPPT / PNPT | Intermédiaire | Pratique + rapport | Approfondir le pentest réseau et la restitution |
| OSCP | Intermédiaire+ | 24 h de lab + rapport | Référence offensive, exige méthode et endurance |
| BTL1 / GCFA / GCIH | Intermédiaire | Blue Team / forensic / incident | Pour la voie SOC & réponse à incident |
| CISSP | Senior | QCM + expérience requise | Pilotage, gouvernance, management |

> [!IMPORTANT] La certification valide un **socle**, pas une compétence complète. Un eJPT sans lab personnel ni rapports rédigés reste théorique ; un carnet de bord propre vaut souvent plus qu'un badge de plus.

## Rythme réaliste

6 à 8 heures par semaine, en trois temps : **1 h de lecture** (ce parcours), **3 h de pratique** (lab), **1 h de restitution** (notes + rapport). Alternez offensive et défensive : comprendre les deux côtés est ce qui fait la différence en entretien comme en incident réel.

## À retenir

Progressez par **boucles courtes** : lire → pratiquer → documenter → vérifier avec un quiz → refaire sans les notes. La régularité bat l'intensité, et la traçabilité de votre travail devient votre meilleur argument professionnel.
