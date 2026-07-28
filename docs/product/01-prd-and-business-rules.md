# Product Requirements Document & Business Rules

**Status:** DRAFT  
**Product Owner:** lihat PIC Assignment Register  
**Sumber awal:** Spesifikasi Sistem Daily Dose Pilates v1.0

## 1. Product Vision dan Pengguna

Daily Dose menyediakan satu platform multi-cabang untuk customer journey, operasional kelas, instructor cost, dan keuangan yang dapat diaudit.

| Role aplikasi | Kanal MVP | Tujuan utama |
|---|---|---|
| Customer | Web v1; Flutter follow-up | Beli paket, timetable, booking/reschedule, check-in, saldo/expiry |
| Instructor | Flutter | Availability, assignment, QR check-in, kelas |
| Admin | Web responsif | Jadwal, booking assistance, check-in backfill, request adjustment |
| Manager | Web responsif | Approval paket/adjustment, expiry follow-up, stopped customer |
| Owner | Web responsif | Laporan dan timetable cabang yang di-assignment |
| Super Owner | Web responsif | Seluruh cabang, master, assignment, close/correction approval |
| Finance | Web responsif | Laporan lintas cabang, other cost, monthly close |
| Operations (`OPS`) | Web/internal operations | Health, job recovery, notification failure dan operational evidence tanpa akses bisnis implisit |

Delapan role di atas adalah **application roles**. Role tersebut berbeda dari AI delivery modes
(Product/BA, Designer, TL, Backend, Web, Flutter, QA, Security, Operations dan Peer Reviewer)
serta berbeda dari human approval authorities seperti Product Owner, Finance, Data Owner, Privacy
dan Operations owner. Kesamaan nama `Operations` tidak memberikan application permission secara
otomatis; authorization tetap berasal dari backend permission dan assignment yang eksplisit.

## 2. KPI Produk Pilot

- 100% transaksi session balance pilot berasal dari Session Ledger dan dapat direkonsiliasi.
- Tidak ada booking melebihi available session atau class capacity.
- 100% aksi approval, backfill, master change, close, dan correction tercatat di Audit Log.
- Laporan close sama dengan hasil reconciliation yang disetujui Finance.
- Tidak ada akses lintas cabang/role yang tidak sah pada authorization test.
- Notifikasi idempotent: satu occurrence tidak menghasilkan pengiriman duplikat.
- Parallel run selesai 1–2 minggu dengan selisih material nol sebelum cutover.

## 3. Terminologi

| Istilah | Definisi otoritatif |
|---|---|
| Ledger balance | Jumlah seluruh entry `SessionLedger` yang valid untuk satu CustomerPackage |
| Reserved session | Sesi yang ditahan oleh active booking dan belum menjadi pengurangan ledger |
| Available session | `ledger balance - active reservations`; tidak boleh negatif |
| H-24 | Tepat 24 jam sebelum waktu mulai ClassSlot dalam timezone cabang |
| H-2 | Tepat 2 jam sebelum waktu mulai ClassSlot dalam timezone cabang |
| H+2 | Tepat 2 jam setelah waktu selesai ClassSlot dalam timezone cabang |
| Monthly close | Snapshot dan lock per cabang/periode; bukan penghapusan atau reset histori |
| Effective date | Tanggal mulai berlakunya master value tanpa menimpa histori sebelumnya |
| Matched check-in | Check-in valid untuk user dan ClassSlot assignment yang sesuai dalam window yang diizinkan |

## 4. Business Rules

### Identity dan Authorization

- **BR-001:** Customer dapat login melalui Google atau OTP WhatsApp ke nomor terverifikasi.
- **BR-002 (amendment draft):** Instructor/staf berstatus aktif hanya dapat login melalui
  identitas Google terverifikasi atau email/password yang dibuat dari undangan valid. Aktivasi
  password tidak boleh memberi role baru, melakukan account linking otomatis, atau melewati
  lifecycle assignment. Amendment ini belum menjadi baseline production sebelum DEC-012/014
  dan review security disetujui.
