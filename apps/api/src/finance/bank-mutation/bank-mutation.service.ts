import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import type {
  BankFormat,
  BankMutationImportResult,
  RawBankMutationRow,
} from './bank-mutation.types';

@Injectable()
export class BankMutationService {
  private readonly logger = new Logger(BankMutationService.name);

  constructor(private readonly db: PrismaService) {}

  /**
   * Parse CSV or JSON payload into standardized RawBankMutationRow objects
   */
  parseInput(input: {
    format?: BankFormat;
    bankName?: string;
    accountNumber?: string;
    csvText?: string;
    items?: Array<{
      bankName?: string;
      accountNumber?: string;
      transactionDate: string | Date;
      amountRp: number;
      description: string;
      referenceNumber?: string;
    }>;
  }): RawBankMutationRow[] {
    const defaultBank = input.bankName || 'BCA';

    // 1. If direct structured items are supplied
    if (input.items && Array.isArray(input.items) && input.items.length > 0) {
      const results: RawBankMutationRow[] = [];
      for (const item of input.items) {
        const date = new Date(item.transactionDate);
        const amount = Math.round(Number(item.amountRp) || 0);
        if (isNaN(date.getTime()) || amount <= 0) continue;
        results.push({
          bankName: item.bankName || defaultBank,
          accountNumber: item.accountNumber || input.accountNumber,
          transactionDate: date,
          amountRp: amount,
          description: (item.description || '').trim(),
          referenceNumber: item.referenceNumber?.trim(),
        });
      }
      return results;
    }

    // 2. If CSV text is supplied
    if (input.csvText && typeof input.csvText === 'string') {
      return this.parseCsv(input.csvText, input.format || 'GENERIC', defaultBank, input.accountNumber);
    }

    return [];
  }

  /**
   * Parses CSV content for BCA, Mandiri, or Generic layouts
   */
  private parseCsv(
    csvText: string,
    format: BankFormat,
    defaultBank: string,
    accountNumber?: string,
  ): RawBankMutationRow[] {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const rows: RawBankMutationRow[] = [];
    let isFirst = true;

    for (const line of lines) {
      if (!line) continue;

      // Skip header lines
      if (
        isFirst &&
        (line.toLowerCase().includes('tanggal') ||
          line.toLowerCase().includes('date') ||
          line.toLowerCase().includes('keterangan') ||
          line.toLowerCase().includes('description'))
      ) {
        isFirst = false;
        continue;
      }
      isFirst = false;

      // Split by comma, semicolon, or tab
      const delimiter = line.includes(';') ? ';' : line.includes('\t') ? '\t' : ',';
      const parts = this.splitCsvLine(line, delimiter);

      if (parts.length < 3) continue;

      if (format === 'BCA') {
        const isDebit =
          line.toUpperCase().includes(' DB') ||
          parts.some((p) => p.toUpperCase().includes(' DB') || p.toUpperCase().endsWith('DB'));
        if (isDebit) continue; // Ignore debit/outflow

        const dateStr = parts[0] || '';
        const desc = parts[1] || '';
        const amountStr = parts[3] || parts[2] || '';
        const amount = this.cleanNumericAmount(amountStr);
        const parsedDate = this.parseDateIndonesian(dateStr);
        if (parsedDate && amount > 0) {
          rows.push({
            bankName: 'BCA',
            accountNumber,
            transactionDate: parsedDate,
            amountRp: amount,
            description: desc,
          });
        }
      } else if (format === 'MANDIRI') {
        const dateStr = parts[0] || '';
        const desc = parts[2] || parts[1] || '';
        const refNo = parts[3];
        const creditStr = parts[5] || parts[4] || '';
        const amount = this.cleanNumericAmount(creditStr);
        const parsedDate = this.parseDateIndonesian(dateStr);
        if (parsedDate && amount > 0) {
          rows.push({
            bankName: 'MANDIRI',
            accountNumber,
            transactionDate: parsedDate,
            amountRp: amount,
            description: desc,
            referenceNumber: refNo || undefined,
          });
        }
      } else {
        const dateStr = parts[0] || '';
        const amountStr = parts[1] || '';
        const desc = parts[2] || '';
        const refNo = parts[3];
        const amount = this.cleanNumericAmount(amountStr);
        const parsedDate = this.parseDateIndonesian(dateStr);
        if (parsedDate && amount > 0) {
          rows.push({
            bankName: defaultBank,
            accountNumber,
            transactionDate: parsedDate,
            amountRp: amount,
            description: desc,
            referenceNumber: refNo || undefined,
          });
        }
      }
    }

    return rows;
  }

