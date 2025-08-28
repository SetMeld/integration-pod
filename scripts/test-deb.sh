#!/usr/bin/env bash
set -euo pipefail

echo "🧪 Testing SetMeld Pod .deb package in Docker"

# Find the .deb file
DEB_FILE=$(find . -name "setmeld-pod_*arm64.deb" | head -1)

if [[ ! -f "$DEB_FILE" ]]; then
    echo "❌ No .deb file found. Run 'npm run bundle' first."
    exit 1
fi

echo "📦 Found package: $DEB_FILE"

# Clean up any existing test containers
echo "🧹 Cleaning up any existing test containers..."
docker rm -f setmeld-pod-test-container 2>/dev/null || true
docker rmi setmeld-pod-test 2>/dev/null || true

# Create a Dockerfile for testing
cat > Dockerfile.test << 'EOF'
FROM ubuntu:22.04

# Minimal runtime deps for your app (edit as needed)
RUN apt-get update && apt-get install -y ca-certificates curl openssh-server \
    && rm -rf /var/lib/apt/lists/*

# Copy .deb
COPY setmeld-pod_*.deb /tmp/

# Install with dependency resolution
RUN apt-get update && apt-get install -y /tmp/setmeld-pod_*.deb \
    && rm -rf /var/lib/apt/lists/*

# Expose whatever your app needs
EXPOSE 3000 2222

# If your deb installs a binary like /usr/bin/setmeld-pod, run it in the foreground.
# Replace this with the actual foreground command your service provides:
CMD ["/usr/bin/setmeld-pod", "--no-daemon"]
EOF

# Build
docker build -f Dockerfile.test -t setmeld-pod-test .

# Run detached so we can follow logs and clean up on Ctrl+C
docker run -d --name setmeld-pod-test-container -p 3000:3000 -p 2222:2222 setmeld-pod-test

# Cleanup on Ctrl+C
trap 'echo; echo "🧹 Cleaning up..."; \
      docker rm -f setmeld-pod-test-container >/dev/null 2>&1 || true; \
      docker rmi setmeld-pod-test >/dev/null 2>&1 || true; \
      rm -f Dockerfile.test; \
      echo "✅ Test completed!"; exit 0' INT

# Follow logs
docker logs -f setmeld-pod-test-container


