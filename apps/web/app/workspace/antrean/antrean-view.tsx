'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  browserWorkQueueClient,
  type AntreanTertinggal,
  type ItemAntrean,
  type KunciAntrean,
  type WorkQueueClient,
} from '@/api-clients/work-queue-client';
import { Feedback, Skeleton } from '../../ui';
import { useSessionContext } from '../../session-context';

const rp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

export const NAMA: Record<KunciAntrean, string> = {
  renewal: 'Member yang paketnya sudah habis dan belum renew',
  verifikasi: 'Verifikasi identitas menunggu',
  bukti: 'Bukti transfer belum diperiksa',
  kuota: 'Kelas di bawah kuota minimum',
  ubahJadwal: 'Permohonan ubah jadwal',
};

const TOMBOL: Record<KunciAntrean, string> = {
  renewal: 'Buka daftar',
  verifikasi: 'Periksa',
  bukti: 'Periksa',
  kuota: 'Lihat kelas',
  ubahJadwal: 'Tinjau',
};

/** "26 hari", "4 jam": satuan terbesar yang masih utuh. */
export function lamaMenunggu(jam: number): string {
  if (jam >= 48) return `${Math.floor(jam / 24)} hari`;
  if (jam >= 24) return '1 hari';
  return jam <= 0 ? 'kurang dari 1 jam' : `${jam} jam`;
}

function jamKelas(iso: string, now: number, timezone: string) {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: timezone, dateStyle: 'short' }).format(d);
  const hari = fmt(new Date(iso));
  const label =
    hari === fmt(new Date(now))
      ? 'hari ini'
      : hari === fmt(new Date(now + 86_400_000))
        ? 'besok'
        : new Intl.DateTimeFormat('id-ID', { weekday: 'long', timeZone: timezone }).format(
            new Date(iso),
          );
  const jam = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  }).format(new Date(iso));
  return `${jam} ${label}`;
}

export function keterangan(item: ItemAntrean, now: number, timezone: string): string {
  switch (item.key) {
    case 'renewal': {
      const nilai = item.nilaiRp ? `Nilai yang belum kembali ${rp(item.nilaiRp)}.` : '';
      const hot = item.hot
        ? ` ${item.hot === item.jumlah ? 'Semuanya' : `${item.hot} di antaranya`} segmen HOT, sesi habis lebih cepat dari masa berlaku.`
        : '';
      return `${nilai}${hot}`.trim();
    }
    case 'verifikasi':
      return 'Member tidak dapat membeli paket atau memesan kelas sampai ini diputuskan.';
    case 'bukti':
      return `Total ${rp(item.nilaiRp ?? 0)}. Sesi member belum aktif sampai pembayarannya disetujui.`;
    case 'kuota': {
      const kelas = (item.kelas ?? []).map((k) => `${k.nama} ${jamKelas(k.mulai, now, timezone)}`);
      const sisa = item.jumlah - kelas.length;
      return `${kelas.join(', ')}${sisa > 0 ? `, dan ${sisa} kelas lain` : ''}. Diputuskan di meja check-in saat kelas mulai bila peserta tidak bertambah.`;
    }
    case 'ubahJadwal':
      return item.alasan ? `Alasan: ${item.alasan}` : 'Tanpa alasan tertulis dari member.';
  }
}

export function catatanWaktu(item: ItemAntrean, now: number): string {
  if (item.key === 'kuota') {
    if (!item.acuanPada) return '';
    const jam = Math.max(0, Math.floor((new Date(item.acuanPada).getTime() - now) / 3_600_000));
    return jam === 0 ? 'Kelas pertama mulai dalam satu jam' : `Kelas pertama mulai ${jam} jam lagi`;
  }
  if (item.umurJam === null) return '';
  if (item.nada === 'TELAT') return `Paling lama menunggu ${lamaMenunggu(item.umurJam)}`;
  return `Masuk ${lamaMenunggu(item.umurJam)} lalu, masih dalam batas`;
}

const GAYA = {
  TELAT: {
    kartu: 'border-dd-danger/40 border-l-dd-danger',
    angka: 'bg-dd-danger text-white',
    waktu: 'text-dd-danger',
    tombol: 'bg-dd-danger text-white hover:brightness-95',
  },
  TENGGAT: {
    kartu: 'border-dd-warning-line/60 border-l-dd-warning-line',
    angka: 'bg-dd-warning text-white',
    waktu: 'text-dd-warning',
    tombol: 'bg-dd-warning text-white hover:brightness-95',
  },
  MENUNGGU: {
    kartu: 'border-dd-line border-l-dd-muted/50',
    angka: 'bg-dd-success-soft text-dd-forest',
    waktu: 'text-dd-muted',
    tombol: 'border border-dd-border-interactive bg-white text-dd-ink hover:border-dd-forest',
  },
} as const;

