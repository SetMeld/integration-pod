#!/bin/sh
# Clean up the user if the package is being purged
if [ "$1" = "purge" ]; then
  echo "Purging setmeld user and SSH configuration..."
  userdel setmeld || echo "User setmeld could not be removed."
  
  # Remove SSH configuration and data
  rm -rf /etc/setmeld-pod/sshd || echo "SSH config could not be removed."
  rm -rf /var/lib/setmeld/data/.internal || echo "SSH data could not be removed."
  
  echo "Cleanup complete."
fi