  private cleanNumericAmount(val: string): number {
    const cleaned = val.replace(/[^\d.,]/g, '').trim();
    if (!cleaned) return 0;
    // Check if comma is decimal separator (e.g. 1.900.844,00) or thousand separator (1,900,844.00)
    if (cleaned.includes('.') && cleaned.includes(',')) {
      if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
        // Indonesian format: 1.900.844,00
        const noDots = cleaned.replace(/\./g, '').replace(',', '.');
        return Math.round(parseFloat(noDots));
      } else {
        // English format: 1,900,844.00
        const noCommas = cleaned.replace(/,/g, '');
        return Math.round(parseFloat(noCommas));
      }
    }
    // Only dots: check if thousands separator (e.g. 1.900.844)
    if (cleaned.includes('.')) {
      const parts = cleaned.split('.');
      const p1 = parts[1];
      if (parts.length > 2 || (parts.length === 2 && p1 && p1.length === 3)) {
        return parseInt(cleaned.replace(/\./g, ''), 10);
      }
      return Math.round(parseFloat(cleaned));
    }
    // Only commas: check if thousands separator (e.g. 1,900,844)
    if (cleaned.includes(',')) {
      const parts = cleaned.split(',');
      const p1 = parts[1];
      if (parts.length > 2 || (parts.length === 2 && p1 && p1.length === 3)) {
        return parseInt(cleaned.replace(/,/g, ''), 10);
      }
      return Math.round(parseFloat(cleaned.replace(',', '.')));
    }
    return parseInt(cleaned, 10) || 0;
  }

  private parseDateIndonesian(val: string): Date | null {
    if (!val) return null;
    // Try YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    }
    // Try DD/MM/YYYY or DD-MM-YYYY
    const match = val.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (match && match[1] && match[2] && match[3]) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const year = parseInt(match[3], 10);
      const d = new Date(year, month, day);
      return isNaN(d.getTime()) ? null : d;
    }
    const fallback = new Date(val);
    return isNaN(fallback.getTime()) ? null : fallback;
  }

  private splitCsvLine(line: string, delimiter: string): string[] {
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim());
    return parts.map((p) => p.replace(/^["']|["']$/g, '').trim());
  }

  /**
   * Generates a deterministic reference number if the bank statement does not provide one
   */
  private generateReferenceNumber(row: RawBankMutationRow): string {
    if (row.referenceNumber && row.referenceNumber.trim().length > 0) {
      return row.referenceNumber.trim();
    }
    const dateKey = row.transactionDate.toISOString().slice(0, 10);
    const hash = createHash('sha256')
      .update(`${row.bankName}|${dateKey}|${row.amountRp}|${row.description.trim()}`)
      .digest('hex')
      .slice(0, 16)
      .toUpperCase();
    return `MUT-${row.bankName}-${hash}`;
  }

  /**
   * Ingests parsed raw mutation rows into the mutasi_bank table, deduplicating existing ones
   */
  async ingestMutations(rows: RawBankMutationRow[]): Promise<BankMutationImportResult> {
    const mutations: BankMutationImportResult['mutations'] = [];
    let insertedCount = 0;
    let duplicateCount = 0;

    for (const row of rows) {
      const referenceNumber = this.generateReferenceNumber(row);

      // Check for duplicate referenceNumber
      const existing = await this.db.mutasiBank.findUnique({
        where: { referenceNumber },
      });

      if (existing) {
        duplicateCount++;
        mutations.push({
          id: existing.id,
          bankName: existing.bankName,
          transactionDate: existing.transactionDate,
          amountRp: existing.amountRp,
          description: existing.description,
          referenceNumber: existing.referenceNumber,
          status: existing.status,
        });
        continue;
      }

      const created = await this.db.mutasiBank.create({
        data: {
          bankName: row.bankName,
          accountNumber: row.accountNumber ?? null,
          transactionDate: row.transactionDate,
          amountRp: row.amountRp,
          description: row.description,
          referenceNumber,
          status: 'UNMATCHED',
        },
      });

      insertedCount++;
      mutations.push({
        id: created.id,
        bankName: created.bankName,
        transactionDate: created.transactionDate,
        amountRp: created.amountRp,
        description: created.description,
        referenceNumber: created.referenceNumber,
        status: created.status,
      });
    }

    return {
      totalParsed: rows.length,
      insertedCount,
      duplicateCount,
      mutations,
    };
  }

  async listMutations(query: {
    status?: 'UNMATCHED' | 'MATCHED' | 'MANUAL_REVIEW';
    from?: string;
    until?: string;
    bankName?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.bankName) where.bankName = query.bankName;
    if (query.from || query.until) {
      where.transactionDate = {};
      if (query.from) where.transactionDate.gte = new Date(query.from);
      if (query.until) where.transactionDate.lte = new Date(query.until);
    }

    const [items, total] = await Promise.all([
      this.db.mutasiBank.findMany({
        where,
        include: {
          matchedPurchase: {
            select: {
              id: true,
              invoiceNumber: true,
              totalAmountRp: true,
              user: { select: { displayName: true } },
            },
          },
        },
        orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
        take: query.limit || 50,
        skip: query.offset || 0,
      }),
      this.db.mutasiBank.count({ where }),
    ]);

    return { items, total };
  }
}
