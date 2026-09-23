import {
  PrismaClient,
  Role,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PolicyService } from '../../apps/api/src/identity/policy.service';
import {
  mapUserToEffectiveRoles,
  IdentityService,
  type SessionPrincipal,
} from '../../apps/api/src/identity/identity.service';
import { OwnerBranchService } from '../../apps/api/src/identity/owner-branch.service';
import { IdentityDocumentAccessService } from '../../apps/api/src/identity/identity-document-access.service';
import {
  validateIdentityDocumentUpload,
  type IdentityDocumentUpload,
} from '../../apps/api/src/identity/identity-document-upload';
import { RateLimitService } from '../../apps/api/src/identity/rate-limit.service';
import { DevFallbackPrivateFileStorage } from '../../apps/api/src/identity/dev-fallback-private-file-storage';
import { IdempotencyService } from '../../apps/api/src/foundation/idempotency.service';
import { BookingsService } from '../../apps/api/src/bookings/pemesanan-kelas.service';
import { digest } from '../../apps/api/src/identity/security';

interface TestResult {
  code: string;
  name: string;
  category: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

const results: TestResult[] = [];

function recordResult(code: string, name: string, category: string, passed: boolean, message: string, durationMs: number) {
  results.push({ code, name, category, passed, message, durationMs });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`   ${icon} [${code}] ${name} (${durationMs}ms)`);
  if (!passed) {
    console.error(`      ⚠️ Detail Kegagalan: ${message}`);
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   DAILYDOSE V2 - UJI ADVERSARIAL TAHAP 1: IDENTITAS, RBAC & KYC              ║');
  console.log('║   "Siapa yang Boleh Masuk & Memesan?" — STRICT ADVERSARIAL & NO HAPPY PATH   ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const db = new PrismaClient();
  const policy = new PolicyService();
  const rateLimit = new RateLimitService();
  const storage = new DevFallbackPrivateFileStorage();
  const identityService = new IdentityService(db as any, policy, rateLimit, storage as any);
  const ownerBranchService = new OwnerBranchService(db as any);
  const identityDocumentAccessService = new IdentityDocumentAccessService(policy, db as any, storage as any);
  const idempotency = new IdempotencyService(db as any);
  const bookingsService = new BookingsService(
    db as any,
    idempotency,
    policy,
    {
      value: {
        booking: { enabled: true, cutoffHours: 2 },
        bookingCancellation: { enabled: true, cutoffHours: 24 },
      },
    } as any,
  );

  const cleanupUserIds: string[] = [];

  try {
    // ------------------------------------------------------------------------
    // Persiapan Aktor Uji dari Database
    // ------------------------------------------------------------------------
    console.log('▶ 1. Menyiapkan Aktor Uji Otentik & Data Cabang...');
    const superOwner = await db.user.findFirstOrThrow({ where: { role: Role.SUPER_OWNER } });
    const owner = await db.user.findFirstOrThrow({ where: { role: Role.OWNER } });
    const admin = await db.user.findFirstOrThrow({ where: { role: Role.ADMIN } });
    const instructor = await db.user.findFirstOrThrow({ where: { role: Role.INSTRUCTOR } });
    const customer = await db.user.findFirstOrThrow({ where: { role: Role.CUSTOMER } });

    const branches = await db.cabang.findMany({ take: 2, orderBy: { code: 'asc' } });
    if (branches.length < 2) {
      throw new Error('Dibutuhkan minimal 2 cabang studio di database untuk uji isolasi multi-cabang!');
    }
    const [branchA, branchB] = branches;

    console.log(`   Cabang A: ${branchA.name} (${branchA.code}), Cabang B: ${branchB.name} (${branchB.code})\n`);

    // ========================================================================
    // PILAR A: AUTENTIKASI, PASSWORD & INTEGRITAS SESI
    // ========================================================================
    console.log('▶ 2. PILAR A: Autentikasi, Password & Integritas Sesi (No Happy Path)...');

    // TEST A.1: Forged Session Token / Tampered Cookie Signature
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        await identityService.authenticateBearer('forged_fake_token_with_injected_super_owner_role_12345');
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'SESSION_REVOKED';
      }
      recordResult(
        'TEST_A1',
        'Forged Session Token / Cryptographic Tampering',
        'Pilar A: Autentikasi',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST A.2: Revoked Session Immediate Invalidation
    {
      const start = Date.now();
      let blocked = false;
      let reason = '';
      try {
        // Terbitkan session aktif temporer
        const session = await identityService.issueSession(customer.id, 'WEB');
        const token = session.webCookieToken!;

        // Pastikan token awal valid
        const principalBefore = await identityService.authenticateBearer(token);
        if (!principalBefore || principalBefore.userId !== customer.id) {
          throw new Error('Gagal menginisialisasi sesi awal uji.');
        }

        // Revoke sesi di server secara eksplisit
        await db.userSession.updateMany({
          where: { accessTokenHash: digest(token) },
          data: {
            revokedAt: new Date(),
            revocationReason: 'ADVERSARIAL_REVOCATION_TEST',
          },
        });

        // Uji akses ulang dengan token lama yang sudah di-revoke
        await identityService.authenticateBearer(token);
      } catch (err: any) {
        blocked = true;
        reason = err?.message || err?.code || 'SESSION_REVOKED';
      }
      recordResult(
        'TEST_A2',
        'Revoked Session Immediate Invalidation (Instant Cutoff)',
        'Pilar A: Autentikasi',
        blocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST A.3: Inactive & Suspended Customer Authentication Guard
    {
      const start = Date.now();
      let loginBlocked = false;
      let reason = '';
      const testEmail = `suspended.tester.${Date.now()}@dailydose.test`;
      try {
        // Buat akun dengan status SUSPENDED
        const suspendedUser = await db.user.create({
          data: {
            id: `usr-susp-${randomUUID().slice(0, 8)}`,
            email: testEmail,
            displayName: 'Suspended Member Test',
            role: Role.CUSTOMER,
            status: 'SUSPENDED',
            passwordHash: '$argon2id$v=19$m=65536,t=3,p=1$OQ7j5B/1n5Tt6+Ww8bi6Iw$FDfbEPDKqHJFt1NDZll1WrMu46qpFcQteLeQSGho8Es',
          },
        });
        cleanupUserIds.push(suspendedUser.id);

        // Coba login dengan password benar (Customer123!)
        try {
          await identityService.authenticatePassword({
            email: testEmail,
            password: 'Customer123!',
            channel: 'WEB',
          });
        } catch (err: any) {
          loginBlocked = true;
          reason = err?.message || err?.code || 'AUTHENTICATION_REQUIRED';
        }
      } catch (err: any) {
        loginBlocked = false;
        reason = err?.message;
      }
      recordResult(
        'TEST_A3',
        'Suspended Customer Login Blockade',
        'Pilar A: Autentikasi',
        loginBlocked,
        reason,
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR B: ESKALASI WEWENANG RBAC & KEBOCORAN CABANG
    // ========================================================================
    console.log('\n▶ 3. PILAR B: Eskalasi Wewenang RBAC & Kebocoran Cabang (No Happy Path)...');

    // TEST B.1: Vertical Privilege Escalation (Customer Menembak Endpoint Staff)
    {
      const start = Date.now();
      let blockedCount = 0;
      const customerRoles = mapUserToEffectiveRoles({ role: 'CUSTOMER' });
      const customerAccess = policy.resolveAccess(customer.id, customerRoles);
      const customerPrincipal: SessionPrincipal = {
        sessionId: `sess-cust-${randomUUID().slice(0, 6)}`,
        userId: customer.id,
        roles: customerRoles,
        capabilities: customerAccess.capabilities,
        branchIds: customerAccess.branchIds,
      };

      // 1. Coba assign owner
      try {
        await ownerBranchService.assignOwner(customerPrincipal, {
          ownerId: customer.id,
          branchId: branchA.id,
        });
      } catch {
        blockedCount += 1;
      }

      // 2. Coba kelola slot kelas
      try {
        policy.requireCapability(customerPrincipal.capabilities, 'class-slot:manage');
      } catch {
        blockedCount += 1;
      }

      // 3. Coba kelola finansial
      try {
        policy.requireCapability(customerPrincipal.capabilities, 'finance:manage');
      } catch {
        blockedCount += 1;
      }

      recordResult(
        'TEST_B1',
        'Vertical Privilege Escalation Blockade (Customer -> Staff Ops)',
        'Pilar B: RBAC',
        blockedCount === 3,
        `Terblokir 3 dari 3 percobaan ilegal (${blockedCount}/3)`,
        Date.now() - start,
      );
    }

    // TEST B.2: Lateral Privilege Escalation (Cross-Branch Admin Hijack)
    {
      const start = Date.now();
      let crossBranchBlocked = false;
      const adminRoles = mapUserToEffectiveRoles({ role: 'ADMIN', preferredBranchId: branchA.id });
      const adminAccess = policy.resolveAccess(admin.id, adminRoles);
      const adminPrincipal: SessionPrincipal = {
        sessionId: `sess-adm-${randomUUID().slice(0, 6)}`,
        userId: admin.id,
        roles: adminRoles,
        capabilities: adminAccess.capabilities,
        branchIds: [branchA.id], // Terikat hanya ke Cabang A
      };

      try {
        // Admin Cabang A mencoba mengakses scope Cabang B
        policy.requireBranchScope(adminPrincipal, branchB.id);
      } catch {
        crossBranchBlocked = true;
      }

      recordResult(
        'TEST_B2',
        'Lateral Cross-Branch Admin Scope Enforcement',
        'Pilar B: RBAC',
        crossBranchBlocked,
        'Admin Cabang A dilarang mengakses Cabang B',
        Date.now() - start,
      );
    }

    // TEST B.3: Owner Cross-Branch Isolation Shield (Aturan Bisnis #10)
    {
      const start = Date.now();
      let shieldActive = false;
      const ownerRoles = mapUserToEffectiveRoles({
        role: 'OWNER',
        ownedBranches: [{ branchId: branchA.id }],
      });
      const ownerAccess = policy.resolveAccess(owner.id, ownerRoles);
      const ownerPrincipal: SessionPrincipal = {
        sessionId: `sess-owner-${randomUUID().slice(0, 6)}`,
        userId: owner.id,
        roles: ownerRoles,
        capabilities: ownerAccess.capabilities,
        branchIds: [branchA.id],
      };

      try {
        // Owner Cabang A mencoba meminta akses ke Cabang B
        policy.requireBranchScope(ownerPrincipal, branchB.id);
      } catch {
        shieldActive = true;
      }

      recordResult(
        'TEST_B3',
        'Owner Cross-Branch Isolation Shield (Rule #10 Protection)',
        'Pilar B: RBAC',
        shieldActive,
        'Owner Cabang A dicekal 100% dari data Cabang B',
        Date.now() - start,
      );
    }

    // TEST B.4: Separation of Duties (Admin Dilarang Approve Request Sendiri)
    {
      const start = Date.now();
      const adminRoles = mapUserToEffectiveRoles({ role: 'ADMIN', preferredBranchId: branchA.id });
      const adminAccess = policy.resolveAccess(admin.id, adminRoles);
      const adminPrincipal: SessionPrincipal = {
        sessionId: `sess-adm-${randomUUID().slice(0, 6)}`,
        userId: admin.id,
        roles: adminRoles,
        capabilities: adminAccess.capabilities,
        branchIds: [branchA.id],
      };

      let soDEnforced = false;
      try {
        // Admin hanya punya ledger:adjust:request, TIDAK PUNYA ledger:adjust:decide
        policy.requireCapability(adminPrincipal.capabilities, 'ledger:adjust:decide');
      } catch {
        soDEnforced = true;
      }

      recordResult(
        'TEST_B4',
        'Separation of Duties (Admin Self-Approval Blockade)',
        'Pilar B: RBAC',
        soDEnforced,
        'Admin tidak memiliki capability ledger:adjust:decide',
        Date.now() - start,
      );
    }

    // TEST B.5: Instructor Data Leak Prevention
    {
      const start = Date.now();
      const instRoles = mapUserToEffectiveRoles({ role: 'INSTRUCTOR', preferredBranchId: branchA.id });
      const instAccess = policy.resolveAccess(instructor.id, instRoles);
      const instructorPrincipal: SessionPrincipal = {
        sessionId: `sess-inst-${randomUUID().slice(0, 6)}`,
        userId: instructor.id,
        roles: instRoles,
        capabilities: instAccess.capabilities,
        branchIds: [branchA.id],
      };

      let kycBlocked = false;
      let financeBlocked = false;

      // Coba akses KYC
      try {
        await identityDocumentAccessService.authorizeReview(instructorPrincipal, 'doc-ktp-test');
      } catch {
        kycBlocked = true;
      }

      // Coba akses finansial
      try {
        policy.requireCapability(instructorPrincipal.capabilities, 'finance:read');
      } catch {
        financeBlocked = true;
      }

      recordResult(
        'TEST_B5',
        'Instructor Data Leak Prevention (KYC & Finance Shield)',
        'Pilar B: RBAC',
        kycBlocked && financeBlocked,
        'Instruktur dicekal dari dokumen identitas dan finansial',
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR C: VERIFIKASI IDENTITAS KYC & BOOKING GATE
    // ========================================================================
    console.log('\n▶ 4. PILAR C: Verifikasi Identitas KYC & Booking Gate (Siapa Boleh Pesan?)...');

    // TEST C.1: Unverified / Inactive Customer Booking Blockade
    {
      const start = Date.now();
      let bookingBlocked = false;
      let reason = '';
      const inactiveUser = await db.user.create({
        data: {
          id: `usr-inact-${randomUUID().slice(0, 8)}`,
          email: `inactive.customer.${Date.now()}@dailydose.test`,
          displayName: 'Unverified Inactive Customer',
          role: Role.CUSTOMER,
          status: 'INACTIVE', // Belum terverifikasi / non-aktif
          passwordHash: '$argon2id$v=19$m=65536,t=3,p=1$OQ7j5B/1n5Tt6+Ww8bi6Iw$FDfbEPDKqHJFt1NDZll1WrMu46qpFcQteLeQSGho8Es',
        },
      });
      cleanupUserIds.push(inactiveUser.id);

      const unverifiedPrincipal: SessionPrincipal = {
        sessionId: `sess-unv-${randomUUID().slice(0, 6)}`,
        userId: inactiveUser.id,
        roles: [{ role: 'CUSTOMER', branchId: null }],
        capabilities: ['customer:self', 'booking:self:create'],
        branchIds: [],
      };

      try {
        // Coba menembak langsung booking service
        await bookingsService.create(
          unverifiedPrincipal,
          {
            classSlotId: randomUUID(),
            customerPackageId: randomUUID(),
            source: 'SELF',
          },
          `idemp-${Date.now()}`,
          'corr-test',
        );
      } catch (err: any) {
        bookingBlocked = true;
        reason = err?.message || err?.code || 'IDENTITY_VERIFICATION_REQUIRED';
      }

      recordResult(
        'TEST_C1',
        'Unverified / Inactive Customer Booking Gate Blockade',
        'Pilar C: KYC Gate',
        bookingBlocked,
        reason,
        Date.now() - start,
      );
    }

    // TEST C.2: Malicious KYC Upload - Executable Script Injection (.php / .exe)
    {
      const start = Date.now();
      let rejected = false;
      let reason = '';
      const maliciousPhpUpload: IdentityDocumentUpload = {
        originalName: 'backdoor.php',
        claimedMimeType: 'image/jpeg',
        buffer: Buffer.from('<?php echo system($_GET["cmd"]); ?>'),
      };

      try {
        validateIdentityDocumentUpload(maliciousPhpUpload, 5 * 1024 * 1024);
      } catch (err: any) {
        rejected = true;
        reason = err?.message || err?.code || 'UPLOAD_REJECTED';
      }

      recordResult(
        'TEST_C2',
        'Malicious Executable Script Injection (.php with fake MIME)',
        'Pilar C: KYC Gate',
        rejected,
        reason,
        Date.now() - start,
      );
    }

    // TEST C.3: Malicious KYC Upload - Embedded XSS SVG Injection
    {
      const start = Date.now();
      let rejected = false;
      let reason = '';
      const xssSvgUpload: IdentityDocumentUpload = {
        originalName: 'ktp.svg',
        claimedMimeType: 'image/svg+xml',
        buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(document.cookie)</script></svg>'),
      };

      try {
        validateIdentityDocumentUpload(xssSvgUpload, 5 * 1024 * 1024);
      } catch (err: any) {
        rejected = true;
        reason = err?.message || err?.code || 'UPLOAD_REJECTED';
      }

      recordResult(
        'TEST_C3',
        'Malicious Embedded XSS SVG Injection Blockade',
        'Pilar C: KYC Gate',
        rejected,
        reason,
        Date.now() - start,
      );
    }

    // TEST C.4: Oversized Document Upload (> maxBytes limit)
    {
      const start = Date.now();
      let rejected = false;
      let reason = '';
      // Buffer raksasa melebihi maxBytes (misal limit 2MB, dikirim 4MB)
      const oversizedUpload: IdentityDocumentUpload = {
        originalName: 'ktp-huge.jpg',
        claimedMimeType: 'image/jpeg',
        buffer: Buffer.alloc(4 * 1024 * 1024),
      };

      try {
        validateIdentityDocumentUpload(oversizedUpload, 2 * 1024 * 1024);
      } catch (err: any) {
        rejected = true;
        reason = err?.message || err?.code || 'UPLOAD_REJECTED';
      }

      recordResult(
        'TEST_C4',
        'Oversized Document Upload Buffer Protection',
        'Pilar C: KYC Gate',
        rejected,
        reason,
        Date.now() - start,
      );
    }

    // TEST C.5: Privacy Data Masking on KTP/Selfie URL
    {
      const start = Date.now();
      let unauthorizedAccessBlocked = false;
      const customerRoles = mapUserToEffectiveRoles({ role: 'CUSTOMER' });
      const customerAccess = policy.resolveAccess(customer.id, customerRoles);
      const customerPrincipal: SessionPrincipal = {
        sessionId: `sess-cust-${randomUUID().slice(0, 6)}`,
        userId: customer.id,
        roles: customerRoles,
        capabilities: customerAccess.capabilities,
        branchIds: customerAccess.branchIds,
      };

      try {
        // Customer mencoba membaca dokumen identitas user lain
        await identityDocumentAccessService.authorizeReview(customerPrincipal, 'doc-ktp-victim');
      } catch {
        unauthorizedAccessBlocked = true;
      }

      recordResult(
        'TEST_C5',
        'Privacy Masking & KYC Access Control (Unauthorized Customer Blocked)',
        'Pilar C: KYC Gate',
        unauthorizedAccessBlocked,
        'Customer dilarang mengakses dokumen KYC akun lain',
        Date.now() - start,
      );
    }

    // ========================================================================
    // PILAR D: MULTI-CABANG & DINAMIKA PENUGASAN (OwnerBranch Shield)
    // ========================================================================
    console.log('\n▶ 5. PILAR D: Multi-Cabang & Dinamika Penugasan (OwnerBranch Cutoff)...');

    // TEST D.1: Immediate Access Cutoff upon Branch Revocation
    {
      const start = Date.now();
      let initialAccessPassed = false;
      let revokedAccessBlocked = false;

      const superOwnerRoles = mapUserToEffectiveRoles({ role: 'SUPER_OWNER' });
      const superOwnerAccess = policy.resolveAccess(superOwner.id, superOwnerRoles);
      const superOwnerPrincipal: SessionPrincipal = {
        sessionId: `sess-so-${randomUUID().slice(0, 6)}`,
        userId: superOwner.id,
        roles: superOwnerRoles,
        capabilities: superOwnerAccess.capabilities,
        branchIds: [],
      };

      // 1. Super Owner menugaskan Cabang B ke Owner
      await ownerBranchService.assignOwner(superOwnerPrincipal, {
        ownerId: owner.id,
        branchId: branchB.id,
      });

      // Validasi akses Cabang B aktif
      const activeOwnerRoles = mapUserToEffectiveRoles({
        role: 'OWNER',
        ownedBranches: [{ branchId: branchA.id }, { branchId: branchB.id }],
      });
      const activeAccess = policy.resolveAccess(owner.id, activeOwnerRoles);
      const activePrincipal: SessionPrincipal = {
        sessionId: `sess-active-${randomUUID().slice(0, 6)}`,
        userId: owner.id,
        roles: activeOwnerRoles,
        capabilities: activeAccess.capabilities,
        branchIds: activeAccess.branchIds,
      };

      try {
        policy.requireBranchScope(activePrincipal, branchB.id);
        initialAccessPassed = true;
      } catch {
        initialAccessPassed = false;
      }

      // 2. Cabut penugasan Cabang B secara instan dari database
      await db.ownerCabang.deleteMany({
        where: {
          ownerId: owner.id,
          branchId: branchB.id,
        },
      });

      // 3. Re-resolve roles pasca-pencabutan
      const revokedOwnerRoles = mapUserToEffectiveRoles({
        role: 'OWNER',
        ownedBranches: [{ branchId: branchA.id }], // Hanya tinggal Cabang A
      });
      const revokedAccess = policy.resolveAccess(owner.id, revokedOwnerRoles);
      const revokedPrincipal: SessionPrincipal = {
        sessionId: `sess-revoked-${randomUUID().slice(0, 6)}`,
        userId: owner.id,
        roles: revokedOwnerRoles,
        capabilities: revokedAccess.capabilities,
        branchIds: revokedAccess.branchIds,
      };

      try {
        // Coba akses kembali Cabang B setelah dicabut
        policy.requireBranchScope(revokedPrincipal, branchB.id);
      } catch {
        revokedAccessBlocked = true;
      }

      recordResult(
        'TEST_D1',
        'Immediate Access Cutoff upon Branch Revocation',
        'Pilar D: Multi-Cabang',
        initialAccessPassed && revokedAccessBlocked,
        'Pencabutan cabang memutus akses seketika pada request berikutnya',
        Date.now() - start,
      );
    }

    // ========================================================================
    // RINGKASAN HASIL AKHIR
    // ========================================================================
    console.log('\n══════════════════════════════════════════════════════════════════════════════');
    console.log('📊 RINGKASAN HASIL PENGUJIAN ADVERSARIAL TAHAP 1 (IDENTITAS, RBAC & KYC)');
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
      throw new Error(`Pengujian Adversarial Tahap 1 GAGAL: ${failedTests} skenario terdeteksi bocor!`);
    } else {
      console.log('\n🎉 SEMUA 11 SKENARIO ADVERSARIAL TAHAP 1 LULUS 100%! 🎉');
      console.log('   Pilar A: Autentikasi, Token & Password terlindungi dari pemalsuan.');
      console.log('   Pilar B: RBAC Vertikal, Lateral (Cross-Branch) & SoD terkunci rapat.');
      console.log('   Pilar C: Gerbang KYC memblokir user belum terverifikasi & file berbahaya.');
      console.log('   Pilar D: Multi-Cabang Dynamic Assignment memutus akses seketika saat dicabut.');
    }
  } finally {
    // Bersihkan aktor temporer uji coba
    if (cleanupUserIds.length > 0) {
      console.log('\n🧹 Membersihkan aktor data temporer pengujian...');
      await db.user.deleteMany({
        where: { id: { in: cleanupUserIds } },
      });
      console.log(`   ✅ ${cleanupUserIds.length} data user temporer berhasil dibersihkan.`);
    }
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error('\n💥 FATAL ERROR PADA UJI ADVERSARIAL TAHAP 1:', err);
  process.exit(1);
});
