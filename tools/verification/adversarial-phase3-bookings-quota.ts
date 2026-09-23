import { HttpStatus } from '@nestjs/common';
import {
  BookingStatus,
  ClassSlotCancellationReason,
  ClassSlotStatus,
  Prisma,
  PrismaClient,
  Role,
} from '@prisma/client';
import { randomBytes, randomUUID } from 'node:crypto';
import { BookingsService } from '../../apps/api/src/bookings/pemesanan-kelas.service';
import { AutoCancelService } from '../../apps/api/src/classes/auto-cancel.service';
import { ClassSlotService } from '../../apps/api/src/classes/slot-kelas.service';
import { IdempotencyService } from '../../apps/api/src/foundation/idempotency.service';
import type { SessionPrincipal } from '../../apps/api/src/identity/identity.service';
import { PolicyService } from '../../apps/api/src/identity/policy.service';
import { WhatsAppGatewayService } from '../../apps/api/src/notifications/whatsapp-gateway.service';

interface TestResult {
  code: string;
  name: string;
  category: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

const results: TestResult[] = [];

function recordResult(
  code: string,
  name: string,
  category: string,
  passed: boolean,
  message: string,
  durationMs: number,
) {
  results.push({ code, name, category, passed, message, durationMs });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`   ${icon} [${code}] ${name} (${durationMs}ms)`);
  if (!passed) {
    console.error(`      ⚠️ Detail Kegagalan: ${message}`);
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   DAILYDOSE V2 - UJI ADVERSARIAL TAHAP 3: PEMESANAN & KUOTA SESI             ║');
  console.log('║   "Transaksi Booking Mengunci Kursi & Kuota Tanpa Jebol?" — NO HAPPY PATH   ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const db = new PrismaClient();
  const policy = new PolicyService();
  const idempotency = new IdempotencyService(db as any);
  const runtimeConfig = {
    value: {
      quotaEvaluation: { maxAttempts: 5 },
      booking: { enabled: true, cutoffHours: 2 },
      bookingCancellation: { enabled: true, cutoffHours: 24 },
    },
  } as any;

  const classSlotService = new ClassSlotService(
    db as any,
    policy,
    idempotency,
    runtimeConfig,
  );

  const bookingsService = new BookingsService(
    db as any,
    idempotency,
    policy,
    runtimeConfig,
  );

  const whatsapp = new WhatsAppGatewayService(db as any);
  const autoCancelService = new AutoCancelService(db as any, whatsapp);

  const cleanupSlotIds: string[] = [];
  const cleanupBookingIds: string[] = [];
  const cleanupPackageIds: string[] = [];
  const cleanupCustomerPackageIds: string[] = [];
  const cleanupUserIds: string[] = [];
  const cleanupMinQuotaSettings: Array<{ branchId: string; classTypeId: string }> = [];

  try {
    // ------------------------------------------------------------------------
    // 1. Persiapan Aktor & Master Data
    // ------------------------------------------------------------------------
    console.log('▶ 1. Menyiapkan Aktor Uji, Ruangan Studio & Paket Customer...');

    const branches = await db.cabang.findMany({ take: 2, orderBy: { code: 'asc' } });
    if (branches.length < 2) {
      throw new Error('Dibutuhkan minimal 2 cabang untuk pengujian adversarial tahap 3!');
    }
    const [branchA, branchB] = branches;

    // Ambil jenis kelas 1 & 2
    const classTypes = await db.jenisKelas.findMany({ take: 2, orderBy: { code: 'asc' } });
    if (classTypes.length < 2) {
      throw new Error('Dibutuhkan minimal 2 jenis kelas untuk pengujian!');
    }
    const [classType1, classType2] = classTypes;

    // Ambil studio dan ruangan pada Cabang A
    let studioA = await db.studio.findFirst({ where: { branchId: branchA.id } });
    if (!studioA) {
      studioA = await db.studio.create({
        data: {
          id: `stu-${randomUUID().slice(0, 8)}`,
          branchId: branchA.id,
          name: 'Main Reformer Studio',
          active: true,
        },
      });
    }

    let roomA = await db.ruangan.findFirst({ where: { studioId: studioA.id } });
    if (!roomA) {
      roomA = await db.ruangan.create({
        data: {
          id: `room-${randomUUID().slice(0, 8)}`,
          studioId: studioA.id,
          name: 'Reformer Bed Area 1',
          capacity: 8,
          active: true,
        },
      });
    }

    // Instruktur
    const instructor = await db.user.findFirstOrThrow({ where: { role: Role.INSTRUCTOR } });

    // Admin Cabang A
    const admin = await db.user.findFirstOrThrow({ where: { role: Role.ADMIN } });
    const adminPrincipalA: SessionPrincipal = {
      sessionId: `sess-adm-a-${randomUUID().slice(0, 6)}`,
      userId: admin.id,
      roles: [{ role: 'ADMIN', branchId: branchA.id }],
      capabilities: [
        'class-slot:read',
        'class-slot:manage',
        'booking:read',
        'booking:cancel:assisted',
        'booking:create:assisted',
      ],
      branchIds: [branchA.id],
    };

    // Ambil template paket
    const defaultPackage = await db.paket.findFirstOrThrow();

    // Helper untuk membuat user customer aktif & terverifikasi
    async function createTestCustomer(tag: string): Promise<{
      user: any;
      principal: SessionPrincipal;
    }> {
      const email = `adv3.${tag}.${randomBytes(3).toString('hex')}@dailydose.test`;
      const user = await db.user.create({
        data: {
          email,
          displayName: `Adv3 Customer ${tag}`,
          phone: `+62899${Math.floor(10000000 + Math.random() * 90000000)}`,
          role: Role.CUSTOMER,
          status: 'ACTIVE',
        },
      });
      cleanupUserIds.push(user.id);

      const principal: SessionPrincipal = {
        sessionId: `sess-${tag}-${randomUUID().slice(0, 6)}`,
        userId: user.id,
        roles: [{ role: 'CUSTOMER', branchId: null }],
        capabilities: ['customer:self', 'booking:self:create', 'booking:self:cancel'],
        branchIds: [],
      };
      return { user, principal };
    }

    // Helper untuk membuat PaketPelanggan aktif
    async function createTestCustomerPackage(
      userId: string,
      options: {
        totalSessions?: number;
        remainingSessions?: number;
        status?: 'ACTIVE' | 'FROZEN' | 'EXPIRED';
        validUntil?: Date;
        packageId?: string;
      } = {},
    ) {
      const pkg = await db.paketPelanggan.create({
        data: {
          id: randomUUID(),
          userId,
          packageId: options.packageId ?? defaultPackage.id,
          totalSessions: options.totalSessions ?? 5,
          remainingSessions: options.remainingSessions ?? 5,
          usedSessions: 0,
          validUntil: options.validUntil ?? new Date(Date.now() + 30 * 86_400_000),
          status: options.status ?? 'ACTIVE',
        },
        include: { package: true },
      });
      cleanupCustomerPackageIds.push(pkg.id);
      return pkg;
    }

    // Basis tanggal pengujian (3 hari ke depan)
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 3);
    const dateStr = baseDate.toISOString().split('T')[0];

    console.log(`   Cabang A: ${branchA.name}, Cabang B: ${branchB.name}`);
    console.log(`   Jenis Kelas 1: ${classType1.name}, Jenis Kelas 2: ${classType2.name}`);
    console.log(`   Admin: ${admin.displayName}, Instruktur: ${instructor.displayName}\n`);

    // ========================================================================
    // PILAR A: CONCURRENCY, KAPASITAS & OVERBOOKING GUARD
    // ========================================================================
    console.log('▶ 2. PILAR A: Concurrency, Kapasitas & Overbooking Guard (No Happy Path)...');

    // TEST 3.A1: Capacity Limit Saturation Under High Concurrency Hammer
    {
      const start = Date.now();
      let passed = false;
      let reason = '';
      try {
        // Buat slot kelas dengan kapasitas TEPAT 2 KURSI
        const slotRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType1.id,
            studioId: studioA.id,
            roomId: roomA.id,
            instructorUserId: instructor.id,
            capacity: 2,
            startAt: `${dateStr}T10:00:00.000Z`,
            endAt: `${dateStr}T11:00:00.000Z`,
          },
          `key-slot-cap2-${Date.now()}`,
          'corr-test',
        );
        const slotId = slotRes.body.id;
        cleanupSlotIds.push(slotId);

        // Pastikan kapasitas slot tepat 2 kursi untuk collision test
        await db.slotKelas.update({
          where: { id: slotId },
          data: { capacity: 2 },
        });

        // Publish kelas
        await classSlotService.publish(
          adminPrincipalA,
          slotId,
          {},
          `key-pub-cap2-${Date.now()}`,
          'corr-test',
        );

        // Siapkan 8 customer berbeda dengan paket aktif
        const hammerCount = 8;
        const hammerActors = await Promise.all(
          Array.from({ length: hammerCount }).map(async (_, idx) => {
            const actor = await createTestCustomer(`cap-${idx}`);
            const pkg = await createTestCustomerPackage(actor.user.id, { remainingSessions: 5 });
            return { actor, pkg };
          }),
        );

        // Tembak 8 request pemesanan secara paralel serentak (concurrency hammer)
        const bookingPromises = hammerActors.map(({ actor, pkg }, idx) =>
          bookingsService
            .create(
              actor.principal,
              {
                classSlotId: slotId,
                customerPackageId: pkg.id,
                source: 'SELF',
              },
              `key-burst-book-${idx}-${Date.now()}`,
              'corr-test',
            )
            .then((res) => {
              cleanupBookingIds.push((res.body as any).id);
              return { success: true, status: res.status, error: null };
            })
            .catch((err) => ({
              success: false,
              status: err?.status || err?.statusCode || 409,
              error: err?.message || err?.code || 'CLASS_CAPACITY_FULL',
            })),
        );

        const hammerResults = await Promise.all(bookingPromises);
        const successCount = hammerResults.filter((r) => r.success).length;
        const failedCount = hammerResults.filter((r) => !r.success).length;

        // Verifikasi kondisi database MySQL aktual
        const verifiedSlot = await db.slotKelas.findUniqueOrThrow({
          where: { id: slotId },
        });
        const actualBookedRecords = await db.pemesananKelas.count({
          where: { classSlotId: slotId, status: 'BOOKED' },
        });

        passed =
          successCount === 2 &&
          failedCount === 6 &&
          verifiedSlot.bookedCount === 2 &&
          actualBookedRecords === 2;

        reason = `Berhasil = ${successCount}/2, Dicekal = ${failedCount}/6, DB bookedCount = ${verifiedSlot.bookedCount}`;
      } catch (err: any) {
        passed = false;
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_3A1',
        'Capacity Limit Saturation Under High Concurrency Hammer (8 Parallel -> Exactly 2 Allowed)',
        'Pilar A: Concurrency',
        passed,
        reason,
        Date.now() - start,
      );
    }

