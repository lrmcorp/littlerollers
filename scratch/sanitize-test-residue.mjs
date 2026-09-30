import { PrismaClient } from '../apps/api/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient();

async function run(dryRun = false) {
  console.log(`\n======================================================`);
  console.log(`[START] Sanitasi Database Residu Uji (Mode: ${dryRun ? 'DRY-RUN' : 'LIVE COMMIT'})`);
  console.log(`======================================================\n`);

  const dummyBranchCodes = [
    'availability-1790587944851-a',
    'availability-1790587944851-b',
    'rbac-it-1790611816899-a',
    'rbac-it-1790611816899-b',
  ];

  const branches = await prisma.cabang.findMany({
    where: { code: { in: dummyBranchCodes } },
    select: { id: true, code: true, name: true },
  });
  const branchIds = branches.map((b) => b.id);
  console.log(`[1] Ditemukan ${branches.length} cabang dummy:`, branches.map((b) => `${b.code} (${b.name})`));

  const dummyUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { endsWith: '@dailydose.test' } },
        { email: { endsWith: '@example.com' } },
        { displayName: { contains: 'Synthetic' } },
        { displayName: { startsWith: 'RBAC ' } },
        { displayName: { startsWith: 'Stress ' } },
        { displayName: { startsWith: 'Hammer ' } },
        { displayName: { startsWith: 'Multi Member ' } },
        { displayName: 'Member Test' },
      ],
      NOT: {
        email: { in: ['ralamzah@gmail.com', 'admin@ddose.com', 'coach@ddose.com'] },
      },
    },
    select: { id: true, email: true, displayName: true },
  });
  const userIds = dummyUsers.map((u) => u.id);
  console.log(`[2] Ditemukan ${dummyUsers.length} user dummy sisa test.`);

  const result = await prisma.$transaction(async (tx) => {
    // Cari packages & bookings milik user dummy
    const pkgs = await tx.paketPelanggan.findMany({
      where: { userId: { in: userIds } },
      select: { id: true },
    });
    const pkgIds = pkgs.map((p) => p.id);

    const bookings = await tx.pemesananKelas.findMany({
      where: { OR: [{ userId: { in: userIds } }, { customerPackageId: { in: pkgIds } }] },
      select: { id: true },
    });
    const bookingIds = bookings.map((b) => b.id);

    // 1. CorrectionJournal
    const dCorrections = await tx.correctionJournal.deleteMany({
      where: {
        OR: [
          { requestedById: { in: userIds } },
          { approvedById: { in: userIds } },
          { branchId: { in: branchIds } },
        ],
      },
    });

    // 2. InstructorAvailability
    const dAvail = await tx.instructorAvailability.deleteMany({
      where: { OR: [{ branchId: { in: branchIds } }, { instructorId: { in: userIds } }] },
    });

    // 3. SessionAdjustRequest
    const dAdjust = await tx.sessionAdjustRequest.deleteMany({
      where: {
        OR: [
          { customerPackageId: { in: pkgIds } },
          { bookingId: { in: bookingIds } },
          { requestedById: { in: userIds } },
          { approvedById: { in: userIds } },
        ],
      },
    });

    // 4. UbahJadwal (Reschedule)
    const dReschedules = await tx.ubahJadwal.deleteMany({
      where: {
        OR: [
          { bookingId: { in: bookingIds } },
          { requestedById: { in: userIds } },
        ],
      },
    });

    // 5. KehadiranPelanggan
    const dAttendances = await tx.kehadiranPelanggan.deleteMany({
      where: { OR: [{ bookingId: { in: bookingIds } }, { recordedById: { in: userIds } }] },
    });

    // 6. CheckInToken
    const dTokens = await tx.checkInToken.deleteMany({
      where: { bookingId: { in: bookingIds } },
    });

    // 7. KehadiranInstruktur & InstructorCheckInToken
    const dInstTokens = await tx.instructorCheckInToken.deleteMany({
      where: { issuedById: { in: userIds } },
    });
    const dInstAttendances = await tx.kehadiranInstruktur.deleteMany({
      where: { OR: [{ instructorId: { in: userIds } }, { recordedById: { in: userIds } }] },
    });

    // 8. SlotKelas: lepaskan referensi instructorId jika mengarah ke dummy user
    const dSlotInstructors = await tx.slotKelas.updateMany({
      where: { instructorId: { in: userIds } },
      data: { instructorId: null },
    });

    // 9. PemesananKelas
    const dBookings = await tx.pemesananKelas.deleteMany({
      where: { id: { in: bookingIds } },
    });

    // 10. SessionLedger
    const dLedgers = await tx.sessionLedger.deleteMany({
      where: { OR: [{ customerPackageId: { in: pkgIds } }, { createdById: { in: userIds } }] },
    });

    // 11. PaketPelanggan
    const dPkgs = await tx.paketPelanggan.deleteMany({
      where: { id: { in: pkgIds } },
    });

    // 12. Pembelian
    const dPurchases = await tx.pembelian.deleteMany({
      where: {
        OR: [
          { userId: { in: userIds } },
          { branchId: { in: branchIds } },
          { verifiedById: { in: userIds } },
        ],
      },
    });

    // 13. PenugasanInstruktur
    const dAssignments = await tx.penugasanInstruktur.deleteMany({
      where: { OR: [{ coachId: { in: userIds } }, { branchId: { in: branchIds } }] },
    });

    // 14. InstructorFee
    const dFees = await tx.instructorFee.deleteMany({
      where: { OR: [{ instructorId: { in: userIds } }, { branchId: { in: branchIds } }] },
    });

    // 15. OtherCost
    const dCosts = await tx.otherCost.deleteMany({
      where: { OR: [{ createdById: { in: userIds } }, { branchId: { in: branchIds } }] },
    });

    // 16. MonthlyClose
    const dCloses = await tx.monthlyClose.deleteMany({
      where: { OR: [{ closedById: { in: userIds } }, { branchId: { in: branchIds } }] },
    });

    // 17. SupportCase & SupportCaseNote
    const dNotes = await tx.supportCaseNote.deleteMany({
      where: { authorId: { in: userIds } },
    });
    const dCases = await tx.supportCase.deleteMany({
      where: {
        OR: [
          { customerId: { in: userIds } },
          { assignedUserId: { in: userIds } },
          { branchId: { in: branchIds } },
        ],
      },
    });

    // 18. UserSession
    const dSessions = await tx.userSession.deleteMany({
      where: { userId: { in: userIds } },
    });

    // 19. ProfilPengguna
    const dProfiles = await tx.profilPengguna.deleteMany({
      where: { userId: { in: userIds } },
    });

    // 19b. OwnerCabang
    const dOwners = await tx.ownerCabang.deleteMany({
      where: { OR: [{ ownerId: { in: userIds } }, { branchId: { in: branchIds } }] },
    });

    // 20. User
    const dUsers = await tx.user.deleteMany({
      where: { id: { in: userIds } },
    });

    // 21. Cabang
    const dBranches = await tx.cabang.deleteMany({
      where: { id: { in: branchIds } },
    });

    const summary = {
      correctionJournals: dCorrections.count,
      instructorAvailabilities: dAvail.count,
      adjustRequests: dAdjust.count,
      reschedules: dReschedules.count,
      attendances: dAttendances.count,
      checkInTokens: dTokens.count,
      instructorTokens: dInstTokens.count,
      instructorAttendances: dInstAttendances.count,
      slotInstructorsCleared: dSlotInstructors.count,
      bookings: dBookings.count,
      sessionLedgers: dLedgers.count,
      customerPackages: dPkgs.count,
      purchases: dPurchases.count,
      instructorAssignments: dAssignments.count,
      instructorFees: dFees.count,
      otherCosts: dCosts.count,
      monthlyCloses: dCloses.count,
      supportCases: dCases.count,
      supportNotes: dNotes.count,
      userSessions: dSessions.count,
      userProfiles: dProfiles.count,
      ownerCabangs: dOwners.count,
      users: dUsers.count,
      branches: dBranches.count,
    };

    if (dryRun) {
      throw new Error(`DRY_RUN_ROLLBACK:${JSON.stringify(summary)}`);
    }

    return summary;
  });

  return result;
}

const isDryRun = process.argv.includes('--dry-run');

run(isDryRun)
  .then((summary) => {
    console.log(`\n[SUCCESS] Pembersihan selesai dan tersimpan ke database!`);
    console.table(summary);
  })
  .catch((err) => {
    if (err.message.startsWith('DRY_RUN_ROLLBACK:')) {
      const summary = JSON.parse(err.message.replace('DRY_RUN_ROLLBACK:', ''));
      console.log(`\n[DRY-RUN VALIDATION PASSED] Relasi foreign key 100% valid! Ringkasan:`);
      console.table(summary);
    } else {
      console.error(`\n[FAILED] Terjadi error saat sanitasi:`, err);
      process.exit(1);
    }
  })
  .finally(() => prisma.$disconnect());
