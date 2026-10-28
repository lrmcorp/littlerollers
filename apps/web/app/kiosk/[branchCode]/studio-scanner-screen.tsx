'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import { Check, Lock, Maximize2 } from 'lucide-react';
import {
  getKioskToday as defaultGetKioskToday,
  scanAtKiosk as defaultScanAtKiosk,
  type KioskScanResult,
  type KioskTodayItem,
} from '../../api-clients/booking-client';
import { ApiError } from '../../lib/api-client';
import { BrandMark } from '../../components/public/brand-mark';

/** Lama hasil pindaian tampil sebelum layar siap untuk orang berikutnya. */
export const DURASI_HASIL_MS = 6_000;
/** Kode yang sama dari kamera diabaikan selama ini, karena kamera membaca QR berkali-kali per detik. */
const JEDA_KODE_SAMA_MS = 5_000;
const AWALAN_PASS = 'dd-pass:';

export interface StudioScannerClient {
  scanAtKiosk(branchCode: string, token: string, pass: string): Promise<KioskScanResult>;
  getKioskToday(branchCode: string, token: string): Promise<KioskTodayItem[]>;
}

function jam(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));
}

/** Kalimat penolakan yang menyebut sebabnya dan apa yang bisa dilakukan orang di depan layar. */
export function kalimatPenolakan(hasil: KioskScanResult): { judul: string; isi: string } {
  const nama = hasil.orang?.nama ?? 'Pemilik QR ini';
  const tz = hasil.timezone;
  const kelas = hasil.kelas;
  switch (hasil.alasan) {
    case 'PASS_TIDAK_DIKENALI':
      return {
        judul: 'QR tidak dikenali',
        isi: 'Ini bukan QR kehadiran Daily Dose. Buka QR dari menu Akun di aplikasi, atau dari foto yang Anda simpan.',
      };
    case 'AKUN_BERHENTI':
      return {
        judul: 'Akun tidak aktif',
        isi: `Akun ${nama} sudah tidak aktif. Silakan ke meja depan.`,
      };
    case 'BELUM_WAKTUNYA':
      return {
        judul: 'Belum waktunya',
        isi: kelas
          ? `Kelas ${kelas.namaKelas ?? ''} pukul ${jam(kelas.mulai, tz)} baru bisa dipindai mulai ${jam(
              new Date(
                new Date(kelas.mulai).getTime() - (hasil.bukaPadaMenitSebelum ?? 45) * 60_000,
              ).toISOString(),
              tz,
            )}.`
          : 'Kelas Anda belum bisa dipindai sekarang.',
      };
    case 'KELAS_SUDAH_LEWAT':
      return {
        judul: 'Kelas sudah selesai',
        isi: kelas
          ? `Kelas pukul ${jam(kelas.mulai, tz)} sudah selesai. Bila Anda tadi hadir, minta staf meja depan mencatatnya.`
          : 'Kelas Anda sudah selesai. Minta staf meja depan mencatatnya bila perlu.',
      };
    case 'SUDAH_TERCATAT':
      return {
        judul: 'Sudah tercatat',
        isi: kelas
          ? `${nama} sudah tercatat untuk kelas pukul ${jam(kelas.mulai, tz)}. Tidak perlu memindai lagi.`
          : `${nama} sudah tercatat. Tidak perlu memindai lagi.`,
      };
    case 'TIDAK_ADA_KELAS':
    default:
      return {
        judul: 'Tidak ada kelas',
        isi: `${nama} tidak punya kelas di ${hasil.namaCabang} sekitar jam ini. QR benar, tetapi jadwalnya tidak cocok.`,
      };
  }
}

