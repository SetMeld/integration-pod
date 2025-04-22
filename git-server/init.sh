#!/bin/bash

# Set up Git-only shell
chsh -s $(which git-shell) git

# Ensure authorized_keys is linked correctly
mkdir -p /home/git/.ssh
ln -sf /authorized_keys /home/git/.ssh/authorized_keys
chown -R git:git /home/git/.ssh
chmod 700 /home/git/.ssh
chmod 600 /home/git/.ssh/authorized_keys

# Set up repo hooks
HOOK_DIR="/etc/git-hooks"
for repo in /srv/git/*.git; do
  if [ -d "$repo/hooks" ]; then
    cp "$HOOK_DIR/post-receive" "$repo/hooks/post-receive"
    chmod +x "$repo/hooks/post-receive"
  fi
done

# Start SSH
exec /usr/sbin/sshd -D
