#!/usr/bin/env bash
set -e
systemctl disable setmeld-pod.target || true
systemctl stop setmeld-pod.target || true
