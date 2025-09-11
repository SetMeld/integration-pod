#!/usr/bin/env bash
set -euo pipefail
DEV_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.."; pwd)/data/.internal"
exec /usr/sbin/sshd -D -f "${DEV_DIR}/sshd/sshd_config"
