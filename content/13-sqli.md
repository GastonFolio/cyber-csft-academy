---
id: web-injection-sql
title: Injection SQL : comprendre, détecter, prévenir
module: M09
level: intermediaire
minutes: 12
order: 3
brief: Pourquoi une concaténation devient du code, comment raisonner sur les différents types d'injection et comment la corriger durablement.
tags: SQLi, injection, OWASP, requêtes paramétrées
---

## Le mécanisme

Une injection se produit quand une donnée contrôlée par l'utilisateur est **concaténée** dans une requête et interprétée comme de la syntaxe SQL.

```python
# Vulnérable : la donnée devient du code
query = f"SELECT * FROM users WHERE name = '{user_input}' AND password = '{pwd}'"

# Sûr : la donnée reste une donnée
cur.execute("SELECT * FROM users WHERE name = %s AND password = %s", (user_input, pwd))
```

Avec `user_input = "admin' -- "`, la première requête commente le contrôle de mot de passe. Le problème n'est pas le caractère `'` : c'est l'**absence de séparation entre code et données**. Les filtres de caractères et l'échappement manuel sont donc des solutions fragiles.

## Familles à connaître

| Famille | Principe | Signal typique |
|:--|:--|:--|
| **In-band / UNION** | Les résultats remontent dans la réponse | Colonnes supplémentaires, erreurs de type |
| **Error-based** | Le SGBD renvoie des messages détaillés | Stack traces, erreurs de conversion |
| **Blind boolean** | La page diffère selon vrai/faux | Contenu présent ou absent |
| **Blind time-based** | Délai conditionnel (`SLEEP`) | Temps de réponse anormal |
| **Out-of-band** | Exfiltration via DNS/HTTP externe | Requête sortante inattendue |
| **Second-order** | Donnée stockée puis réinjectée plus tard | Impact dans une autre fonctionnalité |

> [!CONSEIL] Dans un lab, comparez toujours deux requêtes ne différant que par une condition logique. Une différence de contenu ou de latence est une preuve d'injection, même sans donnée visible.

## Démarche de test (sur cible autorisée)

1. Repérer chaque paramètre : `?id=`, champs de formulaire, en-têtes, cookies, chemins d'API.
2. Observer le comportement nominal, puis perturber **une seule chose à la fois**.
3. Confirmer l'interprétation côté serveur (et non un simple reflet client).
4. Évaluer l'impact **minimal démontrable** : lecture d'une colonne de test, pas exfiltration massive.
5. Documenter la requête, la réponse, l'impact et la correction.

```bash
# Contrôle de non-régression : comparer les réponses
curl -s -o /dev/null -w '%{http_code} %{size_download} %{time_total}\n' \
  'https://lab.local/product?id=1'
curl -s -o /dev/null -w '%{http_code} %{size_download} %{time_total}\n' \
  'https://lab.local/product?id=1%27'
```

## Remédiation

- **Requêtes paramétrées / prepared statements partout**, y compris pour les `ORDER BY` (utiliser une allowlist de colonnes).
- ORM correctement utilisé ; jamais de concaténation dans les requêtes natives.
- Compte applicatif avec **moindre privilège** : pas de `FILE`, pas de droits DDL, pas d'accès aux schémas système.
- Messages d'erreur génériques côté client, journalisation détaillée côté serveur.
- Tests automatisés (SAST + DAST) dans la CI et revue des requêtes dynamiques.

## À retenir

L'injection SQL est un problème de **conception de la frontière code/données**. La correction est structurelle (paramétrage), jamais un filtre de caractères. Le même raisonnement s'applique aux injections de commandes, LDAP, XPath et aux templates (SSTI).
