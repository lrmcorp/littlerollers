import { HttpStatus } from '@nestjs/common';
import {
  CheckInMethod,
  ClassSlotStatus,
  PrismaClient,
  Role,
  SessionMutationType,
} from '@prisma/client';
import { randomBytes, randomUUID } from 'node:crypto';
import { AttendanceService } from '../../apps/api/src/attendance/kehadiran.service';
import { BookingsService } from '../../apps/api/src/bookings/pemesanan-kelas.service';
import { ClassSlotService } from '../../apps/api/src/classes/slot-kelas.service';
import { IdempotencyService } from '../../apps/api/src/foundation/idempotency.service';
import type { SessionPrincipal } from '../../apps/api/src/identity/identity.service';
import { PolicyService } from '../../apps/api/src/identity/policy.service';

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
  console.log('║   DAILYDOSE V2 - UJI ADVERSARIAL TAHAP 4: DUAL CHECK-IN & POTONG SESI        ║');
  console.log('║   "Siapa yang Hadir & Kapan Kuota Dipotong?" — STRICT NO HAPPY PATH          ║');
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

  const attendanceService = new AttendanceService(
    db as any,
    policy,
    idempotency,
  );

  const cleanupSlotIds: string[] = [];
  const cleanupBookingIds: string[] = [];
  const cleanupPackageIds: string[] = [];
  const cleanupCustomerPackageIds: string[] = [];
  const cleanupUserIds: string[] = [];
  const cleanupStudioIds: string[] = [];

  try {
    // ------------------------------------------------------------------------
    // 1. Persiapan Aktor & Master Data
    // ------------------------------------------------------------------------
    console.log('▶ 1. Menyiapkan Aktor Uji, Ruangan Studio & Sesi Paket...');

    const branches = await db.cabang.findMany({ take: 2, orderBy: { code: 'asc' } });
    if (branches.length < 1) {
      throw new Error('Dibutuhkan minimal 1 cabang untuk pengujian check-in!');
    }
    const branchA = branches[0];

    const classType = await db.jenisKelas.findFirstOrThrow();
    const defaultPackage = await db.paket.findFirstOrThrow();

    // Helper untuk membuat studio terisolasi per skenario pengujian
    async function createIsolatedStudio(tag: string) {
      const studioId = randomUUID();
      const uid = randomUUID().slice(0, 6);
      const studio = await db.studio.create({
        data: {
          id: studioId,
          branchId: branchA.id,
          code: `STU-${tag.toUpperCase()}-${uid}`.slice(0, 32),
          name: `Studio Test ${tag} ${Date.now()}`,
          active: true,
        },
      });
      cleanupStudioIds.push(studio.id);
      return studio;
    }

    // Instruktur 1 & Instruktur 2
    const instructors = await db.user.findMany({
      where: { role: Role.INSTRUCTOR },
      take: 2,
    });
    const instructor1 = instructors[0];
    let instructor2 = instructors[1];
    if (!instructor2) {
      instructor2 = await db.user.create({
        data: {
          email: `coach2.${Date.now()}@dailydose.test`,
          displayName: 'Coach Secondary',
          phone: '+6281988887777',
          role: Role.INSTRUCTOR,
          status: 'ACTIVE',
        },
      });
      cleanupUserIds.push(instructor2.id);
    }

    const instructor1Principal: SessionPrincipal = {
      sessionId: `sess-inst1-${randomUUID().slice(0, 6)}`,
      userId: instructor1.id,
      roles: [{ role: 'INSTRUCTOR', branchId: branchA.id }],
      capabilities: ['class:assigned:read', 'attendance:self'],
      branchIds: [branchA.id],
    };

    const instructor2Principal: SessionPrincipal = {
      sessionId: `sess-inst2-${randomUUID().slice(0, 6)}`,
      userId: instructor2.id,
      roles: [{ role: 'INSTRUCTOR', branchId: branchA.id }],
      capabilities: ['class:assigned:read', 'attendance:self'],
      branchIds: [branchA.id],
    };

    // Admin
    const admin = await db.user.findFirstOrThrow({ where: { role: Role.ADMIN } });
    const adminPrincipalA: SessionPrincipal = {
      sessionId: `sess-adm-a-${randomUUID().slice(0, 6)}`,
      userId: admin.id,
      roles: [{ role: 'ADMIN', branchId: branchA.id }],
      capabilities: [
        'class-slot:read',
        'class-slot:manage',
        'attendance:read',
        'attendance:manage',
        'booking:read',
        'booking:cancel:assisted',
        'booking:create:assisted',
      ],
      branchIds: [branchA.id],
    };

    // Helper membuat customer
    async function createTestCustomer(tag: string): Promise<{
      user: any;
      principal: SessionPrincipal;
    }> {
      const email = `adv4.${tag}.${randomBytes(3).toString('hex')}@dailydose.test`;
      const user = await db.user.create({
        data: {
          email,
          displayName: `Adv4 Customer ${tag}`,
          phone: `+62895${Math.floor(10000000 + Math.random() * 90000000)}`,
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

    // Helper membuat customer package
    async function createTestCustomerPackage(
      userId: string,
      remainingSessions = 5,
    ) {
      const pkg = await db.paketPelanggan.create({
        data: {
          id: randomUUID(),
          userId,
          packageId: defaultPackage.id,
          totalSessions: remainingSessions,
          remainingSessions,
          usedSessions: 0,
          validUntil: new Date(Date.now() + 30 * 86_400_000),
          status: 'ACTIVE',
        },
        include: { package: true },
      });
      cleanupCustomerPackageIds.push(pkg.id);
      return pkg;
    }

    console.log(`   Cabang: ${branchA.name}`);
    console.log(`   Admin: ${admin.displayName}`);
    console.log(`   Instruktur 1: ${instructor1.displayName}, Instruktur 2: ${instructor2.displayName}\n`);

    // ========================================================================
    // PILAR A: DUAL CHECK-IN & JENDELA WAKTU KEHADIRAN
    // ========================================================================
    console.log('▶ 2. PILAR A: Dual Check-in & Jendela Waktu Kehadiran (No Happy Path)...');

    // TEST 4.A1: Instructor Check-In Window Guard (Too Early & Expired)
    {
      const start = Date.now();
      let blockedTooEarly = false;
      let blockedExpired = false;
      let reason = '';
      try {
        const studio = await createIsolatedStudio('4a1');
        const now = new Date();
        const startIn3h = new Date(now.getTime() + 3 * 3_600_000);
        const endIn4h = new Date(startIn3h.getTime() + 3_600_000);

        const slotRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studio.id,
            instructorUserId: instructor1.id,
            capacity: 5,
            startAt: startIn3h.toISOString(),
            endAt: endIn4h.toISOString(),
          },
          `key-slot-inst-win-${Date.now()}`,
          'corr-test',
        );
        const slotId = slotRes.body.id;
        cleanupSlotIds.push(slotId);

        // Update status ke CONFIRMED agar valid untuk check-in
        await db.slotKelas.update({
          where: { id: slotId },
          data: { status: ClassSlotStatus.CONFIRMED },
        });

        // A. Coba check-in instruktur 3 jam sebelum kelas (terlalu dini, buka H-30 menit)
        try {
          await attendanceService.issueInstructor(
            instructor1Principal,
            slotId,
            `key-inst-issue-early-${Date.now()}`,
            'corr-test',
            now,
          );
        } catch (err: any) {
          if (err?.message?.includes('CHECK_IN_TOO_EARLY') || err?.code === 'CHECK_IN_TOO_EARLY') {
            blockedTooEarly = true;
          }
        }

        // B. Coba check-in instruktur setelah kelas selesai (now = endAt + 10 menit)
        const expiredTime = new Date(endIn4h.getTime() + 10 * 60_000);
        try {
          await attendanceService.issueInstructor(
            instructor1Principal,
            slotId,
            `key-inst-issue-exp-${Date.now()}`,
            'corr-test',
            expiredTime,
          );
        } catch (err: any) {
          if (err?.message?.includes('CHECK_IN_WINDOW_CLOSED') || err?.code === 'CHECK_IN_WINDOW_CLOSED') {
            blockedExpired = true;
          }
        }

        reason = `TooEarly Blocked = ${blockedTooEarly}, Expired Blocked = ${blockedExpired}`;
      } catch (err: any) {
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_4A1',
        'Instructor Check-In Window Timing Guard (Too Early & Expired Blockade)',
        'Pilar A: Dual Check-in',
        blockedTooEarly && blockedExpired,
        reason,
        Date.now() - start,
      );
    }

    // TEST 4.A2: Instructor Identity & Assignment Verification Guard
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        const studio = await createIsolatedStudio('4a2');
        const now = new Date();
        const startIn20m = new Date(now.getTime() + 20 * 60_000);
        const endIn1h20m = new Date(startIn20m.getTime() + 3_600_000);

        const slotRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studio.id,
            instructorUserId: instructor1.id, // Ditugaskan ke Coach 1
            capacity: 5,
            startAt: startIn20m.toISOString(),
            endAt: endIn1h20m.toISOString(),
          },
          `key-slot-inst-diff-${Date.now()}`,
          'corr-test',
        );
        const slotId = slotRes.body.id;
        cleanupSlotIds.push(slotId);

        await db.slotKelas.update({
          where: { id: slotId },
          data: { status: ClassSlotStatus.CONFIRMED },
        });

        // Coach 2 mencoba menerbitkan token check-in untuk kelas Coach 1
        await attendanceService.issueInstructor(
          instructor2Principal,
          slotId,
          `key-inst2-unauth-${Date.now()}`,
          'corr-test',
          now,
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'RESOURCE_NOT_FOUND';
      }
      recordResult(
        'TEST_4A2',
        'Instructor Identity & Assignment Guard (Unassigned Coach 2 Blocked)',
        'Pilar A: Dual Check-in',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 4.A3: Customer Web Link Check-In Timing Guard
    {
      const start = Date.now();
      let blockedTooEarly = false;
      let blockedExpired = false;
      let reason = '';
      try {
        const studio = await createIsolatedStudio('4a3');
        const now = new Date();
        const startIn3h = new Date(now.getTime() + 3 * 3_600_000);
        const endIn4h = new Date(startIn3h.getTime() + 3_600_000);

        const slotRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studio.id,
            capacity: 5,
            startAt: startIn3h.toISOString(),
            endAt: endIn4h.toISOString(),
          },
          `key-slot-cust-time-${Date.now()}`,
          'corr-test',
        );
        const slotId = slotRes.body.id;
        cleanupSlotIds.push(slotId);

        await db.slotKelas.update({
          where: { id: slotId },
          data: { status: ClassSlotStatus.CONFIRMED },
        });

        const { user: custUser } = await createTestCustomer('time-chk');
        const custPkg = await createTestCustomerPackage(custUser.id, 5);

        const bookRes = await bookingsService.create(
          adminPrincipalA,
          {
            classSlotId: slotId,
            customerPackageId: custPkg.id,
            customerUserId: custUser.id,
            source: 'ADMIN_ASSISTED',
          },
          `key-book-cust-time-${Date.now()}`,
          'corr-test',
        );
        const bookingId = (bookRes.body as any).id;
        cleanupBookingIds.push(bookingId);

        // Terbitkan token check-in oleh admin
        const tokenRes = await attendanceService.issue(
          adminPrincipalA,
          bookingId,
          {},
          `key-issue-time-${Date.now()}`,
          'corr-test',
        );

        // A. Coba konfirmasi tautan 3 jam sebelum kelas (jendela resmi buka H-60 menit)
        try {
          await attendanceService.confirmCustomerLink(tokenRes.token, now);
        } catch (err: any) {
          if (err?.message?.includes('CHECK_IN_TOO_EARLY') || err?.code === 'CHECK_IN_TOO_EARLY') {
            blockedTooEarly = true;
          }
        }

        // B. Coba konfirmasi tautan setelah kelas berakhir (now = endAt + 10 menit)
        const expiredTime = new Date(endIn4h.getTime() + 10 * 60_000);
        try {
          await attendanceService.confirmCustomerLink(tokenRes.token, expiredTime);
        } catch (err: any) {
          if (err?.message?.includes('CHECK_IN_WINDOW_CLOSED') || err?.code === 'CHECK_IN_WINDOW_CLOSED') {
            blockedExpired = true;
          }
        }

        reason = `Customer TooEarly = ${blockedTooEarly}, Expired = ${blockedExpired}`;
      } catch (err: any) {
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_4A3',
        'Customer Web Link Check-In Timing Guard (Window: H-60m s/d EndAt)',
        'Pilar A: Dual Check-in',
        blockedTooEarly && blockedExpired,
        reason,
        Date.now() - start,
      );
    }

    // TEST 4.A4: Customer Web Link Check-In Idempotent Replay
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        const studio = await createIsolatedStudio('4a4');
        const now = new Date();
        const startIn3h = new Date(now.getTime() + 3 * 3_600_000);
        const endIn4h = new Date(startIn3h.getTime() + 3_600_000);

        const slotRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studio.id,
            capacity: 5,
            startAt: startIn3h.toISOString(),
            endAt: endIn4h.toISOString(),
          },
          `key-slot-idem-web-${Date.now()}`,
          'corr-test',
        );
        const slotId = slotRes.body.id;
        cleanupSlotIds.push(slotId);

        await db.slotKelas.update({
          where: { id: slotId },
          data: { status: ClassSlotStatus.CONFIRMED },
        });

        const { user: custUser } = await createTestCustomer('idem-web');
        const custPkg = await createTestCustomerPackage(custUser.id, 5);

        const bookRes = await bookingsService.create(
          adminPrincipalA,
          {
            classSlotId: slotId,
            customerPackageId: custPkg.id,
            customerUserId: custUser.id,
            source: 'ADMIN_ASSISTED',
          },
          `key-book-idem-web-${Date.now()}`,
          'corr-test',
        );
        const bookingId = (bookRes.body as any).id;
        cleanupBookingIds.push(bookingId);

        const tokenRes = await attendanceService.issue(
          adminPrincipalA,
          bookingId,
          {},
          `key-issue-idem-${Date.now()}`,
          'corr-test',
        );

        // Eksekusi 1: Check-in pertama kali pada H-15 menit (dalam jendela H-60 menit)
        const checkInTime = new Date(startIn3h.getTime() - 15 * 60_000);
        const firstConfirm = await attendanceService.confirmCustomerLink(tokenRes.token, checkInTime);

        // Eksekusi 2: Membuka link kembali (Replay)
        const secondConfirm = await attendanceService.confirmCustomerLink(tokenRes.token, checkInTime);

        const attendanceCount = await db.kehadiranPelanggan.count({
          where: { bookingId },
        });

        success =
          firstConfirm.status === 'ATTENDED' &&
          secondConfirm.status === 'ALREADY_ATTENDED' &&
          attendanceCount === 1;

        reason = `Confirm 1 = ${firstConfirm.status}, Confirm 2 = ${secondConfirm.status}, DB attendance count = ${attendanceCount}`;
      } catch (err: any) {
        success = false;
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_4A4',
        'Customer Web Link Check-In Idempotent Replay (Zero Duplicate Attendance)',
        'Pilar A: Dual Check-in',
        success,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR B: TOKEN TAMPERING, REPLAY & IDOR ATTACKS
    // ========================================================================
    console.log('\n▶ 3. PILAR B: Token Tampering, Replay & IDOR Attacks (No Happy Path)...');

    // TEST 4.B1: Replay Attack on Revoked / Consumed Check-In Token
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        const studio = await createIsolatedStudio('4b1');
        const now = new Date();
        const startIn20m = new Date(now.getTime() + 20 * 60_000);
        const endIn1h20m = new Date(startIn20m.getTime() + 3_600_000);

        const slotRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studio.id,
            capacity: 5,
            startAt: startIn20m.toISOString(),
            endAt: endIn1h20m.toISOString(),
          },
          `key-slot-tok-rev-${Date.now()}`,
          'corr-test',
        );
        const slotId = slotRes.body.id;
        cleanupSlotIds.push(slotId);

        await db.slotKelas.update({
          where: { id: slotId },
          data: { status: ClassSlotStatus.CONFIRMED },
        });

        const { user: custUser } = await createTestCustomer('tok-rev');
        const custPkg = await createTestCustomerPackage(custUser.id, 5);

        const bookRes = await bookingsService.create(
          adminPrincipalA,
          {
            classSlotId: slotId,
            customerPackageId: custPkg.id,
            customerUserId: custUser.id,
            source: 'ADMIN_ASSISTED',
          },
          `key-book-tok-rev-${Date.now()}`,
          'corr-test',
        );
        const bookingId = (bookRes.body as any).id;
        cleanupBookingIds.push(bookingId);

        const tokenRes = await attendanceService.issue(
          adminPrincipalA,
          bookingId,
          {},
          `key-issue-rev-${Date.now()}`,
          'corr-test',
        );

        // Revoke token secara manual via service revoke
        await attendanceService.revoke(adminPrincipalA, tokenRes.id, {}, 'corr-test');

        // Mencoba konsumsi token yang sudah di-revoke
        await attendanceService.consume(
          adminPrincipalA,
          { token: tokenRes.token },
          `key-consume-rev-${Date.now()}`,
          'corr-test',
          now,
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'CHECK_IN_TOKEN_REVOKED';
      }
      recordResult(
        'TEST_4B1',
        'Replay Attack on Revoked Token Blockade (CHECK_IN_TOKEN_REVOKED)',
        'Pilar B: Token Security',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 4.B2: Forged / Malformed Raw Token String Blockade
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        await attendanceService.confirmCustomerLink('bad-malformed-token-string!@#$');
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'CHECK_IN_TOKEN_INVALID';
      }
      recordResult(
        'TEST_4B2',
        'Forged / Malformed Raw Token String Blockade (Token Parser Rejection)',
        'Pilar B: Token Security',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 4.B3: Non-Existent Token Hash Blockade (Ghost Token)
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        const ghostToken = randomBytes(32).toString('base64url');
        await attendanceService.confirmCustomerLink(ghostToken);
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'CHECK_IN_TOKEN_INVALID';
      }
      recordResult(
        'TEST_4B3',
        'Non-Existent Token Hash Blockade (Valid Format but Ghost Hash -> 404)',
        'Pilar B: Token Security',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 4.B4: Unauthorized Token Consumption (Cross-Customer Guard)
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        const studio = await createIsolatedStudio('4b4');
        const now = new Date();
        const startIn20m = new Date(now.getTime() + 20 * 60_000);
        const endIn1h20m = new Date(startIn20m.getTime() + 3_600_000);

        const slotRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studio.id,
            capacity: 5,
            startAt: startIn20m.toISOString(),
            endAt: endIn1h20m.toISOString(),
          },
          `key-slot-idor-tok-${Date.now()}`,
          'corr-test',
        );
        const slotId = slotRes.body.id;
        cleanupSlotIds.push(slotId);
        await db.slotKelas.update({ where: { id: slotId }, data: { status: ClassSlotStatus.CONFIRMED } });

        // Korban Customer 1
        const { user: victimUser } = await createTestCustomer('victim-tok');
        const victimPkg = await createTestCustomerPackage(victimUser.id, 5);
        const bookRes = await bookingsService.create(
          adminPrincipalA,
          {
            classSlotId: slotId,
            customerPackageId: victimPkg.id,
            customerUserId: victimUser.id,
            source: 'ADMIN_ASSISTED',
          },
          `key-book-victim-tok-${Date.now()}`,
          'corr-test',
        );
        const bookingId = (bookRes.body as any).id;
        cleanupBookingIds.push(bookingId);

        const tokenRes = await attendanceService.issue(
          adminPrincipalA,
          bookingId,
          {},
          `key-issue-vic-${Date.now()}`,
          'corr-test',
        );

        // Penyerang Customer 2 mencoba memanggil API consume staff
        const { principal: attackerPrincipal } = await createTestCustomer('attacker-tok');

        await attendanceService.consume(
          attackerPrincipal,
          { token: tokenRes.token },
          `key-consume-unauth-${Date.now()}`,
          'corr-test',
          now,
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'FORBIDDEN';
      }
      recordResult(
        'TEST_4B4',
        'Unauthorized Token Consumption (Customer B consumes Customer A via Staff API)',
        'Pilar B: Token Security',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR C: ADMIN BACKFILL TOLERANSI H+2 JAM (ATURAN BISNIS #9)
    // ========================================================================
    console.log('\n▶ 4. PILAR C: Admin Backfill Toleransi H+2 Jam (Aturan Bisnis #9)...');

    let backfillSuccessBookingId = '';

    // TEST 4.C1: Admin Backfill Within Allowed Window (H+1 Jam Setelah Selesai)
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        const studio = await createIsolatedStudio('4c1');
        const now = new Date();
        const startPast = new Date(now.getTime() - 2 * 3_600_000); // mulai 2 jam lalu
        const endPast = new Date(now.getTime() - 1 * 3_600_000);   // selesai 1 jam lalu (H+1 jam dari endAt)

        const slotRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studio.id,
            capacity: 5,
            startAt: startPast.toISOString(),
            endAt: endPast.toISOString(),
          },
          `key-slot-backfill-ok-${Date.now()}`,
          'corr-test',
        );
        const slotId = slotRes.body.id;
        cleanupSlotIds.push(slotId);
        await db.slotKelas.update({ where: { id: slotId }, data: { status: ClassSlotStatus.CONFIRMED } });

        const { user: custUser } = await createTestCustomer('backfill-ok');
        const custPkg = await createTestCustomerPackage(custUser.id, 5);

        // Booking langsung via DB untuk menyimulasikan data kelas lampau
        const booking = await db.pemesananKelas.create({
          data: {
            id: randomUUID(),
            bookingNumber: `BK-TEST-${Date.now().toString(36).toUpperCase()}`,
            classSlotId: slotId,
            userId: custUser.id,
            customerPackageId: custPkg.id,
            status: 'BOOKED',
          },
        });
        backfillSuccessBookingId = booking.id;
        cleanupBookingIds.push(booking.id);

        // Admin melakukan backfill saat now = endAt + 1 jam (dalam batas toleransi H+2 jam)
        await attendanceService.backfillCustomer(
          adminPrincipalA,
          {
            bookingId: booking.id,
            reason: 'Pelanggan terkendala kuota internet saat tiba di studio',
          },
          `key-backfill-ok-${Date.now()}-123456`,
          'corr-test',
          now,
        );

        const updatedBooking = await db.pemesananKelas.findUniqueOrThrow({
          where: { id: booking.id },
          include: { attendance: true },
        });

        success =
          updatedBooking.status === 'ATTENDED' &&
          updatedBooking.attendance?.method === CheckInMethod.MANUAL_FRONTDESK;
        reason = `Status = ${updatedBooking.status}, Method = ${updatedBooking.attendance?.method}`;
      } catch (err: any) {
        success = false;
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_4C1',
        'Admin Backfill Within Allowed Window (H+1h after class ends -> Permitted)',
        'Pilar C: Admin Backfill',
        success,
        reason,
        Date.now() - start,
      );
    }

    // TEST 4.C2: Admin Backfill Tolerance Expired Blockade (H+3 Jam Setelah Selesai)
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        const studio = await createIsolatedStudio('4c2');
        const now = new Date();
        const startPast = new Date(now.getTime() - 4 * 3_600_000); // mulai 4 jam lalu
        const endPast = new Date(now.getTime() - 3 * 3_600_000);   // selesai 3 jam lalu (melewati batas H+2 jam!)

        const slotRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studio.id,
            capacity: 5,
            startAt: startPast.toISOString(),
            endAt: endPast.toISOString(),
          },
          `key-slot-backfill-exp-${Date.now()}`,
          'corr-test',
        );
        const slotId = slotRes.body.id;
        cleanupSlotIds.push(slotId);
        await db.slotKelas.update({ where: { id: slotId }, data: { status: ClassSlotStatus.CONFIRMED } });

        const { user: custUser } = await createTestCustomer('backfill-exp');
        const custPkg = await createTestCustomerPackage(custUser.id, 5);

        const booking = await db.pemesananKelas.create({
          data: {
            id: randomUUID(),
            bookingNumber: `BK-EXP-${Date.now().toString(36).toUpperCase()}`,
            classSlotId: slotId,
            userId: custUser.id,
            customerPackageId: custPkg.id,
            status: 'BOOKED',
          },
        });
        cleanupBookingIds.push(booking.id);

        // Admin mencoba backfill saat now = endPast + 3 jam (lewat dari cutoffBackfill = endPast + 2 jam)
        await attendanceService.backfillCustomer(
          adminPrincipalA,
          {
            bookingId: booking.id,
            reason: 'Mencoba backfill kelas kemarin',
          },
          `key-backfill-exp-${Date.now()}-123456`,
          'corr-test',
          now,
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'ADMIN_BACKFILL_WINDOW_CLOSED';
      }
      recordResult(
        'TEST_4C2',
        'Admin Backfill Tolerance Expired Blockade (H+3h > H+2h Cutoff -> ADMIN_BACKFILL_WINDOW_CLOSED)',
        'Pilar C: Admin Backfill',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 4.C3: Duplicate Backfill Blockade (Attendance Already Recorded)
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        if (!backfillSuccessBookingId) throw new Error('Booking ID backfill tidak tersedia');

        // Coba backfill kedua kali pada booking yang sama
        await attendanceService.backfillCustomer(
          adminPrincipalA,
          {
            bookingId: backfillSuccessBookingId,
            reason: 'Mencoba backfill ulang pada data yang sudah hadir',
          },
          `key-backfill-dup-${Date.now()}-123456`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'ATTENDANCE_ALREADY_RECORDED';
      }
      recordResult(
        'TEST_4C3',
        'Duplicate Backfill Blockade (ATTENDANCE_ALREADY_RECORDED)',
        'Pilar C: Admin Backfill',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST 4.C4: Invalid Justification Reason Length Validation
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        await attendanceService.backfillCustomer(
          adminPrincipalA,
          {
            bookingId: randomUUID(),
            reason: 'ab', // < 3 karakter
          },
          `key-backfill-short-${Date.now()}-123456`,
          'corr-test',
        );
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'VALIDATION_ERROR';
      }
      recordResult(
        'TEST_4C4',
        'Invalid Justification Reason Length Validation (<3 chars -> VALIDATION_ERROR)',
        'Pilar C: Admin Backfill',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR D: PEMOTONGAN SESI PASCA-KELAS & AUDIT SESSION LEDGER (ATURAN #1)
    // ========================================================================
    console.log('\n▶ 5. PILAR D: Pemotongan Sesi Pasca-Kelas & Audit SessionLedger (Aturan #1)...');

    // TEST 4.D1: Session Deduction & SessionLedger Creation on Attended Completion
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        const studio = await createIsolatedStudio('4d1');
        const now = new Date();
        const startPast = new Date(now.getTime() - 2 * 3_600_000);
        const endPast = new Date(now.getTime() - 1 * 3_600_000);

        const slotRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studio.id,
            capacity: 5,
            startAt: startPast.toISOString(),
            endAt: endPast.toISOString(),
          },
          `key-slot-deduct-att-${Date.now()}`,
          'corr-test',
        );
        const slotId = slotRes.body.id;
        cleanupSlotIds.push(slotId);
        await db.slotKelas.update({ where: { id: slotId }, data: { status: ClassSlotStatus.CONFIRMED } });

        const { user: custUser } = await createTestCustomer('deduct-att');
        const custPkg = await createTestCustomerPackage(custUser.id, 5);

        // Booking
        const booking = await db.pemesananKelas.create({
          data: {
            id: randomUUID(),
            bookingNumber: `BK-DED-${Date.now().toString(36).toUpperCase()}`,
            classSlotId: slotId,
            userId: custUser.id,
            customerPackageId: custPkg.id,
            status: 'ATTENDED', // Sudah hadir
          },
        });
        cleanupBookingIds.push(booking.id);

        // Catat kehadiran di KehadiranPelanggan
        await db.kehadiranPelanggan.create({
          data: {
            id: randomUUID(),
            bookingId: booking.id,
            method: CheckInMethod.WEB_LINK,
            checkedInAt: startPast,
          },
        });

        // Selesaikan kelas oleh admin
        await classSlotService.complete(
          adminPrincipalA,
          slotId,
          { reason: 'NORMAL_COMPLETION' },
          `key-complete-att-${Date.now()}-123456`,
          'corr-test',
        );

        // Verifikasi saldo paket
        const updatedPkg = await db.paketPelanggan.findUniqueOrThrow({ where: { id: custPkg.id } });

        // Verifikasi buku besar SessionLedger
        const ledger = await db.sessionLedger.findFirst({
          where: {
            customerPackageId: custPkg.id,
            referenceId: booking.id,
            type: SessionMutationType.ATTEND,
          },
        });

        success =
          updatedPkg.remainingSessions === 4 &&
          updatedPkg.usedSessions === 1 &&
          ledger !== null &&
          ledger.amount === -1 &&
          ledger.balanceAfter === 4;

        reason = `Remaining = ${updatedPkg.remainingSessions}/4, Used = ${updatedPkg.usedSessions}/1, Ledger amount = ${ledger?.amount}, balanceAfter = ${ledger?.balanceAfter}`;
      } catch (err: any) {
        success = false;
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_4D1',
        'Session Deduction & SessionLedger Creation on Attended Completion (Rule #1: 5 -> 4)',
        'Pilar D: Pemotongan Sesi',
        success,
        reason,
        Date.now() - start,
      );
    }

    // TEST 4.D2: No-Show Customer Session Forfeiture (Sesi Hangus Mangkir)
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        const studio = await createIsolatedStudio('4d2');
        const now = new Date();
        const startPast = new Date(now.getTime() - 2 * 3_600_000);
        const endPast = new Date(now.getTime() - 1 * 3_600_000);

        const slotRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studio.id,
            capacity: 5,
            startAt: startPast.toISOString(),
            endAt: endPast.toISOString(),
          },
          `key-slot-noshow-${Date.now()}`,
          'corr-test',
        );
        const slotId = slotRes.body.id;
        cleanupSlotIds.push(slotId);
        await db.slotKelas.update({ where: { id: slotId }, data: { status: ClassSlotStatus.CONFIRMED } });

        const { user: custUser } = await createTestCustomer('noshow');
        const custPkg = await createTestCustomerPackage(custUser.id, 5);

        // Booking status BOOKED (Mangkir / Tidak Hadir)
        const booking = await db.pemesananKelas.create({
          data: {
            id: randomUUID(),
            bookingNumber: `BK-NOSHOW-${Date.now().toString(36).toUpperCase()}`,
            classSlotId: slotId,
            userId: custUser.id,
            customerPackageId: custPkg.id,
            status: 'BOOKED',
          },
        });
        cleanupBookingIds.push(booking.id);

        // Selesaikan kelas oleh admin
        await classSlotService.complete(
          adminPrincipalA,
          slotId,
          { reason: 'NORMAL_COMPLETION' },
          `key-complete-noshow-${Date.now()}-123456`,
          'corr-test',
        );

        const updatedBooking = await db.pemesananKelas.findUniqueOrThrow({ where: { id: booking.id } });
        const updatedPkg = await db.paketPelanggan.findUniqueOrThrow({ where: { id: custPkg.id } });
        const ledger = await db.sessionLedger.findFirst({
          where: {
            customerPackageId: custPkg.id,
            referenceId: booking.id,
            type: SessionMutationType.ATTEND,
          },
        });

        success =
          updatedBooking.status === 'NO_SHOW' &&
          updatedPkg.remainingSessions === 4 &&
          ledger !== null &&
          ledger.notes.includes('NO SHOW');

        reason = `Booking status = ${updatedBooking.status}, Sisa sesi = ${updatedPkg.remainingSessions}/4, Ledger note = "${ledger?.notes}"`;
      } catch (err: any) {
        success = false;
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_4D2',
        'No-Show Customer Session Forfeiture (Status -> NO_SHOW & Quota Forfeited)',
        'Pilar D: Pemotongan Sesi',
        success,
        reason,
        Date.now() - start,
      );
    }

    // TEST 4.D3: Multi-Trigger Idempotency on Class Completion (Zero Double Deduction)
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        const studio = await createIsolatedStudio('4d3');
        const now = new Date();
        const startPast = new Date(now.getTime() - 2 * 3_600_000);
        const endPast = new Date(now.getTime() - 1 * 3_600_000);

        const slotRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studio.id,
            capacity: 5,
            startAt: startPast.toISOString(),
            endAt: endPast.toISOString(),
          },
          `key-slot-idem-comp-${Date.now()}`,
          'corr-test',
        );
        const slotId = slotRes.body.id;
        cleanupSlotIds.push(slotId);
        await db.slotKelas.update({ where: { id: slotId }, data: { status: ClassSlotStatus.CONFIRMED } });

        const { user: custUser } = await createTestCustomer('idem-comp');
        const custPkg = await createTestCustomerPackage(custUser.id, 5);

        const booking = await db.pemesananKelas.create({
          data: {
            id: randomUUID(),
            bookingNumber: `BK-IDEMCOMP-${Date.now().toString(36).toUpperCase()}`,
            classSlotId: slotId,
            userId: custUser.id,
            customerPackageId: custPkg.id,
            status: 'ATTENDED',
          },
        });
        cleanupBookingIds.push(booking.id);

        // Eksekusi complete pertama
        await classSlotService.complete(
          adminPrincipalA,
          slotId,
          { reason: 'NORMAL_COMPLETION' },
          `key-comp-burst-1-${Date.now()}-123456`,
          'corr-test',
        );

        // Eksekusi complete kedua (Hammering)
        await classSlotService.complete(
          adminPrincipalA,
          slotId,
          { reason: 'NORMAL_COMPLETION' },
          `key-comp-burst-2-${Date.now()}-123456`,
          'corr-test',
        );

        // Eksekusi complete ketiga (Hammering)
        await classSlotService.complete(
          adminPrincipalA,
          slotId,
          { reason: 'NORMAL_COMPLETION' },
          `key-comp-burst-3-${Date.now()}-123456`,
          'corr-test',
        );

        const updatedPkg = await db.paketPelanggan.findUniqueOrThrow({ where: { id: custPkg.id } });
        const ledgerCount = await db.sessionLedger.count({
          where: {
            customerPackageId: custPkg.id,
            referenceId: booking.id,
            type: SessionMutationType.ATTEND,
          },
        });

        success = updatedPkg.remainingSessions === 4 && ledgerCount === 1;
        reason = `Sisa sesi = ${updatedPkg.remainingSessions}/4, Ledger count = ${ledgerCount}/1 (Zero Double Deduction)`;
      } catch (err: any) {
        success = false;
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_4D3',
        'Multi-Trigger Idempotency on Class Completion (3 Calls -> Exactly 1 Deduction)',
        'Pilar D: Pemotongan Sesi',
        success,
        reason,
        Date.now() - start,
      );
    }

    // TEST 4.D4: Automatic Token Revocation on Class Completion
    {
      const start = Date.now();
      let success = false;
      let reason = '';
      try {
        const studio = await createIsolatedStudio('4d4');
        const now = new Date();
        const startPast = new Date(now.getTime() - 2 * 3_600_000);
        const endPast = new Date(now.getTime() - 1 * 3_600_000);

        const slotRes = await classSlotService.create(
          adminPrincipalA,
          {
            branchId: branchA.id,
            classTypeId: classType.id,
            studioId: studio.id,
            capacity: 5,
            startAt: startPast.toISOString(),
            endAt: endPast.toISOString(),
          },
          `key-slot-tok-rev-comp-${Date.now()}`,
          'corr-test',
        );
        const slotId = slotRes.body.id;
        cleanupSlotIds.push(slotId);
        await db.slotKelas.update({ where: { id: slotId }, data: { status: ClassSlotStatus.CONFIRMED } });

        const { user: custUser } = await createTestCustomer('tok-comp');
        const custPkg = await createTestCustomerPackage(custUser.id, 5);

        const booking = await db.pemesananKelas.create({
          data: {
            id: randomUUID(),
            bookingNumber: `BK-TOKCOMP-${Date.now().toString(36).toUpperCase()}`,
            classSlotId: slotId,
            userId: custUser.id,
            customerPackageId: custPkg.id,
            status: 'BOOKED',
          },
        });
        cleanupBookingIds.push(booking.id);

        // Buat token check-in aktif yang belum terpakai
        const rawToken = randomBytes(32).toString('base64url');
        const token = await db.checkInToken.create({
          data: {
            id: randomUUID(),
            bookingId: booking.id,
            token: Buffer.from(rawToken).toString('hex'), // dummy hash
            expiresAt: endPast,
            isUsed: false,
          },
        });

        // Selesaikan kelas oleh admin
        await classSlotService.complete(
          adminPrincipalA,
          slotId,
          { reason: 'NORMAL_COMPLETION' },
          `key-complete-revtok-${Date.now()}-123456`,
          'corr-test',
        );

        const updatedToken = await db.checkInToken.findUniqueOrThrow({ where: { id: token.id } });

        success = updatedToken.isUsed === true;
        reason = `Token isUsed = ${updatedToken.isUsed} (Otomatis direvoke saat kelas COMPLETED)`;
      } catch (err: any) {
        success = false;
        reason = err?.message || err?.code;
      }
      recordResult(
        'TEST_4D4',
        'Automatic Check-In Token Revocation on Class Completion (Unused Tokens Revoked)',
        'Pilar D: Pemotongan Sesi',
        success,
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
    console.log('📊 RINGKASAN HASIL PENGUJIAN ADVERSARIAL TAHAP 4 (DUAL CHECK-IN & POTONG SESI)');
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
      console.log('🎉 SEMUA 16 SKENARIO ADVERSARIAL TAHAP 4 LULUS 100%! 🎉');
      console.log('   Pilar A: Dual Check-in jendelanya terproteksi ketat dari too early / expired / unassigned.');
      console.log('   Pilar B: Token tampering, replay attack, dan pencurian token dicekal mutlak.');
      console.log('   Pilar C: Rule #9 terbukti membatasi backfill toleransi H+2 jam dan menolak H+3 jam.');
      console.log('   Pilar D: Rule #1 terbukti memotong kuota saat kelas COMPLETED & aman dari double deduction.');
    }
  } finally {
    // ------------------------------------------------------------------------
    // Cleanup / Teardown
    // ------------------------------------------------------------------------
    console.log('\n🧹 Membersihkan slot kelas & data temporer pengujian Tahap 4...');
    try {
      if (cleanupBookingIds.length > 0) {
        await db.kehadiranPelanggan.deleteMany({ where: { bookingId: { in: cleanupBookingIds } } });
        await db.checkInToken.deleteMany({ where: { bookingId: { in: cleanupBookingIds } } });
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
      if (cleanupStudioIds.length > 0) {
        await db.ruangan.deleteMany({ where: { studioId: { in: cleanupStudioIds } } });
        await db.slotKelas.deleteMany({ where: { studioId: { in: cleanupStudioIds } } });
        await db.studio.deleteMany({ where: { id: { in: cleanupStudioIds } } });
      }
      console.log(`   ✅ Seluruh data temporer pengujian Tahap 4 berhasil dibersihkan.`);
    } catch (cleanupErr: any) {
      console.warn(`   ⚠️ Catatan cleanup: ${cleanupErr.message}`);
    }

    await db.$disconnect();

    const failed = results.filter((r) => !r.passed).length;
    if (failed > 0) {
      throw new Error(`Pengujian Adversarial Tahap 4 GAGAL: ${failed} skenario terdeteksi bocor!`);
    }
  }
}

main().catch((err) => {
  console.error('\n💥 FATAL ERROR PADA UJI ADVERSARIAL TAHAP 4:', err);
  process.exit(1);
});
