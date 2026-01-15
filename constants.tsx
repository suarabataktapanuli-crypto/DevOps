
import React from 'react';

export const SCRIPTS = {
  deployment: `#!/bin/bash
# Deployment with Auto-Rollback
set -e
VERSION=$(date +%Y%m%d%H%M)
BACKUP_DIR="/var/backups/app_v_current"

echo "[$(date)] Starting deployment of v\${VERSION}..."
echo "[$(date)] Creating atomic backup of current state..."
cp -rp /var/www/html $BACKUP_DIR

if ./health_check.sh; then
    echo "[$(date)] Health check passed. Moving files..."
    cp -rp /tmp/new_release/* /var/www/html/
    
    if ./verify_deployment.sh; then
        echo "[$(date)] Deployment successful!"
    else
        echo "[$(date)] ERROR: Verification failed. Rolling back..."
        cp -rp $BACKUP_DIR/* /var/www/html/
        exit 1
    fi
else
    echo "[$(date)] ERROR: System unhealthy. Aborting."
    exit 1
fi`,
  logRotation: `#!/bin/bash
# Log Rotation Policy: Retention=5, Compress=True
LOG_DIR="/var/log/myapp"
MAX_BACKUPS=5

echo "Rotating logs in $LOG_DIR..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Compress current log
mv "$LOG_DIR/access.log" "$LOG_DIR/access.log.$TIMESTAMP"
gzip "$LOG_DIR/access.log.$TIMESTAMP"

# Retention cleanup
ls -dt "$LOG_DIR"/access.log.*.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm
echo "Rotation complete. Retained last $MAX_BACKUPS logs."`,
  cleanup: `#!/bin/bash
# Safe Cleanup Script
set -euo pipefail
WHITELIST=("/tmp/app_cache" "/var/tmp/exports")
DRY_RUN=\${1:-true}

echo "Starting cleanup (Dry Run: $DRY_RUN)..."
for dir in "\${WHITELIST[@]}"; do
    if [ "$DRY_RUN" = "true" ]; then
        echo "[DRY-RUN] Would remove files in $dir older than 7 days"
    else
        find "$dir" -type f -mtime +7 -delete
        echo "Cleaned $dir"
    fi
done`,
  backup: `#!/bin/bash
# DB Backup with Integrity Check
DB_NAME="production_db"
DEST="/mnt/storage/backups"
FILE="$DEST/backup_$(date +%F).sql.gz"

echo "Streaming backup to $FILE..."
mysqldump $DB_NAME | gzip > "$FILE"

echo "Verifying checksum..."
sha256sum "$FILE" > "$FILE.sha256"

if [ $? -eq 0 ]; then
    echo "Backup verified and stored safely."
    curl -X POST -H 'Content-type: application/json' --data '{"text":"Backup Successful"}' $SLACK_WEBHOOK
else
    echo "CRITICAL: Backup corruption detected!"
    exit 1
fi`
};

export const INITIAL_HEALTH = {
  cpu: 12,
  memory: 45,
  uptime: "4d 12h 31m",
  connections: 124
};
