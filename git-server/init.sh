#!/bin/bash

# Create a git-shell only environment
chsh -s $(which git-shell) git

# Authorize any keys present
touch /home/git/.ssh/authorized_keys
chown git:git /home/git/.ssh/authorized_keys
chmod 600 /home/git/.ssh/authorized_keys

# Set up hooks
HOOK_DIR="/etc/git-hooks"
for repo in /srv/git/*.git; do
  if [ -d "$repo/hooks" ]; then
    cp "$HOOK_DIR/post-receive" "$repo/hooks/post-receive"
    chmod +x "$repo/hooks/post-receive"
  fi
done

# Start SSH
exec /usr/sbin/sshd -D
