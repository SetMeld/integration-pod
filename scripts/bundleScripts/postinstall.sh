#!/usr/bin/env bash
set -euo pipefail

log() { echo "[setmeld-postinst] $*"; }

log "Setting up SetMeld Pod (minimal)..."

# 1) Create service users
if ! id -u setmeld >/dev/null 2>&1; then
  log "Creating 'setmeld' system user..."
  useradd --system --home /var/lib/setmeld --shell /usr/sbin/nologin setmeld || true
fi

if ! id -u git >/dev/null 2>&1; then
  log "Creating 'git' system user..."
  useradd --system --home /var/lib/setmeld --shell /usr/bin/git-shell git || true
fi

# 2) Create core dirs (owned by git for SSH access)
log "Creating data directories..."
install -d -m 0755 -o git -g git /var/lib/setmeld/data

# 3) Config dir (conffile is installed by the package; don't overwrite here)
log "Ensuring config directory..."
install -d -m 0755 -o root -g root /etc/setmeld-pod
# DO NOT copy config.env here; nfpm installs it as a conffile:
# - src: ./scripts/bundleScripts/config.env.example
#   dst: /etc/setmeld-pod/config.env
#   type: config

# 4) Container-safe systemd handling (no-ops in containers)
if command -v systemctl >/dev/null 2>&1 && [ -d /run/systemd/system ]; then
  log "Systemd detected; enabling SetMeld Pod services..."
  systemctl daemon-reload || true
  systemctl enable setmeld-pod.target || true
  # The target unit will automatically enable both setmeld-pod-node.service and setmeld-pod-git-sshd.service
else
  log "No systemd (container likely). Skipping service enable."
fi

log "SetMeld Pod installation complete."
log "Next steps (typical container run):"
log "  - Edit /etc/setmeld-pod/config.env if needed."
log "  - Start with: /usr/bin/setmeld-pod"
