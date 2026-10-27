'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  getKioskDisplay as defaultGetKioskDisplay,
  type KioskDisplayData,
  type KioskSlotItem,
} from '../../api-clients/booking-client';
import { Button } from '../../components/actions';
import { Skeleton } from '../../ui';

const DEFAULT_KIOSK_PIN = process.env.NEXT_PUBLIC_KIOSK_PIN || '123456';
const ROTATION_SECONDS = 60;

interface KioskViewProps {
  branchCode: string;
  client?: {
    getKioskDisplay: (code: string) => Promise<KioskDisplayData>;
  };
  initialAuthorized?: boolean;
}

export function KioskView({
  branchCode,
  client = { getKioskDisplay: defaultGetKioskDisplay },
  initialAuthorized,
}: KioskViewProps) {
  const normalizedBranch = branchCode.toLowerCase();
  const storageKey = `dd_kiosk_authorized_${normalizedBranch}`;

  // Otorisasi PIN Studio
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    if (initialAuthorized !== undefined) return initialAuthorized;
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(storageKey) === 'true';
    }
    return false;
  });

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Data Jadwal & Sesi Kiosk
  const [data, setData] = useState<KioskDisplayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());
  const [secondsLeft, setSecondsLeft] = useState(ROTATION_SECONDS);

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live clock setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data kiosk dari server
  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await client.getKioskDisplay(branchCode);
      setData(res);
      setLastRefreshedAt(new Date());
      setSecondsLeft(ROTATION_SECONDS);

      // Pilih slot yang sedang OPEN pertama kali jika belum ada slot yang dipilih
      setSelectedSlotId((prev) => {
        if (prev && res.slots.some((s) => s.id === prev)) return prev;
        const openSlot = res.slots.find((s) => s.window === 'OPEN') ?? res.slots[0];
        return openSlot?.id ?? null;
      });
    } catch {
      setError('Layar Kiosk belum dapat memuat jadwal cabang ini. Periksa kode cabang atau koneksi studio.');
    } finally {
      setLoading(false);
    }
  }, [branchCode, client]);

  // Initial load saat sudah terotorisasi
  useEffect(() => {
    if (isAuthorized) {
      void load();
    }
  }, [isAuthorized, load]);

  // Countdown timer rotasi QR 60 detik
  useEffect(() => {
    if (!isAuthorized) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          void load();
          return ROTATION_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthorized, load]);

  // Slot aktif saat ini
  const activeSlot: KioskSlotItem | null = useMemo(() => {
    if (!data || data.slots.length === 0) return null;
    return data.slots.find((s) => s.id === selectedSlotId) ?? data.slots[0] ?? null;
  }, [data, selectedSlotId]);

  // Daftar presensi yang sudah tercatat hari ini (isAttended = true)
  const attendedSlotsToday = useMemo(() => {
    if (!data) return [];
    return data.slots.filter((s) => s.isAttended);
  }, [data]);

  // Render QR Code 280 px pada kartu putih
  useEffect(() => {
    if (activeSlot?.qrPayload && qrCanvasRef.current && !activeSlot.isAttended) {
      void QRCode.toCanvas(qrCanvasRef.current, activeSlot.qrPayload, {
        width: 280,
        margin: 2,
        color: {
          dark: '#1e3d30', // Daily Dose deep forest ink
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });
    }
  }, [activeSlot?.qrPayload, activeSlot?.isAttended, activeSlot?.id]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      void document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const lockKiosk = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(storageKey);
    }
    setIsAuthorized(false);
    setPinInput('');
    setPinError(null);
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput.trim() === DEFAULT_KIOSK_PIN) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(storageKey, 'true');
      }
      setIsAuthorized(true);
      setPinError(null);
    } else {
      setPinError('PIN otorisasi studio salah. Masukkan 6 digit PIN resmi cabang.');
    }
  };

  const handleKeypadPress = (key: string) => {
    if (key === 'C') {
      setPinInput('');
      setPinError(null);
    } else if (key === 'OK') {
      handlePinSubmit();
    } else if (pinInput.length < 6) {
      const nextPin = pinInput + key;
      setPinInput(nextPin);
      setPinError(null);
      if (nextPin.length === 6 && nextPin === DEFAULT_KIOSK_PIN) {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(storageKey, 'true');
        }
        setIsAuthorized(true);
      }
    }
  };

  const formatTimeStr = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: data?.branch.timezone || 'Asia/Jakarta',
    });
  };

  // 1. LAYAR OTORISASI PIN TABLET KIOSK
  if (!isAuthorized) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-dd-canvas p-6 text-dd-ink">
        <div className="w-full max-w-md rounded-2xl border border-dd-line bg-white p-8 shadow-dd-card text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-dd-forest text-white shadow-md">
            <Lock className="size-7" />
          </div>

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-dd-forest/10 px-3 py-1 text-xs font-bold text-dd-forest uppercase tracking-wider">
            <ShieldCheck className="size-3.5" />
            <span>Otorisasi Tablet Studio</span>
          </div>

          <h1 className="mt-3 text-2xl font-bold text-dd-ink">
            Kunci Akses Tablet Kiosk
          </h1>
          <p className="mt-2 text-sm text-dd-muted">
            Perangkat ini belum dipasangkan sebagai tablet resmi studio{' '}
            <strong className="text-dd-ink">{branchCode.toUpperCase()}</strong>. Masukkan 6 digit PIN
            otorisasi studio untuk mengaktifkan layar presensi.
          </p>

          {pinError && (
            <div
              className="mt-4 rounded-xl border border-dd-danger/30 bg-dd-danger-soft p-3 text-xs font-medium text-dd-danger"
              role="alert"
            >
              {pinError}
            </div>
          )}

          <form onSubmit={handlePinSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="kiosk-pin-input" className="sr-only">
                PIN Otorisasi Studio (6 Digit)
              </label>
              <input
                id="kiosk-pin-input"
                type="password"
                maxLength={6}
                inputMode="numeric"
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.replace(/\D/g, ''));
                  setPinError(null);
                }}
                placeholder="● ● ● ● ● ●"
                className="w-full rounded-xl border-2 border-dd-line py-3 text-center font-mono text-3xl tracking-[0.4em] text-dd-ink focus:border-dd-forest focus:outline-none transition shadow-inner"
              />
            </div>

            {/* Virtual Keypad untuk Layar Sentuh Tablet */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map((btn) => (
                <button
                  key={btn}
                  type="button"
                  onClick={() => handleKeypadPress(btn)}
                  className={`flex h-12 items-center justify-center rounded-xl border font-mono text-lg font-bold shadow-sm transition active:scale-95 ${
                    btn === 'OK'
                      ? 'border-dd-forest bg-dd-forest text-white hover:bg-dd-forest-dark'
                      : btn === 'C'
                        ? 'border-dd-danger/30 bg-dd-danger-soft text-dd-danger hover:bg-dd-danger/10'
                        : 'border-dd-line bg-dd-surface text-dd-ink hover:bg-dd-canvas'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>

            <Button type="submit" className="w-full mt-2">
              Aktifkan Layar Kiosk
            </Button>
          </form>

          <div className="mt-6 border-t border-dd-line pt-4 text-xs text-dd-muted">
            <Link href="/kiosk" className="font-semibold text-dd-forest hover:underline">
              ← Pilih Cabang Studio Lain
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 2. STATE MEMUAT
  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dd-canvas p-6">
        <Skeleton label="Memuat layar Kiosk Studio..." />
      </div>
    );
  }

  // 3. STATE ERROR KONEKSI / JADWAL GAGAL
  if (error || !data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-dd-canvas p-6 text-center text-dd-ink">
        <div className="max-w-md space-y-4 rounded-2xl border border-dd-danger/30 bg-white p-8 shadow-dd-card">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-dd-danger-soft text-dd-danger">
            <MapPin className="size-6" />
          </div>
          <h1 className="text-xl font-bold text-dd-ink">Layar Kiosk Tidak Tersedia</h1>
          <p className="text-sm text-dd-muted">{error}</p>
          <div className="pt-2">
            <Button onClick={() => void load()}>Coba Muat Ulang</Button>
          </div>
          <div className="pt-2">
            <Link href="/kiosk" className="text-xs font-semibold text-dd-forest hover:underline">
              ← Pilih Cabang Lain
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const branch = data.branch;
  const timezoneName = branch.timezone.includes('Jakarta') ? 'WIB' : 'WITA';

  // 4. LAYAR UTAMA KIOSK LANDSCAPE (1024 x 768 px)
  return (
    <main className="flex min-h-screen flex-col bg-dd-canvas text-dd-ink selection:bg-dd-forest selection:text-white">
      {/* Top Header & Status Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-dd-line bg-white/95 px-6 py-4 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-dd-forest text-white font-extrabold text-lg shadow-md">
            DD
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-dd-forest">
                Studio Kiosk Mode
              </span>
              <span className="size-2 rounded-full bg-dd-forest animate-pulse" />
            </div>
            <h1 className="text-lg font-bold text-dd-ink sm:text-xl">
              Daily Dose Pilates · {branch.name}
            </h1>
          </div>
        </div>

        {/* Live Clock, Geofence Badge & Control Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Badge Radius Geofence */}
          <div className="hidden rounded-xl border border-dd-line bg-dd-surface px-3 py-1.5 text-xs text-dd-forest font-medium md:flex md:items-center md:gap-2 shadow-sm">
            <Navigation className="size-3.5 text-dd-forest shrink-0" />
            <span className="font-semibold">
              {branch.hasGeofence
                ? `Radius Geofence: ${branch.geofenceRadiusMeters}m dari studio`
                : 'Lokasi cabang: Terverifikasi'}
            </span>
          </div>

          {/* Jam Digital Terbaca Jelas */}
          <div className="text-right">
            <div className="text-2xl font-black font-mono tracking-tight text-dd-ink">
              {currentTime.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: branch.timezone,
              })}{' '}
              <span className="text-sm font-semibold text-dd-muted">{timezoneName}</span>
            </div>
            <div className="text-[11px] font-semibold tracking-wider text-dd-muted uppercase">
              {currentTime.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                timeZone: branch.timezone,
              })}
            </div>
          </div>

          {/* Tombol Kunci Tablet Kiosk */}
          <button
            type="button"
            onClick={lockKiosk}
            title="Kunci Kembali Tablet Kiosk"
            className="flex items-center gap-1.5 rounded-xl border border-dd-line bg-white px-3 py-2 text-xs font-semibold text-dd-muted shadow-sm transition hover:bg-dd-danger-soft hover:text-dd-danger hover:border-dd-danger/30"
            aria-label="Kunci Tablet Kiosk"
          >
            <Lock className="size-4" />
            <span className="hidden sm:inline">Kunci Tablet</span>
          </button>

          {/* Toggle Layar Penuh */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (Kiosk)'}
            className="rounded-xl border border-dd-line bg-white p-2 text-dd-muted shadow-sm transition hover:bg-dd-canvas hover:text-dd-ink"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
          </button>
        </div>
      </header>

      {/* Main Content Area (1024 x 768 Landscape Optimized) */}
      <div className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          {data.slots.length === 0 ? (
            /* Empty State Sesi Kelas */
            <div className="flex min-h-[55vh] flex-col items-center justify-center rounded-2xl border border-dd-line bg-white p-8 text-center shadow-dd-card">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-dd-surface-muted text-dd-muted shadow-inner">
                <Calendar className="size-8" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-dd-ink">
                Tidak Ada Sesi Kelas Terjadwal Saat Ini
              </h2>
              <p className="mt-2 max-w-md text-sm text-dd-muted">
                Sesi kelas berikutnya akan otomatis muncul pada layar ini 30 menit sebelum jadwal
                dimulai.
              </p>
              <div className="mt-6">
                <Button variant="secondary" onClick={() => void load()}>
                  <RefreshCw className="mr-1.5 size-4" /> Segarkan Jadwal
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-12 items-start">
              {/* SISI KIRI (~45% Lebar): QR PRESENSI MINIMAL 280 PX PADA KARTU PUTIH */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-2xl border-2 border-dd-line/80 bg-white p-6 sm:p-8 shadow-dd-card text-center">
                {activeSlot && (
                  <div className="w-full space-y-5">
                    {/* Badge Sesi Status */}
                    <div className="flex items-center justify-center gap-2">
                      {activeSlot.isAttended ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-dd-success-soft border border-dd-forest/30 px-3 py-1 text-xs font-bold text-dd-forest shadow-sm">
                          <CheckCircle2 className="size-4" /> Presensi Terverifikasi
                        </span>
                      ) : activeSlot.window === 'OPEN' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-dd-forest/10 border border-dd-forest/30 px-3 py-1 text-xs font-bold text-dd-forest shadow-sm">
                          <span className="size-2 rounded-full bg-dd-forest animate-ping" />
                          <span>QR Siap Dipindai</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-dd-canvas border border-dd-line px-3 py-1 text-xs font-bold text-dd-muted">
                          <Clock className="size-3.5" /> Menunggu Jam Sesi
                        </span>
                      )}
                    </div>

                    {/* Area QR Display atau State Terverifikasi */}
                    <div className="flex flex-col items-center justify-center py-2">
                      {activeSlot.isAttended ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dd-forest/30 bg-dd-success-soft/60 p-6 text-center shadow-dd-soft w-full">
                          <div className="flex size-16 items-center justify-center rounded-full bg-dd-forest text-white shadow-md">
                            <CheckCircle2 className="size-10" />
                          </div>
                          <h3 className="mt-4 text-xl font-bold text-dd-forest">
                            Presensi Terverifikasi!
                          </h3>
                          <p className="mt-1 text-sm font-semibold text-dd-forest-dark">
                            Coach {activeSlot.instructorName}
                          </p>
                          <div className="mt-4 rounded-xl bg-white border border-dd-line p-3 text-xs text-dd-ink w-full text-left space-y-1.5 shadow-sm">
                            <div className="flex justify-between">
                              <span className="text-dd-muted">Waktu Presensi:</span>
                              <strong className="text-dd-ink font-semibold">
                                {activeSlot.attendance?.checkedInAt
                                  ? `${formatTimeStr(activeSlot.attendance.checkedInAt)} ${timezoneName}`
                                  : '-'}
                              </strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-dd-muted">Lokasi Studio:</span>
                              <strong className="text-dd-forest font-semibold">
                                {activeSlot.attendance?.distanceMeters !== null &&
                                activeSlot.attendance?.distanceMeters !== undefined
                                  ? `Terdeteksi (${activeSlot.attendance.distanceMeters}m dari studio)`
                                  : 'Dalam Radius Cabang'}
                              </strong>
                            </div>
                            <div className="pt-1 text-[11px] text-dd-muted border-t border-dd-line/60">
                              Honor sesi ini telah resmi terverifikasi ke sistem.
                            </div>
                          </div>
                        </div>
                      ) : activeSlot.window === 'OPEN' ? (
                        <div className="flex flex-col items-center justify-center space-y-3">
                          {/* Kartu Putih Berisi QR Presensi Berukuran 280 px */}
                          <div className="rounded-2xl border-2 border-dd-forest/20 bg-white p-3 shadow-md">
                            <canvas
                              ref={qrCanvasRef}
                              width={280}
                              height={280}
                              role="img"
                              aria-label="QR Code Presensi Instruktur Kiosk"
                              className="size-[280px] rounded-lg"
                            />
                          </div>

                          {/* Keterangan rotasi 60 detik (Wajib Spec 5.10) */}
                          <div className="space-y-1.5 w-full max-w-[280px]">
                            <p className="text-xs font-bold text-dd-forest">
                              Kode berganti otomatis setiap 60 detik
                            </p>

                            {/* Visual Progress Bar Rotasi */}
                            <div className="w-full bg-dd-canvas rounded-full h-1.5 overflow-hidden border border-dd-line">
                              <div
                                className="bg-dd-forest h-full transition-all duration-1000 ease-linear rounded-full"
                                style={{ width: `${(secondsLeft / ROTATION_SECONDS) * 100}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-mono text-dd-muted">
                              Berganti dalam {secondsLeft} detik
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dd-line bg-dd-canvas p-8 text-center max-w-xs shadow-sm space-y-2">
                          <Clock className="mx-auto size-10 text-dd-warning" />
                          <h3 className="text-base font-bold text-dd-ink">
                            Menunggu Jendela Jam Kelas
                          </h3>
                          <p className="text-xs text-dd-muted">
                            QR presensi akan aktif otomatis{' '}
                            <strong className="text-dd-warning">30 menit</strong> sebelum jadwal sesi.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Badge Geofence Lokasi Studio */}
                    <div className="rounded-xl border border-dd-line bg-dd-surface p-3 text-xs text-dd-muted flex items-center justify-center gap-2">
                      <Navigation className="size-4 text-dd-forest shrink-0" />
                      <span>
                        Radius Geofence:{' '}
                        <strong className="text-dd-ink">
                          {branch.geofenceRadiusMeters ?? 100}m dari studio
                        </strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* SISI KANAN: SESI BERIKUTNYA (ATAS) & DAFTAR PRESENSI HARI INI (BAWAH) */}
              <div className="lg:col-span-7 flex flex-col space-y-6">
                {/* SISI KANAN ATAS: SESI BERIKUTNYA / AKTIF (Spec 5.10: 40px & 22px) */}
                {activeSlot && (
                  <div className="rounded-2xl border border-dd-line bg-white p-6 sm:p-8 shadow-dd-card space-y-4">
                    <div className="flex items-center justify-between border-b border-dd-line pb-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-dd-forest">
                        <Sparkles className="size-4" /> Sesi Kelas Studio
                      </span>
                      {activeSlot.roomName && (
                        <span className="rounded-full bg-dd-canvas border border-dd-line px-3 py-1 text-xs font-semibold text-dd-muted">
                          {activeSlot.roomName}
                        </span>
                      )}
                    </div>

                    {/* Jam Sesi & Nama Kelas 40 px (Spec 5.10) */}
                    <div>
                      <div className="text-[40px] font-bold text-dd-ink leading-tight tracking-tight">
                        {formatTimeStr(activeSlot.startAt)} – {formatTimeStr(activeSlot.endAt)}{' '}
                        <span className="text-2xl font-bold text-dd-muted">{timezoneName}</span>
                      </div>
                      <h2 className="mt-1 text-[40px] font-bold text-dd-ink leading-tight tracking-tight">
                        {activeSlot.classTypeName}
                      </h2>
                    </div>

                    {/* Nama Instruktur & Studio 22 px (Spec 5.10) */}
                    <div className="pt-1">
                      <p className="text-[22px] font-semibold text-dd-forest-dark">
                        Coach {activeSlot.instructorName}{' '}
                        <span className="text-dd-muted font-normal">·</span>{' '}
                        {activeSlot.studioName || branch.name}
                      </p>
                    </div>

                    {/* Jumlah Peserta Terdaftar (Spec 5.10) */}
                    <div className="flex items-center gap-2 pt-2 border-t border-dd-line/80 text-base text-dd-ink">
                      <Users className="size-5 text-dd-forest shrink-0" />
                      <span className="font-medium">
                        Jumlah peserta terdaftar:{' '}
                        <strong className="font-bold text-dd-ink">
                          {activeSlot.bookedCount ?? 0} dari {activeSlot.capacity ?? 10} peserta
                        </strong>
                      </span>
                    </div>
                  </div>
                )}

                {/* SISI KANAN BAWAH: DAFTAR PRESENSI HARI INI DENGAN JAM SCAN (Spec 5.10) */}
                <div className="rounded-2xl border border-dd-line bg-white p-6 sm:p-8 shadow-dd-card space-y-4">
                  <div className="flex items-center justify-between border-b border-dd-line pb-3">
                    <h3 className="text-base font-bold text-dd-ink flex items-center gap-2">
                      <CheckCircle2 className="size-5 text-dd-forest" />
                      <span>Daftar Presensi Hari Ini</span>
                    </h3>
                    <span className="text-xs font-semibold text-dd-muted">
                      {attendedSlotsToday.length} Instruktur Hadir
                    </span>
                  </div>

                  {attendedSlotsToday.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-dd-line bg-dd-surface p-5 text-center text-sm text-dd-muted">
                      Belum ada presensi instruktur yang tercatat hari ini.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {attendedSlotsToday.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between rounded-xl border border-dd-forest/20 bg-dd-success-soft/30 p-3.5 shadow-sm text-sm"
                        >
                          <div className="space-y-0.5">
                            <strong className="block font-bold text-dd-ink">
                              Coach {slot.instructorName}
                            </strong>
                            <p className="text-xs text-dd-muted">
                              {slot.classTypeName} ({formatTimeStr(slot.startAt)} {timezoneName})
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 font-semibold text-dd-forest text-xs">
                              ✓ {slot.attendance?.checkedInAt
                                ? `${formatTimeStr(slot.attendance.checkedInAt)} ${timezoneName}`
                                : 'Hadir'}{' '}
                              (Hadir)
                            </span>
                            {slot.attendance?.distanceMeters !== null &&
                              slot.attendance?.distanceMeters !== undefined && (
                                <p className="text-[11px] text-dd-muted">
                                  {slot.attendance.distanceMeters}m dari studio
                                </p>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sesi Lain Hari Ini (Navigasi Kiosk) */}
                  {data.slots.length > 1 && (
                    <div className="pt-2 border-t border-dd-line">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-dd-muted">
                          Semua Jadwal Sesi Hari Ini ({data.slots.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => void load()}
                          className="flex items-center gap-1 text-xs font-medium text-dd-muted hover:text-dd-forest transition"
                        >
                          <RefreshCw className="size-3" /> Segarkan
                        </button>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {data.slots.map((slot) => {
                          const isSelected = slot.id === activeSlot?.id;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={`text-left rounded-xl border p-3 transition ${
                                isSelected
                                  ? 'border-dd-forest bg-dd-success-soft/50 ring-1 ring-dd-forest'
                                  : 'border-dd-line bg-dd-surface hover:bg-dd-surface-muted hover:border-dd-forest/40'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs font-bold text-dd-ink">
                                <span>{slot.classTypeName}</span>
                                {slot.isAttended ? (
                                  <span className="text-dd-forest font-semibold">✓ Hadir</span>
                                ) : slot.window === 'OPEN' ? (
                                  <span className="text-dd-warning font-semibold">● Aktif</span>
                                ) : (
                                  <span className="text-dd-muted font-normal">Nanti</span>
                                )}
                              </div>
                              <p className="mt-1 text-[11px] text-dd-muted">
                                Coach {slot.instructorName} · {formatTimeStr(slot.startAt)}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* BARIS PENUTUP WAJIB (Spec 5.10) */}
                <div className="rounded-xl border border-dd-forest/20 bg-dd-surface p-4 text-center shadow-sm">
                  <p className="text-sm font-semibold text-dd-forest-dark">
                    Presensi hanya tercatat jika instruktur terdaftar di sesi ini dan berada di area studio.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <footer className="border-t border-dd-line bg-white px-6 py-2.5 text-center text-[11px] text-dd-muted shadow-sm">
        <span>Sistem Presensi Kiosk Daily Dose Studio</span>
        <span className="mx-2">·</span>
        <span>
          Auto-refresh aktif ({ROTATION_SECONDS}s) · Terakhir diperbarui:{' '}
          {lastRefreshedAt.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: branch.timezone,
          })}
        </span>
      </footer>
    </main>
  );
}
