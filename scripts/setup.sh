#!/bin/bash
set -e

mkdir ./data
touch ./data/authorized_keys
sudo chown $(whoami) ./data/authorized_keys
chmod 666 ./data/authorized_keys

echo "authorized_keys is ready!"
