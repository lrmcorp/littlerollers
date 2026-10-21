'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  getKioskDisplay as defaultGetKioskDisplay,
  type KioskDisplayData,
} from '../../api-clients/booking-client';
import { Button } from '../../components/actions';
import { Skeleton } from '../../ui';

interface KioskViewProps {
  branchCode: string;
  client?: {
    getKioskDisplay: (code: string) => Promise<KioskDisplayData>;
  };
}

export function KioskView({
  branchCode,
  client = { getKioskDisplay: defaultGetKioskDisplay },
}: KioskViewProps) {
  const [data, setData] = useState<KioskDisplayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Update live clock setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await client.getKioskDisplay(branchCode);
      setData(res);
      setLastRefreshedAt(new Date());

      // Pilih slot yang sedang OPEN pertama kali jika belum dipilih user
      if (!selectedSlotId) {
        const openSlot = res.slots.find((s) => s.window === 'OPEN') ?? res.slots[0];
        setSelectedSlotId(openSlot?.id ?? null);
      }
    } catch {
      setError('Layar Kiosk belum dapat memuat jadwal cabang ini. Periksa kode cabang atau koneksi studio.');
    } finally {
      setLoading(false);
    }
  }, [branchCode, client, selectedSlotId]);

  // Initial load & Polling background setiap 20 detik
  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 20000);
    return () => clearInterval(interval);
  }, [load]);

  const activeSlot = data?.slots.find((s) => s.id === selectedSlotId) ?? data?.slots[0] ?? null;

  // Render QR Code saat activeSlot berubah
  useEffect(() => {
    if (activeSlot?.qrPayload && qrCanvasRef.current && !activeSlot.isAttended) {
      void QRCode.toCanvas(qrCanvasRef.current, activeSlot.qrPayload, {
        width: 280,
        margin: 2,
        color: {
          dark: '#285740', // Daily Dose forest green
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

  const formatTimeStr = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: data?.branch.timezone || 'Asia/Jakarta',
    });
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dd-canvas p-6">
        <Skeleton label="Memuat layar Kiosk Studio..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-dd-canvas p-6 text-center">
        <div className="max-w-md space-y-4 rounded-dd-2xl border border-dd-danger/30 bg-white p-8 shadow-dd-card">
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

  return (
    <main className="flex min-h-screen flex-col bg-dd-canvas text-dd-ink selection:bg-dd-forest selection:text-white">
      {/* Top Navigation & Status Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-dd-line bg-white/90 px-6 py-4 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-dd-md bg-dd-forest text-white font-bold shadow-md">
            DD
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-dd-forest">
                Studio Kiosk Mode
              </span>
              <span className="size-1.5 rounded-full bg-dd-forest animate-pulse" />
            </div>
            <h1 className="text-lg font-bold text-dd-ink sm:text-xl">
              Daily Dose Pilates · {branch.name}
            </h1>
          </div>
        </div>

        {/* Live Clock & Studio Geofence Badge */}
        <div className="flex items-center gap-4">
          <div className="hidden rounded-dd-md border border-dd-line bg-dd-canvas px-3 py-1.5 text-xs text-dd-forest font-medium md:flex md:items-center md:gap-2 shadow-sm">
            <Navigation className="size-3.5 text-dd-forest" />
            <span>
              {branch.hasGeofence
                ? `Radius Geofence: ${branch.geofenceRadiusMeters}m dari studio`
                : 'Lokasi cabang: Terverifikasi'}
            </span>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black font-mono tracking-tight text-dd-ink">
              {currentTime.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: branch.timezone,
              })}
            </div>
            <div className="text-[10px] font-semibold tracking-wider text-dd-muted uppercase">
              {currentTime.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                timeZone: branch.timezone,
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (Kiosk)'}
            className="rounded-dd-md border border-dd-line bg-white p-2 text-dd-muted shadow-sm transition hover:bg-dd-canvas hover:text-dd-ink"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-6 lg:p-10">
        <div className="mx-auto max-w-6xl">
          {data.slots.length === 0 ? (
            /* Empty State: Tidak ada jadwal kelas dekat */
            <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-dd-2xl border border-dd-line bg-dd-surface p-8 text-center shadow-dd-card">
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
              {/* Left Column: Sesi Kelas & QR Code (Big Focus) */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-dd-2xl border border-dd-line bg-dd-surface p-6 sm:p-10 shadow-dd-card">
                {activeSlot && (
                  <div className="w-full text-center space-y-6">
                    {/* Header Sesi */}
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-dd-success-soft border border-dd-forest/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-dd-forest shadow-sm">
                        <Sparkles className="size-3.5" />
                        <span>Sesi Kelas Aktif</span>
                      </div>
                      <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-dd-ink tracking-tight">
                        {activeSlot.classTypeName}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-dd-muted">
                        <span className="font-semibold text-dd-forest">
                          {formatTimeStr(activeSlot.startAt)} – {formatTimeStr(activeSlot.endAt)}{' '}
                          {branch.timezone.includes('Jakarta') ? 'WIB' : 'WITA'}
                        </span>
                        {activeSlot.roomName && <span>· Ruangan: {activeSlot.roomName}</span>}
                        {activeSlot.studioName && <span>· {activeSlot.studioName}</span>}
                      </div>
                      <p className="mt-1 text-sm text-dd-muted font-medium">
                        Instruktur:{' '}
                        <strong className="text-dd-ink">{activeSlot.instructorName}</strong>
                      </p>
                    </div>

                    {/* QR Display Card / Attended State */}
                    <div className="flex flex-col items-center justify-center">
                      {activeSlot.isAttended ? (
                        <div className="my-2 flex flex-col items-center justify-center rounded-dd-2xl border-2 border-dd-forest/30 bg-dd-success-soft/60 p-8 text-center shadow-dd-soft w-full max-w-sm">
                          <div className="flex size-16 items-center justify-center rounded-full bg-dd-forest text-white shadow-md">
                            <CheckCircle2 className="size-10" />
                          </div>
                          <h3 className="mt-4 text-xl font-bold text-dd-forest">
                            Presensi Terverifikasi!
                          </h3>
                          <p className="mt-1 text-xs font-medium text-dd-forest-dark">
                            Coach {activeSlot.instructorName}
                          </p>
                          <div className="mt-4 rounded-dd-xl bg-white border border-dd-line p-4 text-xs text-dd-ink w-full text-left space-y-1.5 shadow-sm">
                            <div className="flex justify-between">
                              <span className="text-dd-muted">Waktu Presensi:</span>
                              <strong className="text-dd-ink font-semibold">
                                {activeSlot.attendance?.checkedInAt
                                  ? formatTimeStr(activeSlot.attendance.checkedInAt)
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
                              Honor sesi ini telah resmi terverifikasi.
                            </div>
                          </div>
                        </div>
                      ) : activeSlot.window === 'OPEN' ? (
                        <div className="my-2 flex flex-col items-center justify-center">
                          <div className="rounded-dd-2xl border-4 border-dd-forest/20 bg-white p-4 shadow-dd-soft transition hover:scale-102">
                            <canvas
                              ref={qrCanvasRef}
                              role="img"
                              aria-label="QR Code Presensi Instruktur Kiosk"
                              className="rounded-dd-lg"
                            />
                          </div>
                          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-dd-success-soft border border-dd-forest/30 px-3.5 py-1 text-xs font-bold text-dd-forest shadow-sm">
                            <span className="size-2 rounded-full bg-dd-forest animate-ping" />
                            <span>QR Siap Dipindai</span>
                          </div>
                        </div>
                      ) : (
                        <div className="my-4 rounded-dd-xl border border-dd-line bg-dd-canvas p-8 text-center max-w-sm shadow-sm">
                          <Clock className="mx-auto size-10 text-dd-warning" />
                          <h3 className="mt-3 text-lg font-bold text-dd-ink">
                            Menunggu Jendela Waktu
                          </h3>
                          <p className="mt-1 text-xs text-dd-muted">
                            QR presensi akan terbuka secara otomatis{' '}
                            <strong className="text-dd-warning">30 menit</strong> sebelum sesi kelas
                            dimulai.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Instruksi Penggunaan bagi Instruktur */}
                    <div className="rounded-dd-xl border border-dd-line bg-dd-surface-muted p-4 text-xs text-dd-muted text-left space-y-1.5 max-w-md mx-auto shadow-sm">
                      <div className="flex items-center gap-1.5 font-bold text-dd-ink">
                        <ShieldCheck className="size-4 text-dd-forest" />
                        <span>Ketentuan Presensi Instruktur:</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-dd-muted">
                        <li>
                          Buka aplikasi Daily Dose di ponsel Anda &gt; menu <strong className="text-dd-ink">Scan QR</strong>
                          .
                        </li>
                        <li>
                          Pastikan izin <strong className="text-dd-ink">GPS / Lokasi</strong> aktif di ponsel Anda.
                        </li>
                        <li>
                          Arahkan kamera ke QR di atas saat berada di area studio ({branch.name}).
                        </li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Daftar Sesi Lain di Cabang Ini Hari Ini */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between border-b border-dd-line pb-3">
                  <h3 className="text-base font-bold text-dd-ink flex items-center gap-2">
                    <Calendar className="size-4 text-dd-forest" />
                    <span>Jadwal Sesi Hari Ini ({data.slots.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => void load()}
                    className="flex items-center gap-1 text-xs font-medium text-dd-muted hover:text-dd-forest transition"
                  >
                    <RefreshCw className="size-3" /> Segarkan
                  </button>
                </div>

                <div className="space-y-3">
                  {data.slots.map((slot) => {
                    const isSelected = slot.id === activeSlot?.id;
                    return (
                      <div
                        key={slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`cursor-pointer rounded-dd-xl border p-4 transition ${
                          isSelected
                            ? 'border-dd-forest bg-dd-success-soft/40 shadow-sm ring-1 ring-dd-forest'
                            : 'border-dd-line bg-dd-surface hover:bg-dd-surface-muted hover:border-dd-forest/40 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <strong className="block text-sm font-bold text-dd-ink">
                              {slot.classTypeName}
                            </strong>
                            <p className="mt-0.5 text-xs text-dd-muted">
                              Coach {slot.instructorName}
                            </p>
                          </div>
                          <div>
                            {slot.isAttended ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-dd-success-soft border border-dd-forest/30 px-2.5 py-0.5 text-[11px] font-bold text-dd-forest shadow-sm">
                                ✓ Hadir
                              </span>
                            ) : slot.window === 'OPEN' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-dd-warning-soft border border-dd-warning/30 px-2.5 py-0.5 text-[11px] font-bold text-dd-warning shadow-sm">
                                ● Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-dd-canvas border border-dd-line px-2.5 py-0.5 text-[11px] font-bold text-dd-muted">
                                Nanti
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-dd-muted border-t border-dd-line/60 pt-2">
                          <span className="font-mono text-dd-forest font-semibold">
                            {formatTimeStr(slot.startAt)} – {formatTimeStr(slot.endAt)}
                          </span>
                          <span>{slot.roomName ?? 'Studio Utama'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 text-center">
                  <Link
                    href="/kiosk"
                    className="text-xs font-semibold text-dd-muted hover:text-dd-forest hover:underline transition"
                  >
                    ← Ganti Cabang Kiosk
                  </Link>
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
          Auto-refresh aktif · Terakhir diperbarui:{' '}
          {lastRefreshedAt.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </span>
      </footer>
    </main>
  );
}