- **BR-003:** Tindakan sensitif wajib memeriksa permission efektif, scope cabang, status user, optimistic locking, audit, dan separation-of-duties pada backend.
- **BR-004:** Authorization ditentukan backend berdasarkan role, assignment cabang, status user, dan action; UI bukan enforcement boundary.
- **BR-005:** Owner hanya melihat cabang pada OwnerBranch; Instructor hanya beroperasi pada InstructorBranch; Super Owner dan Finance memiliki akses lintas cabang sesuai permission.
- **BR-006:** Review identitas customer berscope global. Admin cabang tidak memiliki akses default;
  reviewer custom wajib memakai role `GLOBAL`.
- **BR-007:** Akses verifikasi dipisahkan menjadi `identity-verification:read`,
  `identity-verification:decide`, dan `identity-verification:delete`; capability legacy
  `identity-verification:review` tidak memberi akses.
- **BR-008:** Preview Selfie/KTP hanya diterbitkan setelah tindakan eksplisit actor berizin, terikat
  pada viewer, sekali pakai, kedaluwarsa singkat, dan wajib memvalidasi ulang file
  `FINALIZED`, `CLEAN`, aktif, serta belum diganti/dihapus.
- **BR-009:** Profil customer umum tidak memuat gambar, object key, token preview, atau PII identitas.
  Authorization, view, decision, dan deletion dokumen wajib diaudit. Tidak ada MFA pada workflow
  ini.

### Paket, Pembayaran, dan Expiry

- **BR-010:** Satu Package memiliki tepat satu Branch dan satu ClassType.
- **BR-011:** Customer/Admin mengunggah bukti transfer; file dipindai dan tidak boleh public.
- **BR-012:** Manager atau Super Owner sesuai permission dapat approve/reject purchase.
- **BR-013:** Approval secara atomik mengaktifkan CustomerPackage, menentukan activation/expiry date, menyimpan sale price, dan menambah ledger `PURCHASE`.
- **BR-014:** Expiry dihitung dari activation date menggunakan duration pada snapshot Package saat approval.
- **BR-015:** Saat expiry tercapai, unused session hangus untuk availability; histori ledger tetap utuh. Pemulihan hanya melalui approved manual adjustment.
- **BR-016:** Perubahan Package master tidak mengubah CustomerPackage yang telah dibeli.

### Booking dan Session Reservation

- **BR-020:** Jalur utama adalah Customer self-booking; Admin assistance wajib diaudit.
- **BR-021:** Booking hanya diizinkan untuk CustomerPackage aktif, Branch/ClassType cocok, available session ≥1, slot `PUBLISHED`/`CONFIRMED`, kapasitas tersedia, dan waktu belum H-2.
- **BR-022:** Booking sukses membuat tepat satu active reservation; tidak membuat ledger debit.
- **BR-023:** Pembuatan booking/reservation dan capacity allocation harus atomik serta aman terhadap concurrent request/retry.
- **BR-024:** Active reservation dilepas ketika booking dibatalkan/reschedule/auto-cancel sesuai rule, atau dikonsumsi saat attendance diposting.
- **BR-025:** Idempotency key mencegah duplicate booking akibat retry.
- **BR-026:** MVP tidak menawarkan `trial class`. CTA publik hanya boleh mengarahkan
  pengguna ke katalog jadwal atau autentikasi. Booking tetap memerlukan
  CustomerPackage aktif sesuai BR-021. Fitur trial baru boleh diperkenalkan setelah
  keputusan produk terpisah menyetujui eligibility, harga, batas pemakaian,
  cancellation/no-show, entitlement, reporting, dan audit.

### Availability, Timetable, dan Class Lifecycle

