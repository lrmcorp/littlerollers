import { HttpStatus } from '@nestjs/common';
import { ApiProblem } from '../identity/security';

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
/** Rentang laporan keuangan paling lebar (selaras dengan batas ekspor). */
export const FINANCE_MAX_RANGE_DAYS = 366;

export interface FinanceRange {
  /** Tanggal awal dan akhir (inklusif), `YYYY-MM-DD`. */
  from: string;
  until: string;
  /** Batas query: `gte fromDate` dan `lt untilExclusive` (hari setelah `until`). */
  fromDate: Date;
  untilExclusive: Date;
  /** Label ringkas: `2026-10` bila tepat satu bulan penuh, selain itu `dari/sampai`. */
  label: string;
}

const invalid = (field: string, issue: string) =>
  new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [{ field, issue }]);

function parseDay(value: string, field: string): Date {
  if (!DAY.test(value)) throw invalid(field, 'INVALID_DATE');
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    throw invalid(field, 'INVALID_DATE');
  return date;
}

const isoDay = (date: Date) => date.toISOString().slice(0, 10);

/**
 * Rentang tanggal laporan. `from`/`until` (inklusif) diutamakan; `period` (`YYYY-MM`) dipertahankan sebagai
 * singkatan satu bulan penuh. Tanpa input apa pun: bulan berjalan. Batas hari memakai UTC, sama dengan Dashboard.
 */
export function financeRange(
  input: { from?: string; until?: string; period?: string } = {},
  now: Date = new Date(),
): FinanceRange {
  let from = input.from?.trim();
  let until = input.until?.trim();

  if (!from && !until) {
    const period = input.period?.trim() || now.toISOString().slice(0, 7);
    if (!MONTH.test(period)) throw invalid('period', 'INVALID_PERIOD');
    const first = new Date(`${period}-01T00:00:00.000Z`);
    const last = new Date(first);
    last.setUTCMonth(last.getUTCMonth() + 1);
    last.setUTCDate(0);
    from = isoDay(first);
    until = isoDay(last);
  }
  if (!from || !until) throw invalid(from ? 'until' : 'from', 'REQUIRED');

  const fromDate = parseDay(from, 'from');
  const untilDay = parseDay(until, 'until');
  if (fromDate > untilDay) throw invalid('until', 'BEFORE_FROM');
  const untilExclusive = new Date(untilDay.getTime() + 86_400_000);
  if ((untilExclusive.getTime() - fromDate.getTime()) / 86_400_000 > FINANCE_MAX_RANGE_DAYS)
    throw new ApiProblem('RANGE_TOO_LARGE', HttpStatus.UNPROCESSABLE_ENTITY, false, [
      { field: 'until', issue: 'RANGE_TOO_LARGE' },
    ]);

  const wholeMonth =
    from.slice(0, 7) === until.slice(0, 7) &&
    from.endsWith('-01') &&
    isoDay(new Date(Date.UTC(untilDay.getUTCFullYear(), untilDay.getUTCMonth() + 1, 0))) === until;
  return { from, until, fromDate, untilExclusive, label: wholeMonth ? from.slice(0, 7) : `${from}/${until}` };
}

/** Bulan (`YYYY-MM`) yang tanggal 1-nya jatuh di dalam rentang; dipakai untuk biaya lama yang hanya tercatat per bulan. */
export function monthsStartingIn(range: FinanceRange): string[] {
  const months: string[] = [];
  const cursor = new Date(Date.UTC(range.fromDate.getUTCFullYear(), range.fromDate.getUTCMonth(), 1));
  if (cursor < range.fromDate) cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  while (cursor < range.untilExclusive) {
    months.push(cursor.toISOString().slice(0, 7));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return months;
}

/**
 * Filter biaya operasional dalam rentang: berdasarkan tanggal pengeluaran (`incurredOn`); biaya lama tanpa tanggal
 * dihitung pada tanggal 1 bulannya.
 */
export function otherCostInRange(range: FinanceRange) {
  const legacyMonths = monthsStartingIn(range);
  return {
    OR: [
      { incurredOn: { gte: range.fromDate, lt: range.untilExclusive } },
      ...(legacyMonths.length ? [{ incurredOn: null, period: { in: legacyMonths } }] : []),
    ],
  };
}

/** Tanggal efektif sebuah biaya (baris lama tanpa tanggal memakai tanggal 1 bulannya). */
export function otherCostDay(cost: { incurredOn: Date | null; period: string }): string {
  return cost.incurredOn ? isoDay(cost.incurredOn) : `${cost.period}-01`;
}

/** Validasi tanggal pengeluaran tunggal (`YYYY-MM-DD`). */
export function parseIncurredOn(value: unknown, field = 'incurredOn'): Date {
  if (typeof value !== 'string') throw invalid(field, 'REQUIRED');
  return parseDay(value.trim(), field);
}
