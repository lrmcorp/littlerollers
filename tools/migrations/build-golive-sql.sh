#!/usr/bin/env bash
# Membangun SQL data go-live Daily Dose v2 dari dump database v1.
#
# Semua langkah berjalan di MySQL lokal; produksi tidak pernah disentuh. Hasil akhirnya satu berkas SQL berisi DATA saja
# (skema v2 dibuat lebih dulu di produksi dengan `prisma db push`).
#
# Pemakaian:
#   tools/migrations/build-golive-sql.sh /path/ke/dailydose.sql
#
# Variabel opsional:
#   V1_DB     database lokal tempat dump v1 diimpor (DIKOSONGKAN lalu diisi ulang)     default: dailydose_local
#   BUILD_DB  database lokal tempat hasil migrasi dibangun (DIKOSONGKAN)               default: dailydose_v2_sandbox
#   OUT       folder hasil (berisi data pribadi pelanggan; letakkan di luar repositori) default: ~/Documents/Database/golive_v2_<tanggal>
#
# Kredensial MySQL diambil dari DATABASE_URL di .env (user proyek, bukan root).
set -euo pipefail

DUMP="${1:?Pakai: build-golive-sql.sh /path/ke/dailydose.sql}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
V1_DB="${V1_DB:-dailydose_local}"
BUILD_DB="${BUILD_DB:-dailydose_v2_sandbox}"
OUT="${OUT:-$HOME/Documents/Database/golive_v2_$(date +%Y%m%d)}"

[ -f "$DUMP" ] || { echo "Berkas dump tidak ditemukan: $DUMP"; exit 1; }
case "$OUT" in "$ROOT"*) echo "OUT berada di dalam repositori; data pribadi tidak boleh masuk repositori."; exit 1;; esac

DATABASE_URL_ENV="$(grep -E '^DATABASE_URL=' "$ROOT/.env" | cut -d= -f2-)"
export MYSQL_PWD="$(echo "$DATABASE_URL_ENV" | sed -E 's#mysql://[^:]+:([^@]+)@.*#\1#')"
DB_USER="$(echo "$DATABASE_URL_ENV" | sed -E 's#mysql://([^:]+):.*#\1#')"
DB_HOST="$(echo "$DATABASE_URL_ENV" | sed -E 's#.*@([^:/]+).*#\1#')"
BUILD_URL="$(echo "$DATABASE_URL_ENV" | sed -E "s#/[^/?]+(\\?.*)?\$#/$BUILD_DB\\1#")"
MYSQL=(mysql "-u$DB_USER" "-h$DB_HOST")

q() { "${MYSQL[@]}" -N -e "$1"; }
step() { printf '\n== %s\n' "$1"; }

step "1/6 Impor dump v1 ke $V1_DB"
q "CREATE DATABASE IF NOT EXISTS \`$V1_DB\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
"${MYSQL[@]}" --default-character-set=utf8mb4 --max-allowed-packet=256M "$V1_DB" < "$DUMP"

step "2/6 Skema v2 kosong di $BUILD_DB"
q "CREATE DATABASE IF NOT EXISTS \`$BUILD_DB\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
(cd "$ROOT/apps/api" && DATABASE_URL="$BUILD_URL" npx prisma db push --skip-generate >/dev/null)

step "3/6 Migrasi v1 -> v2"
(cd "$ROOT/apps/api" && DATABASE_URL="$BUILD_URL" V1_DB="$V1_DB" CONFIRM_TRUNCATE="$BUILD_DB" NODE_PATH="$PWD/node_modules" \
  node node_modules/tsx/dist/cli.mjs ../../tools/migrations/migrate-full-v1-to-v2.ts | grep -E "STEP|✓|❌|FATAL" )

