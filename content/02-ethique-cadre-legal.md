---
id: fondations-ethique
title: Éthique, cadre légal & règles d'engagement
module: M01
level: debutant
minutes: 9
order: 5
brief: Ce que vous avez le droit de faire, sur quelles cibles, et comment cadrer une mission de test d'intrusion.
tags: éthique, légal, autorisation, scope
---

## La règle numéro un

> [!IMPORTANT] Aucun scan, aucune requête, aucun test — même « inoffensif » — sans **autorisation écrite** du propriétaire du système. Sur Internet, la curiosité n'est pas une défense juridique.

Un `nmap` sur un serveur qui ne vous appartient pas peut constituer une tentative d'accès frauduleux. La différence entre un pentesteur et un attaquant n'est pas l'outil : c'est **l'autorisation**, le **périmètre** et la **restitution**.

## Les trois piliers de la sécurité de l'information

| Pilier | Question | Exemple de contrôle |
|:--|:--|:--|
| **Confidentialité** | Qui peut lire ? | Chiffrement, ACL, MFA |
| **Intégrité** | Les données sont-elles fiables ? | Signature, hash, contrôle de version |
| **Disponibilité** | Le service est-il accessible ? | Redondance, sauvegardes, anti-DDoS |

C'est la **triade CIA** (*Confidentiality, Integrity, Availability*). Chaque vulnérabilité se ramène à une atteinte à l'un de ces trois piliers.

## Le cadre d'une mission

Avant la première commande, un document de **règles d'engagement** (*Rules of Engagement*) doit préciser :

- le **périmètre** : plages IP, domaines, applications, comptes de test explicitement listés ;
- les **exclusions** : production critique, tiers, fournisseurs cloud, données personnelles réelles ;
- la **fenêtre de tir** : dates, heures, charge maximale autorisée ;
- les **techniques interdites** : déni de service, ingénierie sociale sur des tiers, persistance destructive ;
- le **contact d'escalade** : qui appeler si quelque chose casse ;
- la **gestion des données** : où sont stockés les artefacts, quand sont-ils détruits.

## S'entraîner sans risque

```text
Lab local      : VMs isolées (VirtualBox / Proxmox), réseau « host-only »
Cibles légales : Hack The Box, TryHackMe, PortSwigger Web Security Academy,
                 DVWA, Juice Shop, VulnHub, INE / eJPT labs
Certifications : eJPT (pratique junior) → eCPPT → OSCP → OSCE
```

> [!CONSEIL] Configurez votre lab sur un réseau **sans pont vers Internet** et prenez un snapshot propre avant chaque exercice d'exploitation.

## En France et en Tunisie : repères

En France, les atteintes aux systèmes de traitement automatisé de données sont réprimées par le Code pénal (art. 323-1 et suivants), et l'ANSSI publie les référentiels de durcissement. En Tunisie, la loi sur les cybercrimes et l'ANSI encadrent ces pratiques. Dans tous les cas : **contrat, périmètre, traçabilité**. Le RGPD impose par ailleurs de minimiser les données personnelles manipulées pendant un test.

## À retenir

Un professionnel se distingue par sa discipline : il documente ses actions, limite son impact, signale immédiatement un incident et rend un rapport actionnable. La technique s'apprend ; la rigueur, aussi.
