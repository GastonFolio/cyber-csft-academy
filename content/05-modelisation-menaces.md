---
id: menaces-surface-attaque
title: Surface d'attaque & modélisation des menaces
module: M02
level: debutant
minutes: 9
order: 14
brief: Cartographier ce qui est exposé, puis raisonner avec STRIDE pour trouver les défenses manquantes avant l'attaquant.
tags: surface d'attaque, STRIDE, threat modeling, architecture
---

## La surface d'attaque

C'est l'ensemble des **points par lesquels un attaquant peut interagir** avec votre système : ports ouverts, API publiques, formulaires, comptes, dépendances tierces, CI/CD, clés SSH, buckets cloud, sous-domaines oubliés, mais aussi les humains et les processus.

Réduire la surface, ce n'est pas ajouter un produit : c'est **retirer** ce qui n'est pas nécessaire.

```bash
# Inventaire rapide d'un hôte Linux
ss -tulpn                       # ce qui écoute
systemctl list-unit-files --state=enabled   # ce qui démarre tout seul
sudo nft list ruleset           # ce qui est filtré
find / -name '*.pem' -o -name 'id_rsa' 2>/dev/null
```

## STRIDE en pratique

STRIDE est une mnémotechnique de Microsoft pour passer en revue une architecture, composant par composant :

| Lettre | Menace | Atteinte | Contrôle typique |
|:--|:--|:--|:--|
| **S** | Spoofing (usurpation) | Authenticité | MFA, certificats, signature |
| **T** | Tampering (altération) | Intégrité | Hash, signature, WORM, contrôle de version |
| **R** | Repudiation (répudiation) | Traçabilité | Logs centralisés, horodatage, immuabilité |
| **I** | Information disclosure | Confidentialité | Chiffrement, moindre privilège, masquage |
| **D** | Denial of service | Disponibilité | Rate limiting, quotas, redondance |
| **E** | Elevation of privilege | Autorisation | RBAC, sandbox, patch, sudo restreint |

## Méthode en 5 étapes

1. **Dessiner** le flux de données (client → reverse proxy → API → base), avec les frontières de confiance.
2. **Lister** les actifs et les données sensibles qui traversent chaque flux.
3. **Appliquer STRIDE** à chaque nœud et chaque flèche.
4. **Coter** chaque risque : probabilité × impact, en précisant l'hypothèse.
5. **Décider** : éviter, réduire, transférer ou accepter — avec un responsable et une échéance.

> [!CONSEIL] Une frontière de confiance est un endroit où les données changent de niveau de privilège : Internet→DMZ, DMZ→LAN, utilisateur→root, tenant A→tenant B. C'est là que se concentrent les contrôles.

## Exemple minimal

Pour une API exposée : `S` → JWT non vérifié ; `T` → paramètres de requête non validés ; `R` → pas de corrélation d'identifiant de requête ; `I` → messages d'erreur verbeux ; `D` → absence de limitation de débit ; `E` → endpoint d'administration accessible avec un compte standard.

## À retenir

La modélisation des menaces se fait **avant** d'écrire le code et se relit à chaque changement d'architecture. Elle produit une liste de contrôles vérifiables, pas un document qui dort dans un dossier.
