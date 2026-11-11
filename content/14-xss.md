---
id: web-xss-csp
title: XSS, encodage & politique de sécurité de contenu
module: M09
level: intermediaire
minutes: 10
order: 4
brief: Comprendre les trois familles de XSS, la bonne façon d'encoder selon le contexte et les défenses en profondeur.
tags: XSS, CSP, encodage, DOM, session
---

## Le mécanisme

Une XSS survient quand une donnée est insérée dans une page HTML **sans être encodée pour son contexte**. Le navigateur ne devine pas l'intention : il exécute ce qui ressemble à du script.

| Famille | Où naît le problème | Persistance |
|:--|:--|:--|
| **Reflected** | La donnée de la requête est renvoyée dans la réponse | Non |
| **Stored** | La donnée est sauvegardée puis servie à d'autres utilisateurs | Oui, impact massif |
| **DOM-based** | Un sink JavaScript côté client (`innerHTML`, `eval`, `location`) | Variable |

## L'encodage dépend du contexte

C'est l'erreur la plus fréquente : un « échappement HTML » universel n'existe pas.

```html
<!-- Contexte texte HTML : encoder < > & " ' -->
<p>{{ user_bio | e }}</p>

<!-- Contexte attribut : encoder les quotes + utiliser des guillemets -->
<input value="{{ value | attr }}">

<!-- Contexte JavaScript : sérialiser en JSON, ne jamais concaténer -->
<script>const cfg = {{ config | tojson }};</script>

<!-- Contexte URL : encoder la composante, valider le schéma -->
<a href="{{ url | urlencode }}">lien</a>
```

> [!ATTENTION] `innerHTML`, `document.write`, `eval`, `Function()` et `setTimeout(string)` sont des **sinks** : toute donnée non maîtrisée qui y arrive devient exécutable. Préférez `textContent`, `createElement` et des frameworks qui encodent par défaut.

## Défense en profondeur

1. **Encodage contextuel automatique** par le moteur de templates (React, Jinja2, Angular…).
2. **CSP** stricte : `Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'`. Avec des *nonces* ou des hashes plutôt que `unsafe-inline`.
3. **Cookies** : `HttpOnly` (inaccessible au JS), `Secure`, `SameSite=Lax|Strict`. Cela ne bloque pas la XSS mais empêche le vol de session.
4. **Validation d'entrée** en allowlist pour les formats attendus — complément, pas substitut de l'encodage.
5. Sanitisation HTML (DOMPurify) **uniquement** quand l'utilisateur doit réellement fournir du HTML riche.

## Tester proprement

Sur la Web Security Academy de PortSwigger ou un Juice Shop local :

- Injectez une **charge inoffensive et identifiable** (un `alert(document.domain)` ou un marqueur unique) plutôt qu'un vrai payload.
- Vérifiez où la donnée réapparaît : texte, attribut, bloc `<script>`, URL, réponse JSON.
- Tracez le chemin jusqu'au sink dans les DevTools (sources + points d'arrêt DOM).
- Testez le second ordre : profil, commentaire, nom de fichier, logs d'administration.

## À retenir

Une XSS est un problème de **sortie**, pas d'entrée. La question à poser à chaque rendu est : « dans quel contexte cette chaîne est-elle insérée, et cet encodage est-il le bon ? ». La CSP est le filet de sécurité, pas la correction.
