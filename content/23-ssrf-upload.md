---
id: web-ssrf-upload-logique
title: SSRF, uploads & failles de logique métier
module: M09
level: avance
minutes: 10
order: 6
brief: Trois familles où le scanner automatique échoue et où la compréhension du métier fait la différence.
tags: SSRF, upload, logique métier, API, cloud
---

## SSRF : faire fetch le serveur

Une **Server-Side Request Forgery** survient quand une application récupère une ressource dont l'URL est fournie par l'utilisateur (aperçu de lien, import d'image, webhook, génération de PDF). Le serveur devient un proxy vers des ressources qu'il peut atteindre et que l'attaquant ne peut pas : `localhost`, réseau interne, métadonnées cloud.

```text
POST /api/preview  { "url": "http://169.254.169.254/latest/meta-data/iam/..." }
                          ↑ le serveur exécute la requête avec SES propres droits
```

Défenses : **allowlist** de domaines et de schémas (`https` uniquement), résolution DNS puis vérification de l'IP (anti-DNS rebinding), blocage des plages privées/link-local, désactivation des redirections ou revalidation à chaque saut, IMDSv2 / identité de workload, sortie réseau filtrée par un proxy dédié.

> [!CONSEIL] Un blocage « si l'URL contient 127.0.0.1 » se contourne avec `2130706433`, `127.1`, un nom DNS pointant en interne ou une redirection. Validez l'**adresse IP résolue**, pas la chaîne.

## Uploads de fichiers

Les contrôles à empiler (aucun n'est suffisant seul) :

| Couche | Contrôle |
|:--|:--|
| Extension + type MIME | Allowlist, jamais de liste noire (`php5`, `phtml`, `phar`…) |
| Contenu réel | Vérification *magic bytes*, réencodage des images |
| Stockage | Hors de la racine web, nom aléatoire, permissions non exécutables |
| Distribution | Domaine séparé, `Content-Disposition: attachment`, `nosniff` |
| Taille / décompression | Limites strictes, anti-*zip slip*, anti-décompression bomb |
| Analyse | Antivirus en CI ou au dépôt, journalisation |

## Failles de logique métier

Ce sont les failles qu'aucun scanner ne trouve : la fonctionnalité fonctionne « comme prévu », mais l'enchaînement d'étapes est contournable.

- Modifier le prix ou la quantité **après** validation du panier (valeurs négatives, dépassement d'entier).
- Rejouer un coupon ou un appel de paiement (idempotence absente).
- Sauter une étape : appeler directement `/checkout/confirm` sans passer par le paiement.
- Abuser d'une race condition sur un solde ou un stock (verrouillage transactionnel manquant).
- Changer le destinataire d'un email de réinitialisation via un en-tête ou un paramètre caché.
- Manipuler un champ de rôle renvoyé par l'API et accepté côté serveur (*mass assignment*).

Méthode de test : dessinez le **diagramme d'états** attendu, puis essayez chaque transition interdite. Documentez l'impact métier (perte financière, contournement de contrôle) plutôt qu'une simple « anomalie ».

```bash
# Rejouer une requête en changeant un seul champ (test d'idempotence)
curl -s -X POST https://lab.local/api/coupon -H 'Content-Type: application/json' \
  -d '{"code":"WELCOME10","order_id":1042}' -H "Authorization: Bearer $TOKEN"
```

## À retenir

Ces trois familles demandent un **modèle mental du système**, pas un dictionnaire de payloads. Quand un test automatique ne remonte rien, c'est souvent là que se trouvent les découvertes les plus intéressantes — et les plus faciles à corriger une fois expliquées au développeur.
