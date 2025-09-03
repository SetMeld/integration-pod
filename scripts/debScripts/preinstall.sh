#!/bin/sh
# Create a dedicated system user if it doesn't already exist.
# This makes the installation process idempotent.
if ! id -u setmeld >/dev/null 2>&1; then
  echo "Creating setmeld system user..."
  # --system keeps UID low; --shell ensures sshd has a valid shell
  useradd --system \
          --shell /usr/bin/git-shell \
          --comment "SetMeld Pod User" \
          --create-home \
          setmeld
fi

# Ensure the account is unlocked (no password, but not disabled)
passwd -u setmeld 2>/dev/null || true
passwd -d setmeld 2>/dev/null || true   # remove any password, keep key-only auth
