#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bilingual Database Architecture & Data Dictionary Generator for Daily Dose Pilates V2.
Produces an interactive, comprehensive HTML documentation and exports it to PDF via Headless Chrome.
Now includes comprehensive business purposes, workflow actors, and architectural rationale for all 97 models.
"""

import glob
import os
import sys
import re
import json
import subprocess

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from model_purposes import MODEL_PURPOSES

WORKSPACE_ROOT = '/Users/lrmcorporation/Documents/Website/dailydose_v2'
SCHEMA_DIR = os.path.join(WORKSPACE_ROOT, 'apps/api/prisma/schema')
DOCS_DIR = os.path.join(WORKSPACE_ROOT, 'docs')
OUTPUT_HTML = os.path.join(DOCS_DIR, 'DailyDose_V2_Kamus_Data_dan_Desain_Database.html')
OUTPUT_PDF = os.path.join(DOCS_DIR, 'DailyDose_V2_Kamus_Data_dan_Desain_Database.pdf')

DOMAIN_METADATA = {
    'master.prisma': {
        'order': 1,
        'code': 'DOM-01',
        'title': 'Master Data & Struktur Fasilitas Studio',
        'badge': 'Core Master',
        'desc': 'Mengelola entitas dasar studio Pilates: unit cabang operasional, gedung studio, ruangan fisik reformer/mat, jam operasional, jenis kelas (Private/Group/Duet), serta profil publik situs.',
        'diagram_title': 'Relasi Master Data, Cabang & Ruangan Studio',
        'diagram': """+-------------------------+        +--------------------------+
