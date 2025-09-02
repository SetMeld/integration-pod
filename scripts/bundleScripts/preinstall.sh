#!/bin/sh
# Create a dedicated system user if it doesn't already exist.
# This makes the installation process idempotent.
if ! id -u setmeld >/dev/null 2>&1; then
  echo "Creating setmeld system user..."
  useradd --system --shell /usr/sbin/nologin --comment "SetMeld Pod User" setmeld
fi