#!/usr/bin/env bash
set -e
systemctl disable setmeld-pod || true
systemctl stop setmeld-pod || true
