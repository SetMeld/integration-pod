#!/usr/bin/env bash
set -e

echo "Setting up SetMeld Pod..."

# Check if Node.js 18+ is installed
if ! command -v node >/dev/null 2>&1 || [[ $(node --version | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
    echo "Node.js 18+ is required but not found or version is too old."
    echo ""
    echo "You can install Node.js 18+ using the provided script:"
    echo "  sudo setmeld-pod-install-nodejs"
    echo ""
    echo "Or install manually using one of these methods:"
    echo ""
    echo "Method 1 - Using NodeSource repository (recommended):"
    echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install -y nodejs"
    echo ""
    echo "Method 2 - Using Node Version Manager (nvm):"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  source ~/.bashrc"
    echo "  nvm install 18"
    echo "  nvm use 18"
    echo ""
    echo "After installing Node.js 18+, restart the setmeld-pod service:"
    echo "  sudo systemctl restart setmeld-pod"
    echo ""
    echo "Note: The service will not start until Node.js 18+ is installed."
fi

# CSS service account
if ! id -u setmeld >/dev/null 2>&1; then
    echo "Creating setmeld user..."
    useradd --system --home /var/lib/setmeld --shell /usr/sbin/nologin setmeld
fi

# Git account for pretty URLs 'git@host'
if ! id -u git >/dev/null 2>&1; then
    echo "Creating git user..."
    useradd --system --home /var/lib/setmeld/data/.internal/integration-repo --shell /usr/bin/git-shell git
fi

# Create data directories
echo "Creating data directories..."
install -d -o setmeld -g setmeld /var/lib/setmeld/data
install -d -o setmeld -g setmeld /var/lib/setmeld/data/.internal
install -d -o setmeld -g setmeld /var/lib/setmeld/data/.internal/integration-repo

# Create configuration directories
echo "Creating configuration directories..."
install -d -o root -g root /etc/setmeld-pod
install -d -o root -g root /etc/setmeld-pod/sshd
install -d -o root -g root /etc/setmeld-pod/sshd/hostkeys

# Copy default configuration if it doesn't exist
if [[ ! -f /etc/setmeld-pod/config.env ]]; then
    echo "Installing default configuration..."
    cp /usr/share/setmeld-pod/config.env.example /etc/setmeld-pod/config.env
fi

# Create authorized_keys file with proper permissions
echo "Setting up SSH access..."
touch /etc/setmeld-pod/authorized_keys
chmod 600 /etc/setmeld-pod/authorized_keys
chown root:root /etc/setmeld-pod/authorized_keys

# Generate SSH host keys if they don't exist
if [[ ! -f /etc/setmeld-pod/sshd/hostkeys/ssh_host_ed25519_key ]]; then
    echo "Generating SSH host keys..."
    ssh-keygen -t ed25519 -N "" -f /etc/setmeld-pod/sshd/hostkeys/ssh_host_ed25519_key
    chown -R root:root /etc/setmeld-pod/sshd/hostkeys
    chmod 600 /etc/setmeld-pod/sshd/hostkeys/ssh_host_ed25519_key
    chmod 644 /etc/setmeld-pod/sshd/hostkeys/ssh_host_ed25519_key.pub
fi

# Set proper ownership for repository directory
echo "Setting up repository directory..."
chown -R git:git /var/lib/setmeld/data/.internal/integration-repo

# Reload systemd and enable services
echo "Enabling services..."
systemctl daemon-reload || true
systemctl enable setmeld-pod || true

echo "SetMeld Pod installation complete!"
echo ""
echo "Next steps:"
echo "1. Add SSH keys to /etc/setmeld-pod/authorized_keys"
echo "2. Edit configuration at /etc/setmeld-pod/config.env (optional)"
echo "3. Start services: systemctl start setmeld-pod"
echo "4. Create repositories: sudo -u git mkdir -p /var/lib/setmeld/data/.internal/integration-repo/your-repo.git && sudo -u git git -C /var/lib/setmeld/data/.internal/integration-repo/your-repo.git init --bare"
