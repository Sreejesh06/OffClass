#!/bin/bash
set -e

# Requirements: 'age' must be installed on the host machine.
# Generate a key once: age-keygen -o key.txt
RECIPIENT_PUBKEY="age1placeholderkey000000000000000000000000000000000000000"
BACKUP_DIR="/var/backups/cryptid"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="cryptid_backup_${TIMESTAMP}.sql.age"

echo "Dumping and encrypting database..."
# Pipe pg_dump directly into age encryption so plaintext never touches disk
docker exec cryptid-db-1 pg_dump -U postgres cryptid | age -r $RECIPIENT_PUBKEY > "$BACKUP_DIR/$FILENAME"

echo "Backup complete and encrypted: $BACKUP_DIR/$FILENAME"

# Cleanup backups older than 30 days
find "$BACKUP_DIR" -type f -name "*.sql.age" -mtime +30 -exec rm {} \;
