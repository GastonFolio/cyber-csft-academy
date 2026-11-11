---
id: grc-risques-conformite
title: Gestion des risques, ISO 27001, NIST & RGPD
module: M13
level: avance
minutes: 11
order: 1
brief: Relier les contrôles techniques aux exigences de gouvernance : SMSI, appétence au risque, registre et preuves d'audit.
tags: ISO 27001, NIST CSF, RGPD, risques, conformité, GRC
---

## Pourquoi la gouvernance concerne le technique

Un pare-feu mal documenté, sans propriétaire ni revue, ne satisfait aucun audit — même s'il est parfaitement configuré. La gouvernance apporte trois choses : une **décision** sur le risque acceptable, une **responsabilité** et une **preuve** dans le temps.

## Le vocabulaire du risque

```text
Risque = Impact × Vraisemblance (sur un actif, face à une menace, via une vulnérabilité)

Actif      : base clients, contrôleur de domaine, clé de signature
Menace     : ransomware, erreur de configuration, prestataire compromis
Vulnérabilité : compte de service sans MFA, port exposé, absence de sauvegarde
Traitement : éviter · réduire · transférer (assurance) · accepter (avec signature)
```

Le **registre des risques** consigne : contexte, cotation avant/après, contrôles existants, propriétaire, échéance, risque résiduel. C'est un document vivant, pas une photo annuelle.

## Les référentiels en parallèle

| Référentiel | Nature | Ce qu'il apporte |
|:--|:--|:--|
| **ISO/IEC 27001** | Norme de système de management (certifiable) | SMSI, approche par risques, amélioration continue |
| **ISO/IEC 27002** | Guide de contrôles | Mesures concrètes (Annexe A : 93 contrôles en 2022) |
| **NIST CSF 2.0** | Cadre volontaire, 6 fonctions | Govern · Identify · Protect · Detect · Respond · Recover |
| **CIS Controls v8** | Priorisation opérationnelle | 18 contrôles techniques, classés par maturité (IG1→IG3) |
| **RGPD** | Règlement européen | Licéité, minimisation, notification 72 h, DPIA, registre des traitements |
| **ANSSI / ENS** | Référentiels nationaux | Hygiène, durcissement, qualification des prestataires |

> [!CONSEIL] Ne « collectionnez » pas les référentiels. Choisissez un cadre de pilotage (ISO 27001 ou NIST CSF), puis mappez les contrôles techniques dessus une seule fois : c'est une **matrice de correspondance** qui évite de produire trois preuves pour le même contrôle.

## Le cycle PDCA / roue de Deming

1. **Plan** : périmètre, politique, appréciation des risques, plan de traitement.
2. **Do** : déployer les contrôles, former, documenter les procédures.
3. **Check** : audit interne, tests (pentest, exercice de crise), indicateurs, revue de direction.
4. **Act** : actions correctives, mise à jour du registre, amélioration continue.

Un audit ne demande pas « avez-vous un WAF ? » mais « montrez-moi que le contrôle choisi est **appliqué, efficace et revu** » : configuration exportée, log de changement, résultat de test, compte-rendu de revue.

## Indicateurs utiles

- Délai moyen de correction des vulnérabilités critiques, par périmètre.
- Taux de couverture des actifs par l'inventaire et par l'EDR.
- Pourcentage de comptes privilégiés avec MFA et revue trimestrielle.
- Résultats des tests de restauration de sauvegarde (pas seulement « les sauvegardes tournent »).
- Nombre d'incidents avec retour d'expérience clôturé.

## À retenir

La cybersécurité n'est pas un état mais un **système de management**. Les modules techniques de ce parcours produisent les contrôles ; la gouvernance produit la décision, la responsabilité et la preuve.
