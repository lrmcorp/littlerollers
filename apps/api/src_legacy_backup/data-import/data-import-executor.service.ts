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
        const {
          name,
          email,
          phoneE164,
          role,
          branchId,
          status,
          genderCode,
          birthDate,
          address,
          barcode,
          ktpPath,
          selfiePath,
          nik,
          countryCode,
          fotoPath,
        } = item.data;
        const emailHash = canonicalEmailHash(email);
        const isCustomer = role === 'CUSTOMER';
        const defaultHash = isCustomer ? defaultCustomerPass : defaultStaffPass;
        const parsedBirthDate = birthDate ? new Date(birthDate) : null;
        const nikHash = nik ? createHash('sha256').update(nik).digest('hex') : null;

        const mimeFromPath = (p: string) => {
          const lower = p.toLowerCase();
          if (lower.endsWith('.png')) return 'image/png';
          if (lower.endsWith('.webp')) return 'image/webp';
          return 'image/jpeg';
        };
        const nameFromPath = (p: string) => {
          const parts = p.split(/[\/\\]/);
          return parts[parts.length - 1] || 'document.jpg';
        };
        const resolveObjectKey = (p: string) =>
          p.startsWith('http://') || p.startsWith('https://')
            ? p
            : `legacy:${p.replace(/^\/+/, '')}`;

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
          if (
            address ||
            genderCode ||
            parsedBirthDate ||
            barcode ||
            nikHash ||
            countryCode
          ) {
            await this.db.profilPengguna.upsert({
              where: { userId: existingUser.id },
              create: {
                userId: existingUser.id,
                address: address || null,
                genderCode: genderCode || null,
                birthDate: parsedBirthDate,
                barcode: barcode || null,
                nikHash: nikHash || null,
                countryCode: countryCode || null,
              },
              update: {
                ...(address ? { address } : {}),
                ...(genderCode ? { genderCode } : {}),
                ...(parsedBirthDate ? { birthDate: parsedBirthDate } : {}),
                ...(barcode ? { barcode } : {}),
                ...(nikHash ? { nikHash } : {}),
                ...(countryCode ? { countryCode } : {}),
              },
            });
          }

          // Upsert KTP document if provided
          if (ktpPath) {
            const objectKey = resolveObjectKey(ktpPath);
            const existingKtp = await this.db.dokumenVerifikasiIdentitas.findFirst({
              where: { userId: existingUser.id, kind: 'KTP_FRONT', replacedById: null },
            });
            if (existingKtp) {
              await this.db.dokumenVerifikasiIdentitas.update({
                where: { id: existingKtp.id },
                data: {
                  objectKey,
                  fileName: nameFromPath(ktpPath),
                  mimeType: mimeFromPath(ktpPath),
                  status: 'APPROVED',
                  uploadStatus: 'FINALIZED',
                  scanStatus: 'CLEAN',
                },
              });
            } else {
              await this.db.dokumenVerifikasiIdentitas.create({
                data: {
                  id: randomUUID(),
                  userId: existingUser.id,
                  kind: 'KTP_FRONT',
                  status: 'APPROVED',
                  uploadStatus: 'FINALIZED',
                  scanStatus: 'CLEAN',
                  objectKey,
                  fileName: nameFromPath(ktpPath),
                  mimeType: mimeFromPath(ktpPath),
                  checksum: createHash('sha256').update(ktpPath).digest('hex'),
                  sizeBytes: 0,
                  issuedAt: new Date(),
                  uploadedAt: new Date(),
                  finalizedAt: new Date(),
                },
              });
            }
          }

          // Upsert Selfie document if provided
          if (selfiePath) {
            const objectKey = resolveObjectKey(selfiePath);
            const existingSelfie = await this.db.dokumenVerifikasiIdentitas.findFirst({
              where: { userId: existingUser.id, kind: 'SELFIE', replacedById: null },
            });
            if (existingSelfie) {
              await this.db.dokumenVerifikasiIdentitas.update({
                where: { id: existingSelfie.id },
                data: {
                  objectKey,
                  fileName: nameFromPath(selfiePath),
                  mimeType: mimeFromPath(selfiePath),
                  status: 'APPROVED',
                  uploadStatus: 'FINALIZED',
                  scanStatus: 'CLEAN',
                },
              });
            } else {
              await this.db.dokumenVerifikasiIdentitas.create({
                data: {
                  id: randomUUID(),
                  userId: existingUser.id,
                  kind: 'SELFIE',
                  status: 'APPROVED',
                  uploadStatus: 'FINALIZED',
                  scanStatus: 'CLEAN',
                  objectKey,
                  fileName: nameFromPath(selfiePath),
                  mimeType: mimeFromPath(selfiePath),
                  checksum: createHash('sha256').update(selfiePath).digest('hex'),
                  sizeBytes: 0,
                  issuedAt: new Date(),
                  uploadedAt: new Date(),
                  finalizedAt: new Date(),
                },
              });
            }
          }

          // Upsert Avatar/Profile Photo if provided
          if (fotoPath) {
            const objectKey = resolveObjectKey(fotoPath);
            const existingPhoto = await this.db.asetMedia.findFirst({
              where: {
                entityType: 'User',
                entityId: existingUser.id,
                purposeCode: 'PROFILE_PHOTO',
              },
            });
            if (existingPhoto) {
              await this.db.asetMedia.update({
                where: { id: existingPhoto.id },
                data: {
                  objectKey,
                  mimeType: mimeFromPath(fotoPath),
                  scanStatus: 'CLEAN',
                },
              });
            } else {
              await this.db.asetMedia.create({
                data: {
                  id: randomUUID(),
                  ownerUserId: existingUser.id,
                  entityType: 'User',
                  entityId: existingUser.id,
                  purposeCode: 'PROFILE_PHOTO',
                  objectKey,
                  checksum: createHash('sha256').update(fotoPath).digest('hex'),
                  mimeType: mimeFromPath(fotoPath),
                  sizeBytes: 0,
                  scanStatus: 'CLEAN',
                  visibility: 'PUBLIC',
                },
              });
            }
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

            if (
              address ||
              genderCode ||
              parsedBirthDate ||
              barcode ||
              nikHash ||
              countryCode
            ) {
              await tx.profilPengguna.create({
                data: {
                  userId: newUserId,
                  address: address || null,
                  genderCode: genderCode || null,
                  birthDate: parsedBirthDate,
                  barcode: barcode || null,
                  nikHash: nikHash || null,
                  countryCode: countryCode || null,
                },
              });
            }

            if (ktpPath) {
              await tx.dokumenVerifikasiIdentitas.create({
                data: {
                  id: randomUUID(),
                  userId: newUserId,
                  kind: 'KTP_FRONT',
                  status: 'APPROVED',
                  uploadStatus: 'FINALIZED',
                  scanStatus: 'CLEAN',
                  objectKey: resolveObjectKey(ktpPath),
                  fileName: nameFromPath(ktpPath),
                  mimeType: mimeFromPath(ktpPath),
                  checksum: createHash('sha256').update(ktpPath).digest('hex'),
                  sizeBytes: 0,
                  issuedAt: new Date(),
                  uploadedAt: new Date(),
                  finalizedAt: new Date(),
                },
              });
            }

            if (selfiePath) {
              await tx.dokumenVerifikasiIdentitas.create({
                data: {
                  id: randomUUID(),
                  userId: newUserId,
                  kind: 'SELFIE',
                  status: 'APPROVED',
                  uploadStatus: 'FINALIZED',
                  scanStatus: 'CLEAN',
                  objectKey: resolveObjectKey(selfiePath),
                  fileName: nameFromPath(selfiePath),
                  mimeType: mimeFromPath(selfiePath),
                  checksum: createHash('sha256').update(selfiePath).digest('hex'),
                  sizeBytes: 0,
                  issuedAt: new Date(),
                  uploadedAt: new Date(),
                  finalizedAt: new Date(),
                },
              });
            }

            if (fotoPath) {
              await tx.asetMedia.create({
                data: {
                  id: randomUUID(),
                  ownerUserId: newUserId,
                  entityType: 'User',
                  entityId: newUserId,
                  purposeCode: 'PROFILE_PHOTO',
                  objectKey: resolveObjectKey(fotoPath),
                  checksum: createHash('sha256').update(fotoPath).digest('hex'),
                  mimeType: mimeFromPath(fotoPath),
                  sizeBytes: 0,
                  scanStatus: 'CLEAN',
                  visibility: 'PUBLIC',
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

    // Get a default classType and all branches
    const defaultClassType = await this.db.jenisKelas.findFirst({
      where: { active: true },
      select: { id: true },
    });
    const allBranches = await this.db.cabang.findMany({ select: { id: true, code: true } });

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
        const {
          businessKey,
          name,
          sessionCount,
          durationDays,
          priceRp,
          branchId,
          isGlobal,
          branchIds,
          classTypeId,
          isShowPublic,
          manyTimesAllowed,
          promoteCode,
          discountPercent,
        } = item.data;

        const targetBranchIds = isGlobal
          ? allBranches.map((b) => b.id)
          : branchIds && branchIds.length > 0
            ? branchIds
            : branchId
              ? [branchId]
              : allBranches.map((b) => b.id);

        const discountRp =
          discountPercent > 0 ? Math.round((priceRp * discountPercent) / 100) : 0;
        const effectiveClassTypeId = classTypeId || defaultClassType?.id || null;

        const existing = await this.db.paket.findFirst({ where: { businessKey } });
        let pkgId: string;

        if (existing) {
          pkgId = existing.id;
          await this.db.paket.update({
            where: { id: existing.id },
            data: {
              name,
              sessionCount,
              durationDays,
              priceRp,
              branchId: targetBranchIds[0] || null,
              classTypeId: effectiveClassTypeId,
              status: 'ACTIVE',
            },
          });
          updated++;
        } else {
          pkgId = randomUUID();
          await this.db.paket.create({
            data: {
              id: pkgId,
              businessKey,
              name,
              sessionCount,
              durationDays,
              priceRp,
              effectiveFrom: new Date(),
              status: 'ACTIVE',
              branchId: targetBranchIds[0] || null,
              classTypeId: effectiveClassTypeId,
            },
          });
          inserted++;
        }

        // Link branch scopes
        for (const bId of targetBranchIds) {
          await this.db.cakupanCabangPaket.upsert({
            where: { packageId_branchId: { packageId: pkgId, branchId: bId } },
            create: { id: randomUUID(), packageId: pkgId, branchId: bId, active: true },
            update: { active: true },
          });
        }

        // Link class type scope
        if (effectiveClassTypeId) {
          await this.db.cakupanJenisKelasPaket.upsert({
            where: { packageId_classTypeId: { packageId: pkgId, classTypeId: effectiveClassTypeId } },
            create: { id: randomUUID(), packageId: pkgId, classTypeId: effectiveClassTypeId, active: true },
            update: { active: true },
          });
        }

        // Record commercial revision
        const existingRevisions = await this.db.revisiPaket.count({ where: { packageId: pkgId } });
        await this.db.revisiPaket.create({
          data: {
            id: randomUUID(),
            packageId: pkgId,
            revisionNumber: existingRevisions + 1,
            sessionCount,
            durationDays,
            priceRp,
            promoteCode: promoteCode || null,
            discountRp: discountRp || null,
            manyTimesAllowed: Boolean(manyTimesAllowed),
            visible: Boolean(isShowPublic),
            effectiveFrom: new Date(),
          },
        });

        // Set public profile if public
        if (isShowPublic) {
          await this.db.profilPublikPaket.upsert({
            where: { packageId: pkgId },
            create: {
              packageId: pkgId,
              summary: name,
              description: `Paket ${name} dengan kuota ${sessionCount} sesi berlaku selama ${durationDays} hari.`,
              highlights: [`${sessionCount} Sesi Pertemuan`, `Masa Berlaku ${durationDays} Hari`],
              usageGuidance: 'Dapat digunakan untuk pemesanan kelas reguler sesuai cabang dan jenis kelas yang ditentukan.',
              terms: ['Tidak dapat diuangkan kembali', 'Berlaku sesuai masa aktif tertera'],
            },
            update: {
              summary: name,
              description: `Paket ${name} dengan kuota ${sessionCount} sesi berlaku selama ${durationDays} hari.`,
            },
          });
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
