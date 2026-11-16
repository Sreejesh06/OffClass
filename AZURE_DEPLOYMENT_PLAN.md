# Azure Production Deployment Plan for Cryptid

## 1. Executive Summary

This plan provisions **Cryptid** on Microsoft Azure within a **$15 – $25/month** budget (or **$0/month** against the Azure for Students $100 credit pool).

Instead of dispersing the stack across expensive independent managed PaaS services (which incur high baseline charges for managed Redis, managed Postgres, and App Services), Cryptid runs inside its pre-configured, battle-tested Docker Compose architecture on a burstable Azure B-series Linux virtual machine with off-site encrypted backups to Azure Blob Storage.

---

## 2. Resource Specifications & Line-Item Budget

| Azure Resource | SKU / Specifications | Region (e.g. Central India or East US) | Estimated Monthly Cost |
| :--- | :--- | :--- | :--- |
| **Virtual Machine** | `Standard_B2s` (2 vCPU, 4 GiB RAM, Burstable) or `Standard_B2ats_v2` (AMD 2 vCPU, 4 GiB RAM) | East US / Central India | ~$20.00 – $26.00 / mo *(On-Demand)*<br>*(~$14.00/mo if 1-Yr Reserved)* |
| **OS Disk** | 32 GiB Standard SSD (`E4`) or 64 GiB Standard SSD (`E6`) | Same as VM | ~$1.54 – $3.00 / mo |
| **Public IP** | Standard SKU Public IP (Static or Dynamic) | Same as VM | ~$3.60 / mo |
| **Azure Blob Storage** | General Purpose v2 (Cool tier, LRS) for encrypted database backups | Same as VM | ~$0.10 / mo (for ~10 GB backups) |
| **Outbound Data Transfer** | First 100 GB/month egress from Azure is **Free** | Global | $0.00 |
| **SSL / TLS Certificate** | Automatic Let's Encrypt managed by Caddy | Caddy inside VM | $0.00 |
| **Total Estimated Run Cost** | | | **~$25.00 – $32.00 / mo** (Pay-as-you-go)<br>**~$18.00 – $22.00 / mo** (1-Yr Savings/Reserved) |

> [!TIP]
> **If Using Azure for Students:**
> Microsoft provides $100 in credits valid for 12 months, plus eligible free services. This architecture can run completely on those credits for 3–5 months, or nearly indefinitely if scheduled to stop during college holidays or overnight off-peak hours (e.g., 2 AM – 6 AM).

---

## 3. Azure Infrastructure Setup (Step-by-Step)

### Option A: Automated Provisioning via Azure CLI

Run these commands in your local terminal or Azure Cloud Shell:

```bash
# 1. Variables
RESOURCE_GROUP="rg-cryptid-prod"
LOCATION="eastus" # or "centralindia"
VM_NAME="vm-cryptid-prod"
VM_SIZE="Standard_B2s"
ADMIN_USER="azureuser"
STORAGE_ACCOUNT="cryptidbackups$RANDOM"

# 2. Create Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION

# 3. Create Network Security Group (NSG) and Rules
az network nsg create --resource-group $RESOURCE_GROUP --name nsg-cryptid

# Allow SSH (Port 22) - Restrict to your college IP if possible
az network nsg rule create --resource-group $RESOURCE_GROUP --name nsg-cryptid \
  --name Allow-SSH --priority 1000 --direction Inbound --access Allow \
  --protocol Tcp --destination-port-ranges 22

# Allow HTTP (Port 80 for Let's Encrypt ACME challenges)
az network nsg rule create --resource-group $RESOURCE_GROUP --name nsg-cryptid \
  --name Allow-HTTP --priority 1010 --direction Inbound --access Allow \
  --protocol Tcp --destination-port-ranges 80

# Allow HTTPS (Port 443 for Secure Web Traffic)
az network nsg rule create --resource-group $RESOURCE_GROUP --name nsg-cryptid \
  --name Allow-HTTPS --priority 1020 --direction Inbound --access Allow \
  --protocol Tcp --destination-port-ranges 443

# 4. Create Public IP & Virtual Network
az network public-ip create --resource-group $RESOURCE_GROUP --name pip-cryptid --sku Standard --allocation-method Static
az network vnet create --resource-group $RESOURCE_GROUP --name vnet-cryptid --address-prefix 10.0.0.0/16 --subnet-name snet-cryptid --subnet-prefix 10.0.1.0/24
az network nic create --resource-group $RESOURCE_GROUP --name nic-cryptid --vnet-name vnet-cryptid --subnet snet-cryptid --network-security-group nsg-cryptid --public-ip-address pip-cryptid

# 5. Create Ubuntu 24.04 LTS VM
az vm create \
  --resource-group $RESOURCE_GROUP \
  --name $VM_NAME \
  --nics nic-cryptid \
  --image Canonical:ubuntu-24_04-lts:server:latest \
  --size $VM_SIZE \
  --os-disk-size-gb 32 \
  --storage-sku Standard_LRS \
  --admin-username $ADMIN_USER \
  --generate-ssh-keys

# 6. Create Backup Storage Account (Blob Storage)
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind StorageV2 \
  --access-tier Cool

az storage container create \
  --name db-backups \
  --account-name $STORAGE_ACCOUNT
```

