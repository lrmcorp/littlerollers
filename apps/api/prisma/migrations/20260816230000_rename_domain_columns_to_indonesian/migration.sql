-- Rename domain columns to Indonesian (matching Prisma @map annotations)

ALTER TABLE `Cabang`
  RENAME COLUMN `code` TO `kode`,
  RENAME COLUMN `name` TO `nama`,
  RENAME COLUMN `timezone` TO `zona_waktu`,
  RENAME COLUMN `active` TO `aktif`,
  RENAME COLUMN `createdAt` TO `dibuat_pada`,
  RENAME COLUMN `updatedAt` TO `diperbarui_pada`;

ALTER TABLE `JenisKelas`
  RENAME COLUMN `code` TO `kode`,
  RENAME COLUMN `name` TO `nama`,
  RENAME COLUMN `active` TO `aktif`,
  RENAME COLUMN `createdAt` TO `dibuat_pada`,
  RENAME COLUMN `updatedAt` TO `diperbarui_pada`;

ALTER TABLE `Paket`
  DROP CHECK `Package_positive_values`,
  DROP CHECK `Package_valid_period`;

ALTER TABLE `Paket`
  RENAME COLUMN `businessKey` TO `kunci_bisnis`,
  RENAME COLUMN `name` TO `nama`,
  RENAME COLUMN `sessionCount` TO `jumlah_sesi`,
  RENAME COLUMN `durationDays` TO `durasi_hari`,
  RENAME COLUMN `priceRp` TO `harga_rp`,
  RENAME COLUMN `effectiveFrom` TO `berlaku_dari`,
  RENAME COLUMN `effectiveUntil` TO `berlaku_sampai`,
  RENAME COLUMN `version` TO `versi`;

ALTER TABLE `Paket`
  ADD CONSTRAINT `Package_positive_values` CHECK ((`jumlah_sesi` >= 1) and (`durasi_hari` >= 1) and (`harga_rp` >= 1)),
  ADD CONSTRAINT `Package_valid_period` CHECK ((`berlaku_sampai` is null) or (`berlaku_sampai` > `berlaku_dari`));

ALTER TABLE `Pembelian`
  RENAME COLUMN `userId` TO `pengguna_id`,
  RENAME COLUMN `branchId` TO `cabang_id`,
  RENAME COLUMN `packageId` TO `paket_id`,
  RENAME COLUMN `classTypeId` TO `jenis_kelas_id`,
  RENAME COLUMN `voucherId` TO `voucher_id`,
  RENAME COLUMN `packageNameSnapshot` TO `snapshot_nama_paket`,
  RENAME COLUMN `priceRpSnapshot` TO `snapshot_harga_rp`,
  RENAME COLUMN `promotionalPriceRpSnapshot` TO `snapshot_harga_promosi_rp`,
  RENAME COLUMN `voucherCodeSnapshot` TO `snapshot_kode_voucher`,
  RENAME COLUMN `voucherDiscountRpSnapshot` TO `snapshot_diskon_voucher_rp`,
  RENAME COLUMN `priceAfterDiscountRpSnapshot` TO `snapshot_harga_setelah_diskon_rp`,
  RENAME COLUMN `payableAmountRpSnapshot` TO `snapshot_jumlah_tagihan_rp`,
  RENAME COLUMN `paymentUniqueCode` TO `kode_unik_pembayaran`,
  RENAME COLUMN `paymentExpiresAt` TO `batas_waktu_pembayaran`,
  RENAME COLUMN `submittedAt` TO `diajukan_pada`,
  RENAME COLUMN `decidedAt` TO `diputuskan_pada`,
  RENAME COLUMN `decidedById` TO `diputuskan_oleh_id`,
  RENAME COLUMN `decisionReasonCode` TO `kode_alasan_keputusan`;

ALTER TABLE `PaketPelanggan`
  DROP CHECK `CustomerPackage_positive_snapshots`,
  DROP CHECK `CustomerPackage_valid_period`;

