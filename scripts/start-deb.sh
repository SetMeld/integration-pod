#!/usr/bin/env bash
set -euo pipefail

echo "🧪 Testing SetMeld Pod .deb package in Docker"

# Find the .deb file in bundle directory
DEB_FILE=$(find ./bundle -name "setmeld-pod_*arm64.deb" | head -1)

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
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive \
    container=docker

# Minimal systemd
RUN apt-get update && apt-get install -y --no-install-recommends systemd systemd-sysv dbus && \
    rm -rf /var/lib/apt/lists/*

# Install your package
COPY bundle/setmeld-pod_*_arm64.deb /tmp/pkg.deb
RUN apt-get update && apt-get install -y /tmp/pkg.deb && \
    rm -rf /var/lib/apt/lists/* /tmp/pkg.deb

# Ensure journald can persist and forward to console (so `docker logs` works)
RUN mkdir -p /var/log/journal && \
    sed -i 's/^#\?Storage=.*/Storage=persistent/' /etc/systemd/journald.conf && \
    sed -i 's/^#\?ForwardToConsole=.*/ForwardToConsole=yes/' /etc/systemd/journald.conf

# (Important) Make sure your service is ENABLED at boot
# If your .deb doesn't enable it, create the wants/ symlink manually at build time.
# Adjust the unit name if different.
RUN ln -sf /lib/systemd/system/setmeld-pod.service \
           /etc/systemd/system/multi-user.target.wants/setmeld-pod.service

EXPOSE 3000 2222
STOPSIGNAL SIGRTMIN+3
ENTRYPOINT ["/sbin/init"]
EOF

echo "Building Docker..."
# Build
docker build -f Dockerfile.test -t setmeld-pod-test .

echo "Running Docker..."
# Run detached so we can follow logs and clean up on Ctrl+C
docker run -d --name setmeld-pod-test-container \
  --privileged \
  --cgroupns=host \
  -v /sys/fs/cgroup:/sys/fs/cgroup:rw \
  -p 3000:3000 -p 2222:2222 \
  setmeld-pod-test

# Wait a moment for systemd to fully boot up
echo "⏳ Waiting for systemd to boot up..."
sleep 5

# Start the setmeld-pod target
echo "🚀 Starting setmeld-pod.target..."
docker exec setmeld-pod-test-container systemctl start setmeld-pod.target

# Cleanup on Ctrl+C
trap 'echo; echo "🧹 Cleaning up..."; \
      docker rm -f setmeld-pod-test-container >/dev/null 2>&1 || true; \
      docker rmi setmeld-pod-test >/dev/null 2>&1 || true; \
      rm -f Dockerfile.test; \
      echo "✅ Test completed!"; exit 0' INT

# Follow logs
docker logs -f setmeld-pod-test-container