---

## 4. Host Preparation on the Azure VM

SSH into the newly created Azure VM:

```bash
# Obtain Public IP
PUBLIC_IP=$(az network public-ip show --resource-group $RESOURCE_GROUP --name pip-cryptid --query ipAddress -o tsv)
ssh azureuser@$PUBLIC_IP
```

Inside the VM, install Docker, Docker Compose, and utility tools:

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Docker & Docker Compose v2
sudo apt install -y ca-certificates curl gnupg lsb-release age
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 3. Add azureuser to docker group (avoids needing sudo for docker commands)
sudo usermod -aG docker $USER
newgrp docker

# 4. Configure 2GB Swap space (protects burstable VM during heavy build spikes)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 5. Deploying the Application

```bash
# 1. Clone repository into /opt/cryptid
sudo mkdir -p /opt/cryptid
sudo chown -R $USER:$USER /opt/cryptid
git clone -b production https://github.com/Sreejesh06/Cryptid.git /opt/cryptid
cd /opt/cryptid

# 2. Configure .env file
cp .env.example .env
nano .env
```

### Production `.env` Values for Azure:
- `DOMAIN`: Set to your custom college domain (e.g. `cryptid.sece.ac.in`) or Azure DNS label (`<name>.<region>.cloudapp.azure.com`).
- `FRONTEND_URL` & `CLIENT_URL`: `https://cryptid.sece.ac.in`.
- `JWT_SECRET`: Generate using `openssl rand -hex 32`.
- `POSTGRES_PASSWORD` & `APP_DB_PASSWORD`: Strong random strings.
- `REDIS_PASSWORD`: Strong random string.
- `MINIO_ACCESS_KEY` & `MINIO_SECRET_KEY`: Set strong keys.

```bash
# 3. Run pre-flight check
bash scripts/deploy-check.sh

# 4. Launch containers
docker compose up -d --build

# 5. Run Prisma migrations and seed database
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed

# 6. Verify health
curl -I http://localhost/api/health
```

---

## 6. Zero-Cost Off-Site Backups to Azure Blob Storage

Cryptid already has a backup script (`scripts/backup.sh`) that dumps and encrypts PostgreSQL with `age` encryption. We can sync these encrypted dumps directly to Azure Blob Storage:

```bash
# Install Azure CLI on the VM
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Create automated cron job: dumps DB at 03:00 AM daily and uploads to Azure Blob Storage
sudo crontab -e
```

Add this cron entry:
```cron
0 3 * * * /opt/cryptid/scripts/backup.sh && az storage blob upload-batch --account-name <your_storage_account> -d db-backups -s /var/backups/cryptid --auth-mode key >> /var/log/cryptid-backup.log 2>&1
```

---

## 7. Cost-Optimization Levers (How to Save an Extra 30–50%)

1. **Auto-Shutdown During Inactive Hours:**
   If this is strictly a campus department tool where students aren't active between 2:00 AM and 6:00 AM, configure Azure VM Auto-Shutdown (`az vm auto-shutdown` or in the Azure Portal). Turning off the VM 5 hours/day reduces compute costs by **~20%**.
2. **1-Year Azure Savings Plan / Reserved Instance:**
   Committing to 1 year of a B-series instance drops the compute price by up to **40%**, bringing the VM cost down to ~$12–$14/month.
3. **Standard SSD over Premium SSD:**
   Do not choose Premium SSD v2 or Ultra Disks. PostgreSQL with PgBouncer session pooling handles 500–1,000 active students effortlessly on a Standard SSD (`Standard_LRS` E4 disk), which costs ~$1.50/month.
4. **No Public IP for Database:**
   All databases (Postgres, Redis, MinIO) remain on the private Docker `internal` network. No Azure Bastion or public load balancers are needed, saving another ~$100+/month.
