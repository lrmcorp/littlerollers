import { PrismaClient, Role, ClassSlotStatus } from '@prisma/client';

async function main() {
  const db = new PrismaClient();
  try {
    const branch = await db.cabang.findFirstOrThrow({ where: { code: 'DD-GG' } });
    const studio = await db.studio.findFirstOrThrow({ where: { branchId: branch.id } });
    const classType = await db.jenisKelas.findFirstOrThrow();
    const instructor = await db.user.findFirstOrThrow({ where: { role: Role.INSTRUCTOR } });

    // Customer Amanda Member
    let customer = await db.user.findFirst({ where: { email: 'amanda.member@dailydose.test' } });
    if (!customer) {
      customer = await db.user.findFirstOrThrow({ where: { role: Role.CUSTOMER } });
    }

    // Pastikan paket amanda aktif dengan sisa 10 sesi
    let pkg = await db.paketPelanggan.findFirst({
      where: { userId: customer.id, status: 'ACTIVE' },
    });
    if (!pkg) {
      const masterPkg = await db.paket.findFirstOrThrow({ where: { status: 'ACTIVE' } });
      pkg = await db.paketPelanggan.create({
        data: {
          userId: customer.id,
          packageId: masterPkg.id,
          totalSessions: 10,
          remainingSessions: 10,
          usedSessions: 0,
          validUntil: new Date(Date.now() + 30 * 86400000),
          status: 'ACTIVE',
        },
      });
    } else {
      await db.paketPelanggan.update({
        where: { id: pkg.id },
        data: { remainingSessions: 10, usedSessions: 0 },
      });
    }

    // 1. Fixture Slot UAT Presensi
    const now = new Date();
    const startAt = new Date(now.getTime() + 15 * 60000); // 15 menit lagi
    const endAt = new Date(startAt.getTime() + 60 * 60000);

    const slotUat = await db.slotKelas.create({
      data: {
        branchId: branch.id,
        studioId: studio.id,
        classTypeId: classType.id,
        instructorId: instructor.id,
        startAt,
        endAt,
        capacity: 5,
        bookedCount: 1,
        status: ClassSlotStatus.CONFIRMED,
      },
    });

    const bookingUat = await db.pemesananKelas.create({
      data: {
        bookingNumber: `BK-UAT-${Date.now()}`,
        classSlotId: slotUat.id,
        userId: customer.id,
        customerPackageId: pkg.id,
        status: 'BOOKED',
      },
    });

    // CheckIn Token (Database menyimpan sha256 dari rawToken)
    const { createHash, randomBytes } = await import('node:crypto');
    const rawToken = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    await db.checkInToken.create({
      data: {
        token: tokenHash,
        bookingId: bookingUat.id,
        expiresAt: new Date(endAt.getTime() + 3600000),
        isUsed: false,
      },
    });

    // 2. Fixture SessionAdjustRequest PENDING
    const admin = await db.user.findFirstOrThrow({ where: { role: Role.ADMIN } });
    const adjustReq = await db.sessionAdjustRequest.create({
      data: {
        customerPackageId: pkg.id,
        bookingId: bookingUat.id,
        reason: 'UAT Browser: Kompensasi medis darurat (< H-24) surat dokter terverifikasi',
        sessionCount: 1,
        status: 'PENDING',
        requestedById: admin.id,
      },
    });

    console.log('✅ FIXTURE BERHASIL DISIAPKAN:');
    console.log('   Customer Email :', customer.email);
    console.log('   Customer Pkg ID:', pkg.id, '(Saldo: 10 sesi)');
    console.log('   Slot UAT ID    :', slotUat.id);
    console.log('   Booking UAT ID :', bookingUat.id);
    console.log('   Check-In Token :', rawToken);
    console.log('   Check-In URL   : http://localhost:32120/check-in/' + rawToken);
    console.log('   Adjust Req ID  :', adjustReq.id);
    console.log('   Adjust URL     : http://localhost:32120/ledger/adjustments');
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error('Fixture setup failed:', err);
  process.exit(1);
});
