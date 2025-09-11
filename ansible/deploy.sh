#!/bin/bash

# Simple SetMeld Pod deployment script
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 SetMeld Pod Deployment${NC}"

# Check arguments
if [ $# -lt 2 ]; then
    echo "Usage: $0 <server> <domain> [port] [--ssl]"
    echo "Example: $0 user@myserver.com myserver.com 80"
    echo "Example: $0 user@myserver.com myserver.com 443 --ssl"
    echo ""
    echo "Note: <server> can be:"
    echo "  - user@hostname (e.g., jackson@192.168.1.100)"
    echo "  - hostname (e.g., myserver.com)"
    echo "  - SSH alias (e.g., sandbox) - from ~/.ssh/config"
    echo ""
    echo "Options:"
    echo "  --ssl    Enable SSL with Let's Encrypt (requires port 80 to be open)"
    exit 1
fi

SERVER=$1
BASE_URL=$2
PORT=${3:-80}
SSL_ENABLED=false

# Check for SSL flag
if [[ "$*" == *"--ssl"* ]]; then
    SSL_ENABLED=true
    if [ "$PORT" != "443" ] && [ "$PORT" != "80" ]; then
        echo "Warning: SSL is enabled but port is not 80 or 443. Setting port to 443."
        PORT=443
    fi
fi

# Use the server parameter directly - let SSH handle aliases and config
# This preserves SSH aliases, config files, and custom connection settings
SSH_CONNECTION="$SERVER"

echo -e "${BLUE}📋 Deploying to: $SERVER${NC}"
echo -e "${BLUE}🌐 Domain: $BASE_URL${NC}"
echo -e "${BLUE}🔌 Port: $PORT${NC}"
echo -e "${BLUE}🔒 SSL: $SSL_ENABLED${NC}"

# Check if Ansible is installed
if ! command -v ansible-playbook &> /dev/null; then
    echo -e "${RED}❌ Ansible not found. Install with:${NC}"
    echo "  # macOS: brew install ansible"
    echo "  # Ubuntu: sudo apt install ansible"
    exit 1
fi

# Create simple inventory
cat > inventory-temp.yml << EOF
all:
  hosts:
    myserver:
      ansible_host: $SSH_CONNECTION
      base_url: $BASE_URL
      enable_https: $SSL_ENABLED
      nginx_port: $PORT
  vars:
    ansible_python_interpreter: /usr/bin/python3
    ansible_become: yes
    ansible_become_method: sudo
EOF

echo -e "${BLUE}📜 Running deployment...${NC}"

# Run deployment
if ansible-playbook -i inventory-temp.yml deploy.yml; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    if [ "$SSL_ENABLED" = true ]; then
        echo -e "${GREEN}🌐 Your SetMeld Pod is now accessible at: https://$BASE_URL${NC}"
    else
        echo -e "${GREEN}🌐 Your SetMeld Pod is now accessible at: http://$BASE_URL:$PORT${NC}"
    fi
    echo -e "${GREEN}🔑 Git operations: ssh://setmeld@$BASE_URL:2222/path/to/repo${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

# Clean up
rm inventory-temp.yml
