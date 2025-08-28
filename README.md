# SetMeld Pod

SetMeld Pod: Community Solid Server + Git over SSH (git-shell).

## Features

- **Community Solid Server (CSS)** with full Solid protocol support
- **Git over SSH** with pretty repository URLs (`ssh://git@host:port/repo.git`)

## Prerequisites

### Development
- Node.js ≥ 20
- Git
- OpenSSH (dev: `/usr/sbin/sshd` available on macOS & Linux)

### Production
- nfpm (for packaging): `go install github.com/goreleaser/nfpm/v2/cmd/nfpm@latest`

## Development

### Quick Start

```bash
npm i
npm run dev
```

### Development Usage

After running `npm run dev`, you can:

 - Navigate to http://localhost:3000/.integration/
 - Click "Sign Up" and create an account with the "Pod Name" "admin"
 - Click "Set SSH Key" and paste your ssh key for your personal computer into the modal. (this will allow you to commit to the git repo)
 - For dev, all data is stored in the `./data` folder. Look in the `./data/.internal` for integration data. Specifically:
    - `./data/.internal/integration-git`: The root file where git repos are committed.
    - `./data/.internal/integration-code`: The folder integration code is cloned to and run from.
    - `./data/.internal/integration-meta`: Metadata about each integration
    - `./data/.internal/authorized_keys`: Lists the ssh key that is allowed to commit to the integration repo.

3. **Push to the repository**:
   ```bash
   git remote add origin ssh://git@localhost:2229/my_repo_name.git
   git push -u origin main
   ```

### Development Scripts

- `npm run dev:setup` - Initialize development environment
- `npm run dev:sshd` - Start Git SSHD only
- `npm run dev:css` - Start CSS only
- `npm run dev` - Start both services concurrently

## Production Deployment

### Building the Package

```bash
# Build the Debian package
npm run bundle
# => setmeld-pod_0.1.0_amd64.deb
```

### Installation

1. **Publish your `.deb`** to an APT repository (Cloudsmith/PackageCloud or self-hosted)

2. **Install on target host**:
   ```bash
   sudo apt update
   sudo apt install setmeld-pod
   ```

3. **Configure**:
   ```bash
   # Add admin keys
   sudo nano /etc/setmeld-pod/authorized_keys
   
   # Optional: Edit configuration
   sudo nano /etc/setmeld-pod/config.env
   
   # Restart services
   sudo systemctl daemon-reload
   sudo systemctl restart setmeld-pod.target
   ```

4. **Create repositories**:
   ```bash
   # Create a bare repository
   sudo -u git mkdir -p /var/lib/setmeld/data/.internal/integration-repo/my_repo_name.git
   sudo -u git git -C /var/lib/setmeld/data/.internal/integration-repo/my_repo_name.git init --bare
   
   # Push from workstation
   git remote add origin ssh://git@HOST:2222/my_repo_name.git
   git push -u origin main
   ```

## Configuration

### CSS Parameters

All Community Solid Server parameters are supported:

```
--port|-p (default 3000)
--baseUrl|-b (default http://localhost:$PORT/)
--socket
--loggingLevel|-l (default info)
--config|-c (default @css:config/default.json)
--rootFilePath|-f (default ./)
--sparqlEndpoint|-s
--showStackTrace|-t (default false)
--podConfigJson (default ./pod-config.json)
--seedConfig
--mainModulePath|-m
--workers|-w (default 1)
```

### Orchestrator Parameters

- `--git-port` (default 2222) - Port for dedicated Git SSHD

### Configuration Precedence

1. Command line arguments
2. `/etc/setmeld-pod/config.env` (production)
3. Default values

## Architecture

### Pretty URLs

The system supports pretty repository URLs:

```
ssh://git@HOST:PORT/my_repo_name.git
```

Internally maps to:

```
${ROOT_FILE_PATH}/.internal/integration-repo/my_repo_name.git
```

Using `SetEnv GIT_PROJECT_ROOT` + `git-shell` for clean URL mapping.

### Services

- **CSS Service** (`setmeld-pod-node.service`) - Runs Community Solid Server
- **Git SSHD Service** (`setmeld-pod-git-sshd.service`) - Dedicated SSH daemon for Git
- **Target Service** (`setmeld-pod.target`) - Groups both services together

### Security

- **Separate SSH daemon** - Isolated from system sshd
- **Git-shell only** - Restricted to Git operations
- **Public key authentication** - No password authentication
- **No TTY/forwarding** - Disabled for security

## Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| **CSS Port** | 3000 | Configurable |
| **Git Port** | 2229 | 2222 (default) |
| **Data Directory** | `./data` | `/var/lib/setmeld/data` |
| **SSH Keys** | `./dev/sshd/hostkeys` | `/etc/setmeld-pod/sshd/hostkeys` |
| **Authorized Keys** | `./dev/authorized_keys` | `/etc/setmeld-pod/authorized_keys` |
| **Service Management** | Manual/Concurrently | Systemd |

## Troubleshooting

### Development Issues

1. **SSH connection refused**: Ensure `npm run dev:setup` was run
2. **Permission denied**: Check `dev/authorized_keys` contains your public key
3. **Port already in use**: Kill existing processes or change ports in scripts

### Production Issues

1. **Service won't start**: Check logs with `journalctl -u setmeld-pod-node.service`
2. **Git access denied**: Verify `/etc/setmeld-pod/authorized_keys` permissions and content
3. **Port conflicts**: Adjust `GIT_PORT` in `/etc/setmeld-pod/config.env`

## License

MIT