#!/usr/bin/env bash
set -euo pipefail

# Build script for setmeld-pod packages with bundled Node.js
# Usage: ./scripts/build-packages.sh [version]

VERSION="${1:-0.1.0}"
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
sed -i.bak "s/version: \"0.1.0\"/version: \"${VERSION}\"/" nfpm-amd64.yaml
rm -f nfpm-amd64.yaml.bak

nfpm pkg --config nfpm-amd64.yaml --packager deb --target bundle/setmeld-pod_${VERSION}_amd64.deb

# Build for arm64
echo "Building arm64 package..."
if check_node_arch "arm64"; then
    echo "Using existing Node.js runtime for arm64"
else
    echo "Downloading Node.js for arm64..."
    TARGETARCH=arm64 bash scripts/fetch-node.sh
fi

# Update version in nfpm config
sed -i.bak "s/version: \"0.1.0\"/version: \"${VERSION}\"/" nfpm-arm64.yaml
rm -f nfpm-arm64.yaml.bak

nfpm pkg --config nfpm-arm64.yaml --packager deb --target bundle/setmeld-pod_${VERSION}_arm64.deb

echo "Build complete! Packages created in bundle/:"
ls -la bundle/setmeld-pod_${VERSION}_*.deb
