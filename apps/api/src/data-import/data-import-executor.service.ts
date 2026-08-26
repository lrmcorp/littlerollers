import { HttpStatus, Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { canonicalEmailHash, hashPassword } from '../identity/credential-security';
import { ApiProblem } from '../identity/security';
import type {
  ImportExecutionRequest,
  ImportExecutionResult,
} from './data-import.types';

@Injectable()
export class DataImportExecutorService {
  constructor(private readonly db: PrismaService) {}

  async executeImport(
    request: ImportExecutionRequest,
    principalId: string,
  ): Promise<ImportExecutionResult> {
    if (!request.rows || request.rows.length === 0) {
      throw new ApiProblem('EMPTY_IMPORT_ROWS', HttpStatus.BAD_REQUEST);
    }

    switch (request.targetTable) {
      case 'USERS':
        return this.importUsers(request, principalId);
      case 'PACKAGES':
        return this.importPackages(request);
      case 'CUSTOMER_PACKAGES':
        return this.importCustomerPackages(request, principalId);
      case 'VOUCHERS':
        return this.importVouchers(request, principalId);
      case 'BRANCHES':
        return this.importBranches(request);
      default:
        throw new ApiProblem('UNSUPPORTED_TARGET_TABLE', HttpStatus.BAD_REQUEST);
    }
  }

  private async importUsers(
    request: ImportExecutionRequest,
    _principalId: string,
  ): Promise<ImportExecutionResult> {
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let errorCount = 0;
    const errors: Array<{ rowNumber: number; message: string }> = [];

    const defaultCustomerPass = await hashPassword('Customer#2026');
    const defaultStaffPass = await hashPassword('DailyDose#2026');

    for (const item of request.rows) {
      if (item.status === 'ERROR') {
        errorCount++;
        errors.push({ rowNumber: item.rowNumber, message: item.errors.join('; ') });
        continue;
      }

      if (item.status === 'DUPLICATE' && request.duplicateAction === 'SKIP') {
        skipped++;
        continue;
      }

      try {
        const { name, email, phoneE164, role, branchId, status, genderCode, birthDate, address, barcode } = item.data;
        const emailHash = canonicalEmailHash(email);
        const isCustomer = role === 'CUSTOMER';
        const defaultHash = isCustomer ? defaultCustomerPass : defaultStaffPass;
        const parsedBirthDate = birthDate ? new Date(birthDate) : null;

        const existingUser = await this.db.user.findFirst({
          where: { email },
          include: { roles: true },
        });

        if (existingUser) {
          // Update user
          await this.db.user.update({
            where: { id: existingUser.id },
            data: {
              displayName: name,
              phoneE164: phoneE164 || existingUser.phoneE164,
              preferredBranchId: branchId || existingUser.preferredBranchId,
              status: status || existingUser.status,
            },
          });

          // Ensure role is present
          const hasRole = existingUser.roles.some((r) => r.role === role);
          if (!hasRole) {
            await this.db.userRole.create({
              data: {
                id: randomUUID(),
                userId: existingUser.id,
                role,
                branchId: role === 'SUPER_OWNER' ? null : branchId,
                activeFrom: new Date(),
              },
            });
          }

          // Update profile if profile data is provided
          if (address || genderCode || parsedBirthDate || barcode) {
            await this.db.profilPengguna.upsert({
              where: { userId: existingUser.id },
              create: {
                userId: existingUser.id,
                address: address || null,
                genderCode: genderCode || null,
                birthDate: parsedBirthDate,
                barcode: barcode || null,
              },
              update: {
                ...(address ? { address } : {}),
                ...(genderCode ? { genderCode } : {}),
                ...(parsedBirthDate ? { birthDate: parsedBirthDate } : {}),
                ...(barcode ? { barcode } : {}),
              },
            });
          }

          updated++;
        } else {
          // Create new user
          const newUserId = randomUUID();
          await this.db.$transaction(async (tx) => {
            await tx.user.create({
              data: {
                id: newUserId,
                displayName: name,
                email,
                phoneE164: phoneE164 || null,
                preferredBranchId: branchId || null,
                status: status || 'ACTIVE',
              },
            });

            await tx.identitas.create({
              data: {
                id: randomUUID(),
                userId: newUserId,
                provider: 'EMAIL_PASSWORD',
                subjectHash: emailHash,
                verifiedAt: new Date(),
              },
            });

            await tx.passwordCredential.create({
              data: {
                id: randomUUID(),
                userId: newUserId,
                emailHash,
                passwordHash: defaultHash,
                verifiedAt: new Date(),
                passwordChangedAt: new Date(),
              },
            });

            await tx.userRole.create({
              data: {
                id: randomUUID(),
                userId: newUserId,
                role,
                branchId: role === 'SUPER_OWNER' ? null : branchId,
                activeFrom: new Date(),
              },
            });

            if (address || genderCode || parsedBirthDate || barcode) {
              await tx.profilPengguna.create({
                data: {
                  userId: newUserId,
                  address: address || null,
                  genderCode: genderCode || null,
                  birthDate: parsedBirthDate,
                  barcode: barcode || null,
                },
              });
            }
          });
          inserted++;
        }
      } catch (err: any) {
        errorCount++;
        errors.push({
          rowNumber: item.rowNumber,
          message: err?.message || 'Gagal menyimpan data user ke database.',
        });
      }
    }

    return {
      targetTable: 'USERS',
      totalProcessed: request.rows.length,
      insertedCount: inserted,
      updatedCount: updated,
      skippedCount: skipped,
      errorCount,
      errors,
    };
  }

  private async importPackages(request: ImportExecutionRequest): Promise<ImportExecutionResult> {
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let errorCount = 0;
    const errors: Array<{ rowNumber: number; message: string }> = [];

    // Get a default classType if available
    const defaultClassType = await this.db.jenisKelas.findFirst({
      where: { active: true },
      select: { id: true },
    });

    for (const item of request.rows) {
      if (item.status === 'ERROR') {
        errorCount++;
        errors.push({ rowNumber: item.rowNumber, message: item.errors.join('; ') });
        continue;
      }

      if (item.status === 'DUPLICATE' && request.duplicateAction === 'SKIP') {
        skipped++;
        continue;
      }

      try {
        const { businessKey, name, sessionCount, durationDays, priceRp, branchId } = item.data;

        const existing = await this.db.paket.findFirst({ where: { businessKey } });

        if (existing) {
          await this.db.paket.update({
            where: { id: existing.id },
            data: {
              name,
              sessionCount,
              durationDays,
              priceRp,
              branchId: branchId || null,
              status: 'ACTIVE',
            },
          });
          updated++;
        } else {
          await this.db.paket.create({
            data: {
              id: randomUUID(),
              businessKey,
              name,
              sessionCount,
              durationDays,
              priceRp,
              effectiveFrom: new Date(),
              status: 'ACTIVE',
              branchId: branchId || null,
              classTypeId: defaultClassType?.id || null,
            },
          });
          inserted++;
        }
      } catch (err: any) {
        errorCount++;
        errors.push({
          rowNumber: item.rowNumber,
          message: err?.message || 'Gagal menyimpan paket kelas.',
        });
      }
    }

    return {
      targetTable: 'PACKAGES',
      totalProcessed: request.rows.length,
      insertedCount: inserted,
      updatedCount: updated,
      skippedCount: skipped,
      errorCount,
      errors,
    };
  }

  private async importCustomerPackages(
    request: ImportExecutionRequest,
    principalId: string,
  ): Promise<ImportExecutionResult> {
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let errorCount = 0;
    const errors: Array<{ rowNumber: number; message: string }> = [];

    const defaultBranch = await this.db.cabang.findFirst({ select: { id: true } });
    const defaultClassType = await this.db.jenisKelas.findFirst({ select: { id: true } });

    for (const item of request.rows) {
      if (item.status === 'ERROR') {
        errorCount++;
        errors.push({ rowNumber: item.rowNumber, message: item.errors.join('; ') });
        continue;
      }

      try {
        const {
          userId,
          packageId,
          packageName,
          classTypeId,
          sessionCountSnapshot,
          durationDaysSnapshot,
          priceRpSnapshot,
          branchId,
          creditsRemaining,
          expiresAt,
        } = item.data;

        if (!userId || !packageId) {
          errorCount++;
          errors.push({ rowNumber: item.rowNumber, message: 'Relasi user/paket tidak valid.' });
          continue;
        }

        const expiryDate = new Date(expiresAt);
        const effectiveBranchId = branchId || defaultBranch?.id;
        const effectiveClassTypeId = classTypeId || defaultClassType?.id;

        if (!effectiveBranchId || !effectiveClassTypeId) {
          errorCount++;
          errors.push({ rowNumber: item.rowNumber, message: 'Cabang atau Jenis Kelas tidak ditemukan di sistem.' });
          continue;
        }

        const purchaseId = randomUUID();
        const custPkgId = randomUUID();
        const rateRp = Math.round((priceRpSnapshot || 1_000_000) / (sessionCountSnapshot || 10));
        const idempotencyKey = `manual-import-${custPkgId}`;
        const idempotencyKeyHash = createHash('sha256').update(idempotencyKey).digest('hex');

        await this.db.$transaction(async (tx) => {
          // 1. Create completed Purchase record
          await tx.pembelian.create({
            data: {
              id: purchaseId,
              userId,
              branchId: effectiveBranchId,
              packageId,
              classTypeId: effectiveClassTypeId,
              packageNameSnapshot: packageName || 'Imported Package',
              priceRpSnapshot: priceRpSnapshot || 0,
              sessionCountSnapshot: sessionCountSnapshot || creditsRemaining,
              durationDaysSnapshot: durationDaysSnapshot || 30,
              status: 'APPROVED',
              idempotencyKeyHash,
              submittedAt: new Date(),
              decidedAt: new Date(),
              decidedById: principalId,
              timelineComplete: true,
            },
          });

          // 2. Create customer package
          await tx.paketPelanggan.create({
            data: {
              id: custPkgId,
              purchaseId,
              customerUserId: userId,
              branchId: effectiveBranchId,
              packageId,
              classTypeId: effectiveClassTypeId,
              activationDate: new Date(),
              expiryAt: expiryDate,
              salePriceRp: priceRpSnapshot || 0,
              sessionCountSnapshot: sessionCountSnapshot || creditsRemaining,
              durationDaysSnapshot: durationDaysSnapshot || 30,
              projectionRateRp: rateRp,
              status: 'ACTIVE',
            },
          });

          // 3. Create initial ledger entry
          await tx.entriBukuBesar.create({
            data: {
              id: randomUUID(),
              customerPackageId: custPkgId,
              type: 'MIGRATION_OPENING',
              quantity: creditsRemaining,
              referenceType: 'MANUAL_IMPORT',
              referenceId: purchaseId,
              occurredAt: new Date(),
            },
          });
        });

        inserted++;
      } catch (err: any) {
        errorCount++;
        errors.push({
          rowNumber: item.rowNumber,
          message: err?.message || 'Gagal menyimpan saldo paket pelanggan.',
        });
      }
    }

    return {
      targetTable: 'CUSTOMER_PACKAGES',
      totalProcessed: request.rows.length,
      insertedCount: inserted,
      updatedCount: updated,
      skippedCount: skipped,
      errorCount,
      errors,
    };
  }

  private async importVouchers(
    request: ImportExecutionRequest,
    principalId: string,
  ): Promise<ImportExecutionResult> {
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let errorCount = 0;
    const errors: Array<{ rowNumber: number; message: string }> = [];

    for (const item of request.rows) {
      if (item.status === 'ERROR') {
        errorCount++;
        errors.push({ rowNumber: item.rowNumber, message: item.errors.join('; ') });
        continue;
      }

      if (item.status === 'DUPLICATE' && request.duplicateAction === 'SKIP') {
        skipped++;
        continue;
      }

      try {
        const { code, name, discountType, discountValue, maxUsage, validUntil } = item.data;

        const existing = await this.db.voucher.findFirst({ where: { code } });

        if (existing) {
          await this.db.voucher.update({
            where: { id: existing.id },
            data: {
              name,
              discountType,
              discountValue,
              totalUsageLimit: maxUsage || null,
              activeUntil: validUntil ? new Date(validUntil) : null,
              status: 'ACTIVE',
            },
          });
          updated++;
        } else {
          await this.db.voucher.create({
            data: {
              id: randomUUID(),
              code,
              name,
              discountType,
              discountValue,
              totalUsageLimit: maxUsage || null,
              activeFrom: new Date(),
              activeUntil: validUntil ? new Date(validUntil) : null,
              status: 'ACTIVE',
              createdById: principalId,
            },
          });
          inserted++;
        }
      } catch (err: any) {
        errorCount++;
        errors.push({
          rowNumber: item.rowNumber,
          message: err?.message || 'Gagal menyimpan voucher.',
        });
      }
    }

    return {
      targetTable: 'VOUCHERS',
      totalProcessed: request.rows.length,
      insertedCount: inserted,
      updatedCount: updated,
      skippedCount: skipped,
      errorCount,
      errors,
    };
  }

  private async importBranches(request: ImportExecutionRequest): Promise<ImportExecutionResult> {
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let errorCount = 0;
    const errors: Array<{ rowNumber: number; message: string }> = [];

    for (const item of request.rows) {
      if (item.status === 'ERROR') {
        errorCount++;
        errors.push({ rowNumber: item.rowNumber, message: item.errors.join('; ') });
        continue;
      }

      if (item.status === 'DUPLICATE' && request.duplicateAction === 'SKIP') {
        skipped++;
        continue;
      }

      try {
        const { code, name, timezone, phone, studioName, capacity } = item.data;

        const existing = await this.db.cabang.findFirst({
          where: { code },
          include: { studios: true },
        });

        if (existing) {
          await this.db.cabang.update({
            where: { id: existing.id },
            data: {
              name,
              timezone,
              supportWhatsappE164: phone || existing.supportWhatsappE164,
            },
          });

          // Ensure studio exists
          if (studioName && !existing.studios.some((s) => s.name === studioName)) {
            const studioId = randomUUID();
            const studioCode = `STD-${code}-${randomUUID().slice(0, 4)}`.toUpperCase();
            await this.db.studio.create({
              data: {
                id: studioId,
                branchId: existing.id,
                code: studioCode,
                name: studioName,
                active: true,
                rooms: {
                  create: {
                    id: randomUUID(),
                    code: `RM-${randomUUID().slice(0, 4)}`.toUpperCase(),
                    name: `${studioName} Room 1`,
                    capacity: capacity || 10,
                    active: true,
                  },
                },
              },
            });
          }
          updated++;
        } else {
          const branchId = randomUUID();
          const studioId = randomUUID();
          const studioCode = `STD-${code}`.toUpperCase();

          await this.db.cabang.create({
            data: {
              id: branchId,
              code,
              name,
              timezone: timezone || 'Asia/Jakarta',
              supportWhatsappE164: phone || null,
              studios: {
                create: {
                  id: studioId,
                  code: studioCode,
                  name: studioName || 'Main Studio',
                  active: true,
                  rooms: {
                    create: {
                      id: randomUUID(),
                      code: `RM-${code}-1`.toUpperCase(),
                      name: `${studioName || 'Main Studio'} Room 1`,
                      capacity: capacity || 10,
                      active: true,
                    },
                  },
                },
              },
            },
          });
          inserted++;
        }
      } catch (err: any) {
        errorCount++;
        errors.push({
          rowNumber: item.rowNumber,
          message: err?.message || 'Gagal menyimpan data cabang/studio.',
        });
      }
    }

    return {
      targetTable: 'BRANCHES',
      totalProcessed: request.rows.length,
      insertedCount: inserted,
      updatedCount: updated,
      skippedCount: skipped,
      errorCount,
      errors,
    };
  }
}
