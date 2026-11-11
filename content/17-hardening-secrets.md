---
id: crypto-hardening-secrets
title: Durcissement Linux & gestion des secrets
module: M12
level: intermediaire
minutes: 12
order: 3
brief: Réduire la surface d'attaque d'un serveur et ne jamais laisser un secret traîner dans un dépôt, un log ou une variable mal protégée.
tags: hardening, secrets, SSH, sysctl, nftables, ANSSI
---

## Le principe

Un système durci n'est pas un système avec beaucoup d'outils de sécurité : c'est un système où **tout ce qui n'est pas nécessaire a été retiré**, et où ce qui reste est journalisé et cloisonné. On travaille par couches : réseau, services, noyau, identités, secrets, supervision.

## Couche réseau

```bash
# nftables : politique par défaut restrictive (Debian 13+)
sudo nft add table inet filter
sudo nft 'add chain inet filter input { type filter hook input priority 0; policy drop; }'
sudo nft add rule inet filter input ct state established,related accept
sudo nft add rule inet filter input iif lo accept
sudo nft add rule inet filter input tcp dport 22 ip saddr 10.0.0.0/24 accept
sudo nft list ruleset | sudo tee /etc/nftables.conf
sudo systemctl enable --now nftables
```

> [!ATTENTION] Avant d'appliquer une politique `drop` sur une machine distante, gardez une session ouverte et vérifiez la règle SSH. Une erreur de syntaxe peut vous exclure définitivement.

## Couche service et SSH

```text
/etc/ssh/sshd_config
  PermitRootLogin no
  PasswordAuthentication no
  PubkeyAuthentication yes
  X11Forwarding no
  AllowUsers admin deploy
  MaxAuthTries 3
```

Compléments : `systemctl disable --now <service inutile>`, `systemd-analyze security` pour repérer les unités trop permissives, AppArmor/SELinux en mode *enforce*, `umask 027`, partitions `/tmp` en `noexec,nosuid,nodev`.

## Couche noyau

```bash
# Extraits de /etc/sysctl.d/99-hardening.conf
kernel.randomize_va_space = 2
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.tcp_syncookies = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
kernel.yama.ptrace_scope = 2
sudo sysctl --system
```

## Les secrets : règles non négociables

| À faire | À éviter |
|:--|:--|
| Coffre (Vault, SOPS, secrets manager) | `.env` commité, secret en clair dans un YAML |
| Rotation planifiée + révocation testée | Clé « temporaire » qui dure trois ans |
| Secret injecté au runtime, masqué dans les logs | `echo $TOKEN`, secret dans la ligne de commande |
| Scan de secrets en pre-commit + CI | Compter sur la relecture humaine seule |
| Droits `600`, propriétaire dédié | Fichier lisible par le groupe `www-data` |

```bash
# Détecter un secret déjà commité
gitleaks detect --source . --no-banner
trufflehog git file://. --only-verified

# Vérifier les permissions d'une clé
stat -c '%a %U:%G %n' ~/.ssh/id_ed25519   # attendu : 600 user:user
```

> [!CONSEIL] Un secret exposé n'est jamais « nettoyé » par un nouveau commit : l'historique Git le conserve. Il faut le **révoquer**, puis nettoyer l'historique si nécessaire.

## Mesurer

Un durcissement se valide par un **test de non-régression** : scan de ports avant/après, `lynis audit system`, comparaison à une baseline (CIS Benchmark, guides ANSSI), et relectue des écarts acceptés avec une justification datée.

## À retenir

Durcir = retirer, cloisonner, journaliser, vérifier. Les secrets sont un cycle de vie (génération, stockage, distribution, rotation, révocation), pas un fichier de configuration.
