#!/usr/bin/env bash
set -euo pipefail
DEV_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.."; pwd)/data/.internal"
SSHD_DIR="${DEV_DIR}/sshd"
HOST="${SSHD_DIR}/hostkeys"

mkdir -p "${DEV_DIR}/integration-git" "${HOST}"

[[ -f "${HOST}/ssh_host_ed25519_key" ]] || ssh-keygen -t ed25519 -N "" -f "${HOST}/ssh_host_ed25519_key"

touch "${DEV_DIR}/authorized_keys"
chmod 600 "${DEV_DIR}/authorized_keys"

cat > "${SSHD_DIR}/sshd_config" <<EOF
Port 2229
Protocol 2
HostKey ${HOST}/ssh_host_ed25519_key
UsePAM no
PasswordAuthentication no
PubkeyAuthentication yes
PermitTTY no
AllowTcpForwarding no
X11Forwarding no
AuthorizedKeysFile ${DEV_DIR}/authorized_keys
PidFile ${SSHD_DIR}/sshd.pid
SetEnv GIT_PROJECT_ROOT=${DEV_DIR}/integration-git
ForceCommand git-shell -c "\$SSH_ORIGINAL_COMMAND"
EOF

echo "✔ Dev SSHD ready."
echo "Dev repo root:    ${DEV_DIR}/integration-git"
