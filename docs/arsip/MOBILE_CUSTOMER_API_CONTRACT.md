> **DIARSIPKAN 25 Okt 2026.** Tidak ada aplikasi mobile di repositori, dan path di dokumen ini sudah berbeda dari API nyata. Rute khusus mobile (OTP, pemulihan akun, tautan akun) dicabut dari API; lihat riwayat git bila mobile dibuat kelak.

# Mobile API Contract (Customer Edition)
## Daily Dose Pilates iOS & Android Application v2.0

---

## 1. Ikhtisar & Standar Teknis (*Technical Standards*)

### 1.1 Base URL & Versi API
* **Base URL (Staging)**: `https://api.staging.dailydosepilates.com/api/v1`
* **Base URL (Production)**: `https://api.dailydosepilates.com/api/v1`
* **Format Data**: JSON (`application/json`) dan Multipart Form Data untuk upload file.
* **Protokol**: HTTPS / TLS 1.3 (Wajib).

### 1.2 Standar Request Header
Setiap pemanggilan endpoint dari aplikasi mobile wajib menyertakan header berikut:

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <access_token>
X-Client-Platform: iOS | Android
X-Client-Version: 2.0.0
X-Correlation-ID: <uuidv4_generated_per_request>
Idempotency-Key: <uuidv4_generated_for_mutations>
```

> [!NOTE]
> * **`X-Correlation-ID`**: Wajib di-generate pada setiap request untuk pelacakan error end-to-end.
> * **`Idempotency-Key`**: Wajib pada setiap operasi `POST`/`PUT` mutasi (booking, pembayaran, reschedule) untuk mencegah duplikasi jika koneksi mobile timeout atau retry.

### 1.3 Format Respon Standar (*Response Envelope*)

#### Respon Sukses (HTTP 200 / 201)
```json
{
  "data": {
    "...": "payload data"
  },
  "meta": {
    "correlationId": "f7d2e3b1-4c5a-4e2b-8a1a-7b3c2d1e0f9a",
    "timestamp": "2026-08-23T01:15:00.000Z",
    "pagination": {
      "nextCursor": "eyJpZCI6MTIzfQ==",
      "hasMore": true
    }
  }
}
```

#### Respon Error (HTTP 4xx / 5xx)
```json
{
  "error": {
    "code": "BOOKING_CUTOFF_VIOLATION",
    "message": "Perubahan jadwal tidak dapat dilakukan kurang dari 24 jam sebelum kelas dimulai.",
    "correlationId": "f7d2e3b1-4c5a-4e2b-8a1a-7b3c2d1e0f9a",
    "retryable": false,
    "details": [
      {
        "field": "slotId",
        "code": "CUTOFF_H24_EXCEEDED",
        "message": "Batas waktu reschedule (H-24) telah terlewati."
      }
    ]
  }
}
```

---

## 2. Autentikasi & Akun Customer (*Authentication & Account*)

### 2.1 Customer Login
* **Endpoint**: `POST /auth/login`
* **Auth**: Public

#### Request Body
```json
{
  "email": "customer@example.com",
  "password": "Password123!",
  "channel": "MOBILE",
  "deviceInfo": {
    "platform": "iOS",
    "model": "iPhone 15 Pro",
    "osVersion": "18.2",
    "fcmToken": "fcm_token_device_push_notification"
  }
}
```

#### Response (HTTP 200 OK)
```json
{
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresAt": "2026-08-23T09:15:00.000Z",
    "refreshExpiresAt": "2026-09-23T01:15:00.000Z",
    "user": {
      "id": "usr_c7a18b2c",
      "displayName": "Budi Santoso",
      "email": "customer@example.com",
      "phone": "+6281234567890",
      "kycStatus": "APPROVED",
      "roles": ["CUSTOMER"]
    }
  }
}
```

---

### 2.2 Customer Registration (Multipart Upload)
* **Endpoint**: `POST /auth/register`
* **Auth**: Public
* **Content-Type**: `multipart/form-data`

#### Form Data Fields
| Field | Tipe | Wajib | Keterangan |
| :--- | :--- | :---: | :--- |
| `name` | String | Ya | Nama lengkap sesuai KTP |
| `email` | String | Ya | Email aktif |
| `password` | String | Ya | Minimal 8 karakter |
| `phone` | String | Ya | Format: `+628...` / `08...` |
| `dateOfBirth` | String | Ya | Format: `YYYY-MM-DD` |
| `gender` | String | Ya | `FEMALE` / `MALE` |
| `ktpFile` | File (Binary) | Ya | Foto e-KTP (JPG/PNG, Max 5MB) |
| `selfieFile` | File (Binary) | Ya | Foto selfie wajah (JPG/PNG, Max 5MB) |

#### Response (HTTP 201 Created)
```json
{
  "data": {
    "id": "usr_c7a18b2c",
    "email": "customer@example.com",
    "kycStatus": "PENDING_VERIFICATION",
    "message": "Pendaftaran berhasil. Dokumen identitas Anda sedang dalam proses verifikasi tim kami."
  }
}
```

---

### 2.3 Refresh Token
* **Endpoint**: `POST /auth/refresh-token`
* **Auth**: Public

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

#### Response (HTTP 200 OK)
```json
{
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresAt": "2026-08-23T17:15:00.000Z"
  }
}
```

---

### 2.4 Lupa Password (*Forgot Password*)
* **Endpoint**: `POST /auth/forgot-password`
* **Auth**: Public

#### Request Body
```json
{
  "email": "customer@example.com"
}
```

#### Response (HTTP 200 OK)
```json
{
  "data": {
    "message": "Jika email terdaftar, instruksi reset password telah dikirim ke email atau WhatsApp Anda."
  }
}
```

---

### 2.5 Get Profil Customer
* **Endpoint**: `GET /account/profile`
* **Auth**: Bearer Token (Customer)

#### Response (HTTP 200 OK)
```json
{
  "data": {
    "id": "usr_c7a18b2c",
    "displayName": "Budi Santoso",
    "email": "customer@example.com",
    "phone": "+6281234567890",
    "dateOfBirth": "1994-05-12",
    "gender": "MALE",
    "kycStatus": "APPROVED",
    "avatarUrl": "https://storage.dailydosepilates.com/avatars/usr_c7a18b2c.jpg",
    "activePackageCount": 2,
    "availableSessions": 12,
    "upcomingBookingsCount": 1
  }
}
```

---

## 3. Katalog Publik & Eksplorasi Studio (*Catalog & Studios*)

### 3.1 Daftar Studio / Cabang
* **Endpoint**: `GET /public/studios`
* **Auth**: Public

#### Response (HTTP 200 OK)
```json
{
  "data": [
    {
      "id": "brn_jkt01",
      "slug": "jakarta",
      "name": "Daily Dose Jakarta",
      "address": "Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan",
      "city": "Jakarta Selatan",
      "timezone": "Asia/Jakarta",
      "phone": "+6281211111111",
      "latitude": -6.234567,
      "longitude": 106.812345,
      "amenities": ["Reformer Studio", "Cadillac", "Shower", "Valet Parking", "Locker Room"],
      "photos": [
        "https://storage.dailydosepilates.com/studios/jkt-main.jpg",
        "https://storage.dailydosepilates.com/studios/jkt-reformer.jpg"
      ]
    },
    {
      "id": "brn_bsd02",
      "slug": "bsd",
      "name": "Daily Dose BSD",
      "address": "The Breeze BSD City Blok L No. 12, Tangerang",
      "city": "Tangerang Selatan",
      "timezone": "Asia/Jakarta",
      "phone": "+6281222222222",
      "latitude": -6.301234,
      "longitude": 106.654321,
      "amenities": ["Reformer Studio", "Mat Studio", "Locker Room", "Free Parking"],
      "photos": [
        "https://storage.dailydosepilates.com/studios/bsd-main.jpg"
      ]
    }
  ]
}
```

---

### 3.2 Daftar Paket Kelas Tersedia
* **Endpoint**: `GET /public/packages`
* **Auth**: Public
* **Query Params**:
  * `branchId` (opsional): ID cabang untuk filter harga lokal.

#### Response (HTTP 200 OK)
```json
{
  "data": [
    {
      "id": "pkg_ref10",
      "code": "REF-10-GRP",
      "name": "10x Group Reformer Pilates",
      "description": "Paket 10 sesi latihan Reformer grup dengan instruktur tersertifikasi.",
      "sessionCount": 10,
      "validityDays": 90,
      "priceRp": 3500000,
      "formattedPrice": "Rp 3.500.000",
      "branchId": "brn_jkt01",
      "branchName": "Daily Dose Jakarta",
      "isPopular": true,
      "classTypes": ["GROUP_REFORMER", "GROUP_MAT"]
    }
  ]
}
```

---

### 3.3 Jadwal & Ketersediaan Slot Kelas
* **Endpoint**: `GET /public/schedules`
* **Auth**: Public
* **Query Params**:
  * `branchId` (Wajib): ID studio cabang
  * `date` (Wajib): Format `YYYY-MM-DD`
  * `classType` (Opsional): `GROUP_REFORMER` / `PRIVATE` / `MAT`

#### Response (HTTP 200 OK)
```json
{
  "data": [
    {
      "slotId": "slt_20260825_0900",
      "className": "Reformer Flow - All Levels",
      "classType": "GROUP_REFORMER",
      "date": "2026-08-25",
      "startTime": "09:00",
      "endTime": "09:50",
      "durationMinutes": 50,
      "instructor": {
        "id": "ins_sarah",
        "name": "Coach Sarah",
        "photoUrl": "https://storage.dailydosepilates.com/instructors/sarah.jpg"
      },
      "room": "Studio Reformer A",
      "capacity": 6,
      "bookedCount": 4,
      "availableSlots": 2,
      "isFull": false,
      "cutoffTime": "2026-08-24T09:00:00.000Z"
    }
  ]
}
```

---

## 4. Pembelian & Pembayaran Paket (*Orders & Purchases*)

### 4.1 Buat Pesanan Checkout Paket (*Checkout Order*)
* **Endpoint**: `POST /orders/checkout`
* **Auth**: Bearer Token (Customer)

#### Request Body
```json
{
  "packageId": "pkg_ref10",
  "voucherCode": "WELCOME2026"
}
```

#### Response (HTTP 201 Created)
```json
{
  "data": {
    "orderId": "ord_202608_0088",
    "orderNumber": "ORD-202608-0088",
    "packageName": "10x Group Reformer Pilates",
    "sessionCount": 10,
    "validityDays": 90,
    "subtotalRp": 3500000,
    "voucherDiscountRp": 100000,
    "totalAmountRp": 3400000,
    "formattedTotal": "Rp 3.400.000",
    "status": "PAYMENT_PENDING",
    "paymentDeadline": "2026-08-24T01:15:00.000Z",
    "paymentInstructions": {
      "bankName": "Bank Central Asia (BCA)",
      "accountNumber": "5410988777",
      "accountHolder": "PT DAILY DOSE PILATES INDONESIA"
    }
  }
}
```

---

### 4.2 Validasi Voucher Promo (*Apply Voucher*)
* **Endpoint**: `POST /orders/apply-voucher`
* **Auth**: Bearer Token (Customer)

#### Request Body
```json
{
  "voucherCode": "WELCOME2026",
  "packageId": "pkg_ref10"
}
```

#### Response (HTTP 200 OK)
```json
{
  "data": {
    "valid": true,
    "code": "WELCOME2026",
    "discountType": "FIXED_AMOUNT",
    "discountRp": 100000,
    "finalPriceRp": 3400000,
    "formattedDiscount": "Rp 100.000"
  }
}
```

---

### 4.3 Unggah Bukti Pembayaran Transfer (*Upload Proof*)
* **Endpoint**: `POST /purchases/:orderId/upload-proof`
* **Auth**: Bearer Token (Customer)
* **Content-Type**: `multipart/form-data`

#### Form Data
| Field | Tipe | Wajib | Keterangan |
| :--- | :--- | :---: | :--- |
| `proofFile` | File (Binary) | Ya | Foto/PDF bukti transfer (Max 5MB) |
| `sourceBank` | String | Ya | Nama bank pengirim (misal: BCA / Mandiri) |
| `accountHolderName` | String | Ya | Nama pemilik rekening pengirim |

#### Response (HTTP 200 OK)
```json
{
  "data": {
    "orderId": "ord_202608_0088",
    "status": "PAYMENT_UNDER_REVIEW",
    "uploadedAt": "2026-08-23T01:20:00.000Z",
    "message": "Bukti transfer berhasil diunggah dan sedang diverifikasi oleh Tim Finance."
  }
}
```

---

## 5. Paket Saya & Saldo Kuota Sesi (*My Packages & Ledger*)

### 5.1 Daftar Paket Aktif Customer
* **Endpoint**: `GET /account/my-packages`
* **Auth**: Bearer Token (Customer)

#### Response (HTTP 200 OK)
```json
{
  "data": [
    {
      "customerPackageId": "cpk_991823",
      "packageName": "10x Group Reformer Pilates",
      "branchId": "brn_jkt01",
      "branchName": "Daily Dose Jakarta",
      "totalSessions": 10,
      "usedSessions": 2,
      "remainingSessions": 8,
      "status": "ACTIVE",
      "expiresAt": "2026-11-20T23:59:59.000Z",
      "daysLeft": 89
    }
  ]
}
```

---

### 5.2 Riwayat Mutasi Saldo Sesi (*Session Ledger*)
* **Endpoint**: `GET /account/packages/:customerPackageId/ledger`
* **Auth**: Bearer Token (Customer)

#### Response (HTTP 200 OK)
```json
{
  "data": [
    {
      "ledgerId": "ldg_001",
      "type": "PURCHASE_CREDIT",
      "change": 10,
      "balanceAfter": 10,
      "referenceType": "ORDER",
      "referenceId": "ord_202608_0088",
      "description": "Pembelian paket 10 sesi terkonfirmasi",
      "timestamp": "2026-08-23T01:25:00.000Z"
    },
    {
      "ledgerId": "ldg_002",
      "type": "BOOKING_DEBIT",
      "change": -1,
      "balanceAfter": 9,
      "referenceType": "BOOKING",
      "referenceId": "bkg_202608_0042",
      "description": "Booking sesi Reformer Flow (Senin 09:00)",
      "timestamp": "2026-08-23T02:00:00.000Z"
    }
  ]
}
```

---

## 6. Pemesanan Jadwal Kelas (*Booking & Reschedule*)

### 6.1 Booking Sesi Kelas (*Create Booking*)
* **Endpoint**: `POST /bookings`
* **Auth**: Bearer Token (Customer)

#### Request Body
```json
{
  "slotId": "slt_20260825_0900",
  "customerPackageId": "cpk_991823"
}
```

#### Response (HTTP 201 Created)
```json
{
  "data": {
    "bookingId": "bkg_202608_0042",
    "bookingCode": "BKG-202608-0042",
    "status": "BOOKED",
    "className": "Reformer Flow - All Levels",
    "date": "2026-08-25",
    "startTime": "09:00",
    "endTime": "09:50",
    "studioName": "Daily Dose Jakarta",
    "room": "Studio Reformer A",
    "instructorName": "Coach Sarah",
    "remainingPackageSessions": 7,
    "rescheduleCutoff": "2026-08-24T09:00:00.000Z"
  }
}
```

---

### 6.2 Riwayat & Jadwal Booking Saya (*My Bookings*)
* **Endpoint**: `GET /bookings/my-bookings`
* **Auth**: Bearer Token (Customer)
* **Query Params**:
  * `scope`: `UPCOMING` (default) / `PAST` / `ALL`

#### Response (HTTP 200 OK)
```json
{
  "data": [
    {
      "bookingId": "bkg_202608_0042",
      "bookingCode": "BKG-202608-0042",
      "status": "BOOKED",
      "date": "2026-08-25",
      "startTime": "09:00",
      "endTime": "09:50",
      "className": "Reformer Flow - All Levels",
      "studioName": "Daily Dose Jakarta",
      "room": "Studio Reformer A",
      "instructorName": "Coach Sarah",
      "canReschedule": true,
      "canCancel": true
    }
  ]
}
```

---

### 6.3 Reschedule Jadwal Kelas (Batas Cutoff H-24)
* **Endpoint**: `POST /bookings/:bookingId/reschedule`
* **Auth**: Bearer Token (Customer)

#### Request Body
```json
{
  "newSlotId": "slt_20260826_1000"
}
```

#### Response Sukses (HTTP 200 OK)
```json
{
  "data": {
    "bookingId": "bkg_202608_0042",
    "status": "BOOKED",
    "newDate": "2026-08-26",
    "newStartTime": "10:00",
    "message": "Jadwal kelas berhasil diubah ke Rabu, 26 Agustus 2026 pukul 10:00 WIB."
  }
}
```

#### Response Gagal Jika < 24 Jam (HTTP 422 Unprocessable Entity)
```json
{
  "error": {
    "code": "BOOKING_CUTOFF_VIOLATION",
    "message": "Reschedule gagal. Perubahan jadwal hanya dapat dilakukan minimal 24 jam sebelum kelas dimulai.",
    "correlationId": "f7d2e3b1-4c5a-4e2b-8a1a-7b3c2d1e0f9a",
    "retryable": false
  }
}
```

---

### 6.4 Pembatalan Booking (*Cancel Booking*)
* **Endpoint**: `POST /bookings/:bookingId/cancel`
* **Auth**: Bearer Token (Customer)

#### Response (HTTP 200 OK)
```json
{
  "data": {
    "bookingId": "bkg_202608_0042",
    "status": "CANCELLED_BY_USER",
    "refundedSession": true,
    "remainingPackageSessions": 8,
    "message": "Booking dibatalkan dan 1 sesi telah dikembalikan ke saldo kuota paket Anda."
  }
}
```

---

## 7. Digital Check-In QR Pass (*QR Pass Generation*)

### 7.1 Generate Dynamic QR Code Pass
* **Endpoint**: `GET /bookings/:bookingId/qr-pass`
* **Auth**: Bearer Token (Customer)

#### Response (HTTP 200 OK)
```json
{
  "data": {
    "bookingId": "bkg_202608_0042",
    "qrPayload": "DD-PASS:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJiaWQiOiJia2dfMjAyNjA4XzAwNDIiLCJleHAiOjE3ODc1NDg4MDB9.SIGNATURE",
    "customerName": "Budi Santoso",
    "className": "Reformer Flow - All Levels",
    "studioName": "Daily Dose Jakarta",
    "schedule": "Senin, 25 Agustus 2026 (09:00 - 09:50 WIB)",
    "room": "Studio Reformer A - Unit #04",
    "validUntil": "2026-08-25T10:00:00.000Z",
    "status": "READY_FOR_CHECKIN"
  }
}
```

> [!TIP]
> Aplikasi mobile dapat me-render string `qrPayload` langsung ke komponen visual QR Code dengan rasio error correction level `M` atau `Q`.

---

## 8. Notifikasi & Dukungan Pelanggan (*Notifications & Support*)

### 8.1 Daftar Notifikasi (*In-App Notifications*)
* **Endpoint**: `GET /notifications`
* **Auth**: Bearer Token (Customer)

#### Response (HTTP 200 OK)
```json
{
  "data": [
    {
      "id": "notif_001",
      "title": "Pembayaran Paket Terkonfirmasi 🎉",
      "body": "Paket 10x Group Reformer Pilates Anda telah aktif dengan 10 sesi kuota.",
      "type": "PAYMENT_APPROVED",
      "read": false,
      "createdAt": "2026-08-23T01:25:00.000Z"
    },
    {
      "id": "notif_002",
      "title": "Pengingat Jadwal Kelas Besok 🧘‍♀️",
      "body": "Kelas Reformer Flow Anda akan dimulai besok pukul 09:00 WIB di Studio Jakarta.",
      "type": "CLASS_REMINDER",
      "read": true,
      "createdAt": "2026-08-22T09:00:00.000Z"
    }
  ]
}
```

---

### 8.2 Tandai Notifikasi Telah Dibaca
* **Endpoint**: `PUT /notifications/:id/read`
* **Auth**: Bearer Token (Customer)

#### Response (HTTP 200 OK)
```json
{
  "data": {
    "id": "notif_001",
    "read": true
  }
}
```

---

## 9. Kamus Kode Kesalahan (*Error Code Dictionary*)

| HTTP Status | Error Code | Arti & Rekomendasi Aksi di Mobile App |
| :---: | :--- | :--- |
| `401` | `UNAUTHORIZED` | Token expired / invalid $\rightarrow$ Arahkan user ke layar Sign In. |
| `403` | `KYC_NOT_VERIFIED` | KYC belum disetujui $\rightarrow$ Tampilkan banner "Akun dalam proses verifikasi". |
| `404` | `SLOT_NOT_FOUND` | Slot jadwal sudah tidak ada / terhapus. |
| `409` | `SLOT_FULL` | Kuota kelas telah penuh saat booking dikirim $\rightarrow$ Minta user pilih slot lain. |
| `409` | `IDEMPOTENCY_CONFLICT` | Request mutasi berulang dengan payload berbeda $\rightarrow$ Generate UUID baru. |
| `422` | `INSUFFICIENT_SESSIONS` | Saldo kuota sesi habis $\rightarrow$ Tampilkan tombol "Beli Paket Baru". |
| `422` | `BOOKING_CUTOFF_VIOLATION` | Reschedule gagal karena < 24 jam $\rightarrow$ Tampilkan pop-up kebijakan H-24. |
| `422` | `VOUCHER_EXPIRED` | Kode voucher sudah kedaluwarsa atau melebihi kuota klaim. |
| `429` | `RATE_LIMIT_EXCEEDED` | Terlalu banyak request dalam 1 menit $\rightarrow$ Delay tombol submit. |

---
*Dokumen ini merupakan kontrak resmi antara Backend Team dan Mobile Engineering Team Daily Dose Pilates v2.*