export function StudioScannerScreen({
  branchCode,
  token,
  namaCabang,
  timezone,
  onLock,
  onExpired,
  client = { scanAtKiosk: defaultScanAtKiosk, getKioskToday: defaultGetKioskToday },
  kameraAktif = true,
}: {
  branchCode: string;
  token: string;
  namaCabang: string;
  timezone: string;
  onLock(): void;
  /** Token tablet ditolak server: kembali ke layar PIN. */
  onExpired(): void;
  client?: StudioScannerClient;
  /** Hanya untuk tes: tanpa kamera. */
  kameraAktif?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const kontrol = useRef<IScannerControls | undefined>(undefined);
  const terakhir = useRef<{ kode: string; pada: number } | null>(null);
  const sibuk = useRef(false);
  const timerHasil = useRef<number | undefined>(undefined);
  const ketikan = useRef('');

  const [sekarang, setSekarang] = useState(() => new Date());
  const [hasil, setHasil] = useState<KioskScanResult | null>(null);
  const [daftar, setDaftar] = useState<KioskTodayItem[]>([]);
  const [kamera, setKamera] = useState<'menyala' | 'mati' | 'gagal'>('mati');
  const [gangguan, setGangguan] = useState('');

  useEffect(() => {
    const t = window.setInterval(() => setSekarang(new Date()), 1_000);
    return () => window.clearInterval(t);
  }, []);

  const muatDaftar = useCallback(async () => {
    try {
      setDaftar(await client.getKioskToday(branchCode, token));
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) onExpired();
    }
  }, [branchCode, client, onExpired, token]);

  useEffect(() => {
    void muatDaftar();
  }, [muatDaftar]);

  const pindai = useCallback(
    async (kode: string) => {
      const bersih = kode.trim();
      if (!bersih || sibuk.current) return;
      const kini = Date.now();
      if (terakhir.current?.kode === bersih && kini - terakhir.current.pada < JEDA_KODE_SAMA_MS)
        return;
      terakhir.current = { kode: bersih, pada: kini };
      sibuk.current = true;
      setGangguan('');
      try {
        const jawaban = await client.scanAtKiosk(branchCode, token, bersih);
        window.clearTimeout(timerHasil.current);
        setHasil(jawaban);
        timerHasil.current = window.setTimeout(() => setHasil(null), DURASI_HASIL_MS);
        if (jawaban.tercatat) void muatDaftar();
      } catch (cause) {
        if (cause instanceof ApiError && cause.status === 401) {
          onExpired();
          return;
        }
        setGangguan('Pindaian belum terkirim. Periksa koneksi internet studio, lalu pindai lagi.');
        terakhir.current = null;
      } finally {
        sibuk.current = false;
      }
    },
    [branchCode, client, muatDaftar, onExpired, token],
  );

  // Kamera tablet.
  useEffect(() => {
    if (!kameraAktif || !videoRef.current) return;
    let batal = false;
    const reader = new BrowserMultiFormatReader();
    reader
      .decodeFromConstraints(
        { video: { facingMode: { ideal: 'user' } } },
        videoRef.current,
        (decoded) => {
          const teks = decoded?.getText();
          if (teks) void pindai(teks);
        },
      )
      .then((c) => {
        if (batal) c.stop();
        else {
          kontrol.current = c;
          setKamera('menyala');
        }
      })
      .catch(() => setKamera('gagal'));
    return () => {
      batal = true;
      kontrol.current?.stop();
      kontrol.current = undefined;
    };
  }, [kameraAktif, pindai]);

  // Pemindai genggam (USB/Bluetooth) mengetik isi QR lalu menekan Enter, seperti papan ketik.
  useEffect(() => {
    const tekan = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        const isi = ketikan.current;
        ketikan.current = '';
        if (isi.startsWith(AWALAN_PASS)) void pindai(isi);
        return;
      }
      if (event.key.length === 1) ketikan.current = (ketikan.current + event.key).slice(-200);
    };
    window.addEventListener('keydown', tekan);
    return () => window.removeEventListener('keydown', tekan);
  }, [pindai]);

  useEffect(() => () => window.clearTimeout(timerHasil.current), []);

  const tanggal = new Intl.DateTimeFormat('id-ID', {
    timeZone: timezone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(sekarang);

  const layarPenuh = () => {
    if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.();
    else void document.exitFullscreen?.();
  };

  return (
    <main className="flex min-h-dvh flex-col gap-6 bg-[#111827] px-[clamp(16px,3vw,34px)] py-7 text-white">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-4">
            <BrandMark tone="light" className="w-[104px]" href={`/kiosk/${branchCode}`} />
            <h1 className="m-0 text-[22px] font-semibold text-white">{namaCabang}</h1>
          </div>
          <p className="m-0 mt-1 text-[17px] text-[#9ca3af]">{tanggal}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={layarPenuh}
            aria-label="Layar penuh"
            className="flex size-11 items-center justify-center rounded-dd-sm border border-white/20 text-[#9ca3af] hover:text-white"
          >
            <Maximize2 className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onLock}
            className="flex min-h-11 items-center gap-2 rounded-dd-sm border border-white/20 px-3 text-[15px] text-[#9ca3af] hover:text-white"
          >
            <Lock className="size-4" aria-hidden="true" />
            Kunci tablet
          </button>
          <p
            className="m-0 font-display text-[40px] font-semibold leading-none tabular-nums"
            aria-label="Jam sekarang"
          >
            {jam(sekarang.toISOString(), timezone)}
          </p>
        </div>
      </header>

      <div className="flex flex-1 flex-wrap items-stretch gap-5">
        <section
          aria-labelledby="kiosk-scan"
          className="flex min-w-0 flex-[1_1_420px] flex-col rounded-2xl border border-white/10 bg-[#1f2937] p-7"
        >
          <h2
            id="kiosk-scan"
            className="m-0 text-[clamp(26px,2.8vw,32px)] font-semibold text-white"
          >
            Tunjukkan QR Anda ke kamera
          </h2>
          <p className="m-0 mt-3 text-[19px] leading-relaxed text-[#9ca3af]">
            Member dan instruktur memakai QR yang sama setiap kali datang. Tidak perlu tautan, tidak
            perlu sinyal.
          </p>
          <div className="relative mt-6 flex min-h-[300px] flex-1 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-white/20 bg-[#0b1220]">
            <video
              ref={videoRef}
              muted
              playsInline
              className={`absolute inset-0 h-full w-full object-cover ${kamera === 'menyala' ? 'opacity-60' : 'opacity-0'}`}
            />
            <div className="relative flex flex-col items-center gap-4 px-6 text-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6ee7a8"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-16"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="3" height="3" rx="0.5" />
                <rect x="19" y="19" width="2" height="2" rx="0.5" />
              </svg>
              <p className="m-0 text-[19px] text-[#d1d5db]">
                {kamera === 'gagal'
                  ? 'Kamera tidak tersedia. Pemindai genggam tetap bisa dipakai, atau izinkan akses kamera di browser.'
                  : 'Kamera aktif, arahkan QR ke sini'}
              </p>
            </div>
          </div>
          <p className="m-0 mt-4 text-[16px] text-[#9ca3af]">
            Tidak bisa memindai? Staf meja depan dapat mencatat kehadiran secara manual.
          </p>
        </section>

        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-4">
          <div aria-live="assertive" aria-atomic="true">
            {gangguan ? (
              <KartuPenolakan judul="Belum terkirim" isi={gangguan} />
            ) : hasil?.tercatat && hasil.orang ? (
              <KartuTercatat hasil={hasil} />
            ) : hasil ? (
              <KartuPenolakan {...kalimatPenolakan(hasil)} />
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[#1f2937] p-7">
                <p className="m-0 text-[19px] text-[#9ca3af]">
                  Hasil pindaian tampil di sini, termasuk alasannya bila tidak bisa dicatat.
                </p>
              </div>
            )}
          </div>

          <section
            aria-labelledby="kiosk-today"
            className="rounded-2xl border border-white/10 bg-[#1f2937] p-6"
          >
            <h2 id="kiosk-today" className="m-0 font-sans text-[19px] font-bold text-white">
              Tercatat hari ini
            </h2>
            {daftar.length === 0 ? (
              <p className="m-0 mt-3 text-[17px] text-[#9ca3af]">
                Belum ada yang tercatat hari ini.
              </p>
            ) : (
              <ul className="m-0 mt-2 list-none p-0">
                {daftar.slice(0, 6).map((item, i) => (
                  <li
                    key={`${item.nama}-${item.tercatatPada}-${i}`}
                    className="flex items-center justify-between gap-3 border-b border-white/10 py-2.5 text-[18px] last:border-b-0"
                  >
                    <span className="min-w-0 truncate text-[#e5e7eb]">
                      {item.nama}
                      {item.peran === 'INSTRUKTUR' && ' · instruktur'}
                    </span>
                    <span className="shrink-0 tabular-nums text-[#9ca3af]">
                      {jam(item.tercatatPada, timezone)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <p className="m-0 text-[16px] text-[#9ca3af]">
        Kehadiran hanya tercatat jika orangnya punya kelas di cabang ini pada jendela waktu kelas
        tersebut.
      </p>
    </main>
  );
}

function KartuTercatat({ hasil }: { hasil: KioskScanResult }) {
  const { orang, kelas, timezone } = hasil;
  return (
    <section className="rounded-2xl border-2 border-[#6ee7a8] bg-[#0f3d26] p-7">
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#6ee7a8]">
          <Check className="size-6 text-[#0b2817]" strokeWidth={3} aria-hidden="true" />
        </span>
        <h2 className="m-0 text-[clamp(24px,2.6vw,30px)] font-semibold text-white">
          Kehadiran tercatat
        </h2>
      </div>
      <p className="m-0 mt-4 text-[24px] font-bold text-white">{orang!.nama}</p>
      {kelas && (
        <p className="m-0 mt-2 text-[19px] text-[#d1fae5]">
          {kelas.namaKelas ?? 'Kelas'}, {jam(kelas.mulai, timezone)} sampai{' '}
          {jam(kelas.selesai, timezone)}
          {kelas.studio ? ` · ${kelas.studio}` : ''}
        </p>
      )}
      <p className="m-0 mt-2 text-[17px] text-[#a7f3d0]">
        {orang!.peran === 'INSTRUKTUR'
          ? `Presensi mengajar tercatat pukul ${jam(hasil.tercatatPada!, timezone)}.`
          : `Tercatat pukul ${jam(hasil.tercatatPada!, timezone)}. Sesi terpotong saat kelas selesai.`}
      </p>
    </section>
  );
}

function KartuPenolakan({ judul, isi }: { judul: string; isi: string }) {
  return (
    <section className="rounded-2xl border border-[#f87171]/50 bg-[#3b1a1a] p-6">
      <h2 className="m-0 font-sans text-[19px] font-bold text-[#fecaca]">{judul}</h2>
      <p className="m-0 mt-2 text-[18px] leading-relaxed text-[#fde2e2]">{isi}</p>
    </section>
  );
}