step "4/6 Pemeriksaan otomatis (berhenti bila ada yang tidak cocok)"
FAIL=0
check() { # nama, nilai harapan (v1), nilai hasil (v2)
  if [ "$2" = "$3" ]; then printf '  OK     %-52s v1=%s v2=%s\n' "$1" "$2" "$3"; else printf '  GAGAL  %-52s v1=%s v2=%s\n' "$1" "$2" "$3"; FAIL=1; fi
}
zero() { # nama, jumlah yang harus 0
  if [ "$2" = "0" ]; then printf '  OK     %-52s %s\n' "$1" "$2"; else printf '  GAGAL  %-52s %s\n' "$1" "$2"; FAIL=1; fi
}
check "pengguna"                         "$(q "select count(*) from $V1_DB.users")" "$(q "select count(*) from $BUILD_DB.user")"
check "pengguna dihapus di v1 = nonaktif" "$(q "select count(*) from $V1_DB.users where deleted_at is not null")" "$(q "select count(*) from $BUILD_DB.user where status='INACTIVE'")"
check "pesanan (di luar 24 yatim id_paket=0)" "$(q "select count(*) from $V1_DB.order_pakets o join $V1_DB.pakets p on p.id=o.id_paket")" "$(q "select count(*) from $BUILD_DB.pembelian")"
check "pesanan dihapus di v1 = dibatalkan" "$(q "select count(*) from $V1_DB.order_pakets o join $V1_DB.pakets p on p.id=o.id_paket where o.deleted_at is not null")" "$(q "select count(*) from $BUILD_DB.pembelian where status='CANCELLED'")"
check "jadwal kelas"                      "$(q "select count(*) from $V1_DB.kelas_activities")" "$(q "select count(*) from $BUILD_DB.slot_kelas")"
check "booking (yang jadwalnya ada)"      "$(q "select count(*) from $V1_DB.booking_kelas b join $V1_DB.kelas_activities k on k.id=b.id_kelas_activity")" "$(q "select count(*) from $BUILD_DB.pemesanan_kelas")"
check "paket aktif: jumlah paket"         "$(q "select count(*) from $V1_DB.order_pakets where deleted_at is null and is_active=1 and expired_date>now() and sisa>0")" "$(q "select count(*) from $BUILD_DB.paket_pelanggan where status='ACTIVE' and validUntil>now() and remainingSessions>0")"
check "paket aktif: total sisa sesi"      "$(q "select coalesce(sum(sisa),0) from $V1_DB.order_pakets where deleted_at is null and is_active=1 and expired_date>now() and sisa>0")" "$(q "select coalesce(sum(remainingSessions),0) from $BUILD_DB.paket_pelanggan where status='ACTIVE' and validUntil>now() and remainingSessions>0")"
check "paket aktif: jumlah pelanggan"     "$(q "select count(distinct id_user) from $V1_DB.order_pakets where deleted_at is null and is_active=1 and expired_date>now() and sisa>0")" "$(q "select count(distinct userId) from $BUILD_DB.paket_pelanggan where status='ACTIVE' and validUntil>now() and remainingSessions>0")"
check "pesanan menunggu verifikasi (v1 status 2, tidak dihapus)" "$(q "select count(*) from $V1_DB.order_pakets o join $V1_DB.pakets p on p.id=o.id_paket where o.status=2 and o.deleted_at is null")" "$(q "select count(*) from $BUILD_DB.pembelian where status='WAITING_VERIFICATION'")"
zero "pelanggan berpaket aktif yang belum terverifikasi" "$(q "select count(*) from $BUILD_DB.profil_pengguna p where p.userId in (select userId from $BUILD_DB.paket_pelanggan where status='ACTIVE') and (p.notes is null or p.notes not like '%KYC_APPROVED%')")"
zero "paket tanpa pesanan ber-status menunggu (cegah duplikat)" "$(q "select count(*) from $BUILD_DB.paket_pelanggan cp join $BUILD_DB.pembelian pb on pb.id=cp.purchaseId where pb.status in ('WAITING_VERIFICATION','PENDING')")"
zero "booking tanpa paket pelanggan valid" "$(q "select count(*) from $BUILD_DB.pemesanan_kelas b left join $BUILD_DB.paket_pelanggan p on p.id=b.customerPackageId where p.id is null")"
zero "booking tanpa jadwal atau pengguna valid" "$(q "select count(*) from $BUILD_DB.pemesanan_kelas b left join $BUILD_DB.slot_kelas s on s.id=b.classSlotId left join $BUILD_DB.user u on u.id=b.userId where s.id is null or u.id is null")"
zero "paket pelanggan mengacu paket yang tidak ada" "$(q "select count(*) from $BUILD_DB.paket_pelanggan cp left join $BUILD_DB.paket pk on pk.id=cp.packageId where pk.id is null")"
zero "hash password bukan bcrypt \$2y\$" "$(q "select count(*) from $BUILD_DB.user where passwordHash is null or passwordHash not like '\$2y\$%'")"
[ "$FAIL" = "0" ] || { echo; echo "ADA PEMERIKSAAN YANG GAGAL. SQL tidak dibuat."; exit 2; }

step "5/6 Ekspor data (tanpa skema) ke $OUT"
mkdir -p "$OUT"; chmod 700 "$OUT"
TABLES=(cabang studio ruangan jenis_kelas rekening_pembayaran owner_cabang user profil_pengguna penugasan_instruktur paket voucher pembelian bukti_pembayaran paket_pelanggan slot_kelas pemesanan_kelas kehadiran_pelanggan)
{
  echo "-- Daily Dose v2: data go-live dari dump v1 ($(basename "$DUMP"))"
  echo "-- Dibuat $(date '+%d %b %Y %H:%M'). Hanya DATA (tanpa skema). Skema dibuat dulu dengan: prisma db push."
  echo "-- Berisi data pribadi pelanggan: jangan dikomit, jangan dikirim lewat kanal tidak aman."
  echo "SET NAMES utf8mb4; SET FOREIGN_KEY_CHECKS=0; SET UNIQUE_CHECKS=0; SET time_zone='+00:00'; SET sql_mode='NO_AUTO_VALUE_ON_ZERO';"
  mysqldump "-u$DB_USER" "-h$DB_HOST" --no-create-info --complete-insert --extended-insert --skip-triggers --skip-add-locks \
    --skip-lock-tables --no-tablespaces --skip-comments --skip-masking-policies --set-gtid-purged=OFF \
    --default-character-set=utf8mb4 --hex-blob --net-buffer-length=1000000 "$BUILD_DB" "${TABLES[@]}" 2>/dev/null
  echo "SET FOREIGN_KEY_CHECKS=1; SET UNIQUE_CHECKS=1;"
} > "$OUT/01_data_v2_golive.sql"

step "6/6 Sidik jari berkas"
(cd "$OUT" && shasum -a 256 01_data_v2_golive.sql | tee SHA256SUMS && ls -lh 01_data_v2_golive.sql)
echo; echo "SELESAI. Berkas ada di: $OUT"
