'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { browserClassSlotClient, type ClassSlot, type ClassSlotClient } from '../api-clients/class-slot-client';
import { weekWindow } from '../lib/class-time';
import { countClassesByWeek } from './schedule-weeks';

/**
 * Papan minggu: berapa kelas per minggu untuk empat minggu ke depan. Minggu tanpa kelas ditandai merah dengan
 * kata "Kosong" (bukan warna saja) dan muncul sebagai peringatan dengan tautan ke salin jadwal.
 */
export function EmptyWeeksNotice({
  branchId,
  timezone,
  client = browserClassSlotClient,
  weeks = 4,
  initialNow,
  refreshKey = 0,
  canFill = true,
}: {
  branchId: string;
  timezone: string;
  client?: ClassSlotClient;
  weeks?: number;
  initialNow?: Date;
  /** Ubah nilainya untuk memuat ulang setelah jadwal diisi. */
  refreshKey?: number;
  /** Tampilkan tautan "Isi pakai salin jadwal" (butuh izin kelola kelas). */
  canFill?: boolean;
}) {
  const now = useMemo(() => initialNow ?? new Date(), [initialNow]);
  const [slots, setSlots] = useState<ClassSlot[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const first = weekWindow(now, timezone);
    const last = weekWindow(new Date(now.getTime() + (weeks - 1) * 7 * 86_400_000), timezone);
    setSlots(null);
    setFailed(false);
    client
      .discover({ branchId, branches: [{ id: branchId, timezone }], timezone, from: first.start, until: last.end, slotsOnly: true })
      .then((result) => {
        if (!cancelled) setSlots(result.slots);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [branchId, client, now, timezone, weeks, refreshKey]);

  const counts = useMemo(() => (slots ? countClassesByWeek(slots, now, weeks, timezone) : []), [slots, now, weeks, timezone]);
  const empty = counts.filter((entry) => entry.count === 0);

  if (failed) return null;
  if (!slots) return <p className="text-sm text-dd-muted">Memeriksa jadwal empat minggu ke depan…</p>;

  return (
    <section aria-label="Jadwal empat minggu ke depan" className="space-y-3">
      {empty.length > 0 && (
        <div role="alert" className="flex flex-wrap items-start gap-3 rounded-dd-md border border-dd-danger/40 bg-dd-danger-soft p-4 text-dd-danger">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-semibold">
              {empty.length === 1 ? '1 minggu' : `${empty.length} minggu`} dalam empat minggu ke depan belum punya kelas.
            </p>
            <p className="text-sm">{empty.map((entry) => entry.week.label).join('; ')}</p>
            {canFill && (
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <Link
                  href="/workspace/classes/rutin"
                  className="inline-flex min-h-11 items-center justify-center rounded-dd-md bg-dd-forest px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-dd-forest-dark focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#24483a]"
                >
                  Isi pakai jadwal rutin
                </Link>
                <Link
                  href="/workspace/classes/salin"
                  className="inline-flex min-h-11 items-center justify-center rounded-dd-md border border-dd-danger/40 bg-white px-3 py-1.5 text-xs font-semibold text-dd-danger underline hover:bg-dd-danger-soft transition focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-dd-danger"
                >
                  Isi pakai salin jadwal
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {counts.map((entry) => (
          <li
            key={entry.week.label}
            className={`rounded-dd-md border px-3 py-2 text-sm font-semibold ${
              entry.count === 0 ? 'border-dd-danger bg-dd-danger-soft text-dd-danger' : 'border-dd-border-interactive bg-white text-dd-ink'
            }`}
          >
            {entry.week.label}: {entry.count === 0 ? 'Kosong' : `${entry.count} kelas`}
          </li>
        ))}
      </ul>
    </section>
  );
}
