---
id: vuln-owasp-top10
title: OWASP Top 10 : panorama des risques web
module: M06
level: intermediaire
minutes: 11
order: 9
brief: Les dix familles de risques applicatifs, leur mécanisme et le contrôle de remédiation correspondant.
tags: OWASP, web, risques, remédiation
---

## À quoi sert le Top 10

OWASP publie une liste de **catégories de risques** observées dans les applications réelles. Ce n'est pas une checklist de conformité exhaustive, mais la meilleure carte d'orientation pour un premier test web — et le vocabulaire commun entre développeurs et pentesters.

| # | Catégorie (2021) | Mécanisme | Contrôle clé |
|:--|:--|:--|:--|
| A01 | Broken Access Control | Accès à la ressource d'autrui par ID modifié | Autorisation **serveur** à chaque requête, par objet |
| A02 | Cryptographic Failures | Données sensibles en clair, TLS faible, algo obsolète | TLS 1.2+, AES-GCM, Argon2/bcrypt, gestion de clés |
| A03 | Injection | Données interprétées comme du code (SQL, OS, LDAP) | Requêtes paramétrées, validation, moindre privilège |
| A04 | Insecure Design | Absence de modèle de menaces en amont | Threat modeling, limites de métier, tests d'abus |
| A05 | Security Misconfiguration | Defaults, debug actif, headers absents, S3 public | Baseline durcie, revue de config, inventaire |
| A06 | Vulnerable Components | Dépendances obsolètes / CVE connus | SBOM, SCA, patch, veille KEV |
| A07 | Identification & Auth Failures | Sessions faibles, brute force, MFA absent | MFA, rotation d'identifiant de session, rate limit |
| A08 | Software & Data Integrity Failures | Désérialisation non sûre, CI/CD compromis | Signature, vérification d'intégrité, SBOM |
| A09 | Logging & Monitoring Failures | Incident invisible ou non investigable | Logs structurés, corrélation, alertes testées |
| A10 | SSRF | Le serveur fetch une URL fournie par l'utilisateur | Allowlist, blocage des métadonnées cloud, DNS pinning |

## Comment s'en servir en test

1. **Cartographier** l'application : routes, rôles, paramètres, flux d'authentification.
2. **Former une hypothèse** par catégorie : « ce paramètre `id` est-il contrôlé côté serveur ? » (A01), « ce champ est-il concaténé dans une requête ? » (A03).
3. **Tester une hypothèse à la fois**, avec un compte de test et des données non destructives.
4. **Documenter** : requête exacte, réponse observée, impact démontrable, remédiation.
5. **Ne jamais conclure sur un seul signal** : un message d'erreur SQL n'est pas encore une exfiltration.

```bash
# Contrôles rapides, côté client mais révélateurs
curl -sI https://cible.local | grep -iE 'strict-transport-security|content-security-policy|x-frame-options'
curl -s "https://cible.local/api/user/42" -H "Authorization: Bearer $TOKEN_B"   # A01 : IDOR
```

> [!CONSEIL] Les catégories A01, A03 et A07 représentent l'essentiel des découvertes en lab junior. Maîtrisez-les avant de courir après des chaînes d'exploitation exotiques.

## Côté défense

La remédiation la plus rentable n'est presque jamais un WAF : c'est une **API d'autorisation centralisée**, des requêtes paramétrées partout, une gestion de session robuste et un pipeline de dépendances à jour. Le WAF est un filet de sécurité, pas une correction.

## À retenir

Le Top 10 se retient comme un ensemble de **questions à poser à une architecture**, pas comme une liste de payloads. Les modules 09 (Pentest Web) et 12 (Durcissement) reprennent chaque catégorie en pratique.
