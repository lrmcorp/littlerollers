# 📄 STANDAR OPERASIONAL PROSEDUR (SOP) 03
## Presensi Instruktur, Fallback Manual CCTV, & Proteksi Honor Mengajar
**Target Pengguna:** Instruktur / Coach Pilates & Staf Meja Depan (Front Desk)  
**Tujuan:** Memastikan kehadiran instruktur tercatat akurat, mengatasi kendala teknis smartphone di studio, dan mencegah penahanan honor mengajar oleh tim Finance (*SEC-10 Payroll Lock Guard*).

---

### 1. Presensi Mandiri via Scan QR (Jalur Standar / Happy Path)
1. Instruktur tiba di studio maksimal **15–30 menit sebelum sesi kelas dimulai**.
2. Buka aplikasi Daily Dose di smartphone instruktur & login menggunakan akun coach.
3. Klik tombol **`"Presensi Kelas"`** & beri izin akses lokasi (GPS) pada browser/aplikasi.
4. Hadapkan kamera smartphone ke QR Code dinamis yang terpajang di meja resepsionis studio.
5. **Aturan Validasi Geofence & Waktu (Keputusan Bisnis #7):**
   * Lokasi instruktur harus berada di dalam radius **150 meter** dari koordinat studio.
   * Jendela waktu presensi: Dimulai sejak **H-30 menit** sebelum kelas s/d **H+10 menit** setelah kelas dimulai.
   * *Jika scan dilakukan > 30 menit sebelum kelas, sistem menolak dengan pesan: "Presensi terlalu awal. Buka kembali saat mendekati jadwal kelas".*
6. **Hasil:** Banner hijau muncul: *"Presensi berhasil dicatat pada [HH:mm]. Selamat mengajar!"*. Honor mengajar otomatis berstatus valid (*Verified*).

---

### 2. Prosedur Fallback Presensi Manual (Saat HP Instruktur Lowbat / Rusak)
* **Situasi:** Coach Sarah sudah hadir fisik di studio Green Garden dan siap memandu kelas, tetapi baterai smartphone miliknya habis (0%) atau kamera rusak sehingga tidak bisa scan QR.
* **Tindakan Staf Front Desk (Rini):**
  1. Staf meja depan membuka menu **`Jadwal Kelas`** (`/classes`).
  2. Buka detail kelas yang sedang / akan berlangsung yang diajar oleh Coach Sarah.
  3. Klik tombol **`"Verifikasi Presensi Instruktur"`**.
  4. Pada formulir catatan audit, kasir **WAJIB** memasukkan alasan verifikasi manual:  
     Contoh: *"Instruktur Coach Sarah hadir fisik memandu kelas Reformer. Presensi diverifikasi manual oleh Front Desk Rini berdasarkan pantauan langsung dan rekaman CCTV studio jam 09:45 WIB."*
  5. Klik **`"Simpan Verifikasi Presensi"`**.
  6. **Hasil:** Sistem mencatat metode `MANUAL_FRONTDESK`. Tombol ini idempoten (jika kasir tidak sengaja mengklik 2 kali, sistem tidak akan menduplikasi pencatatan).
  7. **PENTING (SEC-09 Anti-Self Verification):**  
     Instruktur dilarang memverifikasi presensinya sendiri secara manual. Hanya staf meja depan atau Studio Manager yang berwenang melakukan bypass manual.

---

### 3. Dampak Jika Sesi Selesai Tanpa Presensi (SEC-10 Payroll Blocker)
* Jika sebuah kelas telah berstatus `COMPLETED` namun presensi instruktur kosong (tidak ada scan QR dan staf lupa verifikasi manual):
  1. Pada dashboard Finance (`/finance`), kartu **`"Belum Terverifikasi Presensi"`** otomatis menyala warna oranye dengan nilai honor tertahan (misal: `Rp 250.000 - 1 kelas`).
  2. Banner peringatan oranye tegas muncul:  
     > ⚠️ *"1 kelas senilai Rp 250.000 belum memiliki presensi instruktur. Verifikasi dari menu Kelas sebelum honor dicairkan."*
  3. **Tim Finance Daniel TIDAK AKAN mencairkan transfer honor** tersebut ke rekening bank instruktur hingga kasir/manager memvalidasi CCTV.
* **Solusi Cepat:** Kasir segera membuka detail kelas tersebut di `/classes`, memasukkan catatan CCTV, dan mengklik tombol verifikasi presensi instruktur. Seketika status unverified hilang dan honor sah dicairkan.
