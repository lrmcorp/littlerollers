#!/usr/bin/env bash
# ==============================================================================
# DAILY DOSE PILATES - ONE-CLICK PRODUCTION UPDATE SCRIPT
# Branch Target: perbaikan_arsitektur
# ==============================================================================
set -Eeuo pipefail

TARGET_BRANCH="perbaikan_arsitektur"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         DAILY DOSE PILATES V2 - AUTOMATED PRODUCTION UPDATE SCRIPT           ║${NC}"
echo -e "${CYAN}║         Target Branch: ${YELLOW}${TARGET_BRANCH}${CYAN}                                              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}\n"

# ------------------------------------------------------------------------------
# STEP 1: PRE-FLIGHT DISK CHECK & AGGRESSIVE CLEANUP
# ------------------------------------------------------------------------------
echo -e "${BLUE}▶ [1/6] Memeriksa & Membersihkan Kapasitas Disk Server...${NC}"
echo -e "   Status Disk Sebelum Pembersihan:"
df -h / | awk 'NR==1 || NR==2 {print "   " $0}'

echo -e "\n   Membersihkan build cache Docker lama untuk mencegah 'no space left on device'..."
docker builder prune -af 2>/dev/null || true
docker image prune -f 2>/dev/null || true
docker container prune -f 2>/dev/null || true

# Bersihkan system log jika dijalankan di Linux VPS
if command -v journalctl >/dev/null 2>&1; then
  journalctl --vacuum-time=2d 2>/dev/null || true
fi
if command -v apt-get >/dev/null 2>&1; then
  apt-get clean 2>/dev/null || true
fi

# Periksa ketersediaan Swap Memory di VPS (sangat krusial untuk KVM VPS multi-container)
if [ -f /proc/swaps ] && command -v free >/dev/null 2>&1; then
  TOTAL_SWAP="$(free -m 2>/dev/null | awk '/Swap:/ {print $2}' || echo '0')"
  if [ "${TOTAL_SWAP:-0}" -lt 1024 ]; then
    echo -e "   ${YELLOW}! PERHATIAN RESOURCE: Swap memory VPS terdeteksi kurang dari 1 GB (${TOTAL_SWAP:-0} MB).${NC}"
    echo -e "   ${YELLOW}  Rekomendasi: Tambahkan swapfile minimal 2–4 GB di VPS untuk mencegah RAM shock saat build.${NC}"
  else
    echo -e "   ${GREEN}✓ Swap memory aktif: ${TOTAL_SWAP} MB.${NC}"
  fi
fi

echo -e "\n   Status Disk Setelah Pembersihan:"
df -h / | awk 'NR==1 || NR==2 {print "   " $0}'
echo -e "   ${GREEN}✓ Pembersihan cache selesai.${NC}\n"

# ------------------------------------------------------------------------------
# STEP 2: GIT SYNC KE BRANCH TARGET (perbaikan_arsitektur)
# ------------------------------------------------------------------------------
echo -e "${BLUE}▶ [2/6] Memperbarui Source Code via Git (Branch: ${TARGET_BRANCH})...${NC}"

# Simpan perubahan lokal jika ada yang tidak sengaja teredit di server
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
  echo -e "   ${YELLOW}! Menyimpan perubahan lokal sementara ke git stash...${NC}"
  git stash push -m "Auto-stash by update.sh at $(date +'%Y-%m-%d %H:%M:%S')" || true
fi

echo -e "   Fetching remote repository..."
git fetch origin "$TARGET_BRANCH"

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')"
if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
  echo -e "   Pindah dari branch '${CURRENT_BRANCH}' ke '${TARGET_BRANCH}'..."
  git checkout "$TARGET_BRANCH"
fi

echo -e "   Melakukan git pull terbaru..."
git pull origin "$TARGET_BRANCH"

COMMIT_HASH="$(git rev-parse --short HEAD)"
COMMIT_MSG="$(git log -1 --pretty=%B | head -n 1)"
echo -e "   ${GREEN}✓ Berhasil sinkronisasi git pada commit [${COMMIT_HASH}]: ${COMMIT_MSG}${NC}\n"