    // TEST 3.A2: Double Booking Attack by Same Customer (Concurrent Hammer)
    {
      const start = Date.now();
      let passed = false;
      let reason = '';
      try {
        const slotRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType1.id,
            studioId: studioA.id,
            roomId: roomA.id,
            instructorUserId: instructor.id,
            capacity: 10,
            startAt: `${dateStr}T11:30:00.000Z`,
            endAt: `${dateStr}T12:30:00.000Z`,
          },
          `key-slot-dbl-${Date.now()}`,
          'corr-test',
        );
        const slotId = slotRes.body.id;
        cleanupSlotIds.push(slotId);

        await classSlotService.publish(
          adminPrincipalA,
          slotId,
          {},
          `key-pub-dbl-${Date.now()}`,
          'corr-test',
        );

        const { principal: custPrincipal, user: custUser } = await createTestCustomer('burst-dbl');
        const custPkg = await createTestCustomerPackage(custUser.id, { remainingSessions: 10 });

        // Tembakkan 5 request bersamaan oleh customer yang SAMA dengan key berbeda
        const burstPromises = Array.from({ length: 5 }).map((_, idx) =>
          bookingsService
            .create(
              custPrincipal,
              {
                classSlotId: slotId,
                customerPackageId: custPkg.id,
                source: 'SELF',
              },
              `key-cust-burst-${idx}-${Date.now()}`,
              'corr-test',
            )
            .then((res) => {
              cleanupBookingIds.push((res.body as any).id);
              return { success: true, err: null };
            })
            .catch((err) => ({
              success: false,
              err: err?.message || err?.code || 'DUPLICATE_ACTIVE_BOOKING',
            })),
        );

