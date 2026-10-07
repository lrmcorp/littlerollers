import { PrismaClient } from '../apps/api/node_modules/@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  console.log(`[Sanitasi] Mulai sanitasi paket pelanggan per ${now.toISOString()}...`);

  // 1. Paket yang sudah melewati masa berlaku tapi status masih ACTIVE -> set ke EXPIRED
  const expiredActive = await prisma.paketPelanggan.findMany({
    where: {
      status: 'ACTIVE',
      validUntil: { lt: now },
    },
    select: { id: true, userId: true, validUntil: true, remainingSessions: true },
  });

  console.log(`[Sanitasi] Ditemukan ${expiredActive.length} paket kedaluwarsa yang masih berstatus ACTIVE.`);
  if (expiredActive.length > 0) {
    const updateResult = await prisma.paketPelanggan.updateMany({
      where: {
        status: 'ACTIVE',
        validUntil: { lt: now },
      },
      data: {
        status: 'EXPIRED',
      },
    });
    console.log(`[Sanitasi] Berhasil mengupdate ${updateResult.count} paket menjadi EXPIRED.`);
  }

  // 2. Anomali totalSessions < remainingSessions + usedSessions (misal sisa 14 dari 1 sesi)
  const anomalies: any = await prisma.$queryRaw`
    SELECT id, totalSessions, remainingSessions, usedSessions
    FROM paket_pelanggan
    WHERE (remainingSessions + usedSessions) > totalSessions
  `;

  console.log(`[Sanitasi] Ditemukan ${anomalies.length} paket dengan sisa sesi melebihi total sesi.`);
  for (const a of anomalies) {
    const targetTotal = Math.max(Number(a.totalSessions), Number(a.remainingSessions) + Number(a.usedSessions));
    console.log(` - Paket ${a.id}: total ${a.totalSessions} -> ${targetTotal} (sisa: ${a.remainingSessions})`);
    await prisma.paketPelanggan.update({
      where: { id: a.id },
      data: { totalSessions: targetTotal },
    });
  }

  console.log(`[Sanitasi] Selesai sanitasi paket pelanggan.`);
}

main()
  .catch((err) => {
    console.error('[Sanitasi] Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
