/** Tarif proyeksi per sesi bila cabang/jenis kelas belum punya tarif sendiri (tetap sama dengan laporan Keuangan). */
export const DEFAULT_PROJECTION_RATE_RP = 125_000;

export interface ProjectionPurchase {
  branchId: string;
  paidAt: Date | null;
  createdAt: Date;
  package: { classTypeId: string | null; sessionCount: number | null };
}

export interface ProjectionRateRow {
  branchId: string;
  classTypeId: string;
  effectiveDate: Date;
  ratePerSesiRp: number;
}

/**
 * Cost proyeksi = sesi terjual x tarif per sesi (tarif terbaru yang berlaku saat pembelian).
 * Satu fungsi untuk laporan Keuangan dan Dashboard agar angkanya tidak berbeda.
 * `rates` harus terurut `effectiveDate` menurun.
 */
export function projectionCostFor(purchases: ProjectionPurchase[], rates: ProjectionRateRow[]) {
  const byBranch = new Map<string, number>();
  const byClassType = new Map<
    string,
    { classTypeId: string; sessionsSold: number; ratePerSesiRp: number; totalCostRp: number }
  >();
  let totalSessionsSold = 0;
  let totalProjectionCostRp = 0;

  for (const purchase of purchases) {
    const classTypeId = purchase.package.classTypeId ?? 'DEFAULT';
    const sessions = purchase.package.sessionCount ?? 1;
    const purchaseDate = purchase.paidAt ?? purchase.createdAt;
    const rate =
      rates.find(
        (item) =>
          item.branchId === purchase.branchId &&
          item.classTypeId === classTypeId &&
          item.effectiveDate <= purchaseDate,
      )?.ratePerSesiRp ?? DEFAULT_PROJECTION_RATE_RP;
    const costRp = sessions * rate;

    totalSessionsSold += sessions;
    totalProjectionCostRp += costRp;
    byBranch.set(purchase.branchId, (byBranch.get(purchase.branchId) ?? 0) + costRp);

    const entry = byClassType.get(classTypeId) ?? {
      classTypeId,
      sessionsSold: 0,
      ratePerSesiRp: rate,
      totalCostRp: 0,
    };
    entry.sessionsSold += sessions;
    entry.totalCostRp += costRp;
    byClassType.set(classTypeId, entry);
  }

  return {
    totalSessionsSold,
    totalProjectionCostRp,
    byBranch,
    breakdown: Array.from(byClassType.values()),
  };
}