- **BR-030:** Instructor hanya mengajukan availability untuk cabang assignment-nya; konflik lintas cabang/waktu ditolak.
- **BR-031:** Admin/Super Owner dapat assign instructor sesuai cabang, availability, dan bebas konflik.
- **BR-032:** Minimum quota adalah snapshot rule per class/branch; perubahan master tidak retroaktif pada slot yang telah dipublish kecuali tindakan eksplisit dan diaudit.
- **BR-033:** State utama: `DRAFT → PUBLISHED → CONFIRMED → COMPLETED`; jalur pembatalan `PUBLISHED → AUTO_CANCELLED` dan manual cancellation melalui action berizin.
- **BR-034:** Scheduler mengevaluasi quota tepat H-24 menggunakan timezone Branch.
- **BR-035:** Jika booking aktif di bawah minimum, slot menjadi `AUTO_CANCELLED`, reservation dilepas, ledger refund hanya dibuat jika sebelumnya ada debit yang valid, dan notifikasi dibuat idempotent.
- **BR-036:** Jika quota terpenuhi, slot menjadi `CONFIRMED`; booking tambahan tetap dibuka sampai H-2 atau capacity penuh.

### Check-in dan Attendance

- **BR-040:** Instructor QR aktif sekitar 30 menit sebelum kelas; token single-purpose, short-lived, signed, dan terikat pada ClassSlot.
- **BR-041:** Matched Instructor check-in menghasilkan paling banyak satu InstructorHourLog bernilai satu jam untuk ClassSlot.
- **BR-042:** Customer check-in memakai authenticated deep link/in-app action, bukan QR.
- **BR-043:** Admin dapat backfill customer yang hadir sampai H+2; alasan dan aktor wajib diaudit.
- **BR-044:** Saat class completion, setiap Customer yang hadir menghasilkan satu ledger `ATTEND` (-1), reservation dikonsumsi, dan proses idempotent.
- **BR-045:** Booking tanpa attendance tidak otomatis memotong sesi; exception hanya melalui approved adjustment sesuai policy.

### Reschedule dan Adjustment

- **BR-050:** Reschedule diajukan Customer dan disetujui Admin/Super Owner sesuai permission.
- **BR-051:** Request pada atau sebelum H-24 melepaskan reservation lama dan membuat booking/reservation baru secara atomik jika target valid.
- **BR-052:** Request kurang dari H-24 ditolak tanpa mutasi booking/reservation; UI mengarahkan Customer menghubungi studio. Pengembalian hak hanya melalui SessionAdjustRequest oleh Admin dan approval Manager/Super Owner.
- **BR-053:** Approved manual adjustment membuat entry append-only `ADJUST_MANUAL` dengan alasan, requestor, approver, dan reference.
- **BR-054:** Requestor tidak boleh approve request-nya sendiri apabila memiliki lebih dari satu role.

### Financial dan Monthly Close

- **BR-060:** Omset periode adalah sale price paket yang approved dalam bulan/cabang tersebut.
- **BR-061:** Projection cost disnapshot saat purchase approval menggunakan rate effective untuk Branch/ClassType.
- **BR-062:** Realtime instructor cost berasal dari matched check-in × fee effective untuk Instructor/Branch/ClassType.
- **BR-063:** OtherCost hanya dapat dibuat/diubah untuk periode `OPEN`.
- **BR-064:** Profit = revenue - projection cost - other cost. Realtime cost tetap laporan operasional/pembayaran instructor dan disnapshot terpisah.
- **BR-065:** Monthly close dilakukan per Branch dan period; close menyimpan snapshot serta mengunci data keuangan terkait.
- **BR-066:** Periode locked tidak diedit. Koreksi dicatat di periode berjalan melalui CorrectionJournal dan approval Super Owner.
- **BR-067:** Close dan correction harus transactional, idempotent, serta diaudit.

### Notification, Audit, dan Historis