function KartuAntrean({
  item,
  now,
  timezone,
}: {
  item: ItemAntrean;
  now: number;
  timezone: string;
}) {
  const gaya = GAYA[item.nada];
  const judulId = `antrean-${item.key}`;
  return (
    <li
      aria-labelledby={judulId}
      className={`flex flex-col gap-4 rounded-dd-lg border border-l-4 bg-white p-5 sm:flex-row sm:items-center ${gaya.kartu}`}
    >
      <span
        className={`grid size-12 shrink-0 place-items-center rounded-dd-lg text-xl font-bold tabular-nums ${gaya.angka}`}
        aria-hidden="true"
      >
        {item.jumlah}
      </span>
      <div className="min-w-0 flex-1">
        <h2 id={judulId} className="m-0 text-lg font-semibold text-dd-ink">
          <span className="sr-only">{item.jumlah} · </span>
          {NAMA[item.key]}
        </h2>
        <p className="m-0 mt-1 text-[15px] text-dd-muted">{keterangan(item, now, timezone)}</p>
        <p className={`m-0 mt-1 text-sm font-semibold ${gaya.waktu}`}>{catatanWaktu(item, now)}</p>
      </div>
      <Link
        href={item.href}
        className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-dd-lg px-5 text-[15px] font-semibold no-underline ${gaya.tombol}`}
      >
        {TOMBOL[item.key]}
      </Link>
    </li>
  );
}

export function AntreanView({
  client = browserWorkQueueClient,
  now = Date.now(),
}: {
  client?: WorkQueueClient;
  now?: number;
}) {
  const context = useSessionContext();
  const branchId = context?.activeBranchId || undefined;
  const timezone = context?.activeBranch?.timezone || 'Asia/Jakarta';
  const [antrean, setAntrean] = useState<AntreanTertinggal | null>(null);
  const [failure, setFailure] = useState(false);

  useEffect(() => {
    let batal = false;
    setAntrean(null);
    setFailure(false);
    client
      .tertinggal(branchId)
      .then((a) => !batal && setAntrean(a))
      .catch(() => !batal && setFailure(true));
    return () => {
      batal = true;
    };
  }, [branchId, client]);

  return (
    <section aria-labelledby="antrean-title" className="space-y-6">
      <header>
        <h1
          id="antrean-title"
          className="m-0 text-[28px] font-semibold tracking-[-0.02em] text-dd-ink sm:text-[32px]"
        >
          Antrean yang tertinggal
        </h1>
        <p className="m-0 mt-1 text-[17px] text-dd-muted">
          Urut dari yang paling lama menunggu, bukan dari yang paling baru masuk. Yang paling atas
          paling merugikan jika dibiarkan.
        </p>
      </header>

      {failure && (
        <Feedback kind="error">Antrean belum dapat dimuat. Coba muat ulang halaman.</Feedback>
      )}
      {!antrean && !failure && <Skeleton label="Memuat antrean" />}

      {antrean && antrean.gagal.length > 0 && (
        <Feedback kind="warning">
          Sebagian antrean belum dapat dimuat ({antrean.gagal.map((k) => NAMA[k]).join(', ')}).
          Daftar di bawah belum lengkap.
        </Feedback>
      )}

      {antrean && antrean.items.length > 0 && (
        <ol className="m-0 list-none space-y-3 p-0">
          {antrean.items.map((item) => (
            <KartuAntrean key={item.key} item={item} now={now} timezone={timezone} />
          ))}
        </ol>
      )}

      {antrean && antrean.items.length === 0 && antrean.gagal.length === 0 && (
        <div className="rounded-dd-lg border border-dd-line bg-white px-6 py-10 text-center">
          <h2 className="m-0 text-xl font-semibold text-dd-forest">
            Tidak ada antrean yang tertinggal
          </h2>
          <p className="m-0 mt-2 text-[15px] text-dd-muted">
            Semua bukti transfer, verifikasi, dan member yang paketnya habis sudah ditangani.
          </p>
          <Link
            href="/workspace/classes"
            className="mt-5 inline-flex min-h-11 items-center rounded-dd-lg border border-dd-border-interactive bg-white px-5 text-[15px] font-semibold text-dd-forest no-underline hover:border-dd-forest"
          >
            Lihat jadwal hari ini
          </Link>
        </div>
      )}
    </section>
  );
}
