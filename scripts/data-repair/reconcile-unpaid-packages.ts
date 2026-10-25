import { PrismaClient } from '../../apps/api/node_modules/@prisma/client';
import * as path from 'node:path';
import * as fs from 'node:fs';

const prisma = new PrismaClient();

async function main() {
  const isDryRun = !process.argv.includes('--apply');
  console.log(`=======================================================`);
  console.log(`[DATA REPAIR] Audit Paket Sesi Terpakai Belum Lunas (Poin 6)`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (Simulasi / Audit saja)' : 'APPLY (Mutasi Data Aktif)'}`);
  console.log(`=======================================================\n`);

  // Query langsung melalui raw SQL untuk kecepatan dan performa maksimal
  const affectedPackages = await prisma.$queryRaw<
    Array<{
      customerPackageId: string;
      usedSessions: number;
      remainingSessions: number;
      packageStatus: string;
      invoiceNumber: string;
      purchaseStatus: string;
      totalAmountRp: number;
      displayName: string;
      email: string;
      phone: string | null;
      packageName: string;
    }>
  >`
    SELECT 
      pp.id AS customerPackageId,
      pp.usedSessions,
      pp.remainingSessions,
      pp.status AS packageStatus,
      p.invoiceNumber,
      p.status AS purchaseStatus,
      p.totalAmountRp,
      u.name AS displayName,
      u.email,
      u.phone,
      pk.name AS packageName
    FROM paket_pelanggan pp
    JOIN pembelian p ON pp.purchaseId = p.id
    JOIN user u ON pp.userId = u.id
    JOIN paket pk ON pp.packageId = pk.id
    WHERE p.status IN ('WAITING_VERIFICATION', 'PENDING', 'REJECTED', 'CANCELLED')
      AND (pp.usedSessions > 0 OR pp.remainingSessions < pk.sessionCount);
  `;

  console.log(`Ditemukan ${affectedPackages.length} paket pelanggan dengan pemakaian sesi mendahului pelunasan:\n`);

  const reportItems: any[] = [];

  for (const item of affectedPackages) {
    const bookings = await prisma.pemesananKelas.findMany({
      where: {
        customerPackageId: item.customerPackageId,
        status: { in: ['BOOKED', 'ATTENDED'] },
      },
      include: {
        classSlot: {
          include: {
            branch: { select: { name: true } },
            classType: { select: { name: true } },
          },
        },
      },
    });

    reportItems.push({
      ...item,
      activeBookingsCount: bookings.length,
      bookings: bookings.map((b) => ({
        bookingId: b.id,
        bookingNumber: b.bookingNumber,
        status: b.status,
        className: `${b.classSlot.branch.name} · ${b.classSlot.classType.name}`,
        startAt: b.classSlot.startAt.toISOString(),
      })),
    });

    console.log(`[PAKET] ${item.packageName} (${item.customerPackageId})`);
    console.log(`  Customer    : ${item.displayName} (${item.phone ?? item.email})`);
    console.log(`  Tagihan     : ${item.invoiceNumber} | Status: ${item.purchaseStatus} | Nominal: Rp ${item.totalAmountRp.toLocaleString('id-ID')}`);
    console.log(`  Status Paket: ${item.packageStatus} | Terpakai: ${item.usedSessions} sesi | Sisa: ${item.remainingSessions} sesi`);
    console.log(`  Booking Terkait (${bookings.length}):`);
    bookings.forEach((b: any, idx: number) => {
      console.log(`    ${idx + 1}. [${b.bookingNumber}] ${b.classSlot.branch.name} · ${b.classSlot.classType.name} (${b.status}) pada ${b.classSlot.startAt.toISOString()}`);
    });
    console.log('');
  }

  // Simpan laporan ke docs/arsip/uat/bukti
  const buktiDir = path.resolve(__dirname, '../../docs/arsip/uat/bukti');
  if (!fs.existsSync(buktiDir)) {
    fs.mkdirSync(buktiDir, { recursive: true });
  }

  const outputPath = path.join(buktiDir, 'unpaid_packages_audit.json');
  fs.writeFileSync(outputPath, JSON.stringify(reportItems, null, 2), 'utf-8');
  console.log(`[AUDIT LOG] Laporan berhasil disimpan di: ${outputPath}`);

  if (isDryRun) {
    console.log(`\n[SELESAI DRY-RUN] Tidak ada mutasi yang diterapkan ke database.`);
    console.log(`Rekomendasi Operasional:`);
    console.log(`1. Koordinasi dengan tim kasir/finance untuk menyetujui invoice jika dana sudah masuk di mutasi bank.`);
    console.log(`2. Jika belum dibayar, bekukan paket (FROZEN) dengan opsi '--apply'.`);
  } else {
    console.log(`\n[APPLY MODE] Membekukan paket yang belum lunas...`);
    for (const item of reportItems) {
      await prisma.paketPelanggan.update({
        where: { id: item.customerPackageId },
        data: { status: 'FROZEN' },
      });
      console.log(`  Paket ${item.customerPackageId} (${item.displayName}) diubah ke status FROZEN.`);
    }
    console.log(`[APPLY SELESAI] Data paket berhasil dibekukan.`);
  }
}

main()
  .catch((err) => {
    console.error('[ERROR]', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
