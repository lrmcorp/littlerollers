'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import {
  bookingFailure,
  browserBookingClient,
  type CheckInResult,
  type InstructorCheckInResult,
} from '@/api-clients/booking-client';
import { Button } from '../components/actions';
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
  // Staf memindai QR pelanggan; instruktur memindai QR presensi yang ditampilkan staf studio.
  const mode: ScanMode = canScanCustomer && (chosenMode === 'customer' || !canScanInstructor)
    ? 'customer'
    : 'instructor';
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | undefined>(undefined);
  const [manual, setManual] = useState('');
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

  const consume = async (value: string) => {
    setError('');
    try {
      if (mode === 'instructor') {
        const consumeInstructor = browserBookingClient.consumeInstructorCheckIn;
        if (!consumeInstructor) return;
        setResult(undefined);
        const coords = await getCoordinates();
        setInstructorResult(
          coords
            ? await consumeInstructor(value, crypto.randomUUID(), coords)
            : await consumeInstructor(value, crypto.randomUUID()),
        );
        setManual('');
        return;
      }
      const consumeCheckIn = browserBookingClient.consumeCheckIn;
      if (!consumeCheckIn) return;
      setInstructorResult(undefined);
      const next = await consumeCheckIn(value, crypto.randomUUID());
      setResult(next);
      setManual('');
    } catch (failure) {
      setError(await bookingFailure(failure));
    }
  };

  const stop = () => {
    controlsRef.current?.stop();
    controlsRef.current = undefined;
    setScanning(false);
  };

  const start = async () => {
    if (!videoRef.current) return;
    setError('');
    try {
      const reader = new BrowserMultiFormatReader();
      controlsRef.current = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: 'environment' } } },
        videoRef.current,
        (decoded) => {
          if (decoded?.getText()) {
            void consume(decoded.getText());
            stop();
          }
        },
      );
      setScanning(true);
    } catch {
      setError('Kamera tidak tersedia. Gunakan input token manual atau izinkan akses kamera.');
    }
  };

  useEffect(() => {
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
  }, []);

  if (!canScanCustomer && !canScanInstructor) {
    return <Feedback kind="error">Anda tidak memiliki akses untuk memindai QR check-in.</Feedback>;
  }

  return (
    <section className="grid gap-6" aria-labelledby="scanner-title">
      <AdminPageHeader
        title="Scan QR check-in"
        titleId="scanner-title"
        description={
          mode === 'instructor'
            ? 'Arahkan kamera HP ke layar Kiosk / tablet meja resepsionis studio untuk mencatat kehadiran mengajar Anda (tersedia 30 menit sebelum kelas).'
            : 'Pindai QR pass pelanggan saat datang. Backend memvalidasi booking, cabang, status, dan window jadwal.'
        }
        actions={
          <span className="rounded-full bg-dd-success-soft px-3 py-1 text-xs font-bold text-dd-success">
            Kamera + fallback manual
          </span>
        }
      />
      {canScanCustomer && canScanInstructor && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Jenis QR">
          <Button
            variant={mode === 'customer' ? 'primary' : 'secondary'}
            onClick={() => setChosenMode('customer')}
          >
            QR pelanggan
          </Button>
          <Button
            variant={mode === 'instructor' ? 'primary' : 'secondary'}
            onClick={() => setChosenMode('instructor')}
          >
            QR presensi instruktur
          </Button>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <Panel className="p-5">
          <h2 className="text-lg font-semibold">Kamera scanner</h2>
          <video
            ref={videoRef}
            className="mt-4 aspect-video w-full rounded-dd-md bg-dd-sidebar object-cover"
            muted
            playsInline
          />
          <p className="mt-2 text-xs text-dd-muted" role="status" aria-live="polite">
            {scanning ? 'Kamera aktif dan siap memindai.' : 'Kamera tidak aktif.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {!scanning ? (
              <Button onClick={() => void start()}>Aktifkan kamera</Button>
            ) : (
              <Button variant="secondary" onClick={stop}>
                Hentikan kamera
              </Button>
            )}
          </div>
        </Panel>
        <Panel className="p-5">
          <h2 className="text-lg font-semibold">Input manual</h2>
          <p className="mt-2 text-sm text-dd-muted">
            {mode === 'instructor'
              ? 'Paste payload `dd-checkin:v1:…` dari QR presensi yang ditampilkan staf studio.'
              : 'Paste payload `dd-checkin:v1:…` atau URL pass dari WhatsApp.'}
          </p>
          <textarea
            className="mt-4 min-h-28 w-full rounded-dd-md border border-dd-line p-3 text-sm"
            value={manual}
            onChange={(event) => setManual(event.target.value)}
            aria-label="Token QR manual"
          />
          <Button className="mt-3" disabled={!manual.trim()} onClick={() => void consume(manual)}>
            {mode === 'instructor' ? 'Catat presensi' : 'Validasi check-in'}
          </Button>
        </Panel>
      </div>
      {error && <Feedback kind="error">{error}</Feedback>}
      {mode === 'instructor' && instructorResult && (
        <Panel className="border-dd-success/30 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-dd-success">
            Presensi instruktur tercatat
          </p>
          {instructorResult.branchName && (
            <p className="mt-1 font-semibold text-dd-ink">
              Studio: {instructorResult.branchName}
            </p>
          )}
          <p className="mt-2 text-sm">
            Kehadiran Anda dicatat pukul{' '}
            {new Date(instructorResult.checkedInAt).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}
            {instructorResult.distanceMeters !== undefined && instructorResult.distanceMeters !== null
              ? ` · Terdeteksi ${instructorResult.distanceMeters} meter dari titik studio (Dalam area cabang)`
              : ''}
            . Honor kelas ini kini terhitung sebagai terverifikasi.
          </p>
        </Panel>
      )}
      {mode === 'customer' && result && (
        <Panel className="border-dd-success/30 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-dd-success">
            Check-in berhasil
          </p>
          <h2 className="mt-2 text-xl font-semibold">{result.customerName}</h2>
          <p className="mt-1 text-sm text-dd-muted">
            {result.className} · {result.branch.name}
          </p>
          <p className="mt-4 text-sm">
            Audit reference: <code>{result.auditReference}</code>
          </p>
          {result.idempotentReplay && (
            <p className="mt-2 text-xs font-semibold text-dd-muted">
              Customer sudah check-in sebelumnya; tidak ada attendance ganda.
            </p>
          )}
        </Panel>
      )}
    </section>
  );
}