# ------------------------------------------------------------------------------
# STEP 3: ENVIRONMENT CONFIGURATION CHECK
# ------------------------------------------------------------------------------
echo -e "${BLUE}▶ [3/6] Memeriksa Konfigurasi Environment (.env)...${NC}"
if [ -f ".env.production" ]; then
  echo -e "   ${GREEN}✓ File .env.production ditemukan.${NC}"
elif [ -f ".env" ]; then
  echo -e "   ${YELLOW}! File .env.production tidak ditemukan, menggunakan .env default.${NC}"
  export APP_ENV_FILE=".env"
else
  echo -e "   ${RED}✗ File .env.production atau .env tidak ditemukan!${NC}"
  echo -e "   Silakan buat file .env.production terlebih dahulu sebelum menjalankan update."
  exit 1
fi

# ------------------------------------------------------------------------------
# STEP 4: DOCKER COMPOSE BUILD
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}▶ [4/6] Membangun Image Docker (Docker Build)...${NC}"
echo -e "   Menjalankan: docker compose build app"

docker compose build app

# Bersihkan layer builder cache yang tersisa setelah build selesai
docker builder prune -f 2>/dev/null || true
echo -e "   ${GREEN}✓ Build image Docker berhasil diselesaikan.${NC}\n"

# ------------------------------------------------------------------------------
# STEP 5: DEPLOY CONTAINER (DOCKER COMPOSE UP)
# ------------------------------------------------------------------------------
echo -e "${BLUE}▶ [5/6] Menjalankan Container Baru...${NC}"
echo -e "   Menjalankan: docker compose up -d --remove-orphans"
docker compose up -d --remove-orphans
echo -e "   ${GREEN}✓ Container berhasil diluncurkan di background.${NC}\n"

# ------------------------------------------------------------------------------
# STEP 6: READINESS PROBE & HEALTHCHECK VERIFICATION
# ------------------------------------------------------------------------------
echo -e "${BLUE}▶ [6/6] Memverifikasi Kesiapan Layanan (Health Check)...${NC}"
echo -e "   Menunggu aplikasi dan database siap menerima trafik..."

MAX_RETRIES=30
RETRY_COUNT=0
HEALTHY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  
  # Cek status container via docker compose ps
  STATUS_APP="$(docker compose ps --format json app 2>/dev/null | grep -o '"Health":"[^"]*"' | cut -d'"' -f4 || echo '')"
  STATUS_STATE="$(docker compose ps --format json app 2>/dev/null | grep -o '"State":"[^"]*"' | cut -d'"' -f4 || echo '')"

  if [ "$STATUS_APP" = "healthy" ]; then
    HEALTHY=true
    break
  fi

  echo -e "   ... Menunggu container sehat (Percobaan ${RETRY_COUNT}/${MAX_RETRIES}) - Status: ${STATUS_STATE:-starting} [${STATUS_APP:-starting}]"
  sleep 4
done

if [ "$HEALTHY" = true ]; then
  echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║               🎉 UPDATE BERHASIL DAN APLIKASI TELAH AKTIF!                    ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}\n"
  
  docker compose ps
  
  echo -e "\n${CYAN}Informasi Layanan:${NC}"
  echo -e " - Web Portal : ${YELLOW}http://<IP_SERVER>:32120/${NC} (atau domain production Anda)"
  echo -e " - API Base   : ${YELLOW}http://<IP_SERVER>:32121/api/v1/${NC}"
  echo -e " - Git Commit : ${YELLOW}${COMMIT_HASH} (${COMMIT_MSG})${NC}"
  echo -e "\nAplikasi Daily Dose Pilates sudah langsung dapat digunakan sekarang!\n"
else
  echo -e "\n${YELLOW}! Aplikasi masih dalam proses inisialisasi awal. Memeriksa log terakhir:${NC}"
  docker compose logs --tail=25 app
  echo -e "\n${YELLOW}Silakan pantau status dengan perintah: docker compose ps && docker compose logs -f app${NC}\n"
fi
