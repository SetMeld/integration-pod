# Scripts Directory

This directory contains all the scripts used in the SetMeld Pod project, organized by their purpose.

## Directory Structure

### `/deploy/` - Deployment Scripts
**Note: Deployment is now handled by the Ansible system in the `ansible/` directory.**

The old custom deployment scripts have been removed in favor of the professional Ansible-based deployment system.

### `/bundle/` - Bundle Creation Scripts
Scripts used to create the .deb packages.

- **`bundle-packages.sh`** - Main bundling script
- **`fetch-node.sh`** - Downloads Node.js runtime for packaging

### `/debScripts/` - Debian Package Scripts
Scripts that get included in the .deb package and run on the target system.

- **`postinstall.sh`** - Runs after package installation
- **`preinstall.sh`** - Runs before package installation
- **`postremove.sh`** - Runs after package removal
- **`preremove.sh`** - Runs before package removal
- **`config.env.example`** - Example configuration file
- **`setmeld-pod.target`** - Systemd target unit
- **`setmeld-pod-node.service`** - Node.js service unit
- **`setmeld-pod-git-sshd.service`** - SSH service unit

### Root Scripts
Scripts that remain in the root scripts directory.

- **`start-deb.sh`** - Start the installed .deb package
- **`dev-setup.sh`** - Development environment setup
- **`dev-sshd.sh`** - Development SSH daemon

## Usage

### Development
```bash
# Setup development environment
./scripts/dev-setup.sh

# Start development services
npm run dev
```

### Building Packages
```bash
# Create .deb packages
npm run bundle
```

### Deployment
```bash
# Deploy using Ansible (see ansible/README.md for details)
cd ansible
./deploy.sh user@server.com domain.com

# Or run manually
ansible-playbook -i inventory.yml deploy.yml
```

### Testing Installed Package
```bash
# Start the installed .deb package
./scripts/start-deb.sh
```

## Script Dependencies

- **Bundle scripts** require nfpm and the project to be built
- **Deb scripts** run on the target system and require systemd
- **Dev scripts** require development dependencies to be installed
- **Deployment** is handled by Ansible (see ansible/README.md)

## Adding New Scripts

When adding new scripts:

1. **Bundle creation scripts** → Place in `/bundle/`
2. **Package scripts** → Place in `/debScripts/`
3. **Development scripts** → Place in root `/scripts/`
4. **Deployment scripts** → Place in `ansible/` directory

Update the appropriate documentation and package.json scripts as needed.