ALTER TABLE `PaketPelanggan`
  RENAME COLUMN `purchaseId` TO `pembelian_id`,
  RENAME COLUMN `customerUserId` TO `pengguna_pelanggan_id`,
  RENAME COLUMN `branchId` TO `cabang_id`,
  RENAME COLUMN `packageId` TO `paket_id`,
  RENAME COLUMN `classTypeId` TO `jenis_kelas_id`,
  RENAME COLUMN `activationDate` TO `tanggal_aktivasi`,
  RENAME COLUMN `expiryAt` TO `tanggal_kedaluwarsa`,
  RENAME COLUMN `salePriceRp` TO `harga_jual_rp`,
  RENAME COLUMN `sessionCountSnapshot` TO `snapshot_jumlah_sesi`,
  RENAME COLUMN `durationDaysSnapshot` TO `snapshot_durasi_hari`,
  RENAME COLUMN `projectionRateRp` TO `rate_proyeksi_rp`,
  RENAME COLUMN `version` TO `versi`;

ALTER TABLE `PaketPelanggan`
  ADD CONSTRAINT `CustomerPackage_positive_snapshots` CHECK ((`harga_jual_rp` >= 1) and (`snapshot_jumlah_sesi` >= 1) and (`snapshot_durasi_hari` >= 1) and (`rate_proyeksi_rp` >= 0)),
  ADD CONSTRAINT `CustomerPackage_valid_period` CHECK (`tanggal_kedaluwarsa` > `tanggal_aktivasi`);

ALTER TABLE `SlotKelas`
  DROP CHECK `ClassSlot_range_check`,
  DROP CHECK `ClassSlot_capacity_check`;

ALTER TABLE `SlotKelas`
  RENAME COLUMN `branchId` TO `cabang_id`,
  RENAME COLUMN `classTypeId` TO `jenis_kelas_id`,
  RENAME COLUMN `studioId` TO `studio_id`,
  RENAME COLUMN `roomId` TO `ruangan_id`,
  RENAME COLUMN `instructorUserId` TO `pengguna_instruktur_id`,
  RENAME COLUMN `startAt` TO `waktu_mulai`,
  RENAME COLUMN `endAt` TO `waktu_selesai`,
  RENAME COLUMN `capacity` TO `kapasitas`;

ALTER TABLE `SlotKelas`
  ADD CONSTRAINT `ClassSlot_range_check` CHECK (`waktu_mulai` < `waktu_selesai`),
  ADD CONSTRAINT `ClassSlot_capacity_check` CHECK ((`kapasitas` >= `minimumQuota`) and (`minimumQuota` >= 1) and (`bookedCount` >= 0) and (`bookedCount` <= `kapasitas`));

ALTER TABLE `PemesananKelas`
  DROP CHECK `Booking_reservedQuantity_check`,
  DROP INDEX `Booking_activeCustomerSlot_key`,
  DROP COLUMN `_activeCustomerSlotKey`;

ALTER TABLE `PemesananKelas`
  RENAME COLUMN `branchId` TO `cabang_id`,
  RENAME COLUMN `classSlotId` TO `slot_kelas_id`,
  RENAME COLUMN `customerUserId` TO `pengguna_pelanggan_id`,
  RENAME COLUMN `customerPackageId` TO `paket_pelanggan_id`,
  RENAME COLUMN `reservationId` TO `reservasi_id`,
  RENAME COLUMN `createdById` TO `dibuat_oleh_id`,
  RENAME COLUMN `source` TO `sumber`,
  RENAME COLUMN `reservedQuantity` TO `jumlah_dipesan`,
  RENAME COLUMN `cancellationReasonCode` TO `kode_alasan_pembatalan`,
  RENAME COLUMN `cancelledAt` TO `dibatalkan_pada`,
  RENAME COLUMN `cancelledById` TO `dibatalkan_oleh_id`;

ALTER TABLE `PemesananKelas`
  ADD CONSTRAINT `Booking_reservedQuantity_check` CHECK (`jumlah_dipesan` = 1),
  ADD COLUMN `_activeCustomerSlotKey` VARCHAR(73)
    GENERATED ALWAYS AS (
      IF(
        `status` IN ('BOOKED', 'RESCHEDULE_PENDING'),
        CONCAT(`pengguna_pelanggan_id`, ':', `slot_kelas_id`),
        NULL
      )
    ) VIRTUAL,
  ADD UNIQUE INDEX `Booking_activeCustomerSlot_key` (`_activeCustomerSlotKey`);

