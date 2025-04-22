#!/bin/bash
set -e

touch ./git-server/authorized_keys
sudo chown $(whoami) ./git-server/authorized_keys
chmod 666 ./git-server/authorized_keys

echo "authorized_keys is ready!"
