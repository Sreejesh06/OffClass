#!/bin/bash
set -e

# Requirements: 'age' must be installed on the host machine (apt install age / brew install age).
# Generate key once on host:
#   age-keygen -o /root/.cryptid-backup-key.txt
#   grep 'public key:' /root/.cryptid-backup-key.txt -> set as BACKUP_AGE_PUBKEY in .env

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Load .env if present
if [ -f "$ROOT_DIR/.env" ]; then
  # export non-comment vars safely
  set -a
  source "$ROOT_DIR/.env"
  set +a
fi

RECIPIENT_PUBKEY="${BACKUP_AGE_PUBKEY:-age1placeholderkey000000000000000000000000000000000000000}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/cryptid}"

if [[ "$RECIPIENT_PUBKEY" == age1placeholder* ]] || [ -z "$RECIPIENT_PUBKEY" ]; then
  echo "❌ ERROR: BACKUP_AGE_PUBKEY is not set or still has the placeholder key."
  echo "Please generate an age keypair and add BACKUP_AGE_PUBKEY to your .env file:"
  echo "  age-keygen -o /root/.cryptid-backup-key.txt"
  echo "  grep 'public key:' /root/.cryptid-backup-key.txt"
  exit 1
fi

if ! command -v age >/dev/null 2>&1; then
  echo "❌ ERROR: 'age' encryption tool is not installed on this host."
  echo "Install it via: sudo apt install -y age"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="cryptid_backup_${TIMESTAMP}.sql.age"

# Resolve container name (fallback to cryptid-db-1)
DB_CONTAINER=$(cd "$ROOT_DIR" && docker compose ps -q db 2>/dev/null || echo "cryptid-db-1")

echo "Dumping and encrypting database from container $DB_CONTAINER..."
# Pipe pg_dump directly into age encryption so plaintext never touches disk
docker exec "$DB_CONTAINER" pg_dump -U postgres cryptid | age -r "$RECIPIENT_PUBKEY" > "$BACKUP_DIR/$FILENAME"

echo "✅ Backup complete and encrypted: $BACKUP_DIR/$FILENAME"

# Cleanup backups older than 30 days
find "$BACKUP_DIR" -type f -name "*.sql.age" -mtime +30 -exec rm {} \;
