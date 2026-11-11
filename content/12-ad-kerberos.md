---
id: postexploit-active-directory
title: Active Directory & Kerberos : les concepts
module: M08
level: avance
minutes: 12
order: 5
brief: Comprendre l'annuaire, les tickets Kerberos et les chemins de mouvement latéral pour mieux les détecter.
tags: Active Directory, Kerberos, mouvement latéral, privesc
---

## Pourquoi l'AD est un objectif central

Dans la majorité des entreprises, Active Directory centralise **identités, machines, stratégies et droits d'accès**. Obtenir un compte de domaine peu privilégié suffit souvent à lire l'annuaire entier : utilisateurs, groupes, SPN, GPO, relations d'approbation. C'est pourquoi la post-exploitation en environnement Windows est d'abord une phase de **cartographie des relations de confiance**.

| Composant | Rôle |
|:--|:--|
| Domain Controller | Annuaire + KDC (service d'émission de tickets) |
| OU / GPO | Organisation et application de stratégies |
| SPN | Identifie un service associé à un compte |
| SID / RID | Identifiant de sécurité, y compris les SIDHistory |
| Groupes protégés | Domain Admins, Enterprise Admins, Schema Admins |

## Kerberos en 4 temps

1. **AS-REQ / AS-REP** : le client prouve son identité au KDC et reçoit un **TGT** chiffré avec la clé du compte `krbtgt`.
2. **TGS-REQ / TGS-REP** : il présente son TGT pour obtenir un **ticket de service** pour un SPN donné.
3. **AP-REQ** : le ticket est présenté au service, qui le valide.
4. Le tout repose sur des **horodatages** : une dérive d'horloge > 5 min casse l'authentification (d'où l'importance de NTP).

Deux familles d'attaques découlent de cette mécanique : le ** Kerberoasting ** (demander un ticket de service pour un compte à SPN, puis tenter de casser son mot de passe hors ligne) et l'**AS-REP Roasting** (compte sans pré-authentification). Côté défense : mots de passe de service longs aléatoires, comptes gMSA, pré-authentification activée, détection des volumes anormaux de TGS-REQ (event 4769).

> [!ATTENTION] Ces techniques sont étudiées ici pour la **détection**. Ne les exécutez que sur un domaine de lab dont vous êtes propriétaire, avec les journaux de sécurité activés.

## Chemins de mouvement latéral à connaître

- Réutilisation d'identifiants locaux (`Local Administrator` identique sur plusieurs postes) → à mitiger avec LAPS.
- Sessions et tickets en mémoire (LSASS) → protéger par Credential Guard et restreindre le débogage.
- Droits excessifs sur les objets AD (`GenericAll`, `WriteDACL`) → auditer les ACL de l'annuaire.
- GPO mal placées ou scripts de connexion modifiables → surveiller SYSVOL.
- Partages SMB contenant des fichiers de configuration avec secrets.

```powershell
# Cartographie lecture seule d'un domaine de lab
Get-ADUser -Filter * -Properties MemberOf,ServicePrincipalName | Select SamAccountName,MemberOf,ServicePrincipalName
Get-ADGroupMember 'Domain Admins' -Recursive
Get-GPO -All | Select DisplayName,CreationTime
```

## Télémétrie utile au SOC

| Event ID | Signal |
|:--|:--|
| 4624 / 4625 | Connexion réussie / échouée (type 3 = réseau, 10 = RDP) |
| 4672 | Attribution de privilèges spéciaux à une session |
| 4688 | Création de processus (avec ligne de commande) |
| 4768 / 4769 / 4771 | TGT / ticket de service / échec de pré-auth |
| 5136 | Modification d'un objet d'annuaire |
| 7045 | Installation d'un service (persistance) |

## À retenir

L'AD n'est pas « un serveur de plus » : c'est un graphe de confiances. La défense consiste à réduire le nombre de chemins vers les groupes privilégiés, à segmenter, et à corréler les événements d'authentification avec les créations de processus.
