#!/usr/bin/env bash
set -euo pipefail

# Build script for setmeld-pod packages with bundled Node.js
# Usage: ./scripts/bundle-packages.sh [version]

# Read version from centralized version.json file
if [[ -f "version.json" ]]; then
    DEFAULT_VERSION=$(grep -o '"version": "[^"]*"' version.json | cut -d'"' -f4)
else
    DEFAULT_VERSION="0.1.0-alpha.0"
fi
VERSION="${1:-$DEFAULT_VERSION}"
NODE_VERSION="${NODE_VERSION:-20.16.0}"

echo "Building setmeld-pod packages version ${VERSION} with Node.js ${NODE_VERSION}"

# Create bundle directory
mkdir -p bundle

# Function to check if we have the right Node.js architecture
check_node_arch() {
    local target_arch=$1
    local runtime_dir="vendor/node-runtime-${target_arch}"
    
    if [[ ! -d "$runtime_dir" ]] || [[ ! -f "$runtime_dir/bin/node" ]]; then
        return 1
    fi
    
    # Check if the node binary matches the target architecture
    if [[ "$target_arch" == "amd64" ]] && file "$runtime_dir/bin/node" | grep -q "x86-64"; then
        return 0
    elif [[ "$target_arch" == "arm64" ]] && file "$runtime_dir/bin/node" | grep -q "ARM"; then
        return 0
    else
        return 1
    fi
}

# Build for amd64
echo "Building amd64 package..."
if check_node_arch "amd64"; then
    echo "Using existing Node.js runtime for amd64"
else
    echo "Downloading Node.js for amd64..."
    TARGETARCH=amd64 bash scripts/fetch-node.sh
fi

# Update version in nfpm config
sed -i.bak "s/version: \"[^\"]*\"/version: \"${VERSION}\"/" nfpm.yaml
rm -f nfpm.yaml.bak

ARCH=amd64 nfpm pkg --config nfpm.yaml --packager deb --target bundle/setmeld-pod_${VERSION}_amd64.deb

# Build for arm64
echo "Building arm64 package..."
if check_node_arch "arm64"; then
    echo "Using existing Node.js runtime for arm64"
else
    echo "Downloading Node.js for arm64..."
    TARGETARCH=arm64 bash scripts/fetch-node.sh
fi

# Update version in nfpm config
sed -i.bak "s/version: \"[^\"]*\"/version: \"${VERSION}\"/" nfpm.yaml
rm -f nfpm.yaml.bak

ARCH=arm64 nfpm pkg --config nfpm.yaml --packager deb --target bundle/setmeld-pod_${VERSION}_arm64.deb

echo "Build complete! Packages created in bundle/:"
ls -la bundle/setmeld-pod_${VERSION}_*.deb
