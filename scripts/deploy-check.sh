#!/usr/bin/env bash
# ==============================================================================
# Cryptid — Pre-flight Production Deployment Checker
# ==============================================================================
# Run this on your server node before running `docker compose up -d`.
# Usage: bash scripts/deploy-check.sh
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}       Cryptid Production Pre-Flight Checklist        ${NC}"
echo -e "${BLUE}======================================================${NC}"
echo ""

ERRORS=0
WARNINGS=0

# 1. Check Docker
echo -n "[1/6] Checking Docker daemon... "
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo -e "${GREEN}OK (Docker $(docker --version | awk '{print $3}' | tr -d ','))${NC}"
else
    echo -e "${RED}FAILED! Docker is not running or current user lacks docker group privileges.${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 2. Check Docker Compose
echo -n "[2/6] Checking Docker Compose... "
if docker compose version &> /dev/null; then
    echo -e "${GREEN}OK ($(docker compose version | awk '{print $4}'))${NC}"
else
    echo -e "${RED}FAILED! Docker compose plugin not found.${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 3. Check System Memory
echo -n "[3/6] Checking RAM capacity... "
TOTAL_RAM_GB=0
if [ -f /proc/meminfo ]; then
    TOTAL_RAM_KB=$(grep MemTotal /proc/meminfo 2>/dev/null | awk '{print $2}' || echo "0")
    TOTAL_RAM_GB=$((TOTAL_RAM_KB / 1024 / 1024))
elif command -v sysctl &> /dev/null; then
    BYTES=$(sysctl -n hw.memsize 2>/dev/null || echo "0")
    TOTAL_RAM_GB=$((BYTES / 1024 / 1024 / 1024))
fi

if [ "$TOTAL_RAM_GB" -ge 4 ]; then
    echo -e "${GREEN}OK (${TOTAL_RAM_GB} GB RAM detected)${NC}"
elif [ "$TOTAL_RAM_GB" -eq 0 ]; then
    echo -e "${YELLOW}SKIPPED (Memory inspection unavailable)${NC}"
else
    echo -e "${YELLOW}WARNING: Less than 4 GB RAM (${TOTAL_RAM_GB} GB). Monitor memory usage.${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 4. Check Free Disk Space
echo -n "[4/6] Checking Available Disk Space... "
# Universal POSIX disk check (1K blocks converted to GB)
FREE_DISK_GB=$(df -k . 2>/dev/null | awk 'NR==2 {print int($4 / 1024 / 1024)}' || echo "0")
if [ "$FREE_DISK_GB" -ge 10 ]; then
    echo -e "${GREEN}OK (${FREE_DISK_GB} GB available)${NC}"
else
    echo -e "${YELLOW}WARNING: Low disk space (${FREE_DISK_GB} GB). At least 10 GB recommended for Docker images and volumes.${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 5. Check .env File
echo -n "[5/6] Checking .env configuration... "
if [ -f ".env" ]; then
    if grep -q "generate_a_very_long_random_string_here" .env 2>/dev/null; then
        echo -e "${RED}FAILED! JWT_SECRET is still set to placeholder in .env!${NC}"
        ERRORS=$((ERRORS + 1))
    elif grep -q "secure_postgres_admin_password_here" .env 2>/dev/null; then
        echo -e "${RED}FAILED! POSTGRES_PASSWORD is still set to default placeholder in .env!${NC}"
        ERRORS=$((ERRORS + 1))
    elif grep -q "secure_app_user_password_here" .env 2>/dev/null; then
        echo -e "${RED}FAILED! APP_DB_PASSWORD is still set to default placeholder in .env!${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}OK (.env exists and critical defaults replaced)${NC}"
    fi
else
    echo -e "${RED}FAILED! .env file not found. Copy .env.example to .env and fill in production secrets.${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 6. Check Port Availability (80 & 443)
echo -n "[6/6] Checking Ports 80 & 443 availability... "
PORT_CONFLICTS=0
if command -v ss &> /dev/null; then
    if ss -tuln | grep -q ":80 "; then
        echo -e "\n  ${YELLOW}Notice: Port 80 appears to be in use.${NC}"
        PORT_CONFLICTS=1
    fi
    if ss -tuln | grep -q ":443 "; then
        echo -e "\n  ${YELLOW}Notice: Port 443 appears to be in use.${NC}"
        PORT_CONFLICTS=1
    fi
fi

if [ $PORT_CONFLICTS -eq 0 ]; then
    echo -e "${GREEN}OK (Ports 80 & 443 available)${NC}"
else
    echo -e "  ${YELLOW}If ports are in use by Apache/Nginx, you may need to stop them or adjust Caddy port mappings in docker-compose.yml.${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo -e "${BLUE}======================================================${NC}"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}RESULT: Pre-flight checks PASSED with $WARNINGS warning(s). Ready for deployment!${NC}"
    echo -e "Run: ${YELLOW}docker compose up -d --build${NC}"
    exit 0
else
    echo -e "${RED}RESULT: $ERRORS critical error(s) found. Please resolve them before starting containers.${NC}"
    exit 1
fi
