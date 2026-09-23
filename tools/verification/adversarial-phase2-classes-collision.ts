import {
  PrismaClient,
  Role,
  ClassSlotStatus,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PolicyService } from '../../apps/api/src/identity/policy.service';
import type { SessionPrincipal } from '../../apps/api/src/identity/identity.service';
import {
  ClassSlotService,
  type ClassSlotCancellationReason,
} from '../../apps/api/src/classes/slot-kelas.service';
import { IdempotencyService } from '../../apps/api/src/foundation/idempotency.service';
import { BookingsService } from '../../apps/api/src/bookings/pemesanan-kelas.service';

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
  console.log('║   DAILYDOSE V2 - UJI ADVERSARIAL TAHAP 2: JADWAL & COLLISION GUARD           ║');
  console.log('║   "Ruangan & Instruktur Siap Tanpa Bentrok?" — STRICT NO HAPPY PATH          ║');
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

  const cleanupSlotIds: string[] = [];
  const cleanupBookingIds: string[] = [];
  const cleanupPackageIds: string[] = [];

  try {
    // ------------------------------------------------------------------------
    // Persiapan Aktor & Master Data
    // ------------------------------------------------------------------------
    console.log('▶ 1. Menyiapkan Aktor Uji, Ruangan Studio & Instruktur...');
    const superOwner = await db.user.findFirstOrThrow({ where: { role: Role.SUPER_OWNER } });
    const admin = await db.user.findFirstOrThrow({ where: { role: Role.ADMIN } });
    const instructor = await db.user.findFirstOrThrow({ where: { role: Role.INSTRUCTOR } });
    const customer = await db.user.findFirstOrThrow({ where: { role: Role.CUSTOMER } });

    const branches = await db.cabang.findMany({ take: 2, orderBy: { code: 'asc' } });
    if (branches.length < 2) {
      throw new Error('Dibutuhkan minimal 2 cabang untuk pengujian scope penjadwalan!');
    }
    const [branchA, branchB] = branches;

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

    const classType = await db.jenisKelas.findFirstOrThrow();

    // Principals
    const adminPrincipalA: SessionPrincipal = {
      sessionId: `sess-adm-a-${randomUUID().slice(0, 6)}`,
      userId: admin.id,
      roles: [{ role: 'ADMIN', branchId: branchA.id }],
      capabilities: ['class-slot:read', 'class-slot:manage'],
      branchIds: [branchA.id],
    };

    const customerPrincipal: SessionPrincipal = {
      sessionId: `sess-cust-${randomUUID().slice(0, 6)}`,
      userId: customer.id,
      roles: [{ role: 'CUSTOMER', branchId: null }],
      capabilities: ['customer:self', 'booking:self:create'],
      branchIds: [],
    };

    const instructorPrincipal: SessionPrincipal = {
      sessionId: `sess-inst-${randomUUID().slice(0, 6)}`,
      userId: instructor.id,
      roles: [{ role: 'INSTRUCTOR', branchId: branchA.id }],
      capabilities: ['class:assigned:read', 'attendance:self'],
      branchIds: [branchA.id],
    };

    console.log(`   Cabang A: ${branchA.name}, Studio: ${studioA.name}, Ruangan: ${roomA.name}`);
    console.log(`   Instruktur: ${instructor.displayName} (${instructor.email})\n`);

    // Basis waktu untuk collision test: Besok jam 10:00 - 11:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const slotTimeBase = {
      startAt: `${dateStr}T10:00:00.000Z`,
      endAt: `${dateStr}T11:00:00.000Z`,
    };

    // Hapus sisa slot uji sebelumnya pada jendela tanggal uji agar bersih
    await db.pemesananKelas.deleteMany({
      where: {
        classSlot: {
          startAt: { gte: new Date(`${dateStr}T00:00:00.000Z`) },
          endAt: { lte: new Date(`${dateStr}T23:59:59.999Z`) },
        },
      },
    });
    await db.slotKelas.deleteMany({
      where: {
        startAt: { gte: new Date(`${dateStr}T00:00:00.000Z`) },
        endAt: { lte: new Date(`${dateStr}T23:59:59.999Z`) },
      },
    });

    // Buat Slot Kelas Utama (Slot A) sebagai baseline collision
    const baseSlotKey = `key-base-slot-${Date.now()}-001`;
    const baseSlotRes = await classSlotService.create(
      adminPrincipalA,
      {
        branchId: branchA.id,
        classTypeId: classType.id,
        studioId: studioA.id,
        roomId: roomA.id,
        instructorUserId: instructor.id,
        startAt: slotTimeBase.startAt,
        endAt: slotTimeBase.endAt,
      },
      baseSlotKey,
      'corr-base',
    );
    const baseSlotId = baseSlotRes.body.id;
    cleanupSlotIds.push(baseSlotId);
    console.log(`   🎯 Baseline Slot A Dibuat: ID=${baseSlotId} (${slotTimeBase.startAt} s/d ${slotTimeBase.endAt})\n`);

    // ========================================================================
    // PILAR A: COLLISION GUARD RUANGAN STUDIO
    // ========================================================================
    console.log('▶ 2. PILAR A: Collision Guard Ruangan Studio (No Happy Path)...');

    // TEST 2.A1: Exact Match Room Collision (10:00 - 11:00)
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studioA.id,
            roomId: roomA.id,
            startAt: `${dateStr}T10:00:00.000Z`,
            endAt: `${dateStr}T11:00:00.000Z`,
          },
          `key-exact-coll-${Date.now()}-002`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'SLOT_SCHEDULE_COLLISION';
      }
      recordResult(
        'TEST_2A1',
        'Exact Match Room Collision (10:00-11:00 vs 10:00-11:00)',
        'Pilar A: Ruangan',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 2.A2: Partial Overlap (Start Inside: 10:30 - 11:30)
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studioA.id,
            roomId: roomA.id,
            startAt: `${dateStr}T10:30:00.000Z`,
            endAt: `${dateStr}T11:30:00.000Z`,
          },
          `key-part-start-${Date.now()}-003`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'SLOT_SCHEDULE_COLLISION';
      }
      recordResult(
        'TEST_2A2',
        'Partial Overlap Collision (10:30-11:30 overlaps with 10:00-11:00)',
        'Pilar A: Ruangan',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 2.A3: Partial Overlap (End Inside: 09:30 - 10:30)
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studioA.id,
            roomId: roomA.id,
            startAt: `${dateStr}T09:30:00.000Z`,
            endAt: `${dateStr}T10:30:00.000Z`,
          },
          `key-part-end-${Date.now()}-004`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'SLOT_SCHEDULE_COLLISION';
      }
      recordResult(
        'TEST_2A3',
        'Partial Overlap Collision (09:30-10:30 overlaps with 10:00-11:00)',
        'Pilar A: Ruangan',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 2.A4: Enclosing Window (09:00 - 12:00)
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studioA.id,
            roomId: roomA.id,
            startAt: `${dateStr}T09:00:00.000Z`,
            endAt: `${dateStr}T12:00:00.000Z`,
          },
          `key-enclosing-${Date.now()}-005`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'SLOT_SCHEDULE_COLLISION';
      }
      recordResult(
        'TEST_2A4',
        'Enclosing Window Collision (09:00-12:00 encloses 10:00-11:00)',
        'Pilar A: Ruangan',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 2.A5: Boundary Non-Colliding Class (Back-to-Back: 11:00 - 12:00 Permitted)
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        const slotBackToBack = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studioA.id,
            roomId: roomA.id,
            startAt: `${dateStr}T11:00:00.000Z`,
            endAt: `${dateStr}T12:00:00.000Z`,
          },
          `key-backtoback-${Date.now()}-006`,
          'corr-test',
        );
        cleanupSlotIds.push(slotBackToBack.body.id);
        success = true;
        reason = `Slot Back-to-Back Berhasil Dibuat: ID=${slotBackToBack.body.id}`;
      } catch (err: any) {
        success = false;
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_2A5',
        'Boundary Non-Colliding Class (Back-to-Back: 11:00-12:00 Permitted)',
        'Pilar A: Ruangan',
        success,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR B: COLLISION GUARD INSTRUKTUR
    // ========================================================================
    console.log('\n▶ 3. PILAR B: Collision Guard Instruktur (No Happy Path)...');

    // TEST 2.B1: Same Instructor Double Booking on Creation
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studioA.id,
            instructorUserId: instructor.id,
            startAt: `${dateStr}T10:15:00.000Z`,
            endAt: `${dateStr}T11:15:00.000Z`,
          },
          `key-inst-coll-${Date.now()}-007`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'SLOT_SCHEDULE_COLLISION';
      }
      recordResult(
        'TEST_2B1',
        'Same Instructor Double Booking on Creation Blockade',
        'Pilar B: Instruktur',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 2.B2: Instructor Collision on Assignment Action
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        const emptySlotRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studioA.id,
            startAt: `${dateStr}T10:20:00.000Z`,
            endAt: `${dateStr}T11:20:00.000Z`,
          },
          `key-empty-slot-${Date.now()}-008`,
          'corr-test',
        );
        const emptySlotId = emptySlotRes.body.id;
        cleanupSlotIds.push(emptySlotId);

        // Assign instruktur yang sedang mengajar di baseline slot (10:00 - 11:00)
        await classSlotService.assign(
          adminPrincipalA,
          emptySlotId,
          { instructorUserId: instructor.id },
          `key-assign-coll-${Date.now()}-009`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'SLOT_SCHEDULE_COLLISION';
      }
      recordResult(
        'TEST_2B2',
        'Instructor Collision on Assignment Action Blockade',
        'Pilar B: Instruktur',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 2.B3: Cancelled Slot Collision Bypass (Legitimate Reuse)
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        const cancelTargetSlot = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studioA.id,
            roomId: roomA.id,
            startAt: `${dateStr}T16:00:00.000Z`,
            endAt: `${dateStr}T17:00:00.000Z`,
          },
          `key-cancel-target-${Date.now()}-010`,
          'corr-test',
        );
        const cancelTargetSlotId = cancelTargetSlot.body.id;
        cleanupSlotIds.push(cancelTargetSlotId);

        // Batalkan slot tersebut
        await classSlotService.cancel(
          adminPrincipalA,
          cancelTargetSlotId,
          { reasonCode: 'STUDIO_UNAVAILABLE' as ClassSlotCancellationReason },
          `key-cancel-exec-${Date.now()}-011`,
          'corr-test',
        );

        // Buat slot baru di jam yang sama persis (16:00 - 17:00)
        const recycledSlot = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studioA.id,
            roomId: roomA.id,
            startAt: `${dateStr}T16:00:00.000Z`,
            endAt: `${dateStr}T17:00:00.000Z`,
          },
          `key-recycled-slot-${Date.now()}-012`,
          'corr-test',
        );
        cleanupSlotIds.push(recycledSlot.body.id);

        success = true;
        reason = `Slot Dibatalkan Berhasil Dipakai Ulang: ID=${recycledSlot.body.id}`;
      } catch (err: any) {
        success = false;
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_2B3',
        'Cancelled Slot Collision Bypass (Legitimate Slot Recycling)',
        'Pilar B: Instruktur',
        success,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR C: VALIDASI WAKTU & INPUT
    // ========================================================================
    console.log('\n▶ 4. PILAR C: Validasi Waktu & Input (No Happy Path)...');

    // TEST 2.C1: Inverted Time Interval (startAt >= endAt)
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studioA.id,
            startAt: `${dateStr}T11:00:00.000Z`,
            endAt: `${dateStr}T10:00:00.000Z`, // Waktu terbalik
          },
          `key-inverted-time-${Date.now()}-013`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'VALIDATION_ERROR';
      }
      recordResult(
        'TEST_2C1',
        'Inverted Time Interval Blockade (startAt >= endAt)',
        'Pilar C: Validasi Waktu',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 2.C2: Zero Duration Class (startAt == endAt)
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studioA.id,
            startAt: `${dateStr}T10:00:00.000Z`,
            endAt: `${dateStr}T10:00:00.000Z`, // Durasi 0 menit
          },
          `key-zero-dur-${Date.now()}-014`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'VALIDATION_ERROR';
      }
      recordResult(
        'TEST_2C2',
        'Zero Duration Class Blockade (startAt == endAt)',
        'Pilar C: Validasi Waktu',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 2.C3: Malformed Timestamp String Injection
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studioA.id,
            startAt: 'besok-pagi-jam-10',
            endAt: `${dateStr}T11:00:00.000Z`,
          },
          `key-malformed-${Date.now()}-015`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'VALIDATION_ERROR';
      }
      recordResult(
        'TEST_2C3',
        'Malformed Non-ISO Timestamp String Blockade',
        'Pilar C: Validasi Waktu',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 2.C4: Non-Existent or Inactive Branch/ClassType Reference
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        await classSlotService.create(
          adminPrincipalA,
          {
            branchId: randomUUID(),
            classTypeId: classType.id,
            studioId: studioA.id,
            startAt: `${dateStr}T18:00:00.000Z`,
            endAt: `${dateStr}T19:00:00.000Z`,
          },
          `key-nonexistent-${Date.now()}-016`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'RESOURCE_NOT_FOUND';
      }
      recordResult(
        'TEST_2C4',
        'Non-Existent Branch UUID Reference Blockade',
        'Pilar C: Validasi Waktu',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR D: INTEGRITAS STATE MACHINE KELAS
    // ========================================================================
    console.log('\n▶ 5. PILAR D: Integritas State Machine Kelas (No Happy Path)...');

    // TEST 2.D1: Idempotent Class Completion
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        const completeTargetRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studioA.id,
            startAt: `${dateStr}T20:00:00.000Z`,
            endAt: `${dateStr}T21:00:00.000Z`,
          },
          `key-compl-target-${Date.now()}-017`,
          'corr-test',
        );
        const completeSlotId = completeTargetRes.body.id;
        cleanupSlotIds.push(completeSlotId);

        // Eksekusi complete pertama (key >= 16 chars)
        const comp1 = await classSlotService.complete(
          adminPrincipalA,
          completeSlotId,
          { reason: 'NORMAL_COMPLETION' },
          `key-comp-first-12345678`,
          'corr-test',
        );

        // Eksekusi complete kedua (Hammering idempotent)
        const comp2 = await classSlotService.complete(
          adminPrincipalA,
          completeSlotId,
          { reason: 'NORMAL_COMPLETION' },
          `key-comp-second-12345678`,
          'corr-test',
        );

        success = comp1.body.status === ClassSlotStatus.COMPLETED && comp2.body.status === ClassSlotStatus.COMPLETED;
        reason = 'Class Completion bersifat idempoten tanpa duplikasi';
      } catch (err: any) {
        success = false;
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_2D1',
        'Idempotent Class Completion (Double Trigger Handled Gracefully)',
        'Pilar D: State Machine',
        success,
        reason,
        Date.now() - start,
      );
    }

    // TEST 2.D2: Automatic Session Return on Manual Class Cancellation
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        // Buat slot kelas
        const cancelWithMembersRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studioA.id,
            startAt: `${dateStr}T22:00:00.000Z`,
            endAt: `${dateStr}T23:00:00.000Z`,
          },
          `key-canc-memb-slot-${Date.now()}-018`,
          'corr-test',
        );
        const cancelWithMembersSlotId = cancelWithMembersRes.body.id;
        cleanupSlotIds.push(cancelWithMembersSlotId);

        // Publikasikan kelas
        await classSlotService.publish(
          adminPrincipalA,
          cancelWithMembersSlotId,
          {},
          `key-pub-slot-1234567890`,
          'corr-test',
        );

        // Siapkan paket aktif untuk customer
        const testPkg = await db.paketPelanggan.create({
          data: {
            id: randomUUID(),
            userId: customer.id,
            packageId: (await db.paket.findFirstOrThrow()).id,
            totalSessions: 5,
            remainingSessions: 5,
            usedSessions: 0,
            validUntil: new Date(Date.now() + 30 * 86_400_000),
            status: 'ACTIVE',
          },
        });
        cleanupPackageIds.push(testPkg.id);

        // Booking kelas
        const booking = await bookingsService.create(
          customerPrincipal,
          {
            classSlotId: cancelWithMembersSlotId,
            customerPackageId: testPkg.id,
            source: 'SELF',
          },
          `key-book-slot-1234567890`,
          'corr-test',
        );
        cleanupBookingIds.push((booking.body as any).id);

        // Batalkan kelas via API cancel
        await classSlotService.cancel(
          adminPrincipalA,
          cancelWithMembersSlotId,
          { reasonCode: 'SAFETY_ISSUE' as ClassSlotCancellationReason },
          `key-cancel-with-memb-123456`,
          'corr-test',
        );

        // Verifikasi paket customer: sisa sesi harus tetap utuh (5 sesi)
        const updatedPkg = await db.paketPelanggan.findUniqueOrThrow({
          where: { id: testPkg.id },
        });

        // Verifikasi status booking: CANCELLED
        const updatedBooking = await db.pemesananKelas.findUniqueOrThrow({
          where: { id: (booking.body as any).id },
        });

        success =
          updatedPkg.remainingSessions === 5 &&
          updatedBooking.status === 'CANCELLED' &&
          updatedBooking.cancellationReason === 'SAFETY_ISSUE';
        reason = `Sesi dipulihkan = ${updatedPkg.remainingSessions}/5, Booking status = ${updatedBooking.status}`;
      } catch (err: any) {
        success = false;
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_2D2',
        'Automatic Booking & Session Refund on Manual Class Cancel',
        'Pilar D: State Machine',
        success,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR E: KEAMANAN & ISOLASI CABANG PENJADWALAN
    // ========================================================================
    console.log('\n▶ 6. PILAR E: Keamanan & Isolasi Cabang Penjadwalan (No Happy Path)...');

    // TEST 2.E1: Customer / Coach Unauthorized Schedule Creation
    {
      const start = Date.now();
      let customerBlocked = false;
      let instructorBlocked = false;

      // Customer mencoba membuat slot kelas
      try {
        await classSlotService.create(
          customerPrincipal,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studioA.id,
            startAt: `${dateStr}T13:00:00.000Z`,
            endAt: `${dateStr}T14:00:00.000Z`,
          },
          `key-cust-illegal-12345678`,
          'corr-test',
        );
      } catch {
        customerBlocked = true;
      }

      // Instruktur mencoba membuat slot kelas
      try {
        await classSlotService.create(
          instructorPrincipal,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studioA.id,
            startAt: `${dateStr}T13:00:00.000Z`,
            endAt: `${dateStr}T14:00:00.000Z`,
          },
          `key-inst-illegal-12345678`,
          'corr-test',
        );
      } catch {
        instructorBlocked = true;
      }

      recordResult(
        'TEST_2E1',
        'Customer & Instructor Unauthorized Schedule Creation Blockade',
        'Pilar E: Keamanan',
        customerBlocked && instructorBlocked,
        'Customer dan Instruktur dilarang membuat slot kelas',
        Date.now() - start,
      );
    }

    // TEST 2.E2: Cross-Branch Schedule Hijack (Admin Cabang A membuat slot di Cabang B)
    {
      const start = Date.now();
      let crossBranchBlocked = false;
      let reason = '';
      try {
        // Admin Cabang A mencoba membuat slot dengan branchId = Cabang B
        await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchB.id, // Cabang B (Di luar hak akses Admin A)
            classTypeId: classType.id,
            studioId: studioA.id,
            startAt: `${dateStr}T15:00:00.000Z`,
            endAt: `${dateStr}T16:00:00.000Z`,
          },
          `key-cross-admin-123456789`,
          'corr-test',
        );
      } catch (err: any) {
        crossBranchBlocked = true;
        reason = err?.message || err?.code || 'RESOURCE_NOT_FOUND';
      }

      recordResult(
        'TEST_2E2',
        'Cross-Branch Schedule Hijack Blockade (Admin A -> Branch B)',
        'Pilar E: Keamanan',
        crossBranchBlocked,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // RINGKASAN HASIL AKHIR TAHAP 2
    // ========================================================================
    console.log('\n══════════════════════════════════════════════════════════════════════════════');
    console.log('📊 RINGKASAN HASIL PENGUJIAN ADVERSARIAL TAHAP 2 (JADWAL & COLLISION GUARD)');
    console.log('══════════════════════════════════════════════════════════════════════════════');

    const totalTests = results.length;
    const passedTests = results.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log(`Total Skenario Diuji : ${totalTests}`);
    console.log(`Skenario LULUS (PASS): ${passedTests} ✅`);
    console.log(`Skenario GAGAL (FAIL): ${failedTests} ${failedTests === 0 ? '🎉' : '❌'}`);

    if (failedTests > 0) {
      console.log('\n❌ DAFTAR SKENARIO GAGAL:');
      for (const fail of results.filter((r) => !r.passed)) {
        console.log(`- [${fail.code}] ${fail.name}: ${fail.message}`);
      }
      throw new Error(`Pengujian Adversarial Tahap 2 GAGAL: ${failedTests} skenario terdeteksi bocor!`);
    } else {
      console.log('\n🎉 SEMUA 16 SKENARIO ADVERSARIAL TAHAP 2 LULUS 100%! 🎉');
      console.log('   Pilar A: Collision Guard Ruangan mendeteksi exact, partial & enclosing overlap.');
      console.log('   Pilar B: Collision Guard Instruktur mencekal double-booking saat create/assign.');
      console.log('   Pilar C: Validasi waktu terbalik, durasi nol & non-ISO string tertolak rapi.');
      console.log('   Pilar D: State machine terbukti idempoten & memulihkan sesi saat kelas dibatalkan.');
      console.log('   Pilar E: Hak akses pembuatan jadwal terisolasi ketat dari customer, coach, & cross-branch.');
    }
  } finally {
    // Bersihkan data slot dan booking temporer pengujian
    console.log('\n🧹 Membersihkan slot kelas & data temporer pengujian Tahap 2...');
    const validBookingIds = cleanupBookingIds.filter(Boolean);
    if (validBookingIds.length > 0) {
      await db.pemesananKelas.deleteMany({
        where: { id: { in: validBookingIds } },
      });
    }
    const validPackageIds = cleanupPackageIds.filter(Boolean);
    if (validPackageIds.length > 0) {
      await db.paketPelanggan.deleteMany({
        where: { id: { in: validPackageIds } },
      });
    }
    const validSlotIds = cleanupSlotIds.filter(Boolean);
    if (validSlotIds.length > 0) {
      await db.slotKelas.deleteMany({
        where: { id: { in: validSlotIds } },
      });
    }
    console.log(`   ✅ ${validSlotIds.length} slot kelas & data temporer berhasil dibersihkan.`);
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error('\n💥 FATAL ERROR PADA UJI ADVERSARIAL TAHAP 2:', err);
  process.exit(1);
});
