# SetMeld Pod Architecture

## Overview

SetMeld Pod has evolved from a simple integration pod to a comprehensive platform that combines Community Solid Server (CSS) with Git-over-SSH capabilities. This architecture provides a complete development and deployment solution for Solid-based applications with integrated version control.

## Architecture Components

### 1. Community Solid Server (CSS)
- **Purpose**: Provides the core Solid protocol implementation
- **Port**: 3000 (dev) / configurable (prod)
- **Features**: Full Solid protocol support, WebID authentication, LDP storage
- **Configuration**: Uses existing `config/config.json` with custom integrations

### 2. Git-over-SSH Service
- **Purpose**: Provides Git repository access with pretty URLs
- **Port**: 2229 (dev) / 2222 (prod)
- **Features**: 
  - Pretty repository URLs: `ssh://git@host:port/repo.git`
  - Internal mapping to `.internal/integration-repo/`
  - Git-shell only access (no general SSH)
  - Public key authentication

### 3. Orchestration Layer
- **Main Script**: `scripts/setmeld-pod`
- **Purpose**: Coordinates CSS and Git services
- **Features**:
  - Parameter parsing and forwarding
  - Environment configuration
  - Service initialization
  - Security setup

## Development Environment

### Structure
```
dev/
├── sshd/
│   ├── hostkeys/           # Generated SSH host keys
│   └── sshd_config         # Development SSHD configuration
├── git-root/               # Bare Git repositories
└── authorized_keys         # Developer SSH public keys
```

### Workflow
1. **Setup**: `npm run dev:setup` - Generates keys and configs
2. **Development**: `npm run dev` - Starts both CSS and Git SSHD
3. **Testing**: `npm run test:dev` - Validates environment
4. **Demo**: `npm run demo` - Creates example repository

## Production Environment

### Systemd Services
- **setmeld-pod-node.service**: CSS service
- **setmeld-pod-git-sshd.service**: Git SSHD service  
- **setmeld-pod.target**: Groups both services

### Directory Structure
```
/usr/lib/setmeld-pod/        # Application files
/etc/setmeld-pod/           # Configuration
/var/lib/setmeld/data/      # Data storage
```

### Users
- **setmeld**: CSS service account
- **git**: Git repository access account

## Security Model

### Git Access
- **Isolation**: Separate SSH daemon from system sshd
- **Restriction**: Git-shell only, no general SSH access
- **Authentication**: Public key only, no passwords
- **URL Mapping**: Pretty URLs via `GIT_PROJECT_ROOT` environment

### CSS Access
- **Authentication**: WebID-based
- **Authorization**: WAC (Web Access Control)
- **Storage**: File-based with proper permissions

## Configuration Management

### Precedence Order
1. Command line arguments
2. Environment file (`/etc/setmeld-pod/config.env`)
3. Default values

### Key Parameters
- **CSS**: All standard CSS parameters supported
- **Git**: `--git-port` for SSHD port configuration
- **Paths**: `--rootFilePath` for data directory

## Deployment

### Development
- **Local setup**: No system changes required
- **Port usage**: High ports (2229) to avoid conflicts
- **Key management**: Local development keys

### Production
- **Package**: Debian package via nfpm
- **Installation**: Standard apt package management
- **Configuration**: System-wide configuration files
- **Services**: Automatic systemd integration

## Migration from Integration Pod

### Preserved Components
- CSS configuration (`config/config.json`)
- Integration API endpoints
- UI components and routing
- Existing data structures

### New Components
- Git-over-SSH service
- Orchestration layer
- Development tooling
- Production packaging

### Breaking Changes
- Package name: `setmeld-pod` → `setmeld-pod`
- Service management: Docker → Systemd
- Development workflow: Docker → Local services

## Benefits

### Developer Experience
- **Local development**: No Docker required
- **Fast iteration**: Direct file access
- **Debugging**: Native tooling support
- **Testing**: Automated environment validation

### Production Readiness
- **Packaging**: Standard Debian packages
- **Deployment**: Native system integration
- **Monitoring**: Systemd service management
- **Security**: Proper user isolation

### Scalability
- **Service separation**: Independent scaling
- **Configuration**: Flexible parameter management
- **Storage**: Configurable data locations
- **Networking**: Port flexibility

## Future Enhancements

### Planned Features
- **Multi-tenant support**: Multiple Git repositories per instance
- **Web hooks**: Git event integration
- **CI/CD integration**: Automated deployment pipelines
- **Monitoring**: Metrics and health checks
- **Backup**: Automated data protection

### Architecture Evolution
- **Microservices**: Further service decomposition
- **Containerization**: Kubernetes deployment
- **Cloud integration**: Multi-cloud support
- **API expansion**: RESTful Git operations
