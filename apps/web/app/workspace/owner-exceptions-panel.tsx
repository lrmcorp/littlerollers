'use client';

import { useEffect, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import {
  browserOwnerReportClient,
  type LaporanOwner,
  type OwnerReportClient,
} from '@/api-clients/owner-report-client';
import { formatRupiah } from '../lib/formatters';
import { Feedback } from '../ui';

/** Nama yang dipakai orang di studio untuk tiap alasan pindaian ditolak. */
const LABEL_PENOLAKAN: Record<string, string> = {
  TIDAK_ADA_KELAS: 'Tidak punya kelas hari ini',
  BELUM_WAKTUNYA: 'Datang sebelum jendela pindai',
  KELAS_SUDAH_LEWAT: 'Datang setelah kelas lewat',
  PASS_TIDAK_DIKENALI: 'QR tidak dikenali',
  AKUN_BERHENTI: 'Akun tidak aktif',
};

function tanggalJam(iso: string | null, timezone: string) {
  if (!iso) return 'Kelas sudah dihapus';
  return new Date(iso).toLocaleString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });
}

/**
 * Laporan untuk Owner: kelas yang tetap berjalan walau peserta di bawah kuota minimum, beserta
 * honor yang tetap dibayar, dan pindaian di studio yang ditolak karena tidak sesuai jadwal.
 */
export function OwnerExceptionsPanel({
  from,
  until,
  branchId,
  timezone = 'Asia/Jakarta',
  client = browserOwnerReportClient,
}: {
  from: string;
  until: string;
  branchId?: string;
  timezone?: string;
  client?: OwnerReportClient;
}) {
  const [laporan, setLaporan] = useState<LaporanOwner>();
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    let aktif = true;
    setGagal(false);
    client
      .laporan({ from, until, branchId })
      .then((hasil) => aktif && setLaporan(hasil))
      .catch(() => aktif && setGagal(true));
    return () => {
      aktif = false;
    };
  }, [branchId, client, from, until]);

  if (gagal) {
    return (
      <Feedback kind="error">
        Laporan kelas di bawah kuota belum dapat dimuat. Coba segarkan halaman.
      </Feedback>
    );
  }
  if (!laporan) return null;

  const { dibawahKuota, pindaiDitolak } = laporan;

  return (
    <section
      aria-labelledby="owner-exceptions-title"
      className="grid gap-6 xl:grid-cols-[1.6fr_1fr]"
    >
      <div className="rounded-dd-xl border border-dd-line bg-white p-6">
        <h2 id="owner-exceptions-title" className="text-lg font-semibold text-dd-ink">
          Kelas jalan di bawah kuota
        </h2>
        {dibawahKuota.total === 0 ? (
          <p className="mt-2 text-sm text-dd-muted">
            Tidak ada kelas yang berjalan di bawah kuota minimum pada periode ini.
          </p>
        ) : (
          <>
            <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.02em] text-dd-ink">
              {formatRupiah(dibawahKuota.totalBebanRp)}
            </p>
            <p className="mt-1.5 text-sm text-dd-muted">
              honor instruktur untuk {dibawahKuota.total} kelas yang tetap jalan dengan peserta
              kurang dari minimum.
            </p>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs text-dd-muted">
                  <tr className="border-b border-dd-line">
                    <th className="py-2 pr-3 font-medium">Kelas</th>
                    <th className="py-2 pr-3 font-medium">Hadir</th>
                    <th className="py-2 pr-3 text-right font-medium">Honor</th>
                    <th className="py-2 font-medium">Alasan tetap jalan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dd-line/70">
                  {dibawahKuota.rows.map((row) => (
                    <tr key={`${row.classSlotId}-${row.diputuskanPada}`} className="align-top">
                      <td className="py-3 pr-3">
                        <span className="block font-medium text-dd-ink">
                          {row.namaKelas ?? 'Kelas'}
                        </span>
                        <span className="block text-xs text-dd-muted">
                          {tanggalJam(row.mulai, timezone)}
                          {row.namaInstruktur ? ` · ${row.namaInstruktur}` : ''}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-3 pr-3 tabular-nums text-dd-warning">
                        {row.hadir !== null && row.minimum !== null
                          ? `${row.hadir} dari ${row.minimum}`
                          : 'Tidak tercatat'}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-3 text-right tabular-nums">
                        {row.selisihBebanRp !== null ? formatRupiah(row.selisihBebanRp) : '–'}
                      </td>
                      <td className="py-3 text-dd-ink">
                        {row.alasan ?? 'Tanpa alasan tertulis'}
                        {row.diputuskanOleh && (
                          <span className="mt-0.5 block text-xs text-dd-muted">
                            Diputuskan oleh {row.diputuskanOleh}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="rounded-dd-xl border border-dd-line bg-white p-6">
        <h2 className="text-lg font-semibold text-dd-ink">Pindaian ditolak di studio</h2>
        <p className="mt-1 text-sm text-dd-muted">
          QR yang dipindai tetapi tidak cocok dengan jadwal. Dihitung tidak hadir.
        </p>
        {pindaiDitolak.total === 0 ? (
          <p className="mt-4 text-sm text-dd-muted">Tidak ada pindaian yang ditolak.</p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {pindaiDitolak.perAlasan.map((item) => (
              <li key={item.alasan} className="flex items-center gap-3 text-sm">
                <TriangleAlert className="size-4 shrink-0 text-dd-warning" aria-hidden="true" />
                <span className="flex-1 text-dd-ink">
                  {LABEL_PENOLAKAN[item.alasan] ?? item.alasan}
                </span>
                <span className="font-semibold tabular-nums text-dd-ink">{item.jumlah}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