|         Cabang          | 1    * |   JamOperasionalCabang   |
| (Unit Cabang Studio DD) |+------>| (Jadwal Buka/Tutup Cabang|
+-------------------------+        +--------------------------+
       | 1             | 1
       |               +-----------------------+
       | *                                     | *
+-------------------------+        +--------------------------+
|         Studio          |        | CakupanCabangJenisKelas  |
| (Identitas Gedung/Area) |        | (Ketersediaan Jenis      |
+-------------------------+        |  Kelas di Tiap Cabang)   |
       | 1                         +--------------------------+
       | *                                     | *
+-------------------------+                    | 1
|         Ruangan         |        +--------------------------+
| (Kapasitas Bed Reformer)|        |        JenisKelas        |
+-------------------------+        | (Group, Private, Duet)   |
                                   +--------------------------+
                                               | 1
                                               | *
                                   +--------------------------+
                                   |KonfigurasiJenisKelasCabag|
                                   | (Durasi, Batas Cancel)   |
                                   +--------------------------+"""
    },
    'identity.prisma': {
        'order': 2,
        'code': 'DOM-02',
        'title': 'Identitas, Autentikasi & Hak Akses (RBAC)',
        'badge': 'Security & RBAC',
        'desc': 'Mengontrol sistem akun tunggal (Single Identity), otentikasi password & Google OAuth, manajemen sesi, sistem izin Role-Based Access Control (RBAC) berbasis kapabilitas, serta verifikasi KTP/Selfie (KYC).',
        'diagram_title': 'Relasi Identitas, Role, Sesi & Verifikasi KYC',
        'diagram': """   +-----------------------+            +-----------------------+
   |   ProfilPengguna      | 1        1 |         User          |
   | (Data Diri, Kontak)   |<---------->| (Identitas Akun Utama)|
   +-----------------------+            +-----------------------+
                                           | 1            | 1
                      +--------------------+              +--------------------+
                      | *                                 | *                  | *
   +-----------------------+            +-----------------------+   +-----------------------+
   |      UserSession      |            | DokumenVerifikasiId   |   |   AccessRoleAssign    |
   | (Sesi Login Web/App)  |            | (Foto KTP & Selfie)   |   | (Penetapan Peran Staf)|
   +-----------------------+            +-----------------------+   +-----------------------+
                                                                               | *
                                                                               | 1
                                                                    +-----------------------+
                                                                    |    RoleDefinition     |
                                                                    | (Owner, Admin, Cust..)|
                                                                    +-----------------------+
                                                                               | 1
                                                                               | *
                                                                    +-----------------------+
                                                                    |    RoleCapability     |
                                                                    | (Izin Akses Fitur)    |
                                                                    +-----------------------+"""
    },
    'packages.prisma': {
        'order': 3,
        'code': 'DOM-03',
        'title': 'Paket Membership, Pembayaran & Voucher',
        'badge': 'Billing & Packages',
        'desc': 'Katalog paket sesi Pilates, order pembelian (invoice), reservasi kode unik transfer, verifikasi bukti pembayaran bank, voucher diskon promosi, hingga aktivasi kuota saldo sesi customer.',
        'diagram_title': 'Relasi Pembelian Paket, Voucher, Pembayaran & Kuota',
        'diagram': """+-----------------------+ 1    * +-----------------------+
|         Paket         |+------>|      RevisiPaket      |
| (Katalog Paket Sesi)  |        | (Jejak Historis Harga)|
+-----------------------+        +-----------------------+
       | 1
       | *
+-----------------------+ 1    * +-----------------------+
|       Pembelian       |+------>|    BuktiPembayaran    |
| (Invoice Pemesanan)   |        | (Struk Transfer Bank) |
+-----------------------+        +-----------------------+
       | 1
       | 1
+-----------------------+ 1    * +-----------------------+
|    PaketPelanggan     |+------>|     ReservasiSesi     |
| (Saldo Kuota Sesi DD) |        | (Kaitan ke Booking)   |
+-----------------------+        +-----------------------+
       ^
       | *
+-----------------------+ 1    * +-----------------------+
|        Voucher        |+------>|   PenukaranVoucher    |
| (Kupon Diskon Promo)  |        | (Jejak Pakai Voucher) |
+-----------------------+        +-----------------------+"""
    },
    'classes.prisma': {
        'order': 4,
        'code': 'DOM-04',
        'title': 'Penjadwalan Kelas & Instruktur',
        'badge': 'Scheduling',
        'desc': 'Manajemen slot jadwal kelas studio harian, penetapan instruktur pengajar, kuota kapasitas peserta, status publikasi jadwal, serta ketersediaan shift kerja instruktur mingguan.',
        'diagram_title': 'Relasi Jadwal Slot Kelas, Instruktur & Ruangan',
        'diagram': """+-----------------------+        +-----------------------+
|        Ruangan        |        |   JenisKelas Studio   |
| (Ruangan Studio)      |        | (Tipe Kelas Pilates)  |
+-----------------------+        +-----------------------+
       | 1                                  | 1
       | *                                  | *
+--------------------------------------------------------+
|                       SlotKelas                        |
| (Jadwal Kelas: Tanggal, Jam Mulai, Instruktur, Kuota)  |
+--------------------------------------------------------+
       ^                                    | 1
       | *                                  | *
+-----------------------+        +-----------------------+
| KetersediaanInstruktur|        |    PemesananKelas     |
| (Shift Kerja Coach)   |        | (Booking Peserta DD)  |
+-----------------------+        +-----------------------+"""
    },
    'bookings.prisma': {
        'order': 5,
        'code': 'DOM-05',
        'title': 'Pemesanan Kelas & Kuota Sesi (Bookings)',
        'badge': 'Bookings Engine',
        'desc': 'Alur pemesanan tiket kelas oleh member, penguncian saldo sesi (hold reservation), daftar peserta kelas, riwayat reschedule (ubah jadwal), penyesuaian kompensasi kuota sesi manual, serta ulasan bintang.',
        'diagram_title': 'Relasi Pemesanan Tiket, Kuota Sesi, Reschedule & Presensi',
        'diagram': """+-----------------------+ 1    * +-----------------------+
|       SlotKelas       |+------>|    PemesananKelas     |
| (Jadwal Kelas Studio) |        | (Tiket Booking Member)|
+-----------------------+        +-----------------------+
                                            | 1
                      +---------------------+---------------------+
                      | 1                                         | 1
                      | *                                         | *
   +-----------------------+                   +-----------------------+
   |     ReservasiSesi     |                   |      UbahJadwal       |
   | (Hold Kuota Paket DD) |                   | (Jejak Pindah Jadwal) |
   +-----------------------+                   +-----------------------+
                      | 1                                         | 1
                      | 1                                         | 1
   +-----------------------+                   +-----------------------+
   |   KehadiranPelanggan  |                   |    UlasanPemesanan    |
   | (Presensi QR Masuk)   |                   | (Rating & Review)     |
   +-----------------------+                   +-----------------------+"""
    },
    'attendance.prisma': {
        'order': 6,
        'code': 'DOM-06',
        'title': 'Presensi Digital QR & Jam Kerja Instruktur',
        'badge': 'Attendance & QR',
        'desc': 'Sistem token QR dinamis (anti-screenshot) untuk check-in kedatangan member di resepsionis studio, pencatatan presensi tepat waktu/terlambat, dan rekapitulasi jam kerja mengajar instruktur bulanan.',
        'diagram_title': 'Relasi Token QR, Presensi Member & Jam Instruktur',
        'diagram': """+-----------------------+        +-----------------------+
|     CheckInToken      |        |   InstructorToken     |
| (QR Member Dinamis)   |        | (QR Presensi Instruktur)
+-----------------------+        +-----------------------+
       | 1                                  | 1
       v 1                                  v 1
+-----------------------+        +-----------------------+
|  KehadiranPelanggan   |        |  KehadiranInstruktur  |
| (Validasi di Scanner) |        | (Jam Datang & Pulang) |
+-----------------------+        +-----------------------+
                                            | *
                                            v 1
                                 +-----------------------+
                                 |  RekapJamInstruktur   |
                                 | (Total Jam & Payroll) |
                                 +-----------------------+"""
    },
    'finance.prisma': {
        'order': 7,
        'code': 'DOM-07',
        'title': 'Finansial, Buku Besar & Akuntansi Jurnal',
        'badge': 'Accounting',
        'desc': 'Sistem akuntansi berpasangan (Double-Entry Bookkeeping): Bagan Akun (Chart of Accounts), bukti jurnal umum, baris buku besar debit/kredit, beban operasional cabang, dan snapshot tutup buku bulanan.',
        'diagram_title': 'Relasi Akun Akuntansi, Jurnal & Buku Besar',
        'diagram': """+-----------------------+ 1    * +-----------------------+
|     AkunAkuntansi     |+------>|     EntriBukuBesar    |
| (Kas, Bank, Modal..)  |        | (Baris Debit/Kredit)  |
+-----------------------+        +-----------------------+
                                            ^ *
                                            | 1
                                 +-----------------------+
                                 |      EntriJurnal      |
                                 | (Voucher Transaksi)   |
                                 +-----------------------+
                                            ^ 1
                                            | 1
                                 +-----------------------+
                                 |       BiayaLain       |
                                 | (Beban Servis/Listrik)|
                                 +-----------------------+"""
    },
    'operations.prisma': {
        'order': 8,
        'code': 'DOM-08',
        'title': 'Operasional Harian, Notifikasi & Layanan Bantuan',
        'badge': 'Operations & CRM',
        'desc': 'Infrastruktur operasional sistem: transactional outbox events, evaluasi kuota expired terjadwal, rate limiting, audit log aktivitas staf, tiket bantuan pelanggan (helpdesk), dan manajemen konten dinamis (CMS).',
        'diagram_title': 'Relasi Operasional, Notifikasi, Tiket Bantuan & Audit',
        'diagram': """+-----------------------+        +-----------------------+
|     Notification      |        |     KasusBantuan      |
| (Email/WA Reminder)   |        | (Tiket Komplain CS)   |
+-----------------------+        +-----------------------+
       | 1                                  | 1
       v *                                  v *
+-----------------------+        +-----------------------+
|  NotificationAttempt  |        |  CatatanKasusBantuan  |
| (Log Gateway Kirim)   |        | (Riwayat Respon CS)   |
+-----------------------+        +-----------------------+
                                            ^
+-----------------------+                   |
|       AuditLog        |                   |
| (Jejak Aksi Admin/Staf|-------------------+"""
    },
    'v1_migration.prisma': {
        'order': 9,
        'code': 'DOM-09',
        'title': 'Engine Migrasi & Rekonsiliasi Data V1-V2',
        'badge': 'Migration Engine',
        'desc': 'Infrastruktur pemindahan data dari database Daily Dose V1 ke V2: pencatatan batch migrasi, pemetaan kunci lama ke UUID baru, penampung anomali/reject, angka kontrol rekonsiliasi total, dan delta sync transaksi transisi.',
        'diagram_title': 'Relasi Staging Migrasi, Pemetaan Kunci & Rekonsiliasi',
        'diagram': """+-----------------------+ 1    * +-----------------------+
|    MigrationBatch     |+------>|   MigrationSourceKey  |
| (Sesi Eksekusi Batch) |        | (ID V1 ➔ UUID V2)     |
+-----------------------+        +-----------------------+
       | 1
       +-----------------------+-----------------------+
       | *                     | *                     | *
+-----------------------+ +-----------------------+ +-----------------------+
|    MigrationReject    | | MigrationControlTotal | |  MigrationResolution  |
| (Data Anomali Ditolak)| | (Kontrol Saldo Klop)  | | (Penyelesaian Manual) |
+-----------------------+ +-----------------------+ +-----------------------+"""
    }
}

# Kamus Istilah Kolom Teknis & Bisnis
FIELD_DICTIONARY = {
    'id': ('ID Entitas (UUID / Kunci Primer)', 'Teknis - EN', 'Identitas unik untuk setiap baris rekaman dalam tabel.'),
    'uuid': ('Kode UUID Unik', 'Teknis - EN', 'Pengenal unik acak standar industri (Universally Unique Identifier).'),
    'createdAt': ('Waktu Dibuat', 'Teknis - EN', 'Timestamp pencatatan awal baris data ke dalam database.'),
    'updatedAt': ('Waktu Terakhir Diperbarui', 'Teknis - EN', 'Timestamp saat data terakhir kali mengalami pembaruan sistem.'),
    'deletedAt': ('Waktu Dihapus (Soft Delete)', 'Teknis - EN', 'Timestamp penanda data telah dinonaktifkan tanpa dihapus fisik.'),
    'version': ('Nomor Versi Konkurensi', 'Teknis - EN', 'Penanda Optimistic Concurrency Control untuk mencegah tabrakan data.'),
    'idempotencyKeyHash': ('Hash Kunci Idempoten', 'Teknis - EN', 'Hash anti-duplikasi permintaan pembayaran atau transaksi.'),
    'payload': ('Data Muatan (JSON Payload)', 'Teknis - EN', 'Struktur data objek mentah dalam format JSON.'),
    'slug': ('Slug Tautan URL Ramah SEO', 'Teknis - EN', 'Teks pengenal unik berbasis huruf kecil dan tanda hubung untuk URL.'),
    'token': ('Token Rahasia / Kunci Sesi', 'Teknis - EN', 'Rangkaian karakter acak kriptografis untuk otentikasi.'),
    'checksum': ('Nilai Checksum Integritas', 'Teknis - EN', 'Hash pemverifikasi keutuhan berkas digital.'),
    'objectKey': ('Kunci Objek Penyimpanan Cloud', 'Teknis - EN', 'Jalur lokasi berkas di dalam bucket penyimpanan S3 / MinIO.'),
    'mimeType': ('Tipe Media Digital', 'Teknis - EN', 'Format ekstensi berkas digital (contoh: image/jpeg, application/pdf).'),
    'sizeBytes': ('Ukuran Berkas (Byte)', 'Teknis - EN', 'Kapasitas ukuran data berkas dalam satuan byte.'),
    'role': ('Kode Peran Otorisasi', 'Teknis - EN', 'Identifikasi peran wewenang sistem (SUPER_OWNER, ADMIN, CUSTOMER).'),
    'capability': ('Kode Kapabilitas Akses', 'Teknis - EN', 'Kode izin granular (contoh: branch:read, payment:verify).'),
    'action': ('Jenis Tindakan Audit', 'Teknis - EN', 'Klasifikasi aksi yang dilakukan pengguna (CREATE, UPDATE, DELETE).'),
    
    # Bisnis & Studio
    'nama': ('Nama Resmi', 'Bisnis - ID', 'Nama lengkap dari entitas (nama cabang, studio, ruangan, atau nama orang).'),
    'name': ('Nama Resmi', 'Bisnis - ID', 'Nama entitas dalam bahasa Inggris atau nama teknis sistem.'),
    'kode': ('Kode Singkat Identifikasi', 'Bisnis - ID', 'Singkatan atau kode resmi (contoh: Cabang "JKT-01").'),
    'code': ('Kode Singkat Identifikasi', 'Bisnis - ID', 'Kode unik identifikasi entitas.'),
    'deskripsi': ('Deskripsi & Catatan Lengkap', 'Bisnis - ID', 'Penjelasan rinci mengenai fasilitas, paket, atau ketentuan layanan.'),
    'description': ('Deskripsi & Keterangan', 'Bisnis - ID', 'Penjelasan rinci mengenai entitas.'),
    'alamat': ('Alamat Fisik Lengkap', 'Bisnis - ID', 'Alamat surat-menyurat atau lokasi fisik fasilitas studio.'),
    'address': ('Alamat Fisik Lengkap', 'Bisnis - ID', 'Alamat fisik lokasi.'),
    'nomorTelepon': ('Nomor Telepon Kontak', 'Bisnis - ID', 'Nomor kontak telepon atau WhatsApp operasional.'),
    'phoneNumber': ('Nomor Telepon Kontak', 'Bisnis - ID', 'Nomor telepon yang dapat dihubungi format E.164.'),
    'email': ('Alamat Email Resmi', 'Bisnis - ID', 'Alamat pos elektronik untuk korespondensi dan login akun.'),
    'status': ('Status Operasional / Transaksi', 'Bisnis - ID', 'Kondisi aktifitas (contoh: ACTIVE, INACTIVE, PENDING, COMPLETED).'),
    'aktif': ('Status Aktif / Nonaktif', 'Bisnis - ID', 'Nilai kebenaran (True/False) penanda status operasional.'),
    'isActive': ('Status Aktif / Nonaktif', 'Bisnis - ID', 'Status kelayakan atau operasional entitas.'),
    
    # Finansial & Pembayaran
    'hargaRp': ('Harga Dasar (Rupiah)', 'Bisnis - ID', 'Nilai nominal uang standar dalam mata uang Rupiah (IDR).'),
    'priceRp': ('Harga Dasar (Rupiah)', 'Bisnis - ID', 'Nominal harga paket atau tarif kelas sebelum diskon.'),
    'jumlahSesi': ('Total Kuota Sesi Latihan', 'Bisnis - ID', 'Banyaknya sesi latihan pilates yang didapatkan dalam paket.'),
    'sessionCount': ('Total Kuota Sesi Latihan', 'Bisnis - ID', 'Jumlah jatah sesi pertemuan yang diberikan.'),
    'masaBerlakuHari': ('Masa Aktif Paket (Hari)', 'Bisnis - ID', 'Durasi masa berlaku kuota sesi dihitung sejak pembelian/aktivasi.'),
    'validityDays': ('Masa Aktif Paket (Hari)', 'Bisnis - ID', 'Jumlah hari sebelum paket kedaluwarsa.'),
    'payableAmountRp': ('Total Tagihan Akhir (Rupiah)', 'Bisnis - ID', 'Jumlah uang yang wajib dibayar customer setelah diskon & kode unik.'),
    'discountAmountRp': ('Nominal Potongan Diskon (Rupiah)', 'Bisnis - ID', 'Besaran potongan harga dari voucher promo atau diskon cabang.'),
    'uniqueCode': ('3 Digit Kode Unik Transfer', 'Bisnis - ID', 'Angka acak (1-999) di ujung nominal transfer untuk identifikasi otomatis.'),
    'bankName': ('Nama Bank Tujuan', 'Bisnis - ID', 'Bank penerima transfer studio (contoh: BCA, Mandiri, BNI).'),
    'accountNumber': ('Nomor Rekening Bank', 'Bisnis - ID', 'Nomor rekening bank penampung resmi studio Daily Dose.'),
    'accountHolder': ('Nama Pemilik Rekening', 'Bisnis - ID', 'Nama pemilik sah rekening bank.'),
    
    # Kelas, Jadwal & Reservasi
    'classSlotId': ('ID Slot Jadwal Kelas', 'Teknis - EN', 'Relasi foreign key ke jadwal kelas spesifik.'),
    'instructorId': ('ID Instruktur Pengajar', 'Teknis - EN', 'Relasi ke akun instruktur Pilates yang mengajar kelas tersebut.'),
    'studioId': ('ID Studio Gedung', 'Teknis - EN', 'Relasi foreign key ke unit gedung studio.'),
    'roomId': ('ID Ruangan Kelas', 'Teknis - EN', 'Relasi foreign key ke ruangan studio (Reformer Room, Private Room).'),
    'startTime': ('Jam Mulai Kelas', 'Bisnis - ID', 'Waktu kelas dimulai.'),
    'endTime': ('Jam Selesai Kelas', 'Bisnis - ID', 'Waktu kelas berakhir.'),
    'capacity': ('Kapasitas Maksimal Ranjang', 'Bisnis - ID', 'Jumlah ranjang reformer atau peserta maksimum dalam satu sesi kelas.'),
    'bookedCount': ('Jumlah Peserta Terdaftar', 'Bisnis - ID', 'Banyaknya customer yang sudah memesan tempat pada slot kelas ini.'),
    'bookingId': ('ID Pemesanan Tiket', 'Teknis - EN', 'Relasi foreign key ke transaksi tiket booking.'),
    'reservationId': ('ID Reservasi Saldo Sesi', 'Teknis - EN', 'Relasi ke pemotongan saldo sesi pada kuota paket member.'),
    'rescheduleDeadlineMinutes': ('Batas Menit Ubah Jadwal', 'Bisnis - ID', 'Waktu minimal sebelum kelas untuk reschedule tanpa hangus (misal: 720 menit = 12 jam).'),
    'cancellationDeadlineMinutes': ('Batas Menit Pembatalan', 'Bisnis - ID', 'Waktu batas pembatalan reservasi agar kuota sesi dikembalikan.'),
    'bookingStatus': ('Status Tiket Booking', 'Bisnis - ID', 'Kondisi tiket (CONFIRMED, ATTENDED, CANCELLED, NO_SHOW).'),
    
    # Presensi & Kehadiran
    'checkInTime': ('Waktu Presensi Masuk', 'Bisnis - ID', 'Waktu presisi saat QR code pass customer berhasil diverifikasi scanner studio.'),
    'verifiedById': ('ID Staf Resepsionis', 'Teknis - EN', 'Relasi ke staf front desk yang memvalidasi kedatangan member.'),
    'minutesLate': ('Keterlambatan (Menit)', 'Bisnis - ID', 'Berapa menit peserta hadir terlambat setelah kelas dimulai.'),
    'instructorHours': ('Durasi Mengajar (Jam)', 'Bisnis - ID', 'Total durasi jam mengajar efektif instruktur untuk dasar kompensasi.'),
    
    # Customer Support & Tiket Bantuan
    'caseId': ('ID Kasus Bantuan', 'Teknis - EN', 'Nomor tiket keluhan atau pertanyaan customer.'),
    'subject': ('Judul Kasus Bantuan', 'Bisnis - ID', 'Topik kendala yang dialami pengguna (contoh: Kendala Bukti Bayar, Reschedule).'),
    'priority': ('Tingkat Prioritas Kasus', 'Bisnis - ID', 'Urgensi penanganan kasus: LOW, MEDIUM, HIGH, URGENT.'),
    'assignedUserId': ('ID Petugas Penanggung Jawab', 'Teknis - EN', 'Relasi ke staf admin yang ditugaskan menangani kasus tersebut.'),
    'resolvedAt': ('Waktu Kasus Diselesaikan', 'Bisnis - ID', 'Timestamp saat keluhan atau permintaan berhasil ditutup.'),
    'tags': ('Label Kategori Kasus', 'Bisnis - ID', 'Daftar tag JSON untuk klasifikasi topik kendala.'),
}

def guess_indonesian_field(field_name, field_type, db_col):
    """Memberikan tebakan cerdas terjemahan Bahasa Indonesia untuk field yang belum ada di kamus."""
    if field_name in FIELD_DICTIONARY:
        return FIELD_DICTIONARY[field_name]
    
    label = db_col if db_col and db_col != field_name else field_name
    category = 'Bisnis - ID'
    desc = 'Atribut pendukung proses bisnis domain terkait.'
    
    if field_name.endswith('Id'):
        category = 'Teknis - EN'
        target = field_name[:-2]
        label = f"ID Referensi {target}"
        desc = f"Kunci asing (foreign key) penunjuk relasi ke entitas {target}."
    elif field_name.endswith('At'):
        category = 'Teknis - EN'
        verb = field_name[:-2]
        label = f"Waktu {verb}"
        desc = f"Timestamp presisi saat kejadian {verb} berlangsung dalam sistem."
    elif field_name.endswith('RpSnapshot') or field_name.endswith('Rp'):
        category = 'Bisnis - ID'
        label = f"Nominal Rupiah ({field_name})"
        desc = "Nilai moneter dalam mata uang Rupiah (IDR)."
    elif field_name.startswith('is') or field_name.startswith('has'):
        category = 'Bisnis - ID'
        label = f"Status Bendera ({field_name})"
        desc = "Nilai boolean penanda kondisi aktif/nonaktif atau kelayakan."
    elif field_name.endswith('Hash') or field_name.endswith('Key') or field_name.endswith('Token'):
        category = 'Teknis - EN'
        label = f"Kunci / Token Teknis ({field_name})"
        desc = "Nilai kriptografi/token teknis untuk otentikasi, enkripsi, atau integritas data."
    elif field_name.endswith('Snapshot'):
        category = 'Bisnis - ID'
        label = f"Snapshot Historis ({field_name})"
        desc = "Salinan nilai data pada saat transaksi terjadi untuk integritas audit."
    
    return (label, category, desc)

def parse_prisma_schemas():
    """Membaca dan mem-parsing seluruh file skema Prisma."""
    domain_models = {}
    total_models = 0
    total_enums = 0
    
    for filename in sorted(os.listdir(SCHEMA_DIR)):
        if not filename.endswith('.prisma') or filename == 'base.prisma':
            continue
        
        filepath = os.path.join(SCHEMA_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        models = []
        enums = []
        
        # Parse enums
        enum_pattern = r'enum\s+(\w+)\s+\{([\s\S]*?)\}'
        for em in re.finditer(enum_pattern, content):
            name = em.group(1)
            values = [v.strip() for v in em.group(2).split('\n') if v.strip() and not v.strip().startswith('//')]
            enums.append({'name': name, 'values': values})
            total_enums += 1
            
        # Parse models
        model_pattern = r'model\s+(\w+)\s+\{([\s\S]*?)\n\}'
        for mm in re.finditer(model_pattern, content):
            model_name = mm.group(1)
            body = mm.group(2)
            total_models += 1
            
            # Cari @@map
            map_match = re.search(r'@@map\("([^"]+)"\)', body)
            db_table = map_match.group(1) if map_match else model_name
            
            fields = []
            for line in body.split('\n'):
                line_clean = line.strip()
                if not line_clean or line_clean.startswith('//') or line_clean.startswith('@@'):
                    continue
                
                parts = line_clean.split()
                if len(parts) < 2:
                    continue
                fname = parts[0]
                ftype = parts[1]
                
                # Cek relasi
                is_relation = '@relation' in line_clean or (
                    not ftype.replace('[]', '').replace('?', '') in [
                        'String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'Decimal', 'Bytes', 'BigInt'
                    ] and not any(e['name'] == ftype.replace('[]', '').replace('?', '') for e in enums)
                )
                
                # Cek @map
                fmap_match = re.search(r'@map\("([^"]+)"\)', line_clean)
                db_col = fmap_match.group(1) if fmap_match else fname
                
                is_pk = '@id' in line_clean
                is_uk = '@unique' in line_clean
                is_nullable = '?' in ftype
                
                default_val = '-'
                def_match = re.search(r'@default\(([^)]+)\)', line_clean)
                if def_match:
                    default_val = def_match.group(1)
                    
                id_name, category, desc = guess_indonesian_field(fname, ftype, db_col)
                
                fields.append({
                    'name': fname,
                    'type': ftype,
                    'db_col': db_col,
                    'is_relation': is_relation,
                    'is_pk': is_pk,
                    'is_uk': is_uk,
                    'is_nullable': is_nullable,
                    'default': default_val,
                    'id_name': id_name,
                    'category': category,
                    'desc': desc
                })
                
            models.append({
                'name': model_name,
                'db_table': db_table,
                'fields': fields,
                'scalar_fields': [f for f in fields if not f['is_relation']],
                'relation_fields': [f for f in fields if f['is_relation']]
            })
            
        domain_info = DOMAIN_METADATA.get(filename, {
            'order': 99,
            'code': 'DOM-EXT',
            'title': filename,
            'badge': 'External',
            'desc': 'Domain tambahan.',
            'diagram': ''
        })
        
        domain_models[filename] = {
            'meta': domain_info,
            'models': models,
            'enums': enums
        }
        
    return domain_models, total_models, total_enums

def generate_html():
    domain_models, total_models, total_enums = parse_prisma_schemas()
    sorted_domains = sorted(domain_models.items(), key=lambda x: x[1]['meta']['order'])
    
    html = f"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Kamus Data Dwibahasa & Pedoman Desain Database - Daily Dose Pilates V2</title>
<style>
  :root {{
    --dd-forest: #285740;
    --dd-forest-dark: #1d402f;
    --dd-forest-light: #3b7457;
    --dd-surface-muted: #f4f6f4;
    --dd-cream: #fbf9f5;
    --dd-cream-border: #ede8dc;
    --dd-ink: #111827;
    --dd-muted: #4b5563;
    --dd-line: #e5e7eb;
    --dd-amber: #d97706;
    --dd-blue: #2563eb;
    --dd-purple: #7c3aed;
  }}

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: var(--dd-ink);
    background-color: #faf9f6;
    line-height: 1.5;
    font-size: 13px;
  }}

  /* Top Navigation & Brand Header */
  header.brand-header {{
    background: linear-gradient(135deg, var(--dd-forest) 0%, var(--dd-forest-dark) 100%);
    color: #ffffff;
    padding: 36px 32px 30px 32px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.12);
  }}

  .header-container {{
    max-width: 1400px;
    margin: 0 auto;
  }}

  .brand-badge {{
    display: inline-block;
    background-color: rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 20px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }}

  h1.doc-title {{
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
    color: #ffffff;
  }}

  p.doc-subtitle {{
    font-size: 14px;
    color: #d1fae5;
    max-width: 960px;
    line-height: 1.6;
    margin-bottom: 24px;
  }}

  .metrics-bar {{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
  }}

  .metric-card {{
    background-color: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    padding: 12px 16px;
  }}

  .metric-val {{
    font-size: 22px;
    font-weight: 800;
    color: #ffffff;
  }}

  .metric-label {{
    font-size: 11.5px;
    color: #a7f3d0;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 600;
  }}

  /* Filter & Search Toolbar */
  .control-panel {{
    background-color: #ffffff;
    border-bottom: 1px solid var(--dd-line);
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }}

  .control-inner {{
    max-width: 1400px;
    margin: 0 auto;
    padding: 14px 32px;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
  }}

  .search-wrapper {{
    position: relative;
    flex: 1;
    min-width: 320px;
  }}

  .search-input {{
    width: 100%;
    padding: 10px 14px 10px 38px;
    border: 1px solid var(--dd-line);
    border-radius: 8px;
    font-size: 13px;
    outline: none;
    transition: all 0.2s;
    background-color: var(--dd-surface-muted);
  }}

  .search-input:focus {{
    border-color: var(--dd-forest);
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(40, 87, 64, 0.15);
  }}

  .search-icon {{
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    font-size: 14px;
  }}

  .domain-filters {{
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    align-items: center;
  }}

  .filter-btn {{
    background-color: var(--dd-surface-muted);
    border: 1px solid var(--dd-line);
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--dd-muted);
    cursor: pointer;
    transition: all 0.15s;
  }}

  .filter-btn:hover {{
    border-color: var(--dd-forest);
    color: var(--dd-forest);
  }}

  .filter-btn.active {{
    background-color: var(--dd-forest);
    border-color: var(--dd-forest);
    color: #ffffff;
  }}

  /* Main Container */
  main.main-content {{
    max-width: 1400px;
    margin: 28px auto;
    padding: 0 32px;
  }}

  /* Section Mengapa 97 Tabel */
  .why-architecture-box {{
    background-color: #ffffff;
    border: 1px solid var(--dd-cream-border);
    border-left: 5px solid var(--dd-forest);
    border-radius: 12px;
    padding: 26px 30px;
    margin-bottom: 30px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  }}

  .why-architecture-box h2 {{
    font-size: 19px;
    font-weight: 800;
    color: var(--dd-forest);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }}

  .arch-lead {{
    font-size: 13.5px;
    color: #374151;
    line-height: 1.6;
    margin-bottom: 20px;
  }}

  .matrix-table {{
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0 24px 0;
    font-size: 12px;
  }}

  .matrix-table th {{
    background-color: var(--dd-forest);
    color: #ffffff;
    padding: 10px 14px;
    text-align: left;
    font-weight: 700;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }}

  .matrix-table td {{
    padding: 10px 14px;
    border-bottom: 1px solid #e5e7eb;
    line-height: 1.45;
  }}

  .matrix-table tr:nth-child(even) td {{
    background-color: #f9fafb;
  }}

  .six-pillars-grid {{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
    gap: 16px;
    margin-top: 18px;
  }}

  .pillar-card {{
    background-color: #f8faf9;
    border: 1px solid #e2e8f0;
    border-left: 4px solid var(--dd-forest);
    border-radius: 8px;
    padding: 14px 16px;
  }}

  .pillar-card h4 {{
    font-size: 13px;
    font-weight: 700;
    color: var(--dd-forest-dark);
    margin-bottom: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }}

  .pillar-count-badge {{
    background-color: var(--dd-forest);
    color: #ffffff;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 12px;
  }}

  .pillar-card p {{
    font-size: 11.5px;
    color: #4b5563;
    line-height: 1.5;
  }}

  /* Guidance Section */
  .guide-box {{
    background-color: #ffffff;
    border: 1px solid var(--dd-cream-border);
    border-left: 4px solid var(--dd-forest);
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 32px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }}

  .guide-box h2 {{
    font-size: 16px;
    color: var(--dd-forest);
    margin-bottom: 8px;
  }}

  .guide-box p {{
    font-size: 12.5px;
    color: var(--dd-muted);
    margin-bottom: 16px;
    line-height: 1.55;
  }}

  .guide-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }}

  .guide-col {{
    background-color: #fbfbf9;
    border: 1px solid var(--dd-cream-border);
    border-radius: 8px;
    padding: 14px 16px;
  }}

  .guide-col h3 {{
    font-size: 13px;
    color: var(--dd-forest-dark);
    margin-bottom: 8px;
    border-bottom: 1px solid var(--dd-cream-border);
    padding-bottom: 6px;
  }}

  .guide-col ul {{
    list-style: none;
  }}

  .guide-col li {{
    font-size: 12px;
    color: #374151;
    margin-bottom: 6px;
    padding-left: 12px;
    position: relative;
  }}

  .guide-col li::before {{
    content: "•";
    position: absolute;
    left: 0;
    color: var(--dd-forest);
    font-weight: bold;
  }}

  /* Domain Section */
  .domain-section {{
    margin-bottom: 48px;
  }}

  .domain-header {{
    background-color: #ffffff;
    border: 1px solid var(--dd-line);
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 20px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 12px;
  }}

  .domain-title-group h2 {{
    font-size: 18px;
    font-weight: 800;
    color: var(--dd-forest);
    display: flex;
    align-items: center;
    gap: 10px;
  }}

  .domain-badge-code {{
    background-color: var(--dd-forest);
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    letter-spacing: 0.04em;
  }}

  .domain-desc {{
    font-size: 12.5px;
    color: var(--dd-muted);
    margin-top: 4px;
    max-width: 900px;
    line-height: 1.5;
  }}

  /* Diagram Box */
  .diagram-box {{
    background-color: #1e293b;
    color: #f8fafc;
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 24px;
    overflow-x: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 11.5px;
    line-height: 1.35;
    box-shadow: inset 0 2px 6px rgba(0,0,0,0.3);
  }}

  .diagram-title {{
    color: #38bdf8;
    font-weight: 700;
    font-size: 12px;
    margin-bottom: 8px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }}

  /* Model Card */
  .model-card {{
    background-color: #ffffff;
    border: 1px solid var(--dd-line);
    border-radius: 12px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    overflow: hidden;
  }}

  .model-header {{
    background-color: #fbfbf9;
    border-bottom: 1px solid var(--dd-line);
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }}

  .model-name-group {{
    display: flex;
    align-items: center;
    gap: 12px;
  }}

  .model-title {{
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    font-family: ui-monospace, monospace;
  }}

  .db-table-tag {{
    font-family: ui-monospace, monospace;
    font-size: 11px;
    background-color: #e2e8f0;
    color: #334155;
    padding: 2px 7px;
    border-radius: 4px;
  }}

  /* Model Purpose Banner */
  .model-purpose-banner {{
    background-color: #fdfbf7;
    border-bottom: 1px solid var(--dd-cream-border);
    padding: 14px 20px;
  }}

  .purpose-title-badge {{
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }}

  .purpose-role {{
    font-size: 13px;
    font-weight: 700;
    color: var(--dd-forest);
    background-color: #e8f0eb;
    padding: 3px 10px;
    border-radius: 6px;
    border: 1px solid #cce0d4;
  }}

  .purpose-grid {{
    display: grid;
    grid-template-columns: 1.2fr 1.1fr 1.1fr;
    gap: 16px;
  }}

  @media (max-width: 900px) {{
    .purpose-grid {{
      grid-template-columns: 1fr;
    }}
  }}

  .purpose-item {{
    font-size: 11.5px;
    line-height: 1.45;
  }}

  .purpose-label {{
    font-weight: 700;
    color: #374151;
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }}

  .purpose-text {{
    color: #4b5563;
  }}

  /* Table Style */
  table.data-dict {{
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }}

  table.data-dict th {{
    background-color: #f1f5f9;
    color: #475569;
    font-weight: 700;
    text-align: left;
    padding: 10px 14px;
    border-bottom: 1px solid var(--dd-line);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }}

  table.data-dict td {{
    padding: 10px 14px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
  }}

  table.data-dict tr:hover {{
    background-color: #f8fafc;
  }}

  .col-prop {{
    font-family: ui-monospace, monospace;
    font-size: 12px;
    font-weight: 600;
    color: #0f172a;
  }}

  .col-db {{
    font-family: ui-monospace, monospace;
    font-size: 11px;
    color: #64748b;
    margin-top: 2px;
  }}

  .col-id-name {{
    font-weight: 600;
    color: var(--dd-forest);
  }}

  .type-code {{
    font-family: ui-monospace, monospace;
    font-size: 11px;
    color: #4338ca;
    background-color: #eef2ff;
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
  }}

  /* Badges */
  .badge-pk {{
    background-color: #fef3c7;
    color: #92400e;
    border: 1px solid #fde68a;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 4px;
  }}

  .badge-uk {{
    background-color: #f3e8ff;
    color: #6b21a8;
    border: 1px solid #e9d5ff;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 4px;
  }}

  .badge-req {{
    background-color: #ecfdf5;
    color: #047857;
    border: 1px solid #a7f3d0;
    font-size: 10px;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: 4px;
  }}

  .badge-null {{
    background-color: #f1f5f9;
    color: #64748b;
    border: 1px solid #e2e8f0;
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 4px;
  }}

  .badge-cat-biz {{
    background-color: #e6f4ea;
    color: #137333;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
  }}

  .badge-cat-tech {{
    background-color: #e8f0fe;
    color: #1a73e8;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
  }}

  /* Print Styles for A4 PDF */
  @media print {{
    @page {{
      size: A4 landscape;
      margin: 12mm 10mm 14mm 10mm;
    }}

    body {{
      background-color: #ffffff;
      font-size: 8.5pt;
    }}

    .control-panel {{
      display: none !important;
    }}

    header.brand-header {{
      padding: 18px 20px;
      box-shadow: none;
    }}

    h1.doc-title {{
      font-size: 16pt;
    }}

    main.main-content {{
      padding: 0;
      margin: 10px 0;
      max-width: 100%;
    }}

    .why-architecture-box, .guide-box, .domain-section, .model-card {{
      page-break-inside: avoid;
      break-inside: avoid;
      box-shadow: none !important;
      border: 1px solid #cbd5e1 !important;
    }}

    .model-card {{
      margin-bottom: 16px;
    }}

    table.data-dict th, table.data-dict td {{
      padding: 5px 8px;
    }}

    .diagram-box {{
      background-color: #f8fafc !important;
      color: #0f172a !important;
      border: 1px solid #cbd5e1 !important;
      font-size: 7.5pt;
    }}

    .diagram-title {{
      color: #0369a1 !important;
    }}
  }}
</style>
</head>
<body>

<header class="brand-header">
  <div class="header-container">
    <div class="brand-badge">Daily Dose Pilates V2 · Engineering & Data Architecture</div>
    <h1 class="doc-title">Kamus Data Dwibahasa & Pedoman Desain Database</h1>
    <p class="doc-subtitle">
      Dokumen referensi resmi arsitektur data Daily Dose Pilates V2: menjelaskan secara komprehensif tujuan bisnis setiap tabel, alur pengisian oleh aktor sistem, alasan pemisahan arsitektur enterprise, serta kamus atribut dwibahasa (Prisma ⟷ MySQL ⟷ Bahasa Indonesia).
    </p>

    <div class="metrics-bar">
      <div class="metric-card">
        <div class="metric-val">{total_models}</div>
        <div class="metric-label">Total Model Tabel</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">{len(sorted_domains)}</div>
        <div class="metric-label">Domain Fungsional</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">{total_enums}</div>
        <div class="metric-label">Tipe Enum Terdefinisi</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">100%</div>
        <div class="metric-label">Cakupan Fungsi Bisnis</div>
      </div>
    </div>
  </div>
</header>

<div class="control-panel">
  <div class="control-inner">
    <div class="search-wrapper">
      <span class="search-icon">🔍</span>
      <input type="text" id="searchInput" class="search-input" placeholder="Cari nama tabel, fungsi bisnis, aktor (kasir/member), atau kolom (contoh: KTP, transfer bank, reformer, diskon)..." oninput="filterData()">
    </div>

    <div class="domain-filters">
      <button class="filter-btn active" onclick="setFilter('all', this)">Semua Domain</button>
"""
    for fname, ddata in sorted_domains:
        dcode = ddata['meta']['code']
        html += f'      <button class="filter-btn" onclick="setFilter(\'{dcode}\', this)">{dcode}</button>\n'

    html += """    </div>
  </div>
</div>

<main class="main-content">

  <!-- Penjelasan Mengapa Ada 97 Tabel -->
  <section class="why-architecture-box">
    <h2>🏛️ Mengapa Database Daily Dose V2 Memiliki 97 Tabel?</h2>
    <p class="arch-lead">
      Banyak pemilik studio dan manajer operasional bertanya: <em>"Mengapa sistem Daily Dose V2 terasa memiliki sangat banyak tabel dibandingkan aplikasi sebelumnya?"</em>
      Jawabannya terletak pada transformasi dari aplikasi monolitik sederhana menuju <strong>Arsitektur Enterprise Multi-Cabang Berstandar Industri</strong> yang menjamin nol kehilangan data, akuntansi berpasangan yang dapat diaudit, pencegahan tabrakan booking (anti-race condition), dan kepatuhan privasi dokumen identitas.
    </p>

    <table class="matrix-table">
      <thead>
        <tr>
          <th style="width: 20%;">Aspek Arsitektur</th>
          <th style="width: 38%;">Aplikasi Monolitik Sederhana (V1)</th>
          <th style="width: 42%;">Arsitektur Enterprise Daily Dose (V2)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Identitas & Hak Akses</strong></td>
          <td>Semua data dicampur dalam 1 tabel <code>users</code> dengan teks string <code>role = 'admin'</code>. Rawan kebocoran akses.</td>
          <td><strong>19 Tabel Granular (DOM-02)</strong>: Single Identity, profil dipisah, kapabilitas RBAC terukur, manajemen multi-sesi, dan perlindungan privasi foto KTP (KYC) dengan enkripsi & retensi otomatis.</td>
        </tr>
        <tr>
          <td><strong>Transaksi & Akuntansi</strong></td>
          <td>Hanya status boolean <code>is_paid = true</code>. Jika ada refund atau dispute kasir, riwayat pembukuan rusak.</td>
          <td><strong>8 Tabel Akuntansi (DOM-07)</strong>: Double-entry bookkeeping (Buku Besar, Jurnal Debit/Kredit, COA standar), biaya operasional cabang, dan snapshot tutup buku bulanan anti-manipulasi.</td>
        </tr>
        <tr>
          <td><strong>Katalog Paket & Kuota</strong></td>
          <td>Edit harga langsung menimpa data lama, menyebabkan laporan keuangan masa lalu ikut berubah.</td>
          <td><strong>18 Tabel Paket & Billing (DOM-03)</strong>: Revisi harga historis, faktur invoice, alokasi 3 digit kode unik transfer, audit struk bank, voucher diskon personal, dan saldo aktif member.</td>
        </tr>
        <tr>
          <td><strong>Booking & Kuota Ranjang</strong></td>
          <td>Booking langsung mengurangi angka counter, rawan overbooking saat ratusan member berebut kelas reformer populer.</td>
          <td><strong>8 Tabel Booking (DOM-05)</strong>: Tiket booking, penguncian saldo sesi (hold reservation lock), waiting list, riwayat reschedule, dan auto-booking member VIP.</td>
        </tr>
        <tr>
          <td><strong>Presensi & Instruktur</strong></td>
          <td>Absensi dicatat manual atau scan barcode statis yang mudah difoto/dishare ke teman.</td>
          <td><strong>5 Tabel Presensi & 2 Tabel Jadwal (DOM-04 & DOM-06)</strong>: QR Code dinamis anti-screenshot tiap 30 detik, presensi scanner pintu, dan rekapitulasi jam kerja payroll otomatis.</td>
        </tr>
        <tr>
          <td><strong>Keandalan & Migrasi Data</strong></td>
          <td>Tidak ada antrean latar belakang, tidak ada audit log, dan data lama langsung ditimpa.</td>
          <td><strong>27 Tabel Operasional & Migrasi (DOM-08 & DOM-09)</strong>: Transactional outbox, rate limiter, kunci idempoten anti-dobel klik, audit log staf, dan 12 tabel engine migrasi data zero-loss.</td>
        </tr>
      </tbody>
    </table>

    <div class="six-pillars-grid">
      <div class="pillar-card">
        <h4>1. Identitas & Privasi KYC <span class="pillar-count-badge">19 Model</span></h4>
        <p>Memisahkan akun login, profil personal, kredensial password, verifikasi OTP, izin peran granular, dan penyimpanan privat KTP berenkripsi.</p>
      </div>
      <div class="pillar-card">
        <h4>2. Akuntansi Double-Entry <span class="pillar-count-badge">8 Model</span></h4>
        <p>Mencatat setiap mutasi rupiah ke jurnal debit/kredit dan bagan akun resmi (COA), serta mengunci transaksi masa lalu lewat tutup buku bulanan.</p>
      </div>
      <div class="pillar-card">
        <h4>3. Pembelian, Struk & Saldo <span class="pillar-count-badge">18 Model</span></h4>
        <p>Mengelola katalog paket, revisi harga lama, verifikasi transfer kasir, kode unik bank, promosi voucher, dan saldo kuota sesi member.</p>
      </div>
      <div class="pillar-card">
        <h4>4. Fasilitas & Multi-Cabang <span class="pillar-count-badge">10 Model</span></h4>
        <p>Menata struktur fisik studio multi-lantai, inventaris ranjang reformer per ruangan, jam buka/tutup, serta kebijakan lokal masing-masing cabang.</p>
      </div>
      <div class="pillar-card">
        <h4>5. Booking, Reschedule & QR <span class="pillar-count-badge">15 Model</span></h4>
        <p>Menjamin reservasi ranjang reformer anti-rebutan, mengunci saldo sesi saat booking, melacak riwayat pindah jadwal, dan validasi QR anti-screenshot.</p>
      </div>
      <div class="pillar-card">
        <h4>6. Operasional & Engine Migrasi <span class="pillar-count-badge">27 Model</span></h4>
        <p>Infrastruktur background job, transactional outbox notifikasi, audit trail staf, helpdesk komplain, dan 12 tabel penjamin migrasi data V1-V2 tanpa data hilang.</p>
      </div>
    </div>
  </section>

  <!-- Pedoman Membaca & Glosarium -->
  <section class="guide-box">
    <h2>📖 Pedoman Klasifikasi Istilah (Dwibahasa)</h2>
    <p>
      Untuk menjamin kompatibilitas kode internasional sekaligus memudahkan pemahaman pemilik studio, penamaan atribut dibagi menjadi 2 kategori:
    </p>
    <div class="guide-grid">
      <div class="guide-col">
        <h3>1. Istilah Teknis yang Dipertahankan dalam Bahasa Inggris [Teknis - EN]</h3>
        <ul>
          <li><strong>Kunci & Identifikasi</strong>: <code>id</code>, <code>uuid</code>, <code>slug</code>, <code>key</code>, <code>checksum</code>, <code>token</code>.</li>
          <li><strong>Web & Media</strong>: <code>url</code>, <code>mimeType</code>, <code>sizeBytes</code>, <code>objectKey</code>, <code>e164</code>.</li>
          <li><strong>Arsitektur & Konkurensi</strong>: <code>version</code> (Optimistic Lock), <code>idempotencyKeyHash</code> (Anti Duplikasi), <code>outbox</code>, <code>payload</code>.</li>
          <li><strong>Keamanan & RBAC</strong>: <code>role</code>, <code>capability</code>, <code>permission</code>, <code>session</code>, <code>challenge</code>.</li>
        </ul>
      </div>
      <div class="guide-col">
        <h3>2. Istilah Bisnis yang Diberi Padanan Bahasa Indonesia [Bisnis - ID]</h3>
        <ul>
          <li><strong>Paket & Bayar</strong>: <code>sessionCount</code> ➔ Jumlah Sesi, <code>payableAmount</code> ➔ Jumlah Tagihan, <code>discount</code> ➔ Diskon.</li>
          <li><strong>Jadwal & Booking</strong>: <code>durationMinutes</code> ➔ Durasi Menit, <code>remainingSessions</code> ➔ Sisa Kuota Sesi.</li>
          <li><strong>Studio & Ruangan</strong>: <code>address</code> ➔ Alamat, <code>capacity</code> ➔ Kapasitas Ranjang Reformer.</li>
          <li><strong>Status Transaksi</strong>: <code>submittedAt</code> ➔ Waktu Upload Bukti, <code>decidedAt</code> ➔ Waktu Verifikasi.</li>
        </ul>
      </div>
    </div>
  </section>
"""

    # Render Domains & Models
    for fname, ddata in sorted_domains:
        meta = ddata['meta']
        dcode = meta['code']
        dtitle = meta['title']
        ddesc = meta['desc']
        models = ddata['models']
        diagram = meta.get('diagram', '')
        diagram_title = meta.get('diagram_title', 'Diagram Relasi Entitas')
        
        html += f"""
  <section class="domain-section" data-domain="{dcode}" id="{dcode}">
    <div class="domain-header">
      <div class="domain-title-group">
        <h2><span class="domain-badge-code">{dcode}</span> {dtitle}</h2>
        <p class="domain-desc">{ddesc}</p>
      </div>
    </div>
"""
        if diagram:
            html += f"""
    <div class="diagram-box">
      <div class="diagram-title">📊 {diagram_title}</div>
      <pre>{diagram}</pre>
    </div>
"""
        # Render each model
        for model in models:
            mname = model['name']
            dbtable = model['db_table']
            scalar_fields = model['scalar_fields']
            rel_fields = model['relation_fields']
            
            pinfo = MODEL_PURPOSES.get(mname, {
                'role_title': 'Entitas Data Operasional',
                'purpose': 'Menyimpan data atribut pendukung modul terkait.',
                'workflow': 'Dikelola oleh sistem atau staf sesuai alur operasional.',
                'why_separated': 'Normalisasi struktur data untuk keandalan dan performa query.'
            })
            
            p_role = pinfo.get('role_title', 'Entitas Data')
            p_purpose = pinfo.get('purpose', '')
            p_workflow = pinfo.get('workflow', '')
            p_why = pinfo.get('why_separated', '')
            
            search_text = f"{mname.lower()} {dbtable.lower()} {p_role.lower()} {p_purpose.lower()} {p_workflow.lower()} {p_why.lower()}"
            
            html += f"""
    <article class="model-card" data-model-name="{mname.lower()} {dbtable.lower()}" data-purpose="{search_text}">
      <div class="model-header">
        <div class="model-name-group">
          <span class="model-title">Tabel: {mname}</span>
          <span class="db-table-tag">MySQL: `{dbtable}`</span>
        </div>
        <span style="font-size: 11px; color: #64748b;">{len(scalar_fields)} Kolom Data · {len(rel_fields)} Relasi</span>
      </div>

      <div class="model-purpose-banner">
        <div class="purpose-title-badge">
          <span class="purpose-role">🎯 {p_role}</span>
        </div>
        <div class="purpose-grid">
          <div class="purpose-item">
            <div class="purpose-label">📌 Fungsi Utama Bisnis</div>
            <div class="purpose-text">{p_purpose}</div>
          </div>
          <div class="purpose-item">
            <div class="purpose-label">🔄 Aktor & Alur Pengisian</div>
            <div class="purpose-text">{p_workflow}</div>
          </div>
          <div class="purpose-item">
            <div class="purpose-label">💡 Alasan Pemisahan Tabel</div>
            <div class="purpose-text">{p_why}</div>
          </div>
        </div>
      </div>

      <table class="data-dict">
        <thead>
          <tr>
            <th style="width: 22%;">Nama Kolom (Prisma & DB)</th>
            <th style="width: 18%;">Istilah Bahasa Indonesia</th>
            <th style="width: 14%;">Tipe Data & Kunci</th>
            <th style="width: 10%;">Klasifikasi</th>
            <th>Keterangan / Fungsi Bisnis</th>
          </tr>
        </thead>
        <tbody>
"""
            for field in scalar_fields:
                fname = field['name']
                db_col = field['db_col']
                ftype = field['type']
                id_name = field['id_name']
                category = field['category']
                desc = field['desc']
                
                # Badges
                key_badge = ""
                if field['is_pk']:
                    key_badge += '<span class="badge-pk">PK</span> '
                if field['is_uk']:
                    key_badge += '<span class="badge-uk">UK</span> '
                if field['is_nullable']:
                    key_badge += '<span class="badge-null">NULL</span>'
                else:
                    key_badge += '<span class="badge-req">REQ</span>'
                    
                cat_badge = f'<span class="badge-cat-biz">{category}</span>' if 'Bisnis' in category else f'<span class="badge-cat-tech">{category}</span>'
                
                db_display = f'<div class="col-db">@map("{db_col}")</div>' if db_col != fname else f'<div class="col-db">`{fname}`</div>'
                
                html += f"""          <tr class="field-row" data-search="{fname.lower()} {db_col.lower()} {id_name.lower()} {desc.lower()}">
            <td>
              <div class="col-prop">{fname}</div>
              {db_display}
            </td>
            <td>
              <div class="col-id-name">{id_name}</div>
            </td>
            <td>
              <span class="type-code">{ftype}</span><br>
              <div style="margin-top: 4px;">{key_badge}</div>
            </td>
            <td>{cat_badge}</td>
            <td style="color: #334155; line-height: 1.45;">{desc}</td>
          </tr>
"""
            html += """        </tbody>
      </table>
    </article>
"""
        html += "  </section>\n"
        
    html += """
</main>

<script>
  let activeDomain = 'all';

  function setFilter(domain, btn) {
    activeDomain = domain;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterData();
  }

  function filterData() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const sections = document.querySelectorAll('.domain-section');

    sections.forEach(sec => {
      const secDomain = sec.getAttribute('data-domain');
      const matchDomain = activeDomain === 'all' || secDomain === activeDomain;

      if (!matchDomain) {
        sec.style.display = 'none';
        return;
      }

      const modelCards = sec.querySelectorAll('.model-card');
      let visibleInSec = 0;

      modelCards.forEach(card => {
        const modelInfo = card.getAttribute('data-model-name') || '';
        const purposeInfo = card.getAttribute('data-purpose') || '';
        const rows = card.querySelectorAll('.field-row');
        let visibleRows = 0;

        rows.forEach(row => {
          const searchData = row.getAttribute('data-search') || '';
          if (!query || searchData.includes(query) || modelInfo.includes(query) || purposeInfo.includes(query)) {
            row.style.display = '';
            visibleRows++;
          } else {
            row.style.display = 'none';
          }
        });

        if (!query || visibleRows > 0 || modelInfo.includes(query) || purposeInfo.includes(query)) {
          card.style.display = '';
          visibleInSec++;
        } else {
          card.style.display = 'none';
        }
      });

      sec.style.display = (visibleInSec > 0 || !query) ? '' : 'none';
    });
  }
</script>

</body>
</html>
"""
    return html

def export_to_pdf():
    chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if not os.path.exists(chrome_path):
        print(f"Chrome not found at {chrome_path}")
        return False
        
    cmd = [
        chrome_path,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={OUTPUT_PDF}",
        OUTPUT_HTML
    ]
    print("Exporting to PDF via Google Chrome Headless...")
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode == 0:
        pdf_size = os.path.getsize(OUTPUT_PDF) // 1024
        print(f"PDF Document generated successfully: {OUTPUT_PDF} ({pdf_size} KB)")
        return True
    else:
        print(f"Failed to generate PDF: {result.stderr.decode('utf-8')}")
        return False

def main():
    print(f"Parsing schemas from: {SCHEMA_DIR}")
    html_content = generate_html()
    os.makedirs(DOCS_DIR, exist_ok=True)
    with open(OUTPUT_HTML, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"HTML Document generated successfully: {OUTPUT_HTML}")
    
    export_to_pdf()

if __name__ == '__main__':
    main()
