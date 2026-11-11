---
id: cloud-devsecops
title: Cloud, conteneurs & DevSecOps
module: M13
level: avance
minutes: 12
order: 3
brief: Le modèle de responsabilité partagée, les risques IAM et conteneurs, et l'intégration de la sécurité dans la CI/CD.
tags: cloud, IAM, conteneurs, Kubernetes, CI/CD, SAST, SBOM
---

## Responsabilité partagée

Le fournisseur sécurise **le cloud** (infrastructure physique, réseau, hyperviseur) ; vous sécurisez **ce que vous mettez dans le cloud** (identités, données, configuration, réseau logique, images, logs). La majorité des incidents cloud vient d'une **mauvaise configuration**, pas d'une faille du fournisseur.

| Erreur classique | Conséquence | Contrôle |
|:--|:--|:--|
| Bucket de stockage public | Exposition de données | Bloquer l'accès public au niveau du compte |
| Clé d'accès longue durée commitée | Compte compromis | Rôles temporaires / workload identity |
| `*:*` dans une politique IAM | Élévation de privilèges | Moindre privilège + analyse IAM |
| Port de gestion exposé à Internet | Accès direct | Réseau privé + bastion + MFA |
| Journalisation désactivée | Incident invisible | Activer audit trails, stockage immuable |

## Conteneurs : la nouvelle surface

```dockerfile
# Image durcie : minimaliste, non-root, versions épinglées
FROM gcr.io/distroless/nodejs20-debian12@sha256:<digest>
COPY --chown=10001:10001 app/ /app/
USER 10001
WORKDIR /app
CMD ["server.js"]
```

Checklist : images de base minimales et épinglées par digest · utilisateur non-root · `readOnlyRootFilesystem` · pas de `privileged`, pas de montage du socket Docker · limites CPU/mémoire · `seccomp`/AppArmor · scan d'images et **SBOM** en CI · signature des images (cosign) · secrets injectés par le orchestrateur, jamais dans l'image.

> [!ATTENTION] Le endpoint de métadonnées d'instance (`169.254.169.254`) est une cible classique de SSRF : une application qui « fetch une URL fournie » peut offrir des credentials temporaires à l'attaquant. Imposer IMDSv2 / équivalent et bloquer ce réseau depuis les workloads.

## DevSecOps : déplacer la sécurité vers la gauche

| Étape | Contrôle automatisé | Outil type |
|:--|:--|:--|
| Pre-commit | Détection de secrets, formatage, lint | gitleaks, pre-commit |
| Build | SAST, analyse de dépendances (SCA), SBOM | Semgrep, Dependabot, Syft |
| Image | Scan CVE, policy as code | Trivy, Grype, OPA |
| Déploiement | IaC scanning, signature, admission control | Checkov, cosign, Kyverno |
| Staging | DAST, tests d'API, scans authentifiés | ZAP, Nuclei |
| Production | RASP/WAF, monitoring, détection d'anomalies | Wazuh, Falco, SIEM |

```yaml
# Exemple de job de sécurité minimal (GitHub Actions)
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: gitleaks detect --no-banner
      - run: semgrep scan --config auto --error
      - run: trivy fs --exit-code 1 --severity HIGH,CRITICAL .
```

## Principes de conception

- **Tout est identité** : workloads inclus. Préférer des rôles courts et auditable aux clés statiques.
- **Infrastructure as Code** revue comme du code applicatif : la dérive de configuration se détecte par diff.
- Observabilité dès le départ : traces, métriques, logs structurés avec identifiant de corrélation.
- Isolation par compte/projet/ namespace : limiter le rayon d'impact d'une compromission.
- Tests de reprise réguliers : une sauvegarde non restaurée est une hypothèse, pas une garantie.

## À retenir

Dans le cloud, la sécurité est d'abord de la **configuration et de l'identité**. Automatisez les contrôles dans le pipeline pour qu'ils soient reproductibles, mesurables et non contournables par la vitesse des livraisons.