        const burstResults = await Promise.all(burstPromises);
        const successCount = burstResults.filter((r) => r.success).length;
        const duplicateBlocked = burstResults.filter(
          (r) => !r.success && (r.err.includes('DUPLICATE') || r.err.includes('CONFLICT')),
        ).length;

        const dbBookingCount = await db.pemesananKelas.count({
          where: { classSlotId: slotId, userId: custUser.id, status: 'BOOKED' },
        });

        passed = successCount === 1 && duplicateBlocked === 4 && dbBookingCount === 1;
        reason = `Tepat 1 sukses, 4 dicekal DUPLICATE_ACTIVE_BOOKING, DB count = ${dbBookingCount}`;
      } catch (err: any) {
        passed = false;
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_3A2',
        'Double Booking Attack by Same Customer (5 Concurrent Burst -> Exactly 1 Allowed)',
        'Pilar A: Concurrency',
        passed,
        reason,
        Date.now() - start,
      );
    }

    // TEST 3.A3: Serial Duplicate Booking Blockade
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        const slotRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType1.id,
            studioId: studioA.id,
            roomId: roomA.id,
            instructorUserId: instructor.id,
            capacity: 5,
            startAt: `${dateStr}T13:00:00.000Z`,
            endAt: `${dateStr}T14:00:00.000Z`,
          },
          `key-slot-ser-${Date.now()}`,
          'corr-test',
        );
        const slotId = slotRes.body.id;
        cleanupSlotIds.push(slotId);

        await classSlotService.publish(
          adminPrincipalA,
          slotId,
          {},
          `key-pub-ser-${Date.now()}`,
          'corr-test',
        );

        const { principal: custPrincipal, user: custUser } = await createTestCustomer('ser-dbl');
        const custPkg = await createTestCustomerPackage(custUser.id, { remainingSessions: 5 });

        // Pemesanan pertama
        const first = await bookingsService.create(
          custPrincipal,
          {
            classSlotId: slotId,
            customerPackageId: custPkg.id,
            source: 'SELF',
          },
          `key-ser-book-1-${Date.now()}`,
          'corr-test',
        );
        cleanupBookingIds.push((first.body as any).id);

        // Percobaan pemesanan kedua secara sekuensial pada kelas yang sama
        await bookingsService.create(
          custPrincipal,
          {
            classSlotId: slotId,
            customerPackageId: custPkg.id,
            source: 'SELF',
          },
          `key-ser-book-2-${Date.now()}`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'DUPLICATE_ACTIVE_BOOKING';
      }
      recordResult(
        'TEST_3A3',
        'Serial Duplicate Booking Blockade on Active Booking',
        'Pilar A: Concurrency',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR B: INTEGRITAS SALDO PAKET & RULES MISMATCH
    // ========================================================================
    console.log('\n▶ 3. PILAR B: Integritas Saldo Paket & Rules Mismatch (No Happy Path)...');

    // TEST 3.B1: Package Depletion & Insufficient Available Sessions Guard (Rule #1)
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        // Buat 2 slot kelas berbeda
        const slot1Res = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType1.id,
            studioId: studioA.id,
            capacity: 5,
            startAt: `${dateStr}T14:30:00.000Z`,
            endAt: `${dateStr}T15:30:00.000Z`,
          },
          `key-slot-dep1-${Date.now()}`,
          'corr-test',
        );
        const slot1Id = slot1Res.body.id;
        cleanupSlotIds.push(slot1Id);
        await classSlotService.publish(
          adminPrincipalA,
          slot1Id,
          {},
          `key-pub-dep1-${Date.now()}`,
          'corr-test',
        );

        const slot2Res = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType1.id,
            studioId: studioA.id,
            capacity: 5,
            startAt: `${dateStr}T16:00:00.000Z`,
            endAt: `${dateStr}T17:00:00.000Z`,
          },
          `key-slot-dep2-${Date.now()}`,
          'corr-test',
        );
        const slot2Id = slot2Res.body.id;
        cleanupSlotIds.push(slot2Id);
        await classSlotService.publish(
          adminPrincipalA,
          slot2Id,
          {},
          `key-pub-dep2-${Date.now()}`,
          'corr-test',
        );

        // Buat customer dengan sisa sesi TEPAT 1 SESI
        const { principal: custPrincipal, user: custUser } = await createTestCustomer('deplete');
        const custPkg = await createTestCustomerPackage(custUser.id, {
          totalSessions: 1,
          remainingSessions: 1,
        });

        // Booking kelas 1 -> Berhasil
        const b1 = await bookingsService.create(
          custPrincipal,
          {
            classSlotId: slot1Id,
            customerPackageId: custPkg.id,
            source: 'SELF',
          },
          `key-dep-b1-${Date.now()}`,
          'corr-test',
        );
        cleanupBookingIds.push((b1.body as any).id);

        // Cek Rule #1: Saldo fisik di DB masih tetap 1
        const pkgDb = await db.paketPelanggan.findUniqueOrThrow({ where: { id: custPkg.id } });
        if (pkgDb.remainingSessions !== 1) {
          throw new Error(`Rule #1 violated: remainingSessions berubah menjadi ${pkgDb.remainingSessions}`);
        }

        // Coba booking kelas 2 dengan paket yang sama -> Harus dicekal karena kuota virtual habis (1 - 1 = 0)
        await bookingsService.create(
          custPrincipal,
          {
            classSlotId: slot2Id,
            customerPackageId: custPkg.id,
            source: 'SELF',
          },
          `key-dep-b2-${Date.now()}`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'INSUFFICIENT_AVAILABLE_SESSIONS';
      }
      recordResult(
        'TEST_3B1',
        'Virtual Quota Depletion Guard (Rule #1: Physical=1, Virtual=0 -> Blocked)',
        'Pilar B: Saldo & Mismatch',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 3.B2: Cross-Branch Package Hijack (Cabang Mismatch)
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        // Buat paket khusus Cabang A
        const templateBranchA = await db.paket.create({
          data: {
            id: randomUUID(),
            name: `Paket Khusus Cabang A ${Date.now()}`,
            branchId: branchA.id,
            price: 500000,
            sessionCount: 5,
            validityDays: 30,
            active: true,
          },
        });
        cleanupPackageIds.push(templateBranchA.id);

        const { principal: custPrincipal, user: custUser } = await createTestCustomer('mismatch-br');
        const custPkg = await createTestCustomerPackage(custUser.id, {
          packageId: templateBranchA.id,
          remainingSessions: 5,
        });

        // Ambil studio di Cabang B
        let studioB = await db.studio.findFirst({ where: { branchId: branchB.id } });
        if (!studioB) {
          studioB = await db.studio.create({
            data: {
              id: `stu-b-${randomUUID().slice(0, 6)}`,
              branchId: branchB.id,
              name: 'Muara Karang Studio',
              active: true,
            },
          });
        }

        // Buat slot kelas di Cabang B
        const adminPrincipalB: SessionPrincipal = {
          sessionId: `sess-adm-b-${randomUUID().slice(0, 6)}`,
          userId: admin.id,
          roles: [{ role: 'ADMIN', branchId: branchB.id }],
          capabilities: ['class-slot:read', 'class-slot:manage'],
          branchIds: [branchB.id],
        };

        const slotBRes = await classSlotService.create(
          adminPrincipalB,
          {
            branchId: branchB.id,
            classTypeId: classType1.id,
            studioId: studioB.id,
            capacity: 5,
            startAt: `${dateStr}T17:30:00.000Z`,
            endAt: `${dateStr}T18:30:00.000Z`,
          },
          `key-slot-brb-${Date.now()}`,
          'corr-test',
        );
        const slotBId = slotBRes.body.id;
        cleanupSlotIds.push(slotBId);
        await classSlotService.publish(
          adminPrincipalB,
          slotBId,
          {},
          `key-pub-brb-${Date.now()}`,
          'corr-test',
        );

        // Percobaan memesan kelas di Cabang B menggunakan paket Cabang A
        await bookingsService.create(
          custPrincipal,
          {
            classSlotId: slotBId,
            customerPackageId: custPkg.id,
            source: 'SELF',
          },
          `key-book-cross-br-${Date.now()}`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'PACKAGE_BRANCH_MISMATCH';
      }
      recordResult(
        'TEST_3B2',
        'Cross-Branch Package Hijack Blockade (Branch A Package -> Branch B Slot)',
        'Pilar B: Saldo & Mismatch',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 3.B3: Class Type Incompatibility (Jenis Kelas Mismatch)
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        // Buat paket khusus ClassType 1
        const templateType1 = await db.paket.create({
          data: {
            id: randomUUID(),
            name: `Paket Khusus Type 1 ${Date.now()}`,
            classTypeId: classType1.id,
            price: 600000,
            sessionCount: 5,
            validityDays: 30,
            active: true,
          },
        });
        cleanupPackageIds.push(templateType1.id);

        const { principal: custPrincipal, user: custUser } = await createTestCustomer('mismatch-typ');
        const custPkg = await createTestCustomerPackage(custUser.id, {
          packageId: templateType1.id,
          remainingSessions: 5,
        });

        // Buat slot kelas dengan ClassType 2
        const slotType2Res = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType2.id,
            studioId: studioA.id,
            capacity: 5,
            startAt: `${dateStr}T19:00:00.000Z`,
            endAt: `${dateStr}T20:00:00.000Z`,
          },
          `key-slot-typ2-${Date.now()}`,
          'corr-test',
        );
        const slotType2Id = slotType2Res.body.id;
        cleanupSlotIds.push(slotType2Id);
        await classSlotService.publish(
          adminPrincipalA,
          slotType2Id,
          {},
          `key-pub-typ2-${Date.now()}`,
          'corr-test',
        );

        // Percobaan memesan kelas Type 2 menggunakan paket Type 1
        await bookingsService.create(
          custPrincipal,
          {
            classSlotId: slotType2Id,
            customerPackageId: custPkg.id,
            source: 'SELF',
          },
          `key-book-cross-type-${Date.now()}`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'PACKAGE_CLASS_TYPE_MISMATCH';
      }
      recordResult(
        'TEST_3B3',
        'Class Type Incompatibility Blockade (Type 1 Package -> Type 2 Slot)',
        'Pilar B: Saldo & Mismatch',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 3.B4: Expired & Suspended Package Blockade
    {
      const start = Date.now();
      let blockedExpired = false;
      let blockedSuspended = false;
      let reason = '';
      try {
        const slotTargetRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType1.id,
            studioId: studioA.id,
            capacity: 5,
            startAt: `${dateStr}T20:30:00.000Z`,
            endAt: `${dateStr}T21:30:00.000Z`,
          },
          `key-slot-exp-chk-${Date.now()}`,
          'corr-test',
        );
        const slotTargetId = slotTargetRes.body.id;
        cleanupSlotIds.push(slotTargetId);
        await classSlotService.publish(
          adminPrincipalA,
          slotTargetId,
          {},
          `key-pub-exp-chk-${Date.now()}`,
          'corr-test',
        );

        const { principal: custPrincipal, user: custUser } = await createTestCustomer('exp-sus');

        // A. Paket Kadaluarsa (validUntil di masa lalu)
        const expiredPkg = await createTestCustomerPackage(custUser.id, {
          remainingSessions: 5,
          validUntil: new Date(Date.now() - 86_400_000), // kemarin
        });

        try {
          await bookingsService.create(
            custPrincipal,
            {
              classSlotId: slotTargetId,
              customerPackageId: expiredPkg.id,
              source: 'SELF',
            },
            `key-book-expired-${Date.now()}`,
            'corr-test',
          );
        } catch {
          blockedExpired = true;
        }

        // B. Paket Berstatus FROZEN
        const suspendedPkg = await createTestCustomerPackage(custUser.id, {
          remainingSessions: 5,
          status: 'FROZEN',
        });

        try {
          await bookingsService.create(
            custPrincipal,
            {
              classSlotId: slotTargetId,
              customerPackageId: suspendedPkg.id,
              source: 'SELF',
            },
            `key-book-suspended-${Date.now()}`,
            'corr-test',
          );
        } catch {
          blockedSuspended = true;
        }

        reason = `Expired Blocked = ${blockedExpired}, Suspended Blocked = ${blockedSuspended}`;
      } catch (err: any) {
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_3B4',
        'Expired & Suspended Customer Package Booking Blockade',
        'Pilar B: Saldo & Mismatch',
        blockedExpired && blockedSuspended,
        reason,
        Date.now() - start,
      );
    }

    // TEST 3.B5: Stolen Customer Package ID (IDOR Attack)
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        const slotRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType1.id,
            studioId: studioA.id,
            capacity: 5,
            startAt: `${dateStr}T22:00:00.000Z`,
            endAt: `${dateStr}T23:00:00.000Z`,
          },
          `key-slot-idor-${Date.now()}`,
          'corr-test',
        );
        const slotId = slotRes.body.id;
        cleanupSlotIds.push(slotId);
        await classSlotService.publish(
          adminPrincipalA,
          slotId,
          {},
          `key-pub-idor-${Date.now()}`,
          'corr-test',
        );

        // Customer Korban (Pemilik Sah Paket)
        const { user: victimUser } = await createTestCustomer('victim');
        const victimPkg = await createTestCustomerPackage(victimUser.id, { remainingSessions: 5 });

        // Customer Penyerang (Mencoba menggunakan paket korban)
        const { principal: attackerPrincipal } = await createTestCustomer('attacker');

        await bookingsService.create(
          attackerPrincipal,
          {
            classSlotId: slotId,
            customerPackageId: victimPkg.id,
            source: 'SELF',
          },
          `key-book-idor-${Date.now()}`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'RESOURCE_NOT_FOUND';
      }
      recordResult(
        'TEST_3B5',
        'IDOR Package Hijacking Blockade (Attacker uses Victim Package ID)',
        'Pilar B: Saldo & Mismatch',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR C: CUTOFF WAKTU PEMESANAN & PEMBATALAN
    // ========================================================================
    console.log('\n▶ 4. PILAR C: Cutoff Waktu Pemesanan & Pembatalan (No Happy Path)...');

    // TEST 3.C1: Booking Cutoff Blockade (Late Booking Attempt)
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        // Kelas mulai 1 jam lagi (kurang dari cutoffHours = 2 jam)
        const now = new Date();
        const startSoon = new Date(now.getTime() + 1 * 3_600_000);
        const endSoon = new Date(startSoon.getTime() + 3_600_000);

        const slotLateRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType1.id,
            studioId: studioA.id,
            capacity: 5,
            startAt: startSoon.toISOString(),
            endAt: endSoon.toISOString(),
          },
          `key-slot-late-${Date.now()}`,
          'corr-test',
        );
        const slotLateId = slotLateRes.body.id;
        cleanupSlotIds.push(slotLateId);
        await classSlotService.publish(
          adminPrincipalA,
          slotLateId,
          {},
          `key-pub-late-${Date.now()}`,
          'corr-test',
        );

        const { principal: custPrincipal, user: custUser } = await createTestCustomer('late-b');
        const custPkg = await createTestCustomerPackage(custUser.id, { remainingSessions: 5 });

        await bookingsService.create(
          custPrincipal,
          {
            classSlotId: slotLateId,
            customerPackageId: custPkg.id,
            source: 'SELF',
          },
          `key-book-late-${Date.now()}`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'BOOKING_CUTOFF_PASSED';
      }
      recordResult(
        'TEST_3C1',
        'Booking Cutoff Blockade (Class starts in 1h, Cutoff=2h -> Blocked)',
        'Pilar C: Cutoff Booking',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 3.C2: Customer Late Cancellation Blockade (Bypass H-24 Protection)
    let lateBookingIdToOverride = '';
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        // Kelas mulai dalam 10 jam (melewati batas cutoff pembatalan H-24 jam)
        const now = new Date();
        const startIn10h = new Date(now.getTime() + 10 * 3_600_000);
        const endIn11h = new Date(startIn10h.getTime() + 3_600_000);

        const slotLateCancelRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType1.id,
            studioId: studioA.id,
            capacity: 5,
            startAt: startIn10h.toISOString(),
            endAt: endIn11h.toISOString(),
          },
          `key-slot-lcanc-${Date.now()}`,
          'corr-test',
        );
        const slotLateCancelId = slotLateCancelRes.body.id;
        cleanupSlotIds.push(slotLateCancelId);
        await classSlotService.publish(
          adminPrincipalA,
          slotLateCancelId,
          {},
          `key-pub-lcanc-${Date.now()}`,
          'corr-test',
        );

        const { principal: custPrincipal, user: custUser } = await createTestCustomer('late-c');
        const custPkg = await createTestCustomerPackage(custUser.id, { remainingSessions: 5 });

        // Admin assist buatkan booking terlebih dahulu
        const b = await bookingsService.create(
          adminPrincipalA,
          {
            classSlotId: slotLateCancelId,
            customerPackageId: custPkg.id,
            customerUserId: custUser.id,
            source: 'ADMIN_ASSISTED',
          },
          `key-book-assist-${Date.now()}`,
          'corr-test',
        );
        lateBookingIdToOverride = (b.body as any).id;
        cleanupBookingIds.push(lateBookingIdToOverride);

        // Customer mencoba membatalkan mandiri lewat batas H-24
        await bookingsService.cancel(
          custPrincipal,
          lateBookingIdToOverride,
          { reasonCode: 'CUSTOMER_SCHEDULE_CONFLICT' as any },
          `key-cancel-late-cust-${Date.now()}`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'CANCELLATION_CUTOFF_PASSED';
      }
      recordResult(
        'TEST_3C2',
        'Customer Late Cancellation Blockade (Class in 10h, Cutoff=24h -> Blocked)',
        'Pilar C: Cutoff Booking',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 3.C3: Assisted Admin Cancellation with Valid Justification (Staff Override)
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        if (!lateBookingIdToOverride) throw new Error('Booking ID untuk pembatalan admin tidak tersedia');

        // Admin membatalkan pesanan customer yang terlambat dengan alasan darurat
        await bookingsService.cancel(
          adminPrincipalA,
          lateBookingIdToOverride,
          {
            reasonCode: 'SAFETY_ISSUE' as any,
            reason: 'Darurat Medis Diverifikasi Staf',
          },
          `key-admin-override-cancel-${Date.now()}`,
          'corr-test',
        );

        const bookingDb = await db.pemesananKelas.findUniqueOrThrow({
          where: { id: lateBookingIdToOverride },
        });

        success = bookingDb.status === 'CANCELLED';
        reason = `Admin berhasil override: Status = ${bookingDb.status}, Reason = ${bookingDb.cancellationReason}`;
      } catch (err: any) {
        success = false;
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_3C3',
        'Assisted Admin Emergency Cancellation Override (Staff Justified Action)',
        'Pilar C: Cutoff Booking',
        success,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR D: EVALUASI KUOTA MINIMUM H-24 & MULTI-PIHAK WHATSAPP
    // ========================================================================
    console.log('\n▶ 5. PILAR D: Evaluasi Kuota Minimum H-24 & Multi-Pihak WhatsApp (Rules #4 & #5)...');

    // Konfigurasi MinQuotaSetting: minQuota = 2, cutoffHours = 24
    await db.minQuotaSetting.upsert({
      where: {
        branchId_classTypeId: {
          branchId: branchA.id,
          classTypeId: classType1.id,
        },
      },
      update: { minQuota: 2, cutoffHours: 24, active: true },
      create: { branchId: branchA.id, classTypeId: classType1.id, minQuota: 2, cutoffHours: 24, active: true },
    });
    cleanupMinQuotaSettings.push({ branchId: branchA.id, classTypeId: classType1.id });

    let autoCancelSlotId = '';
    let autoCancelBookingId = '';

    // TEST 3.D1: Auto-Cancel Trigger when Below Min-Quota at H-24 Window
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        process.env.ENABLE_AUTO_CANCEL = 'true';

        // Buat kelas mulai 20 jam ke depan (dalam jendela H-24)
        const now = new Date();
        const startIn20h = new Date(now.getTime() + 20 * 3_600_000);
        const endIn21h = new Date(startIn20h.getTime() + 3_600_000);

        const slotAutoRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType1.id,
            studioId: studioA.id,
            instructorUserId: instructor.id,
            capacity: 5,
            startAt: startIn20h.toISOString(),
            endAt: endIn21h.toISOString(),
          },
          `key-slot-autocanc-${Date.now()}`,
          'corr-test',
        );
        autoCancelSlotId = slotAutoRes.body.id;
        cleanupSlotIds.push(autoCancelSlotId);

        await classSlotService.publish(
          adminPrincipalA,
          autoCancelSlotId,
          {},
          `key-pub-autocanc-${Date.now()}`,
          'corr-test',
        );

        // Hanya 1 customer memesan (minQuota = 2, jadi kurang kuota!)
        const { principal: custPrincipal, user: custUser } = await createTestCustomer('autocanc');
        const custPkg = await createTestCustomerPackage(custUser.id, { remainingSessions: 5 });

        const b = await bookingsService.create(
          custPrincipal,
          {
            classSlotId: autoCancelSlotId,
            customerPackageId: custPkg.id,
            source: 'SELF',
          },
          `key-book-autocanc-${Date.now()}`,
          'corr-test',
        );
        autoCancelBookingId = (b.body as any).id;
        cleanupBookingIds.push(autoCancelBookingId);

        // Jalankan evaluasi AutoCancelService
        await autoCancelService.evaluateClasses(now);

        const slotDb = await db.slotKelas.findUniqueOrThrow({ where: { id: autoCancelSlotId } });
        const bookingDb = await db.pemesananKelas.findUniqueOrThrow({ where: { id: autoCancelBookingId } });
        const pkgDb = await db.paketPelanggan.findUniqueOrThrow({ where: { id: custPkg.id } });

        const slotWasCancelled =
          slotDb.status === ClassSlotStatus.CANCELLED &&
          slotDb.cancellationReason === 'AUTO_CANCEL_MIN_QUOTA';
        const bookingWasCancelled =
          bookingDb.status === 'CANCELLED' &&
          bookingDb.cancellationReason === 'CLASS_AUTO_CANCELLED';
        const sessionPreserved = pkgDb.remainingSessions === 5;

        success = slotWasCancelled && bookingWasCancelled && sessionPreserved;
        reason = `Slot status = ${slotDb.status}, Booking status = ${bookingDb.status}, Sesi = ${pkgDb.remainingSessions}/5`;
      } catch (err: any) {
        success = false;
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_3D1',
        'Auto-Cancel Trigger when Below Min-Quota at H-24 Window (Booked: 1 < Min: 2)',
        'Pilar D: Auto-Cancel H-24',
        success,
        reason,
        Date.now() - start,
      );
    }

    // TEST 3.D2: Multi-Party WhatsApp Notification on Auto-Cancel
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        // Periksa tabel ReminderLog untuk notifikasi pembatalan kelas otomatis
        const logs = await db.reminderLog.findMany({
          where: {
            reminderType: {
              in: ['CLASS_AUTO_CANCELLED', 'CLASS_AUTO_CANCELLED_INSTRUCTOR', 'CLASS_AUTO_CANCELLED_STAFF'],
            },
          },
          orderBy: { sentAt: 'desc' },
          take: 10,
        });

        const customerNotified = logs.some((l) => l.reminderType === 'CLASS_AUTO_CANCELLED');
        const instructorNotified = logs.some((l) => l.reminderType === 'CLASS_AUTO_CANCELLED_INSTRUCTOR');

        success = customerNotified && instructorNotified;
        reason = `Customer WA = ${customerNotified}, Instructor WA = ${instructorNotified}, Total auto-cancel logs = ${logs.length}`;
      } catch (err: any) {
        success = false;
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_3D2',
        'Multi-Party WhatsApp Notification on Auto-Cancel (Customer & Coach Notified)',
        'Pilar D: Auto-Cancel H-24',
        success,
        reason,
        Date.now() - start,
      );
    }

    // TEST 3.D3: Quota Met Class Confirmation (Auto-Confirmation at H-24)
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        const now = new Date();
        const startIn20h = new Date(now.getTime() + 20 * 3_600_000);
        const endIn21h = new Date(startIn20h.getTime() + 3_600_000);

        const slotConfRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType1.id,
            studioId: studioA.id,
            instructorUserId: instructor.id,
            capacity: 5,
            startAt: startIn20h.toISOString(),
            endAt: endIn21h.toISOString(),
          },
          `key-slot-autoconf-${Date.now()}`,
          'corr-test',
        );
        const slotConfId = slotConfRes.body.id;
        cleanupSlotIds.push(slotConfId);

        await classSlotService.publish(
          adminPrincipalA,
          slotConfId,
          {},
          `key-pub-autoconf-${Date.now()}`,
          'corr-test',
        );

        // Daftarkan 2 customer (minQuota = 2, kuota terpenuhi!)
        const custA = await createTestCustomer('conf-a');
        const pkgA = await createTestCustomerPackage(custA.user.id, { remainingSessions: 5 });
        const bA = await bookingsService.create(
          custA.principal,
          {
            classSlotId: slotConfId,
            customerPackageId: pkgA.id,
            source: 'SELF',
          },
          `key-book-confa-${Date.now()}`,
          'corr-test',
        );
        cleanupBookingIds.push((bA.body as any).id);

        const custB = await createTestCustomer('conf-b');
        const pkgB = await createTestCustomerPackage(custB.user.id, { remainingSessions: 5 });
        const bB = await bookingsService.create(
          custB.principal,
          {
            classSlotId: slotConfId,
            customerPackageId: pkgB.id,
            source: 'SELF',
          },
          `key-book-confb-${Date.now()}`,
          'corr-test',
        );
        cleanupBookingIds.push((bB.body as any).id);

        // Jalankan evaluasi auto-cancel
        await autoCancelService.evaluateClasses(now);

        const slotDb = await db.slotKelas.findUniqueOrThrow({ where: { id: slotConfId } });

        success = slotDb.status === ClassSlotStatus.CONFIRMED;
        reason = `Status kelas berhasil dikonfirmasi menjadi = ${slotDb.status} (Peserta: 2/2)`;
      } catch (err: any) {
        success = false;
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_3D3',
        'Quota Met Class Auto-Confirmation at H-24 Window (Booked: 2 >= Min: 2 -> CONFIRMED)',
        'Pilar D: Auto-Cancel H-24',
        success,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR E: IDEMPOTENSI & TAMPERING PROTEKSI
    // ========================================================================
    console.log('\n▶ 6. PILAR E: Idempotensi & Proteksi Transaksi Booking (No Happy Path)...');

    // TEST 3.E1: Replay Attack on Booking Creation (Strict Idempotency)
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        const slotRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType1.id,
            studioId: studioA.id,
            capacity: 5,
            startAt: `${dateStr}T23:30:00.000Z`,
            endAt: `${dateStr}T23:59:00.000Z`,
          },
          `key-slot-replay-${Date.now()}`,
          'corr-test',
        );
        const slotId = slotRes.body.id;
        cleanupSlotIds.push(slotId);
        await classSlotService.publish(
          adminPrincipalA,
          slotId,
          {},
          `key-pub-replay-${Date.now()}`,
          'corr-test',
        );

        const { principal: custPrincipal, user: custUser } = await createTestCustomer('replay');
        const custPkg = await createTestCustomerPackage(custUser.id, { remainingSessions: 5 });

        const replayKey = `key-fixed-idemp-${Date.now()}-${randomBytes(4).toString('hex')}`;

        // Request 1
        const res1 = await bookingsService.create(
          custPrincipal,
          {
            classSlotId: slotId,
            customerPackageId: custPkg.id,
            source: 'SELF',
          },
          replayKey,
          'corr-test',
        );
        cleanupBookingIds.push((res1.body as any).id);

        // Request 2 dengan key yang persis sama (Replay attack)
        const res2 = await bookingsService.create(
          custPrincipal,
          {
            classSlotId: slotId,
            customerPackageId: custPkg.id,
            source: 'SELF',
          },
          replayKey,
          'corr-test',
        );

        const slotDb = await db.slotKelas.findUniqueOrThrow({ where: { id: slotId } });
        const totalBookings = await db.pemesananKelas.count({
          where: { classSlotId: slotId, userId: custUser.id },
        });

        success =
          (res1.body as any).id === (res2.body as any).id &&
          slotDb.bookedCount === 1 &&
          totalBookings === 1;
        reason = `Booking ID identik, DB bookedCount = ${slotDb.bookedCount}, total bookings = ${totalBookings}`;
      } catch (err: any) {
        success = false;
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_3E1',
        'Replay Attack on Booking Creation (Strict Idempotency Replay Handled)',
        'Pilar E: Idempotensi',
        success,
        reason,
        Date.now() - start,
      );
    }

    // TEST 3.E2: Non-Existent Class Slot Reference Blockade
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        const { principal: custPrincipal, user: custUser } = await createTestCustomer('ghost');
        const custPkg = await createTestCustomerPackage(custUser.id, { remainingSessions: 5 });

        await bookingsService.create(
          custPrincipal,
          {
            classSlotId: randomUUID(), // Slot fiktif
            customerPackageId: custPkg.id,
            source: 'SELF',
          },
          `key-book-ghost-${Date.now()}`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'RESOURCE_NOT_FOUND';
      }
      recordResult(
        'TEST_3E2',
        'Non-Existent Class Slot Reference Blockade (Random UUID -> 404)',
        'Pilar E: Idempotensi',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // RINGKASAN HASIL
    // ========================================================================
    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;

    console.log('\n══════════════════════════════════════════════════════════════════════════════');
    console.log('📊 RINGKASAN HASIL PENGUJIAN ADVERSARIAL TAHAP 3 (PEMESANAN & KUOTA SESI)');
    console.log('══════════════════════════════════════════════════════════════════════════════');
    console.log(`Total Skenario Diuji : ${total}`);
    console.log(`Skenario LULUS (PASS): ${passed} ✅`);
    console.log(`Skenario GAGAL (FAIL): ${failed} ${failed > 0 ? '❌' : '🎉'}\n`);

    if (failed > 0) {
      console.log('❌ DAFTAR SKENARIO GAGAL:');
      for (const f of results.filter((r) => !r.passed)) {
        console.log(`- [${f.code}] ${f.name}: ${f.message}`);
      }
    } else {
      console.log('🎉 SEMUA 16 SKENARIO ADVERSARIAL TAHAP 3 LULUS 100%! 🎉');
      console.log('   Pilar A: Concurrency hammer membuktikan proteksi overbooking & double booking mutlak.');
      console.log('   Pilar B: Rule #1 terbukti menjaga kuota fisik & mencegah mismatch cabang / tipe / expired.');
      console.log('   Pilar C: Cutoff booking & late cancellation customer terproteksi ketat dari bypass.');
      console.log('   Pilar D: Auto-cancel H-24 membatalkan kelas kurang kuota & notifikasi multi-pihak terkirim.');
      console.log('   Pilar E: Idempotency replay attack tertangani rapi tanpa duplikasi pemotongan kuota.');
    }
  } finally {
    // ------------------------------------------------------------------------
    // Cleanup / Teardown
    // ------------------------------------------------------------------------
    console.log('\n🧹 Membersihkan slot kelas & data temporer pengujian Tahap 3...');
    try {
      if (cleanupBookingIds.length > 0) {
        await db.pemesananKelas.deleteMany({ where: { id: { in: cleanupBookingIds } } });
      }
      if (cleanupSlotIds.length > 0) {
        await db.slotKelas.deleteMany({ where: { id: { in: cleanupSlotIds } } });
      }
      if (cleanupCustomerPackageIds.length > 0) {
        await db.sessionLedger.deleteMany({
          where: { customerPackageId: { in: cleanupCustomerPackageIds } },
        });
        await db.paketPelanggan.deleteMany({ where: { id: { in: cleanupCustomerPackageIds } } });
      }
      if (cleanupPackageIds.length > 0) {
        await db.paket.deleteMany({ where: { id: { in: cleanupPackageIds } } });
      }
      if (cleanupUserIds.length > 0) {
        await db.user.deleteMany({ where: { id: { in: cleanupUserIds } } });
      }
      for (const mq of cleanupMinQuotaSettings) {
        await db.minQuotaSetting.deleteMany({
          where: { branchId: mq.branchId, classTypeId: mq.classTypeId },
        });
      }
      console.log(`   ✅ Seluruh data temporer pengujian Tahap 3 berhasil dibersihkan.`);
    } catch (cleanupErr: any) {
      console.warn(`   ⚠️ Catatan cleanup: ${cleanupErr.message}`);
    }

    await db.$disconnect();

    const failed = results.filter((r) => !r.passed).length;
    if (failed > 0) {
      throw new Error(`Pengujian Adversarial Tahap 3 GAGAL: ${failed} skenario terdeteksi bocor!`);
    }
  }
}

main().catch((err) => {
  console.error('\n💥 FATAL ERROR PADA UJI ADVERSARIAL TAHAP 3:', err);
  process.exit(1);
});
