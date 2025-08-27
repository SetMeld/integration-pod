#!/usr/bin/env bash
set -e

# CSS service account
id -u setmeld >/dev/null 2>&1 || useradd --system --home /var/lib/setmeld --shell /usr/sbin/nologin setmeld

# Git account for pretty URLs 'git@host'
id -u git >/dev/null 2>&1 || useradd --system --home /var/lib/setmeld/data/.internal/integration-repo --shell /usr/bin/git-shell git

install -d -o setmeld -g setmeld /var/lib/setmeld/data
install -d -o root -g root /etc/setmeld-pod
install -d -o root -g root /etc/setmeld-pod/sshd
install -d -o root -g root /etc/setmeld-pod/sshd/hostkeys

[[ -f /etc/setmeld-pod/config.env ]] || cp /usr/share/setmeld-pod/config.env.example /etc/setmeld-pod/config.env

touch /etc/setmeld-pod/authorized_keys
chmod 600 /etc/setmeld-pod/authorized_keys
chown root:root /etc/setmeld-pod/authorized_keys

REPO_ROOT="/var/lib/setmeld/data/.internal/integration-repo"
mkdir -p "$REPO_ROOT"
chown -R git:git "$REPO_ROOT"

systemctl daemon-reload || true
systemctl enable setmeld-pod.target || true
systemctl restart setmeld-pod.target || true
