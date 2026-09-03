import { HttpStatus, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../database/prisma.service';
import { ApiProblem } from '../identity/security';
import type {
  ImportTargetTable,
  ValidatedRowItem,
  ValidationSummaryResponse,
} from './data-import.types';

export function normalizePhone(raw?: string | number | null): string | null {
  if (!raw) return null;
  const digits = String(raw).replace(/[^0-9+]/g, '');
  if (!digits) return null;
  if (digits.startsWith('+62')) return digits;
  if (digits.startsWith('62')) return `+${digits}`;
  if (digits.startsWith('08')) return `+62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `+62${digits}`;
  return digits.startsWith('+') ? digits : `+${digits}`;
}

export function isValidEmail(email?: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

@Injectable()
export class DataImportValidatorService {
  constructor(private readonly db: PrismaService) {}

  async validateImportFile(input: {
    targetTable: ImportTargetTable;
    fileBase64: string;
    filename?: string;
  }): Promise<ValidationSummaryResponse> {
    if (!input.fileBase64) {
      throw new ApiProblem('EMPTY_FILE_PAYLOAD', HttpStatus.BAD_REQUEST);
    }

    const base64Data = input.fileBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    } catch {
      throw new ApiProblem('INVALID_SPREADSHEET_FILE', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName || !workbook.Sheets[firstSheetName]) {
      throw new ApiProblem('EMPTY_SPREADSHEET_SHEET', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[firstSheetName]!, {
      defval: '',
    });

    if (rawRows.length === 0) {
      return {
        targetTable: input.targetTable,
        totalRows: 0,
        validCount: 0,
        duplicateCount: 0,
        errorCount: 0,
        rows: [],
      };
    }

    switch (input.targetTable) {
      case 'USERS':
        return this.validateUsers(rawRows);
      case 'PACKAGES':
        return this.validatePackages(rawRows);
      case 'CUSTOMER_PACKAGES':
        return this.validateCustomerPackages(rawRows);
      case 'VOUCHERS':
        return this.validateVouchers(rawRows);
      case 'BRANCHES':
        return this.validateBranches(rawRows);
      default:
        throw new ApiProblem('UNSUPPORTED_TARGET_TABLE', HttpStatus.BAD_REQUEST);
    }
  }

  private async validateUsers(rawRows: Record<string, any>[]): Promise<ValidationSummaryResponse> {
    const existingUsers = await this.db.user.findMany({ select: { email: true } });
    const existingEmails = new Set(
      existingUsers
        .map((u) => u.email?.toLowerCase().trim())
        .filter((e): e is string => Boolean(e)),
    );
    const branches = await this.db.cabang.findMany({ select: { code: true, id: true } });
    const existingBranches = new Map<string, string>(
      branches.map((b) => [b.code.toUpperCase().trim(), b.id]),
    );

    const validRoles = [
      'CUSTOMER',
      'INSTRUCTOR',
      'ADMIN',
      'MANAGER',
      'OWNER',
      'FINANCE',
      'OPS',
      'SUPER_OWNER',
    ];

    const validated: ValidatedRowItem[] = [];
    const seenEmailsInFile = new Set<string>();

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i] ?? {};
      const rowNumber = i + 2; // header is row 1
      const errors: string[] = [];
      const warnings: string[] = [];

      const name = String(row['Nama Lengkap'] || row['name'] || row['Nama'] || '').trim();
      const rawEmail = String(row['Email'] || row['email'] || '').trim().toLowerCase();
      const rawPhone = row['No WhatsApp'] || row['phone'] || row['Telepon'] || '';
      const role = String(row['Role'] || row['role'] || 'CUSTOMER').trim().toUpperCase();
      const branchCode = String(
        row['Kode Cabang'] || row['branchCode'] || row['Cabang'] || '',
      ).trim().toUpperCase();
      const status = String(row['Status'] || row['status'] || 'ACTIVE').trim().toUpperCase();

      const rawGender = String(
        row['Jenis Kelamin'] || row['gender'] || row['jenis_kelamin'] || '',
      ).trim().toUpperCase();
      const rawBirthDate = String(
        row['Tanggal Lahir'] || row['birthDate'] || row['tanggal_lahir'] || '',
      ).trim();
      const rawAddress = String(
        row['Alamat'] || row['address'] || row['alamat'] || '',
      ).trim();
      const rawBarcode = String(
        row['Barcode Member'] || row['barcode'] || row['no_member'] || '',
      ).trim();
      const rawKtp = String(
        row['Path / URL KTP'] ||
          row['ktpPath'] ||
          row['ktp'] ||
          row['URL KTP'] ||
          row['foto_ktp'] ||
          '',
      ).trim();
      const rawSelfie = String(
        row['Path / URL Selfie'] ||
          row['selfiePath'] ||
          row['selfie'] ||
          row['URL Selfie'] ||
          row['foto_selfie'] ||
          '',
      ).trim();
      const rawNik = String(row['NIK'] || row['nik'] || row['no_ktp'] || '').trim();
      const rawCountry = String(
        row['Negara'] || row['country'] || row['countryCode'] || row['negara'] || '',
      ).trim();
      const rawFoto = String(
        row['Foto Profil'] ||
          row['foto'] ||
          row['avatar'] ||
          row['photo'] ||
          row['foto_profil'] ||
          row['fotoPath'] ||
          '',
      ).trim();

      if (!name || name.length < 2) {
        errors.push('Nama lengkap wajib diisi (minimal 2 karakter).');
      }

      if (!rawEmail || !isValidEmail(rawEmail)) {
        errors.push('Format email tidak valid.');
      }

      const phoneE164 = normalizePhone(rawPhone);
      if (rawPhone && !phoneE164) {
        warnings.push('Format nomor WhatsApp disesuaikan otomatis.');
      }

      if (!validRoles.includes(role)) {
        errors.push(`Role '${role}' tidak valid. Pilihan: ${validRoles.join(', ')}.`);
      }

      let genderCode: 'MALE' | 'FEMALE' | null = null;
      if (rawGender) {
        if (['1', 'PRIA', 'MALE', 'P', 'M'].includes(rawGender)) {
          genderCode = 'MALE';
        } else if (['0', 'WANITA', 'FEMALE', 'W', 'F'].includes(rawGender)) {
          genderCode = 'FEMALE';
        } else {
          warnings.push(`Jenis kelamin '${rawGender}' disesuaikan.`);
        }
      }

      let birthDate: string | null = null;
      if (rawBirthDate) {
        const parsed = new Date(rawBirthDate);
        if (isNaN(parsed.getTime())) {
          errors.push(`Format tanggal lahir '${rawBirthDate}' tidak valid (gunakan YYYY-MM-DD).`);
        } else {
          birthDate = parsed.toISOString().slice(0, 10);
        }
      }

      let countryCode: string | null = null;
      if (rawCountry) {
        if (/^indonesia$/iu.test(rawCountry) || rawCountry.toUpperCase() === 'ID') {
          countryCode = 'ID';
        } else if (rawCountry.length === 2) {
          countryCode = rawCountry.toUpperCase();
        } else {
          countryCode = 'ID';
        }
      }

      if (rawNik && rawNik.length !== 16) {
        warnings.push(`Panjang NIK '${rawNik}' disarankan 16 digit.`);
      }

      let branchId: string | null = null;
      if (branchCode && branchCode !== 'GLOBAL') {
        branchId = existingBranches.get(branchCode) ?? null;
        if (!branchId) {
          errors.push(`Kode Cabang '${branchCode}' tidak ditemukan.`);
        }
      }

      let duplicateIdentifier: string | undefined;
      let rowStatus: ValidatedRowItem['status'] = 'VALID';

      if (errors.length > 0) {
        rowStatus = 'ERROR';
      } else if (existingEmails.has(rawEmail) || seenEmailsInFile.has(rawEmail)) {
        rowStatus = 'DUPLICATE';
        duplicateIdentifier = rawEmail;
        warnings.push(`Email '${rawEmail}' sudah terdaftar di database.`);
      }

      if (rawEmail) seenEmailsInFile.add(rawEmail);

      validated.push({
        rowNumber,
        status: rowStatus,
        data: {
          name,
          email: rawEmail,
          phoneE164,
          role,
          branchCode: branchCode || null,
          branchId,
          status: status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
          genderCode,
          birthDate,
          address: rawAddress || null,
          barcode: rawBarcode || null,
          ktpPath: rawKtp || null,
          selfiePath: rawSelfie || null,
          nik: rawNik || null,
          countryCode: countryCode || null,
          fotoPath: rawFoto || null,
        },
        errors,
        warnings,
        duplicateIdentifier,
      });
    }

    return this.createSummary('USERS', validated);
  }

  private async validatePackages(rawRows: Record<string, any>[]): Promise<ValidationSummaryResponse> {
    const packages = await this.db.paket.findMany({ select: { businessKey: true, name: true } });
    const existingKeys = new Set(
      packages
        .map((p) => p.businessKey?.toUpperCase().trim())
        .filter((c): c is string => Boolean(c)),
    );
    const branches = await this.db.cabang.findMany({ select: { code: true, id: true } });
    const existingBranches = new Map<string, string>(
      branches.map((b) => [b.code.toUpperCase().trim(), b.id]),
    );
    const classTypes = await this.db.jenisKelas.findMany({
      where: { active: true },
      select: { id: true, code: true, name: true, modality: true },
    });

    const validated: ValidatedRowItem[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i] ?? {};
      const rowNumber = i + 2;
      const errors: string[] = [];
      const warnings: string[] = [];

      const code = String(
        row['Kode Paket'] || row['code'] || row['businessKey'] || '',
      ).trim().toUpperCase();
      const name = String(row['Nama Paket'] || row['name'] || '').trim();
      const category = String(
        row['Kategori Kelas'] || row['category'] || row['id_kelas'] || 'GROUP',
      ).trim().toUpperCase();
      const totalCredits = Number(
        row['Jumlah Sesi'] || row['sessionCount'] || row['totalCredits'] || row['jumlah_pertemuan'] || 0,
      );
      const validityDays = Number(
        row['Masa Berlaku Hari'] || row['durationDays'] || row['validityDays'] || row['valid_day'] || 30,
      );
      const priceIdr = Number(
        row['Harga IDR'] || row['priceRp'] || row['price'] || row['harga'] || 0,
      );
      const rawBranchCode = String(
        row['Kode Cabang'] || row['branchCode'] || row['Cabang'] || 'GLOBAL',
      ).trim();

      const rawShowPublic =
        row['Tampil di Publik'] !== undefined
          ? String(row['Tampil di Publik']).trim().toUpperCase()
          : row['is_show_public'] !== undefined
            ? String(row['is_show_public']).trim().toUpperCase()
            : 'YA';
      const isShowPublic =
        ['YA', '1', 'TRUE', 'Y', 'YES'].includes(rawShowPublic) || rawShowPublic === '';

      const rawManyTimes =
        row['Boleh Beli Berulang'] !== undefined
          ? String(row['Boleh Beli Berulang']).trim().toUpperCase()
          : row['is_many_times'] !== undefined
            ? String(row['is_many_times']).trim().toUpperCase()
            : 'YA';
      const manyTimesAllowed =
        ['YA', '1', 'TRUE', 'Y', 'YES'].includes(rawManyTimes) || rawManyTimes === '';

      const promoteCode =
        String(
          row['Kode Promo'] || row['promote_code'] || row['promoteCode'] || '',
        ).trim() || null;

      const rawDiscount = Number(
        row['Diskon %'] || row['diskon'] || row['discountPercent'] || 0,
      );
      const discountPercent = isNaN(rawDiscount) ? 0 : Math.max(0, Math.min(100, rawDiscount));

      if (!code) errors.push('Kode Paket wajib diisi.');
      if (!name) errors.push('Nama Paket wajib diisi.');
      if (totalCredits <= 0) errors.push('Jumlah sesi harus lebih dari 0.');
      if (validityDays <= 0) errors.push('Masa berlaku hari harus lebih dari 0.');
      if (priceIdr < 0) errors.push('Harga tidak boleh negatif.');

      // Match class type
      const matchedClassType =
        classTypes.find(
          (ct) =>
            ct.code.toUpperCase() === category ||
            ct.name.toUpperCase() === category ||
            (category === '4' && ct.name.toUpperCase().includes('PRIVATE GROUP')) ||
            (category === '3' && ct.name.toUpperCase().includes('SEMI')) ||
            (category === '2' && ct.modality === 'PRIVATE') ||
            (category === '1' && ct.modality === 'GROUP') ||
            (category.includes('PRIVATE') && !category.includes('GROUP') && ct.modality === 'PRIVATE') ||
            (category.includes('GROUP') && ct.modality === 'GROUP'),
        ) ||
        classTypes[0] ||
        null;

      // Parse multi-branches
      const branchCodes: string[] = [];
      const branchIds: string[] = [];
      let isGlobal = false;

      if (!rawBranchCode || rawBranchCode.toUpperCase() === 'GLOBAL') {
        isGlobal = true;
      } else {
        const tokens = rawBranchCode.split(/[,;/]+/).map((t) => t.trim().toUpperCase()).filter(Boolean);
        for (const token of tokens) {
          const id = existingBranches.get(token);
          if (!id) {
            errors.push(`Kode cabang '${token}' tidak ditemukan.`);
          } else {
            branchCodes.push(token);
            branchIds.push(id);
          }
        }
      }

      let rowStatus: ValidatedRowItem['status'] = 'VALID';
      let duplicateIdentifier: string | undefined;

      if (errors.length > 0) {
        rowStatus = 'ERROR';
      } else if (existingKeys.has(code)) {
        rowStatus = 'DUPLICATE';
        duplicateIdentifier = code;
        warnings.push(`Kode paket '${code}' sudah terdaftar di sistem.`);
      }

      validated.push({
        rowNumber,
        status: rowStatus,
        data: {
          code,
          businessKey: code,
          name,
          category,
          classTypeId: matchedClassType?.id || null,
          sessionCount: totalCredits,
          durationDays: validityDays,
          priceRp: priceIdr,
          isGlobal,
          branchCodes,
          branchIds,
          branchId: branchIds[0] || null,
          branchCode: isGlobal ? 'GLOBAL' : branchCodes.join(', '),
          isShowPublic,
          manyTimesAllowed,
          promoteCode,
          discountPercent,
        },
        errors,
        warnings,
        duplicateIdentifier,
      });
    }

    return this.createSummary('PACKAGES', validated);
  }

  private async validateCustomerPackages(
    rawRows: Record<string, any>[],
  ): Promise<ValidationSummaryResponse> {
    const users = await this.db.user.findMany({ select: { email: true, id: true } });
    const existingUsers = new Map<string, string>(
      users
        .filter((u) => Boolean(u.email))
        .map((u) => [u.email!.toLowerCase().trim(), u.id]),
    );

    const pkgs = await this.db.paket.findMany({
      select: {
        id: true,
        businessKey: true,
        name: true,
        sessionCount: true,
        durationDays: true,
        priceRp: true,
        classTypeId: true,
        branchId: true,
      },
    });
    const existingPackages = new Map<string, typeof pkgs[0]>(
      pkgs.map((p) => [p.businessKey.toUpperCase().trim(), p]),
    );

    const branches = await this.db.cabang.findMany({ select: { code: true, id: true } });
    const existingBranches = new Map<string, string>(
      branches.map((b) => [b.code.toUpperCase().trim(), b.id]),
    );

    const validated: ValidatedRowItem[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i] ?? {};
      const rowNumber = i + 2;
      const errors: string[] = [];
      const warnings: string[] = [];

      const customerEmail = String(row['Email Pelanggan'] || row['email'] || '').trim().toLowerCase();
      const packageCode = String(row['Kode Paket'] || row['packageCode'] || '').trim().toUpperCase();
      const creditsRemaining = Number(row['Sisa Sesi'] || row['credits'] || 0);
      const expiresAtRaw = String(row['Tanggal Kadaluwarsa'] || row['expiresAt'] || '').trim();
      const branchCode = String(row['Kode Cabang'] || row['branchCode'] || '').trim().toUpperCase();

      const userId = existingUsers.get(customerEmail);
      if (!userId) {
        errors.push(`Email pelanggan '${customerEmail}' belum terdaftar sebagai user.`);
      }

      const pkg = existingPackages.get(packageCode);
      if (!pkg) {
        errors.push(`Kode paket '${packageCode}' tidak ditemukan.`);
      }

      if (creditsRemaining < 0) {
        errors.push('Sisa sesi tidak boleh negatif.');
      }

      let branchId: string | null = null;
      if (branchCode) {
        branchId = existingBranches.get(branchCode) ?? null;
        if (!branchId) errors.push(`Kode cabang '${branchCode}' tidak ditemukan.`);
      } else if (pkg?.branchId) {
        branchId = pkg.branchId;
      } else {
        branchId = branches[0]?.id ?? null;
      }

      let expiresAt: Date | null = null;
      if (expiresAtRaw) {
        expiresAt = new Date(expiresAtRaw);
        if (isNaN(expiresAt.getTime())) {
          errors.push(`Format tanggal kadaluwarsa '${expiresAtRaw}' tidak valid (gunakan YYYY-MM-DD).`);
        }
      } else {
        errors.push('Tanggal kadaluwarsa wajib diisi.');
      }

      const rowStatus: ValidatedRowItem['status'] = errors.length > 0 ? 'ERROR' : 'VALID';

      validated.push({
        rowNumber,
        status: rowStatus,
        data: {
          customerEmail,
          userId,
          packageCode,
          packageId: pkg?.id,
          packageName: pkg?.name,
          classTypeId: pkg?.classTypeId,
          sessionCountSnapshot: pkg?.sessionCount ?? creditsRemaining,
          durationDaysSnapshot: pkg?.durationDays ?? 30,
          priceRpSnapshot: pkg?.priceRp ?? 0,
          branchId,
          creditsRemaining,
          expiresAt: expiresAt?.toISOString(),
        },
        errors,
        warnings,
      });
    }

    return this.createSummary('CUSTOMER_PACKAGES', validated);
  }

  private async validateVouchers(rawRows: Record<string, any>[]): Promise<ValidationSummaryResponse> {
    const vouchers = await this.db.voucher.findMany({ select: { code: true } });
    const existingVouchers = new Set(
      vouchers.map((v) => v.code.toUpperCase().trim()),
    );

    const validated: ValidatedRowItem[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i] ?? {};
      const rowNumber = i + 2;
      const errors: string[] = [];
      const warnings: string[] = [];

      const code = String(row['Kode Voucher'] || row['code'] || '').trim().toUpperCase();
      const name = String(row['Nama Promo'] || row['name'] || '').trim();
      const discountType = String(row['Tipe Diskon'] || row['type'] || 'PERCENTAGE')
        .trim()
        .toUpperCase();
      const discountValue = Number(row['Nilai Diskon'] || row['value'] || 0);
      const maxUsage = Number(row['Maksimal Pakai'] || row['maxUsage'] || 100);
      const validUntilRaw = String(row['Berlaku Hingga'] || row['validUntil'] || '').trim();

      if (!code) errors.push('Kode Voucher wajib diisi.');
      if (!name) errors.push('Nama Promo wajib diisi.');
      if (discountValue <= 0) errors.push('Nilai diskon harus lebih dari 0.');

      let validUntil: Date | null = null;
      if (validUntilRaw) {
        validUntil = new Date(validUntilRaw);
        if (isNaN(validUntil.getTime())) {
          errors.push(`Format tanggal '${validUntilRaw}' tidak valid.`);
        }
      }

      let rowStatus: ValidatedRowItem['status'] = 'VALID';
      let duplicateIdentifier: string | undefined;

      if (errors.length > 0) {
        rowStatus = 'ERROR';
      } else if (existingVouchers.has(code)) {
        rowStatus = 'DUPLICATE';
        duplicateIdentifier = code;
        warnings.push(`Kode voucher '${code}' sudah ada.`);
      }

      validated.push({
        rowNumber,
        status: rowStatus,
        data: {
          code,
          name,
          discountType: discountType === 'FIXED_AMOUNT' ? 'FIXED_AMOUNT' : 'PERCENTAGE',
          discountValue,
          maxUsage,
          validUntil: validUntil?.toISOString() || null,
        },
        errors,
        warnings,
        duplicateIdentifier,
      });
    }

    return this.createSummary('VOUCHERS', validated);
  }

  private async validateBranches(rawRows: Record<string, any>[]): Promise<ValidationSummaryResponse> {
    const branches = await this.db.cabang.findMany({ select: { code: true } });
    const existingBranches = new Set(
      branches.map((b) => b.code.toUpperCase().trim()),
    );

    const validated: ValidatedRowItem[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i] ?? {};
      const rowNumber = i + 2;
      const errors: string[] = [];
      const warnings: string[] = [];

      const code = String(row['Kode Cabang'] || row['code'] || '').trim().toUpperCase();
      const name = String(row['Nama Cabang'] || row['name'] || '').trim();
      const timezone = String(row['Zona Waktu'] || row['timezone'] || 'Asia/Jakarta').trim();
      const address = String(row['Alamat'] || row['address'] || '').trim();
      const phone = normalizePhone(row['No Kontak'] || row['phone'] || '');
      const studioName = String(row['Nama Studio'] || row['studioName'] || 'Main Studio').trim();
      const capacity = Number(row['Kapasitas'] || row['capacity'] || 10);

      if (!code) errors.push('Kode Cabang wajib diisi.');
      if (!name) errors.push('Nama Cabang wajib diisi.');

      let rowStatus: ValidatedRowItem['status'] = 'VALID';
      let duplicateIdentifier: string | undefined;

      if (errors.length > 0) {
        rowStatus = 'ERROR';
      } else if (existingBranches.has(code)) {
        rowStatus = 'DUPLICATE';
        duplicateIdentifier = code;
        warnings.push(`Kode cabang '${code}' sudah terdaftar.`);
      }

      validated.push({
        rowNumber,
        status: rowStatus,
        data: {
          code,
          name,
          timezone,
          address,
          phone,
          studioName,
          capacity,
        },
        errors,
        warnings,
        duplicateIdentifier,
      });
    }

    return this.createSummary('BRANCHES', validated);
  }

  private createSummary(
    targetTable: ImportTargetTable,
    rows: ValidatedRowItem[],
  ): ValidationSummaryResponse {
    let validCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    for (const r of rows) {
      if (r.status === 'VALID') validCount++;
      else if (r.status === 'DUPLICATE') duplicateCount++;
      else if (r.status === 'ERROR') errorCount++;
    }

    return {
      targetTable,
      totalRows: rows.length,
      validCount,
      duplicateCount,
      errorCount,
      rows,
    };
  }
}
