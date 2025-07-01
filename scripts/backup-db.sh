#!/bin/bash

# LocalBrand Pro Database Backup Script

# Configuration
BACKUP_DIR="/Users/agurley/local-business-pro-main/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/localbrand_backup_$TIMESTAMP.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
echo "Creating database backup..."
mongodump --uri="" --gzip --archive="$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup created successfully: $BACKUP_FILE"
  
  # Clean up old backups (keep last 10)
  echo "Cleaning up old backups..."
  ls -tp "$BACKUP_DIR" | grep -v '/$' | tail -n +11 | xargs -I {} rm -- "$BACKUP_DIR/{}"
  
  echo "Backup process completed."
else
  echo "Backup failed."
  exit 1
fi
