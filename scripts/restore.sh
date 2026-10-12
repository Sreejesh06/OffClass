#!/bin/bash
set -e

# ==============================================================================
# Cryptid Database Restoration Script
# Usage:
#   bash scripts/restore.sh /path/to/backup.sql.age [--key /path/to/key.txt] [--force]
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Load .env if present
if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  source "$ROOT_DIR/.env"
  set +a
fi

BACKUP_FILE="$1"
KEY_FILE="${BACKUP_AGE_KEY_FILE:-/root/.cryptid-backup-key.txt}"
FORCE=false

# Fallback identity paths
if [ ! -f "$KEY_FILE" ] && [ -f "$HOME/.cryptid-backup-key.txt" ]; then
  KEY_FILE="$HOME/.cryptid-backup-key.txt"
fi

# Parse optional arguments
shift || true
while [[ $# -gt 0 ]]; do
  case $1 in
    --key)
      KEY_FILE="$2"
      shift 2
      ;;
    --force|-f|--yes|-y)
      FORCE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ ERROR: Valid backup file path required."
  echo "Usage: $0 /var/backups/cryptid/cryptid_backup_YYYYMMDD_HHMMSS.sql.age [--key /path/to/key.txt] [--force]"
  exit 1
fi

if ! command -v age >/dev/null 2>&1; then
  echo "❌ ERROR: 'age' tool is not installed on this host."
  echo "Install it via: sudo apt install -y age (or brew install age)"
  exit 1
fi

if [ ! -f "$KEY_FILE" ]; then
  echo "❌ ERROR: Secret key file '$KEY_FILE' not found."
  echo "Specify the path with --key /path/to/key.txt or set BACKUP_AGE_KEY_FILE in .env"
  exit 1
fi

# Resolve DB container
DB_CONTAINER=$(cd "$ROOT_DIR" && docker compose ps -q db 2>/dev/null || echo "cryptid-db-1")

if [ -z "$DB_CONTAINER" ]; then
  echo "❌ ERROR: Database container is not running. Please run 'docker compose up -d db' first."
  exit 1
fi

echo "=========================================================="
echo " Cryptid Disaster Recovery — Database Restore"
echo "=========================================================="
echo "Backup File : $BACKUP_FILE"
echo "Key File    : $KEY_FILE"
echo "Target DB   : $DB_CONTAINER (database: cryptid)"
echo "=========================================================="

if [ "$FORCE" = false ]; then
  read -p "⚠️  WARNING: Restoring will overwrite existing database data. Continue? (y/N): " -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled by user."
    exit 0
  fi
fi

echo "Decrypting and restoring database..."
# Stream decrypted SQL directly into psql in the container
age -d -i "$KEY_FILE" "$BACKUP_FILE" | docker exec -i "$DB_CONTAINER" psql -U postgres -d cryptid

echo "✅ Database restore completed successfully!"
