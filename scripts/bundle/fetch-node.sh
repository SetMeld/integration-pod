#!/usr/bin/env bash
set -euo pipefail

# Pin your Node version here
NODE_VERSION="${NODE_VERSION:-20.16.0}"

# Map the build arch to Node's naming
ARCH_IN="${TARGETARCH:-$(dpkg --print-architecture 2>/dev/null || echo amd64)}"
case "$ARCH_IN" in
  amd64|x86_64) NODE_ARCH=x64 ;;
  arm64|aarch64) NODE_ARCH=arm64 ;;
  *) echo "Unsupported arch: $ARCH_IN"; exit 1 ;;
esac

BASE="node-v${NODE_VERSION}-linux-${NODE_ARCH}"
URL="https://nodejs.org/dist/v${NODE_VERSION}/${BASE}.tar.xz"
SUMS_URL="https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt"

mkdir -p vendor
echo "Downloading ${URL}..."
curl -fsSL "$URL" -o "vendor/${BASE}.tar.xz"

echo "Verifying checksum..."
cd vendor
curl -fsSL "$SUMS_URL" | grep "${BASE}.tar.xz" | sha256sum -c -
cd ..

echo "Unpacking..."
tar -xJf "vendor/${BASE}.tar.xz" -C vendor
rm -f "vendor/${BASE}.tar.xz"

# Create architecture-specific runtime folder
RUNTIME_DIR="vendor/node-runtime-${ARCH_IN}"
rm -rf "$RUNTIME_DIR"
mv "vendor/${BASE}" "$RUNTIME_DIR"

# Optional: prune things you don't need at runtime to shrink package
rm -rf "$RUNTIME_DIR/include" \
       "$RUNTIME_DIR/share" \
       "$RUNTIME_DIR/lib/node_modules/npm"

echo "Ready at $RUNTIME_DIR"
