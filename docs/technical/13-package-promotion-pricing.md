# Package Promotion Pricing

Status: `IMPLEMENTED`

Dokumen ini menjelaskan urutan perhitungan harga paket yang menjadi kontrak bersama katalog, checkout, pembayaran, Finance, dan ledger.

## Sumber harga

- `Package.priceRp` adalah harga normal dan tidak berubah arti.
- `PackagePromotion` adalah potongan langsung pada satu paket. Hanya record `ACTIVE` dalam interval setengah terbuka `[activeFrom, activeUntil)` yang memengaruhi harga.
- `Voucher` adalah potongan tambahan yang divalidasi setelah promo paket.
- Satu paket hanya boleh memiliki satu periode promo non-archived yang overlap pada satu waktu.

## Urutan authoritative

```text
Harga normal paket
- Diskon promo paket
= Harga promo
- Diskon voucher
= Harga setelah seluruh diskon
+ Identifikasi transfer
= Nominal yang perlu ditransfer
```

Persentase dibulatkan ke bawah. Promo harus menyisakan minimal Rp1 sebelum voucher. Semua perhitungan dilakukan server-side; browser hanya menampilkan projection yang diberikan API.

## Snapshot order

Ketika order dibuat, backend menyimpan harga normal, identitas dan nilai promo, harga promo, identitas dan nilai voucher, harga bersih, serta nominal transfer. Approval Finance dan aktivasi paket membaca snapshot ini dan tidak menghitung ulang konfigurasi aktif. Karena itu, pause, perubahan, atau berakhirnya promo tidak mengubah order lama.

Create order membawa expected package version dan expected promotion identity/version. Perubahan harga sebelum order tersimpan menghasilkan `PRICE_CHANGED`, sehingga customer harus memuat ulang dan mengonfirmasi harga terbaru.

## Pelaporan

Rekonsiliasi mencatat secara terpisah:

- gross sales dari harga normal;
- package promotion discount;
- voucher discount;
- net sales setelah seluruh diskon;
- identification amount untuk pencocokan transfer.

Pendapatan paket dan `CustomerPackage.salePriceRp` menggunakan harga bersih. Identifikasi transfer tidak diperlakukan sebagai pendapatan paket.

## Presentasi public

Harga normal hanya menggunakan elemen semantik `<del>` ketika promo benar-benar `LIVE`. Harga promo menjadi harga dominan, disertai label promo dan nilai hemat. Promo draft, terjadwal, paused, expired, atau archived tidak menyebabkan harga dicoret.
