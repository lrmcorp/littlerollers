'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import {
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  Camera,
  CameraOff,
} from 'lucide-react';
import {
  bookingFailure,
  browserBookingClient,
  type CheckInResult,
  type InstructorCheckInResult,
} from '@/api-clients/booking-client';
import { Button, ButtonLink } from '../components/actions';
import { Panel } from '../components/admin/admin-ui';
import { Feedback } from '../ui';
import { AdminPageHeader } from '../components/admin/admin-page-header';
import { useSessionContext } from '../session-context';

type ScanMode = 'customer' | 'instructor';

export function CheckInScannerView() {
  const context = useSessionContext();
  const canScanCustomer = context?.hasCapability('attendance:manage') ?? false;
  const canScanInstructor = context?.hasCapability('attendance:self') ?? false;
  const [chosenMode, setChosenMode] = useState<ScanMode>('customer');

  // Staf memindai QR pelanggan; instruktur memindai QR presensi yang ditampilkan kiosk studio.
  const mode: ScanMode =
    canScanCustomer && (chosenMode === 'customer' || !canScanInstructor)
      ? 'customer'
      : 'instructor';

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | undefined>(undefined);
  const [manual, setManual] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [result, setResult] = useState<CheckInResult>();
  const [instructorResult, setInstructorResult] = useState<InstructorCheckInResult>();
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [locating, setLocating] = useState(false);

  const getCoordinates = async (): Promise<{ latitude: number; longitude: number } | undefined> => {
    if (typeof window === 'undefined' || !navigator.geolocation) return undefined;
    return new Promise((resolve) => {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocating(false);
          resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        },
        () => {
          setLocating(false);
          resolve(undefined);
        },
        { enableHighAccuracy: true, timeout: 4000, maximumAge: 30000 },
      );
    });
  };

  const stop = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = undefined;
    }
    setScanning(false);
  }, []);

  const consume = useCallback(
    async (value: string) => {
      setError('');
      try {
        if (mode === 'instructor') {
          const consumeInstructor = browserBookingClient.consumeInstructorCheckIn;
          if (!consumeInstructor) return;
          setResult(undefined);
          const coords = await getCoordinates();
          const res = coords
            ? await consumeInstructor(value, crypto.randomUUID(), coords)
            : await consumeInstructor(value, crypto.randomUUID());
          setInstructorResult(res);
          setManual('');
          stop();
          return;
        }

        const consumeCheckIn = browserBookingClient.consumeCheckIn;
        if (!consumeCheckIn) return;
        setInstructorResult(undefined);
        const next = await consumeCheckIn(value, crypto.randomUUID());
        setResult(next);
        setManual('');
        stop();
      } catch (failure) {
        setError(await bookingFailure(failure));
      }
    },
    [mode, stop],
  );

  const start = useCallback(async () => {
    if (!videoRef.current) return;
    setError('');
    try {
      const reader = new BrowserMultiFormatReader();
      if (typeof reader.decodeFromConstraints !== 'function') {
        return;
      }
      controlsRef.current = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: 'environment' } } },
        videoRef.current,
        (decoded) => {
          if (decoded?.getText()) {
            void consume(decoded.getText());
          }
        },
      );
      setScanning(true);
    } catch {
      setError('Kamera tidak tersedia. Gunakan kode presensi manual di bawah atau izinkan akses kamera.');
      setScanning(false);
    }
  }, [consume]);

  // Kamera langsung aktif saat halaman dibuka
  useEffect(() => {
    void start();

    const handleVisibility = () => {
      if (document.hidden) stop();
    };

    window.addEventListener('pagehide', stop);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      window.removeEventListener('pagehide', stop);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [start, stop]);

  const resetScan = () => {
    setResult(undefined);
    setInstructorResult(undefined);
    setError('');
    setManual('');
    void start();
  };

  if (!canScanCustomer && !canScanInstructor) {
    return <Feedback kind="error">Anda tidak memiliki akses untuk memindai QR check-in.</Feedback>;
  }

  const hasSuccess = Boolean(result || instructorResult);

  return (
    <section className="grid gap-6 max-w-2xl mx-auto" aria-labelledby="scanner-title">
      <AdminPageHeader
        title={mode === 'instructor' ? 'Scan Presensi Studio' : 'Scan Presensi Pelanggan'}
        titleId="scanner-title"
        description={
          mode === 'instructor'
            ? 'Arahkan kamera ke QR di tablet studio untuk mencatat presensi mengajar.'
            : 'Arahkan kamera ke kode QR pelanggan untuk mencatat kehadiran sesi.'
        }
        actions={
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              scanning
                ? 'bg-dd-success-soft text-dd-success'
                : 'bg-dd-surface-muted text-dd-muted'
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                scanning ? 'bg-dd-success animate-pulse' : 'bg-dd-muted'
              }`}
            />
            {scanning ? 'Kamera aktif' : 'Kamera nonaktif'}
          </span>
        }
      />

      {canScanCustomer && canScanInstructor && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Jenis QR">
          <Button
            variant={mode === 'customer' ? 'primary' : 'secondary'}
            onClick={() => {
              setChosenMode('customer');
              resetScan();
            }}
          >
            QR pelanggan
          </Button>
          <Button
            variant={mode === 'instructor' ? 'primary' : 'secondary'}
            onClick={() => {
              setChosenMode('instructor');
              resetScan();
            }}
          >
            QR presensi instruktur
          </Button>
        </div>
      )}

      {error && <Feedback kind="error">{error}</Feedback>}

      {/* HASIL SUKSES INSTRUKTUR */}
      {mode === 'instructor' && instructorResult && (
        <Panel className="border-dd-success/30 p-6 text-center space-y-4 bg-white rounded-2xl">
          <div className="size-14 rounded-full bg-dd-success-soft text-dd-success mx-auto flex items-center justify-center">
            <CheckCircle2 className="size-8" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-dd-success">
              Presensi instruktur tercatat
            </p>
            <h2 className="mt-1 text-xl font-bold text-dd-ink">Presensi Berhasil Dicatat</h2>
            {instructorResult.branchName && (
              <p className="mt-1 text-sm font-medium text-dd-muted">
                Studio: {instructorResult.branchName}
              </p>
            )}
          </div>
          <p className="text-sm text-dd-ink/80 leading-relaxed">
            Kehadiran Anda dicatat pukul{' '}
            <strong className="font-semibold text-dd-ink">
              {new Date(instructorResult.checkedInAt).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              WIB
            </strong>
            {instructorResult.distanceMeters !== undefined && instructorResult.distanceMeters !== null
              ? ` · Terdeteksi ${instructorResult.distanceMeters} meter dari titik studio (Dalam area cabang)`
              : ''}
            . Presensi Anda telah terverifikasi untuk sesi kelas ini.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <ButtonLink href="/workspace" variant="primary" fullWidth>
              Kembali ke Hari Ini
            </ButtonLink>
            <Button variant="secondary" onClick={resetScan} fullWidth>
              Pindai lagi
            </Button>
          </div>
        </Panel>
      )}

      {/* HASIL SUKSES PELANGGAN */}
      {mode === 'customer' && result && (
        <Panel className="border-dd-success/30 p-6 text-center space-y-4 bg-white rounded-2xl">
          <div className="size-14 rounded-full bg-dd-success-soft text-dd-success mx-auto flex items-center justify-center">
            <CheckCircle2 className="size-8" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-dd-success">
              Check-in berhasil
            </p>
            <h2 className="mt-1 text-2xl font-bold text-dd-ink">{result.customerName}</h2>
            <p className="text-sm text-dd-muted">
              {result.className} · {result.branch.name}
            </p>
          </div>
          <p className="text-xs text-dd-muted">
            Kode referensi: <code className="font-mono font-semibold">{result.auditReference}</code>
          </p>
          {result.idempotentReplay && (
            <p className="text-xs font-semibold text-dd-muted">
              Pelanggan sudah tercatat hadir sebelumnya; tidak ada kehadiran ganda.
            </p>
          )}
          <div className="pt-2">
            <Button variant="primary" onClick={resetScan} fullWidth>
              Pindai berikutnya
            </Button>
          </div>
        </Panel>
      )}

      {/* KAMERA SCANNER VIEWFINDER */}
      {!hasSuccess && (
        <div className="space-y-4">
          <Panel className="p-4 sm:p-5">
            <div className="relative mx-auto aspect-square w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl bg-dd-ink shadow-inner border border-dd-line/60">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                muted
                playsInline
              />

              {/* Viewfinder Target & Corner Brackets */}
              {scanning ? (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/25">
                  <div className="relative size-52 sm:size-60 rounded-2xl border-2 border-white/20">
                    <span className="absolute -top-1 -left-1 size-7 border-t-4 border-l-4 border-dd-forest rounded-tl-lg" />
                    <span className="absolute -top-1 -right-1 size-7 border-t-4 border-r-4 border-dd-forest rounded-tr-lg" />
                    <span className="absolute -bottom-1 -left-1 size-7 border-b-4 border-l-4 border-dd-forest rounded-bl-lg" />
                    <span className="absolute -bottom-1 -right-1 size-7 border-b-4 border-r-4 border-dd-forest rounded-br-lg" />
                    {/* Animated Scanning Line */}
                    <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-dd-forest to-transparent animate-pulse mt-26" />
                  </div>
                  <p className="mt-4 text-xs font-medium text-white/95 drop-shadow bg-black/60 px-3 py-1 rounded-full">
                    Arahkan kamera ke QR di tablet studio
                  </p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white/70 space-y-3 bg-dd-ink">
                  <CameraOff className="size-10 text-white/40" />
                  <p className="text-sm font-medium text-center">
                    Kamera belum aktif
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-dd-muted">
              <p role="status" aria-live="polite">
                {scanning
                  ? 'Arahkan kamera ke layar tablet studio (tersedia 30 menit sebelum kelas).'
                  : 'Kamera tidak aktif.'}
              </p>
              <div>
                {!scanning ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    leadingIcon={<Camera className="size-4" />}
                    onClick={() => void start()}
                  >
                    Aktifkan kamera
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    leadingIcon={<CameraOff className="size-4" />}
                    onClick={stop}
                  >
                    Hentikan kamera
                  </Button>
                )}
              </div>
            </div>
          </Panel>

          {/* FALLBACK INPUT MANUAL DI BALIK ACCORDION */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowManual((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl border border-dd-line/70 bg-white p-3.5 text-sm font-semibold text-dd-ink hover:bg-dd-surface-muted transition cursor-pointer"
              aria-expanded={showManual}
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="size-4 text-dd-muted" />
                <span>Tidak bisa memindai QR?</span>
              </span>
              <ChevronDown
                className={`size-4 text-dd-muted transition-transform duration-200 ${
                  showManual ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showManual && (
              <div className="rounded-xl border border-dd-line/70 bg-dd-surface-muted/50 p-4 space-y-3">
                <p className="text-xs text-dd-muted leading-relaxed">
                  {mode === 'instructor'
                    ? 'Masukkan kode presensi dari tablet studio jika kamera ponsel Anda mengalami kendala.'
                    : 'Masukkan kode presensi atau tautan check-in dari pelanggan.'}
                </p>
                <textarea
                  className="min-h-24 w-full rounded-dd-md border border-dd-line bg-white p-3 text-sm text-dd-ink placeholder:text-dd-muted/60 focus:border-dd-forest focus:outline-none"
                  placeholder="Tempel atau ketik kode presensi di sini..."
                  value={manual}
                  onChange={(event) => setManual(event.target.value)}
                  aria-label="Kode presensi manual"
                />
                <Button
                  fullWidth
                  disabled={!manual.trim()}
                  onClick={() => void consume(manual)}
                >
                  {mode === 'instructor' ? 'Catat presensi' : 'Validasi check-in'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
