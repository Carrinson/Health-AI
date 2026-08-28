#!/bin/bash
# Daily Postgres backup, keeping the last 7 days and deleting anything older.
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/backups
FILE="$BACKUP_DIR/healthai_$TIMESTAMP.sql.gz"

docker exec postgres pg_dump -U healthai healthai | gzip > "$FILE"

# Delete backups older than 7 days
find "$BACKUP_DIR" -name "healthai_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $FILE"
