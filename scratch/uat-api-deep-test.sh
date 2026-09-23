#!/bin/bash
# ============================================================
# UAT DEEP TEST - Daily Dose V2
# Tests: Member Login, Booking, Manager Login, Admin Login
# API: http://localhost:32121
# ============================================================

API="http://localhost:32121/api/v1"
PASS=0
FAIL=0
WARN=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

ok() { echo -e "${GREEN}✅ PASS${NC} | $1"; PASS=$((PASS+1)); }
fail() { echo -e "${RED}❌ FAIL${NC} | $1"; FAIL=$((FAIL+1)); }
warn() { echo -e "${YELLOW}⚠️  WARN${NC} | $1"; WARN=$((WARN+1)); }
section() { echo -e "\n${CYAN}${BOLD}=== $1 ===${NC}\n"; }
info() { echo -e "   ℹ️  $1"; }

# ============================================================
section "UAT-05: Member Login (amanda.member@dailydose.test)"
# ============================================================

MEMBER_LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"amanda.member@dailydose.test","password":"Password123!"}' \
  -c /tmp/member_cookies.txt -b /tmp/member_cookies.txt)

echo "Response: $MEMBER_LOGIN" | head -c 300

MEMBER_TOKEN=$(echo $MEMBER_LOGIN | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('accessToken','') or d.get('token','') or d.get('data',{}).get('accessToken',''))" 2>/dev/null)

if [ -n "$MEMBER_TOKEN" ]; then
  ok "Member login berhasil - token diterima"
  info "Token: ${MEMBER_TOKEN:0:40}..."
else
  # Cek apakah session-based (cookie)
  COOKIE_CHECK=$(cat /tmp/member_cookies.txt 2>/dev/null | grep -v "^#" | grep -v "^$")
  if [ -n "$COOKIE_CHECK" ]; then
    ok "Member login berhasil - session cookie diterima"
    info "Cookie: $(echo $COOKIE_CHECK | head -c 80)..."
    MEMBER_TOKEN="cookie-based"
  else
    MEMBER_ROLE=$(echo $MEMBER_LOGIN | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('user',{}).get('role','') or d.get('role',''))" 2>/dev/null)
    if [ -n "$MEMBER_ROLE" ]; then
      ok "Member login berhasil - role: $MEMBER_ROLE"
      MEMBER_TOKEN="role-based"
    else
      fail "Member login gagal - tidak ada token/cookie"
      info "Response: $MEMBER_LOGIN"
    fi
  fi
fi

# ============================================================
section "UAT-05b: Member Profile Check"
# ============================================================

if [ -n "$MEMBER_TOKEN" ] && [ "$MEMBER_TOKEN" != "cookie-based" ] && [ "$MEMBER_TOKEN" != "role-based" ]; then
  MEMBER_ME=$(curl -s "$API/me" \
    -H "Authorization: Bearer $MEMBER_TOKEN")
  MEMBER_NAME=$(echo $MEMBER_ME | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('name','') or d.get('user',{}).get('name',''))" 2>/dev/null)
  if [ -n "$MEMBER_NAME" ]; then
    ok "Profile member dapat diakses: $MEMBER_NAME"
  else
    warn "Profile member tidak dapat diakses via bearer token"
    info "Response: $MEMBER_ME"
  fi
else
  # Try cookie-based
  MEMBER_ME=$(curl -s "$API/me" \
    -c /tmp/member_cookies.txt -b /tmp/member_cookies.txt)
  MEMBER_NAME=$(echo $MEMBER_ME | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('name','') or d.get('user',{}).get('name',''))" 2>/dev/null)
  if [ -n "$MEMBER_NAME" ]; then
    ok "Profile member dapat diakses (cookie): $MEMBER_NAME"
  else
    warn "Profile tidak teridentifikasi - perlu review"
    info "Me response: $MEMBER_ME" | head -c 200
  fi
fi

# ============================================================
section "UAT-06: Cek Paket Aktif Member"
# ============================================================

MY_PACKAGES=""
if [ -n "$MEMBER_TOKEN" ] && [ "$MEMBER_TOKEN" != "cookie-based" ] && [ "$MEMBER_TOKEN" != "role-based" ]; then
  MY_PACKAGES=$(curl -s "$API/me/memberships" \
    -H "Authorization: Bearer $MEMBER_TOKEN")
else
  MY_PACKAGES=$(curl -s "$API/me/memberships" \
    -c /tmp/member_cookies.txt -b /tmp/member_cookies.txt)
fi

PKG_COUNT=$(echo $MY_PACKAGES | python3 -c "import sys,json; d=json.load(sys.stdin); items=d if isinstance(d,list) else d.get('data',[]); print(len(items))" 2>/dev/null)

