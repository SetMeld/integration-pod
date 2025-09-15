#!/usr/bin/env bash
set -euo pipefail

log() { echo "[setmeld-postinst] $*"; }

log "Setting up SetMeld Pod"

# Create necessary directories
log "Creating SSH service directories..."
mkdir -p /etc/setmeld-pod/sshd/hostkeys

# Generate SSH host key if it doesn't exist
if [ ! -f /etc/setmeld-pod/sshd/hostkeys/ssh_host_ed25519_key ]; then
    log "Generating SSH host key..."
    ssh-keygen -t ed25519 -N "" -f /etc/setmeld-pod/sshd/hostkeys/ssh_host_ed25519_key
    chmod 600 /etc/setmeld-pod/sshd/hostkeys/ssh_host_ed25519_key
fi

# Create required directories and files as root, then change ownership
log "Setting up data directory structure..."
mkdir -p /var/lib/setmeld/data/.internal/integration-git
touch /var/lib/setmeld/data/.internal/authorized_keys
chmod 600 /var/lib/setmeld/data/.internal/authorized_keys

# Set the default git branch to main
git config --system init.defaultBranch main

# Ensure setmeld user owns everything in the data directory
chown -R setmeld:setmeld /var/lib/setmeld/data
chmod -R 755 /var/lib/setmeld/data

# Fix authorized_keys permissions - needs to be readable by SSH daemon (root)
chown setmeld:setmeld /var/lib/setmeld/data/.internal/authorized_keys
chmod 600 /var/lib/setmeld/data/.internal/authorized_keys

# Create sshd_config
log "Creating SSH configuration..."
cat > /etc/setmeld-pod/sshd/sshd_config <<EOF
Port 2222
Protocol 2
HostKey /etc/setmeld-pod/sshd/hostkeys/ssh_host_ed25519_key
UsePAM no
PasswordAuthentication no
PubkeyAuthentication yes
PermitTTY no
AllowTcpForwarding no
X11Forwarding no
AuthorizedKeysFile /var/lib/setmeld/data/.internal/authorized_keys
PidFile /run/setmeld-pod/sshd.pid
SetEnv GIT_PROJECT_ROOT=/var/lib/setmeld/data/.internal/integration-git
ForceCommand git-shell -c "\$SSH_ORIGINAL_COMMAND"
AllowUsers setmeld
EOF

# Update the port in sshd_config to use GIT_PORT from config.env if available
if [ -f /etc/setmeld-pod/config.env ]; then
    GIT_PORT=$(grep "^GIT_PORT=" /etc/setmeld-pod/config.env | cut -d'=' -f2)
    if [ -n "$GIT_PORT" ]; then
        log "Updating SSH port to $GIT_PORT from config.env"
        sed -i "s/^Port 2222/Port $GIT_PORT/" /etc/setmeld-pod/sshd/sshd_config
    fi
fi

# Set proper ownership and permissions
chown -R root:root /etc/setmeld-pod/sshd
chmod 600 /etc/setmeld-pod/sshd/sshd_config

log "SSH service setup complete"

# Check if systemd is running as PID 1.
# This prevents errors in non-systemd environments like Docker.
if [ "$(ps -p 1 -o comm=)" = "systemd" ]; then
  echo "Reloading systemd daemon..."
  systemctl daemon-reload
  echo "Enabling and starting setmeld-pod.target..."
  systemctl enable setmeld-pod.target
  systemctl start setmeld-pod.target

  log "SetMeld Pod installation complete."
  log "Next steps:"
  log "  - Edit /etc/setmeld-pod/config.env if needed."
  log "  - Add SSH public keys to /var/lib/setmeld/data/.internal/authorized_keys"
else
  echo "Systemd not detected, skipping service management."
fi
