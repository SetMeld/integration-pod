#!/bin/bash

# Build script for multi-architecture nfpm packages
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building SetMeld Pod packages for multiple architectures...${NC}"

# Get version from nfpm.yaml
VERSION=$(grep "version:" nfpm.yaml | awk '{print $2}' | tr -d '"')
PACKAGE_NAME="setmeld-pod"

echo -e "${GREEN}Building for version: ${VERSION}${NC}"

# Build for ARM64
echo -e "${YELLOW}Building ARM64 package...${NC}"
nfpm package --target "${PACKAGE_NAME}_${VERSION}_arm64.deb" --config nfpm.yaml

# Build for AMD64
echo -e "${YELLOW}Building AMD64 package...${NC}"
nfpm package --target "${PACKAGE_NAME}_${VERSION}_amd64.deb" --config nfpm.yaml

echo -e "${GREEN}Build complete! Created packages:${NC}"
echo -e "  - ${PACKAGE_NAME}_${VERSION}_arm64.deb"
echo -e "  - ${PACKAGE_NAME}_${VERSION}_amd64.deb"
