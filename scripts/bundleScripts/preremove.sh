#!/usr/bin/env bash
echo "Stopping and disabling my_service.target..."
systemctl disable setmeld-pod.target || true
systemctl stop setmeld-pod.target || true
