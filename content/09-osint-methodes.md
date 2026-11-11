---
id: recon-osint-methodes
title: Méthodologie OSINT & sources ouvertes
module: M04
level: debutant
minutes: 11
order: 4
brief: Structurer une recherche OSINT, distinguer le passif de l'actif et conserver une chaîne de preuves propre.
tags: OSINT, recon, passive, DNS, whois
---

## Passif vs actif

| | Collecte passive | Collecte active |
|:--|:--|:--|
| Contact avec la cible | Aucun | Direct (DNS, ports, bannières) |
| Sources | Registres, moteurs, réseaux sociaux, archives, certificats | Serveurs de l'organisation |
| Trace laissée | Aucune chez la cible | Logs, IDS, pare-feu |
| Autorisation | Généralement libre | **Indispensable** |

La règle : on commence toujours par le passif. On obtient souvent 80 % de la carte d'une cible sans jamais lui envoyer un paquet.

## Les 7 familles de sources

1. **Noms de domaine** : WHOIS/RDAP, historique, sous-domaines via Certificate Transparency (`crt.sh`).
2. **DNS** : enregistrements A, MX, TXT (SPF/DKIM/DMARC), tentatives de transfert de zone.
3. **Infrastructure** : ASN, plages IP, moteurs de scan d'Internet (Shodan, Censys) — consulter, ne pas scanner soi-même hors périmètre.
4. **Web archivé** : Wayback Machine, pages d'erreur, fichiers `robots.txt`, `sitemap.xml`.
5. **Personnes** : annuaires professionnels, signatures d'emails, dépôts publics, offres d'emploi (elles révèlent la stack technique).
6. **Code & secrets** : dépôts GitHub publics, gist, clés API accidentellement commitées, métadonnées de fichiers (EXIF).
7. **Fuites** : bases de credentials connues — à manipuler uniquement dans un cadre légal et avec le consentement de l'organisation.

```bash
# Passif : certificats et DNS publics
curl -s "https://crt.sh/?q=%25.example.com&output=json" | jq -r '.[].name_value' | sort -u
dig +short example.com MX
dig +short TXT example.com
whois example.com | grep -iE 'registrant|name server|created'

# Actif (uniquement dans le périmètre autorisé)
dig axfr @ns1.example.com example.com
curl -sI https://example.com | grep -iE 'server|x-powered|set-cookie'
```

## Méthode de travail

> [!CONSEIL] Notez pour chaque information : **source**, **date de collecte**, **niveau de confiance**, **capture/URL**. Une découverte non sourcée est inexploitable dans un rapport.

Un cycle OSINT propre :

1. **Cadrer** : question précise (« quels sous-domaines exposent une application ? »), pas « trouve-moi tout ».
2. **Collecter** sans interpréter, dans un tableau ou un carnet.
3. **Corréler** : un même serveur hébergeant trois vhosts, un email réutilisé sur deux services, etc.
4. **Valider** par une seconde source indépendante.
5. **Restituer** avec les limites : ce qui est confirmé, probable, ou simple hypothèse.

## Pièges classiques

- Confondre une donnée **publique** et une donnée **à jour** : un sous-domaine de 2019 n'existe peut-être plus.
- Scanner l'infrastructure d'un hébergeur tiers en croyant tester la cible : vérifiez toujours l'ASN et le périmètre du contrat.
- Laisser des outils « passifs » interroger directement la cible (certains le font).
- Oublier que les données personnelles collectées sont soumises au RGPD : minimisez et anonymisez.

## À retenir

OSINT est une discipline de **rigueur documentaire** autant que technique. La qualité d'un rapport de reconnaissance se juge à la traçabilité de chaque affirmation.