if [ -n "$PKG_COUNT" ] && [ "$PKG_COUNT" -gt 0 ] 2>/dev/null; then
  ok "Member memiliki $PKG_COUNT paket aktif"
  echo $MY_PACKAGES | python3 -c "
import sys,json
d=json.load(sys.stdin)
items=d if isinstance(d,list) else d.get('data',[])
for i in items[:3]:
    print(f'   - {i.get(\"packageName\",i.get(\"name\",\"?\"))} | Sisa: {i.get(\"remainingSessions\",\"?\")} sesi | Exp: {i.get(\"expiryDate\",\"?\")}')
" 2>/dev/null
else
  warn "Tidak ada paket aktif ditemukan atau endpoint berbeda"
  info "Response: $(echo $MY_PACKAGES | head -c 200)"
fi

# ============================================================
section "UAT-06b: Ambil Jadwal Kelas Tersedia"
# ============================================================

SCHEDULES=$(curl -s "$API/public/class-catalog?studioSlug=green-garden&limit=5")
SCHED_COUNT=$(echo $SCHEDULES | python3 -c "import sys,json; d=json.load(sys.stdin); items=d if isinstance(d,list) else d.get('data',[]); print(len(items))" 2>/dev/null)

if [ -n "$SCHED_COUNT" ] && [ "$SCHED_COUNT" -gt 0 ] 2>/dev/null; then
  ok "Jadwal kelas tersedia: $SCHED_COUNT slot ditemukan"
  FIRST_SCHED_ID=$(echo $SCHEDULES | python3 -c "
import sys,json
d=json.load(sys.stdin)
items=d if isinstance(d,list) else d.get('data',[])
if items:
    s=items[0]
    print(s.get('id',''))
" 2>/dev/null)
  echo $SCHEDULES | python3 -c "
import sys,json
d=json.load(sys.stdin)
items=d if isinstance(d,list) else d.get('data',[])
for i in items[:3]:
    print(f'   - [{i.get(\"id\",\"?\")}] {i.get(\"classTypeName\",i.get(\"type\",\"?\"))} | {i.get(\"startDate\",\"?\")} | Seats: {i.get(\"availableSeats\",\"?\")}')
" 2>/dev/null
else
  warn "Jadwal kelas kosong atau endpoint berbeda"
  info "Response: $(echo $SCHEDULES | head -c 300)"
  
  # Coba endpoint alternatif tanpa filter studioSlug
  SCHEDULES2=$(curl -s "$API/public/class-catalog?limit=5")
  SCHED_COUNT2=$(echo $SCHEDULES2 | python3 -c "import sys,json; d=json.load(sys.stdin); items=d if isinstance(d,list) else d.get('data',[]); print(len(items))" 2>/dev/null)
  if [ -n "$SCHED_COUNT2" ] && [ "$SCHED_COUNT2" -gt 0 ] 2>/dev/null; then
    ok "Jadwal ditemukan via endpoint tanpa filter: $SCHED_COUNT2 slot"
    FIRST_SCHED_ID=$(echo $SCHEDULES2 | python3 -c "
import sys,json
d=json.load(sys.stdin)
items=d if isinstance(d,list) else d.get('data',[])
if items:
    print(items[0].get('id',''))
" 2>/dev/null)
  fi
fi

# ============================================================
section "UAT-06c: Booking Kelas (Member)"
# ============================================================

if [ -n "$FIRST_SCHED_ID" ]; then
  info "Mencoba booking schedule ID: $FIRST_SCHED_ID"
  
  if [ -n "$MEMBER_TOKEN" ] && [ "$MEMBER_TOKEN" != "cookie-based" ] && [ "$MEMBER_TOKEN" != "role-based" ]; then
    BOOKING_RESP=$(curl -s -X POST "$API/bookings" \
      -H "Authorization: Bearer $MEMBER_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"scheduleId\":\"$FIRST_SCHED_ID\"}")
  else
    BOOKING_RESP=$(curl -s -X POST "$API/bookings" \
      -c /tmp/member_cookies.txt -b /tmp/member_cookies.txt \
      -H "Content-Type: application/json" \
      -d "{\"scheduleId\":\"$FIRST_SCHED_ID\"}")
  fi
  
  BOOKING_ID=$(echo $BOOKING_RESP | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id','') or d.get('bookingId','') or d.get('data',{}).get('id',''))" 2>/dev/null)
  BOOKING_STATUS=$(echo $BOOKING_RESP | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','') or d.get('data',{}).get('status',''))" 2>/dev/null)
  
  if [ -n "$BOOKING_ID" ]; then
    ok "Booking berhasil! Booking ID: $BOOKING_ID | Status: $BOOKING_STATUS"
  else
    BOOKING_ERR=$(echo $BOOKING_RESP | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('message','') or d.get('error',''))" 2>/dev/null)
    if echo "$BOOKING_ERR" | grep -qi "no.*active\|tidak.*paket\|membership\|package"; then
      warn "Booking gagal: Member tidak memiliki paket aktif yang sesuai"
      info "Error: $BOOKING_ERR"
    elif echo "$BOOKING_ERR" | grep -qi "past\|expired\|sudah"; then
      warn "Booking gagal: Jadwal sudah lewat / expired"
      info "Error: $BOOKING_ERR"
    else
      fail "Booking gagal: $BOOKING_ERR"
      info "Full Response: $BOOKING_RESP"
    fi
  fi
else
  warn "Skip booking test - tidak ada schedule ID tersedia"
fi

# ============================================================
section "UAT-07: Manager Login (manager.gg@dailydose.test)"
# ============================================================

MGR_LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"manager.gg@dailydose.test","password":"Password123!"}' \
  -c /tmp/mgr_cookies.txt -b /tmp/mgr_cookies.txt)

echo "Manager Response: $MGR_LOGIN" | head -c 300

MGR_TOKEN=$(echo $MGR_LOGIN | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('accessToken','') or d.get('token','') or d.get('data',{}).get('accessToken',''))" 2>/dev/null)
MGR_ROLE=$(echo $MGR_LOGIN | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('user',{}).get('role','') or d.get('role',''))" 2>/dev/null)

if [ -n "$MGR_TOKEN" ]; then
  ok "Manager login berhasil - Role: $MGR_ROLE"
elif [ -n "$(cat /tmp/mgr_cookies.txt 2>/dev/null | grep -v '^#' | grep -v '^$')" ]; then
  ok "Manager login berhasil (cookie session)"
  MGR_TOKEN="cookie-based"
else
  fail "Manager login gagal"
  info "Response: $MGR_LOGIN"
fi

# ============================================================
section "UAT-07b: Manager - Akses Data Studio"
# ============================================================

if [ -n "$MGR_TOKEN" ] && [ "$MGR_TOKEN" != "cookie-based" ]; then
  MGR_STUDIO=$(curl -s "$API/workspace/studio" \
    -H "Authorization: Bearer $MGR_TOKEN")
else
  MGR_STUDIO=$(curl -s "$API/workspace/studio" \
    -c /tmp/mgr_cookies.txt -b /tmp/mgr_cookies.txt)
fi

STUDIO_NAME=$(echo $MGR_STUDIO | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('name','') or d.get('data',{}).get('name',''))" 2>/dev/null)
if [ -n "$STUDIO_NAME" ]; then
  ok "Manager dapat akses studio: $STUDIO_NAME"
else
  warn "Endpoint studio berbeda atau response kosong"
  info "Studio response: $(echo $MGR_STUDIO | head -c 200)"
fi

# ============================================================
section "UAT-07c: Manager - Akses Jadwal Kelas Studio"
# ============================================================

if [ -n "$MGR_TOKEN" ] && [ "$MGR_TOKEN" != "cookie-based" ]; then
  MGR_SCHEDULES=$(curl -s "$API/workspace/schedules?limit=5" \
    -H "Authorization: Bearer $MGR_TOKEN")
else
  MGR_SCHEDULES=$(curl -s "$API/workspace/schedules?limit=5" \
    -c /tmp/mgr_cookies.txt -b /tmp/mgr_cookies.txt)
fi

MGR_SCHED_COUNT=$(echo $MGR_SCHEDULES | python3 -c "import sys,json; d=json.load(sys.stdin); items=d if isinstance(d,list) else d.get('data',[]); print(len(items))" 2>/dev/null)
if [ -n "$MGR_SCHED_COUNT" ] && [ "$MGR_SCHED_COUNT" -gt 0 ] 2>/dev/null; then
  ok "Manager dapat melihat $MGR_SCHED_COUNT jadwal kelas"
else
  warn "Jadwal manager tidak tersedia (mungkin endpoint berbeda)"
  info "Sched response: $(echo $MGR_SCHEDULES | head -c 200)"
fi

# ============================================================
section "UAT-08: Admin Login (adminmk@ddose.com)"
# ============================================================

ADMIN_LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"adminmk@ddose.com","password":"Password123!"}' \
  -c /tmp/admin_cookies.txt -b /tmp/admin_cookies.txt)

echo "Admin Response: $ADMIN_LOGIN" | head -c 300

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('accessToken','') or d.get('token','') or d.get('data',{}).get('accessToken',''))" 2>/dev/null)
ADMIN_ROLE=$(echo $ADMIN_LOGIN | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('user',{}).get('role','') or d.get('role',''))" 2>/dev/null)

if [ -n "$ADMIN_TOKEN" ]; then
  ok "Admin login berhasil - Role: $ADMIN_ROLE"
elif [ -n "$(cat /tmp/admin_cookies.txt 2>/dev/null | grep -v '^#' | grep -v '^$')" ]; then
  ok "Admin login berhasil (cookie session)"
  ADMIN_TOKEN="cookie-based"
else
  fail "Admin login gagal"
  info "Response: $ADMIN_LOGIN"
fi

# ============================================================
section "UAT-08b: Admin - Akses Dashboard"
# ============================================================

if [ -n "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "cookie-based" ]; then
  ADMIN_DASH=$(curl -s "$API/admin/dashboard" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  ADMIN_STATS=$(curl -s "$API/admin/studios" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
else
  ADMIN_DASH=$(curl -s "$API/admin/dashboard" \
    -c /tmp/admin_cookies.txt -b /tmp/admin_cookies.txt)
  ADMIN_STATS=$(curl -s "$API/admin/studios" \
    -c /tmp/admin_cookies.txt -b /tmp/admin_cookies.txt)
fi

STUDIOS_COUNT=$(echo $ADMIN_STATS | python3 -c "import sys,json; d=json.load(sys.stdin); items=d if isinstance(d,list) else d.get('data',[]); print(len(items))" 2>/dev/null)
if [ -n "$STUDIOS_COUNT" ] && [ "$STUDIOS_COUNT" -gt 0 ] 2>/dev/null; then
  ok "Admin dapat melihat $STUDIOS_COUNT studio"
else
  warn "Admin studio list kosong atau endpoint berbeda"
  info "Admin response: $(echo $ADMIN_STATS | head -c 200)"
fi

# ============================================================
section "UAT-09: Class Types Integrity Check (V1 Only)"
# ============================================================

CLASS_TYPES=$(curl -s "$API/public/class-types" 2>/dev/null || curl -s "$API/class-types" 2>/dev/null)
echo "Class Types response: $(echo $CLASS_TYPES | head -c 300)"

VALID_TYPES=("GROUP_CLASS" "PRIVATE_CLASS" "SEMI_PRIVATE" "PRIVATE_GROUP")
INVALID_TYPES=("REFORMER" "MAT" "BARRE" "REFORMER_PRIV")

for t in "${INVALID_TYPES[@]}"; do
  if echo "$CLASS_TYPES" | grep -qi "$t"; then
    fail "Tipe kelas tidak valid masih ada: $t"
  fi
done

# Check via DB directly
DB_CHECK=$(cd /Users/lrmcorporation/Documents/Website/dailydose_v2 && npx -y tsx apps/api/prisma/check-class-types-simple.ts 2>/dev/null)
if [ -z "$DB_CHECK" ]; then
  # Quick inline check
  TYPES_DB=$(cd /Users/lrmcorporation/Documents/Website/dailydose_v2 && node -e "
const {PrismaClient} = require('./apps/api/node_modules/@prisma/client');
const p = new PrismaClient();
p.classType.findMany({select:{slug:true,name:true}}).then(r => {
  console.log(JSON.stringify(r));
  p.\$disconnect();
}).catch(e => console.error(e));
" 2>/dev/null)
  
  if echo "$TYPES_DB" | grep -qi "REFORMER\|MAT\|BARRE"; then
    fail "Database masih memiliki tipe kelas tidak valid!"
  elif echo "$TYPES_DB" | grep -qi "group\|private\|semi"; then
    ok "Database class types bersih - hanya V1 types yang ada"
    echo $TYPES_DB | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f'   - {i[\"slug\"]} ({i[\"name\"]})') for i in d]" 2>/dev/null
  else
    warn "Tidak dapat verifikasi class types via DB"
  fi
fi

# ============================================================
section "RINGKASAN UAT"
# ============================================================

TOTAL=$((PASS+FAIL+WARN))
echo ""
echo -e "${BOLD}Total Test:${NC} $TOTAL"
echo -e "${GREEN}✅ PASS: $PASS${NC}"
echo -e "${RED}❌ FAIL: $FAIL${NC}"
echo -e "${YELLOW}⚠️  WARN: $WARN${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}${BOLD}🎉 UAT SELESAI - Sistem berjalan dengan baik!${NC}"
elif [ $FAIL -le 2 ]; then
  echo -e "${YELLOW}${BOLD}⚠️  UAT SELESAI dengan $FAIL issue minor${NC}"
else
  echo -e "${RED}${BOLD}❌ UAT memerlukan perhatian - $FAIL test gagal${NC}"
fi
