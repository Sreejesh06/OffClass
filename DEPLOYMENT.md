# Cryptid — Production Deployment Runbook

This document is the step-by-step production operations manual for deploying **Cryptid** on the college server node or virtual machine.

---

## 1. System Architecture

The entire stack is containerized with Docker and isolated across internal and proxy networks:

```text
               Campus LAN / Internet (Students & Faculty)
                                  │
                           Ports 80 & 443
                                  ▼
                   ┌─────────────────────────────┐
                   │            Caddy            │  ◄── Automatic HTTPS / Reverse Proxy
                   │    (Serves Built Vite SPA)  │
                   └──────────────┬──────────────┘
               /api/*             │           Static UI
               Proxy              │           (SPA routing)
                                  ▼
                   ┌─────────────────────────────┐
                   │         API Backend         │  ◄── Node.js Express + BullMQ Worker
                   │    (server/dist/index.js)   │
                   └──────────────┬──────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
  │  PgBouncer   │         │   Redis 7    │         │  MinIO (S3)  │
  │  (Pooler)    │         │ (Queues &    │         │ (Student     │
  │      │       │         │  Caching)    │         │  Uploads)    │
  │      ▼       │         └──────────────┘         └──────────────┘
  │ PostgreSQL 16│
  │ (Database)   │
  └──────────────┘
```

---

## 2. Server Node Prerequisites

Before beginning, ensure the server node meets these minimum requirements:
- **OS**: Ubuntu 22.04 LTS or 24.04 LTS (recommended)
- **CPU**: 4 vCPUs or higher
- **RAM**: 8 GB minimum (16 GB recommended)
- **Disk**: 50 GB+ SSD space
- **Software**: Docker Engine + Docker Compose v2 (`sudo apt install -y docker.io docker-compose-plugin`)

---

## 3. Deployment Steps

### Step 1: Connect to Server Node
Connect to your assigned node via SSH:
```bash
ssh <username>@<server-node-ip>
```

### Step 2: Clone the Production Branch
Clone the dedicated production branch into `/opt/cryptid` or your home directory:
```bash
git clone -b production https://github.com/Sreejesh06/Cryptid.git
cd Cryptid
```

### Step 3: Generate Production Secrets & Configure `.env`
Create your `.env` from the template:
```bash
cp .env.example .env
```

Generate secure random secrets:
```bash
# Generate 64-char JWT secret
openssl rand -hex 32

# Generate secure database passwords
openssl rand -base64 18
```

Open `.env` in an editor (`nano .env`) and fill in:
1. `JWT_SECRET`: The generated 64-character secret.
2. `POSTGRES_PASSWORD` and `APP_DB_PASSWORD`: Strong unique database passwords.
3. `REDIS_PASSWORD`: Strong Redis authentication password.
4. `MINIO_SECRET_KEY`: Strong MinIO root password.
5. `DOMAIN`: Your department domain (e.g. `cryptid.sece.ac.in`) or the server IP with port (e.g. `172.16.5.40:80`).
6. `FRONTEND_URL` & `CLIENT_URL`: `https://cryptid.sece.ac.in`.
7. `BLOCKCHAIN_PRIVATE_KEY` & `CRYPTID_REGISTRY_ADDRESS`: *(Optional)* If testnet anchoring is enabled.

### Step 4: Run Pre-Flight Diagnostic Check
Run our automated checker to verify all prerequisites before launching:
```bash
bash scripts/deploy-check.sh
```
Ensure all 6 checks pass.

### Step 5: Launch Containers
Build and boot the services in detached mode:
```bash
docker compose up -d --build
```

### Step 6: Initialize Database Schema & Seed Data
Once the containers are running, run database migrations and initial seed data:
```bash
# Run Prisma migrations to create all tables
docker compose exec api npx prisma migrate deploy

# Seed initial department houses, rubrics, and admin account
docker compose exec api npx prisma db seed
```

### Step 7: Verify Health
Test that the health endpoint returns `200 OK`:
```bash
curl -I http://localhost/api/health
```

---

## 4. Operational Maintenance

### Viewing Logs
```bash
# View all services in real time
docker compose logs -f

# View only the API server logs
docker compose logs -f api

# View Caddy web server & SSL logs
docker compose logs -f caddy
```

### Restarting Services
```bash
# Restart entire platform
docker compose restart

# Restart only the backend API
docker compose restart api
```

### Applying Future Updates
When new updates are pushed to the `production` branch on GitHub:
```bash
git pull origin production
docker compose build api caddy
docker compose up -d
docker compose exec api npx prisma migrate deploy
```

---

## 5. Automated Database Backups & Disaster Recovery

### Automated Nightly Backups
A backup script is provided at `scripts/backup.sh`. To configure automated nightly backups:

```bash
crontab -e
```
Add the following line to run every night at 2:00 AM:
```cron
0 2 * * * cd /opt/cryptid && bash scripts/backup.sh >> /var/log/cryptid-backup.log 2>&1
```

### Database Restoration & Verification
In the event of a disaster, data corruption, or testing recovery procedures:

1. Locate the desired encrypted snapshot from `/var/backups/cryptid/`:
   ```bash
   ls -la /var/backups/cryptid/
   ```
2. Execute the restore script with the backup file and secret key:
   ```bash
   bash scripts/restore.sh /var/backups/cryptid/cryptid_backup_YYYYMMDD_HHMMSS.sql.age --key /root/.cryptid-backup-key.txt
   ```
   *(Pass `--force` if running non-interactively in an automated DR test).*
3. Verify data restoration:
   ```bash
   docker compose exec api npx prisma db execute --stdin <<< "SELECT count(*) FROM \"User\";"
   ```

---

## 6. Troubleshooting Common Issues

| Issue | Likely Cause | Fix |
| :--- | :--- | :--- |
| **Port 80/443 in use** | Apache or host Nginx already running on server node. | Stop Apache (`sudo systemctl stop apache2`) or adjust Caddy port mappings in `docker-compose.yml`. |
| **Database connection refused** | PgBouncer or Postgres still initializing. | Wait 15 seconds; PgBouncer waits for Postgres health check before accepting traffic. |
| **SSL Certificate warning** | Caddy cannot reach Let's Encrypt due to firewall. | Ensure the college firewall permits outbound HTTPS on port 443, or use internal IP for intranet mode. |
| **Out of memory error** | Server node has < 4GB RAM allocated. | Request the server admin increase VM RAM to 8GB. |
