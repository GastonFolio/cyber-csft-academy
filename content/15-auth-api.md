---
id: web-auth-sessions-api
title: Authentification, sessions & sécurité des API
module: M09
level: intermediaire
minutes: 11
order: 5
brief: JWT, cookies, OAuth/OIDC, IDOR et contrôle d'accès : les failles de logique les plus fréquentes en test web.
tags: authentification, JWT, session, OAuth, IDOR, API
---

## Distinguer les trois notions

- **Authentification** : qui êtes-vous ? (mot de passe, clé, MFA, certificat)
- **Session** : comment le serveur se souvient de vous ? (cookie opaque, JWT, état serveur)
- **Autorisation** : avez-vous le droit d'accéder à **cette ressource précise** ?

La majorité des failles graves (OWASP A01) viennent de la troisième : l'application vérifie que l'utilisateur est connecté, mais pas qu'il est propriétaire de l'objet demandé. C'est l'**IDOR / BOLA**.

```bash
# Test d'autorisation avec deux comptes de test A et B
curl -s -H "Authorization: Bearer $TOKEN_B" https://lab.local/api/orders/1042
# Si la commande de A remonte : contrôle d'accès manquant côté serveur.
```

## Sessions : les réglages qui comptent

| Propriété | Valeur recommandée | Pourquoi |
|:--|:--|:--|
| `HttpOnly` | activé | Bloque la lecture du cookie par un script (XSS) |
| `Secure` | activé | Jamais transmis en HTTP clair |
| `SameSite` | `Lax` ou `Strict` | Limite le CSRF cross-site |
| Rotation à la connexion | obligatoire | Empêche la fixation de session |
| Expiration + déconnexion serveur | courte + révocation | Limite le vol de token |
| Stockage mot de passe | Argon2id / bcrypt | Jamais SHA1/MD5 « salé » maison |

## JWT : ce qu'il faut vérifier

Un JWT est `header.payload.signature` encodé en base64url — **lisible par tous**, pas chiffré. Les pièges classiques : accepter `alg: none`, ne pas vérifier la signature, confondre `iss`/`aud`, ignorer `exp`, ou laisser une clé de signature faible.

> [!CONSEIL] Un JWT n'est pas une session révocable par nature. Pour une invalidation immédiate, gardez une liste de révocation ou préférez un cookie de session opaque avec état serveur.

Checklist de revue :

1. Signature vérifiée avec un algorithme **attendu explicitement** (allowlist).
2. `exp`, `nbf`, `iss`, `aud` validés.
3. Clés rotationnées, secrets hors du dépôt, jamais de clé symétrique partagée entre environnements.
4. Rôles et droits relus **côté serveur** à chaque requête, jamais seulement depuis le token client.
5. Journalisation des échecs d'autorisation (et non seulement des échecs de connexion).

## API : réflexes de test

- Énumérer les routes (OpenAPI/Swagger, JS bundles, `OPTIONS`) et les versions (`/v1`, `/v2`, `/internal`).
- Tester chaque objet avec **deux comptes de même rôle** puis de rôles différents (BOLA, BFLA).
- Vérifier la limitation de débit, la taille des réponses et la pagination (fuite de masse).
- Contrôler le masquage des données sensibles dans les réponses (« excessive data exposure »).
- Tester les verbes alternatifs : un `GET` filtré mais un `PUT` non contrôlé.

## À retenir

Un test d'autorisation sérieux se fait **avec au moins deux identités**. Si vous n'avez qu'un compte, vous ne pouvez pas prouver un IDOR. Et toute décision de sécurité doit être rejouée côté serveur : le client n'est jamais une autorité.