- **BR-070:** Meta Cloud API digunakan melalui provider adapter; status request/delivery disimpan tanpa menyimpan credential pada log.
- **BR-071:** Notification occurrence memiliki idempotency key unik berdasarkan recipient, event, reference, dan schedule occurrence.
- **BR-072:** Kegagalan WhatsApp diretry dengan bounded exponential backoff; setelah batas retry masuk dead-letter/operational alert dan dapat memakai fallback in-app.
- **BR-073:** Audit wajib mencatat actor, action, object, branch, before/after yang aman, reason, timestamp, correlation ID, dan source.
- **BR-074:** Data transaksi, ledger, audit, close, dan correction tidak dihapus secara hard delete.
- **BR-075:** Semua waktu disimpan UTC; rule waktu dihitung memakai IANA timezone Branch.
- **BR-076:** Email transaksional memakai occurrence/attempt idempotent; SMTP acceptance tidak disebut delivered.
- **BR-077:** Failure terminal email bisnis membuat persisted in-app fallback dan operational evidence tanpa silent success.
- **BR-078:** Reminder saldo dibuat sekali per CustomerPackage pada available 3, 1, dan 0; reminder expiry sekali pada branch-local H-7, H-3, dan H-1.
- **BR-079:** Recipient dan template variables sensitif diantrikan terenkripsi; API/log/audit hanya memakai recipient masked/hash dan safe error category.

## 5. Permission Matrix MVP

| Action | Customer | Instructor | Admin | Manager | Owner | Super Owner | Finance |
|---|---:|---:|---:|---:|---:|---:|---:|
| Purchase package self | Y | - | - | - | - | - | - |
| Assisted purchase/booking/check-in | - | - | Y | - | - | Y | - |
| Approve package | - | - | - | Y | - | Y | - |
| Self-book/reschedule request | Y | - | - | - | - | - | - |
| Approve reschedule | - | - | Y | - | - | Y | - |
| Request/approve session adjust | - | - | Request | Approve | - | Approve | - |
| Availability/Instructor check-in | - | Y | - | - | - | - | - |
| Assign instructor to slot | - | - | Y | - | - | Y | - |
| Assign owner/instructor to branch | - | - | - | - | - | Y | - |
| View identity verification | Own submission | - | - | - | - | Y / global reviewer | - |
| Decide/delete identity verification | - | - | - | - | - | Sesuai capability global | - |
| Set master fee/rate/quota | - | - | - | - | - | Y | - |
| View financial report | - | - | - | - | Own branch | All | All |
| Input OtherCost | - | - | - | - | - | Y | Y |
| Monthly close | - | - | - | - | - | Y | Y |
| Approve correction | - | - | - | - | - | Y | - |

## 6. Non-functional Requirements

- **NFR-001 Security:** TLS, encryption at rest where supported, least privilege, secret manager, OWASP controls, audit, and dependency scanning.
- **NFR-002 Availability:** target MVP 99.5% monthly excluding planned maintenance; scheduled backup and tested restore.
- **NFR-003 Performance:** p95 read API <500 ms dan command API <1 s pada beban pilot, di luar latency provider eksternal.
- **NFR-004 Reliability:** financial/ledger command memakai database transaction, constraint, idempotency, dan retry-safe design.
- **NFR-005 Accessibility:** web/mobile critical flow memenuhi WCAG 2.2 AA sejauh applicable.
- **NFR-006 Observability:** structured log, metrics, tracing/correlation ID, alert untuk scheduler/queue/API/error rate.
- **NFR-007 Privacy:** data minimization, consent, retention, access review, incident response, dan audit access PII.
- **NFR-008 Compatibility:** web mendukung dua versi terakhir browser utama; mobile device matrix ditetapkan sebelum UAT.

## 7. Open Questions Terkendali

Item berikut harus diisi Product Owner sebelum story terkait berstatus READY, tetapi tidak mengubah baseline arsitektur:

- Nilai fee, projection rate, quota, capacity, package duration, dan harga aktual.
- Window akhir Customer check-in sebelum/selama kelas.
- Alasan/approval manual cancellation oleh studio.
- Retention period untuk bukti bayar, notification payload, dan audit detail.
- Cabang pilot hasil readiness assessment.

Setiap item dikelola sebagai `DEC-004` sampai `DEC-010` pada [Source Reconciliation & Decision Backlog](../governance/04-reconciliation-and-decisions.md). Nilai yang belum disetujui berstatus `TBD-BLOCKING`; angka contoh atau default non-production tidak boleh dianggap keputusan bisnis.
