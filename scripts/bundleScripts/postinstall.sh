#!/usr/bin/env bash
set -euo pipefail

log() { echo "[setmeld-postinst] $*"; }

log "Setting up SetMeld Pod"

# Check if systemd is running as PID 1.
# This prevents errors in non-systemd environments like Docker.
if [ -d /run/systemd/system ]; then
  echo "Reloading systemd daemon..."
  systemctl daemon-reload
  echo "Enabling and starting setmeld-pod.target..."
  systemctl enable setmeld-pod.target
  systemctl start setmeld-pod.target

  log "SetMeld Pod installation complete."
  log "Next steps:"
  log "  - Edit /etc/setmeld-pod/config.env if needed."
else
  echo "Systemd not detected, skipping service management."
fi
