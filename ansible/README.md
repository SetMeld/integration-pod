# SetMeld Pod Ansible Deployment

Clean, straightforward Ansible deployment for SetMeld Pod. No complexity, just what you need.

## 🚀 Quick Start

### 1. Install Ansible

```bash
# macOS
brew install ansible

# Ubuntu/Debian
sudo apt update && sudo apt install ansible

# Python pip
pip install ansible
```

### 2. Deploy with One Command

```bash
# Basic deployment
./deploy.sh user@myserver.com myserver.com

# Using SSH alias from ~/.ssh/config
./deploy.sh sandbox myserver.com

# Custom port
./deploy.sh user@myserver.com myserver.com 8080

# With SSL (automatic Let's Encrypt setup)
./deploy.sh user@myserver.com myserver.com 443 --ssl
```

## 📁 What You Get

```
ansible/
├── README.md                 # This file
├── deploy.yml                # Single playbook (80 lines)
├── nginx-setmeld-pod.j2      # Simple nginx config
├── inventory.yml             # Example inventory
└── deploy.sh                 # Simple deployment script
```

## 🔧 How It Works

The deployment does exactly what you need:

1. **Installs SetMeld Pod** - Downloads and installs the .deb package
2. **Installs Nginx** - Sets up reverse proxy
3. **Configures Nginx** - Routes traffic to SetMeld Pod
4. **Updates Config** - Sets your domain in config.env
5. **Starts Services** - Everything running and enabled

## 📋 Usage Examples

### Simple Deployment

```bash
# Deploy to myserver.com on port 80
./deploy.sh user@myserver.com myserver.com

# Or use SSH aliases from your ~/.ssh/config
./deploy.sh sandbox myserver.com
```

### SSL Deployment

```bash
# Deploy with SSL (Let's Encrypt) on port 443
./deploy.sh user@myserver.com myserver.com 443 --ssl

# Deploy with SSL using SSH alias
./deploy.sh sandbox myserver.com 443 --ssl
```

**SSL Requirements:**
- Port 80 must be open (for Let's Encrypt verification)
- Domain must point to your server
- Server must be accessible from the internet

### Custom Configuration

```bash
# Deploy to custom port
./deploy.sh user@myserver.com myserver.com 8080

# Deploy with HTTPS (port 443)
./deploy.sh user@myserver.com myserver.com 443 true
```

### Manual Ansible

```bash
# Run manually with custom inventory
ansible-playbook -i inventory.yml deploy.yml

# With custom variables
ansible-playbook -i inventory.yml deploy.yml \
  -e "base_url=myserver.com" \
  -e "nginx_port=8080"
```

## 📝 Customization

### Edit Inventory

Modify `inventory.yml` for your server:

```yaml
all:
  hosts:
    myserver:
      ansible_host: 192.168.1.100        # Your server IP
      ansible_user: ubuntu               # Your username
      ansible_ssh_private_key_file: ~/.ssh/id_rsa  # Your SSH key
      base_url: myserver.com            # Your domain
      enable_https: false               # HTTPS enabled?
      nginx_port: 80                    # Port for nginx
```

### Edit Nginx Config

Modify `nginx-setmeld-pod.j2` for custom nginx settings.

## 🧪 Testing

### Check Deployment

```bash
# SSH to your server
ssh user@myserver.com

# Check services
sudo systemctl status setmeld-pod.target
sudo systemctl status nginx

# Test web interface
curl http://myserver.com/health
```

### Test Git Operations

```bash
# Test SSH connection
ssh -p 2222 setmeld@myserver.com

# Test git clone
git clone ssh://setmeld@myserver.com:2222/test-repo.git
```

## 🚨 Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   - Check SSH key permissions: `chmod 600 ~/.ssh/id_rsa`
   - Verify server accessibility
   - Check username and hostname

2. **Permission Denied**
   - Ensure user has sudo access
   - Check SSH key is added to server

3. **Package Installation Failed**
   - Run `npm run bundle` first to create .deb packages
   - Check server has internet access
   - Verify sufficient disk space

### Debug Mode

```bash
# Run with verbose output
ansible-playbook -i inventory.yml deploy.yml -v

# Check mode (dry run)
ansible-playbook -i inventory.yml deploy.yml --check
```

## 🔒 Security

- SSH key authentication only
- Services run as non-root users
- Basic nginx security headers
- No unnecessary ports open

## 📚 Next Steps

After deployment:

1. **Add SSH keys** to `/var/lib/setmeld/data/.internal/authorized_keys`
2. **Test web interface** at your domain
3. **Test git operations** with SSH
4. **Configure SSL** if needed (manual process for now)

## 🎯 Philosophy

**Start clean, add complexity only when needed.**

This deployment system gives you:
- ✅ **Professional deployment** using Ansible
- ✅ **Easy to understand** - everything in one file
- ✅ **Easy to modify** - no complex role structure
- ✅ **Easy to debug** - all logic visible
- ✅ **Easy to maintain** - minimal moving parts

If you need more features (rolling updates, multiple environments, etc.), we can add them. But start here and grow into complexity.