ALTER TABLE `RekeningPembayaran`
  RENAME COLUMN `branchId` TO `cabang_id`,
  RENAME COLUMN `bankCode` TO `kode_bank`,
  RENAME COLUMN `bankName` TO `nama_bank`,
  RENAME COLUMN `accountNumberEncrypted` TO `nomor_rekening_terenkripsi`,
  RENAME COLUMN `accountNumberLast4` TO `nomor_rekening_4_digit_terakhir`,
  RENAME COLUMN `accountHolderName` TO `nama_pemilik_rekening`,
  RENAME COLUMN `paymentWindowHours` TO `durasi_pembayaran_jam`,
  RENAME COLUMN `active` TO `aktif`;

ALTER TABLE `BuktiPembayaran`
  DROP CHECK `PaymentProof_positive_size`;

ALTER TABLE `BuktiPembayaran`
  RENAME COLUMN `userId` TO `pengguna_id`,
  RENAME COLUMN `branchId` TO `cabang_id`,
  RENAME COLUMN `fileName` TO `nama_file`,
  RENAME COLUMN `mimeType` TO `tipe_mime`,
  RENAME COLUMN `sizeBytes` TO `ukuran_byte`,
  RENAME COLUMN `uploadStatus` TO `status_unggahan`,
  RENAME COLUMN `scanStatus` TO `status_pemindaian`;

ALTER TABLE `BuktiPembayaran`
  ADD CONSTRAINT `PaymentProof_positive_size` CHECK (`ukuran_byte` >= 1);

ALTER TABLE `EntriBukuBesar`
  DROP CHECK `LedgerEntry_nonzero_quantity`;

ALTER TABLE `EntriBukuBesar`
  RENAME COLUMN `customerPackageId` TO `paket_pelanggan_id`,
  RENAME COLUMN `type` TO `tipe`,
  RENAME COLUMN `quantity` TO `kuantitas`,
  RENAME COLUMN `referenceType` TO `tipe_referensi`,
  RENAME COLUMN `referenceId` TO `referensi_id`,
  RENAME COLUMN `occurredAt` TO `terjadi_pada`;

ALTER TABLE `EntriBukuBesar`
  ADD CONSTRAINT `LedgerEntry_nonzero_quantity` CHECK (`kuantitas` <> 0);

ALTER TABLE `ProfilPengguna`
  RENAME COLUMN `userId` TO `pengguna_id`,
  RENAME COLUMN `address` TO `alamat`,
  RENAME COLUMN `genderCode` TO `jenis_kelamin`,
  RENAME COLUMN `countryCode` TO `kode_negara`,
  RENAME COLUMN `birthDate` TO `tanggal_lahir`,
  RENAME COLUMN `barcode` TO `kode_batang`;

ALTER TABLE `Ruangan`
  RENAME COLUMN `studioId` TO `studio_id`,
  RENAME COLUMN `code` TO `kode`,
  RENAME COLUMN `name` TO `nama`,
  RENAME COLUMN `capacity` TO `kapasitas`,
  RENAME COLUMN `active` TO `aktif`;

ALTER TABLE `Voucher`
  RENAME COLUMN `code` TO `kode`,
  RENAME COLUMN `name` TO `nama`,
  RENAME COLUMN `description` TO `deskripsi`,
  RENAME COLUMN `discountType` TO `tipe_diskon`,
  RENAME COLUMN `discountValue` TO `nilai_diskon`,
  RENAME COLUMN `maxDiscountRp` TO `maksimal_diskon_rp`,
  RENAME COLUMN `minimumPurchaseRp` TO `minimal_pembelian_rp`,
  RENAME COLUMN `activeFrom` TO `aktif_dari`,
  RENAME COLUMN `activeUntil` TO `aktif_sampai`,
  RENAME COLUMN `totalUsageLimit` TO `batas_total_penggunaan`,
  RENAME COLUMN `perCustomerUsageLimit` TO `batas_penggunaan_per_pelanggan`;
