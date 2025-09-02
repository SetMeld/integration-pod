#!/usr/bin/env bash
set -euo pipefail

echo "Stopping and disabling setmeld-pod.target..."
systemctl disable setmeld-pod.target || true
systemctl stop setmeld-pod.target || true
