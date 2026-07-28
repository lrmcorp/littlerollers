# Reschedule Customer Runbook

**Status:** PRODUCTION ACTIVATION BLOCKED — menunggu PO/TL/QA/Ops dan UAT

## Policy dan queue

- Request sebelum atau tepat H-24 diterima; setelah boundary ditolak tanpa mutasi dan Customer diarahkan menghubungi studio.
- Reservation tetap pada kelas sumber selama `PENDING`. Admin cabang atau Super Owner memproses queue; requester tidak boleh meng-approve request sendiri.
- Approval selalu merevalidasi status/capacity target, package, reservation, duplicate customer booking dan booking version. Kegagalan tidak boleh memindahkan reservation sumber.

## Penanganan operasional

1. Periksa queue tertua, source/target, alasan, branch dan status kelas.
2. Jika target masih eligible, approve dengan alasan terkontrol. Jika tidak, reject memakai alasan paling tepat dan arahkan Customer memilih jadwal lain.
3. Untuk `SELF_APPROVAL_FORBIDDEN`, gunakan approver lain; jangan mengubah role atau data langsung.
4. Untuk `DUPLICATE_ACTIVE_BOOKING`, pertahankan request/source dan periksa booking target yang dibuat selama pending sebelum memutuskan ulang.
5. Untuk request setelah H-24, jangan membuat reschedule manual langsung. Gunakan proses bantuan studio dan adjustment terpisah bila disetujui kebijakan.
6. Gunakan occurrence ID/correlation ID untuk memeriksa notifikasi. Jangan menyalin email, token, atau payload sensitif ke tiket.

## Aktivasi dan rollback VPS

1. Sebelum migrasi, jalankan preflight `SELECT customerUserId, classSlotId, COUNT(*) FROM Booking WHERE status IN ('BOOKED','RESCHEDULE_PENDING') GROUP BY customerUserId, classSlotId HAVING COUNT(*) > 1;`; hasil wajib kosong dan data tidak boleh dihapus otomatis.
2. Deploy dan migrasikan dengan `BOOKING_ENABLED=false` dan `RESCHEDULE_ENABLED=false`.
3. Jalankan smoke test/UAT menggunakan data dan mailbox yang disetujui.
4. Setelah sign-off, set cutoff `2/24`, aktifkan booking lalu reschedule, dan restart service terkontrol.
5. Pantau queue age, conflict, audit/outbox, projection, email occurrence dan terminal failure selama 24 jam.
6. Rollback dengan `RESCHEDULE_ENABLED=false`. Jangan menghapus request, audit, event, notification atau occurrence yang sudah tersimpan.
