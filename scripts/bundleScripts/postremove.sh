#!/bin/sh
# Clean up the user if the package is being purged
if [ "$1" = "purge" ]; then
  echo "Purging user setmeld user..."
  userdel setmeld || echo "User setmeld could not be removed."
fi