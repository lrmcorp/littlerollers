'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import { bookingFailure, browserBookingClient, type CheckInResult } from '../booking-client';
import { Button, Panel } from '../components/admin/admin-ui';
import { Feedback, PageHeader } from '../ui';
import { useSessionContext } from '../session-context';

export function CheckInScannerView() {
  const context = useSessionContext();
  const canManage = context?.hasCapability('attendance:manage') ?? false;
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | undefined>(undefined);
  const [manual, setManual] = useState('');
  const [result, setResult] = useState<CheckInResult>();
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  const consume = async (value: string) => {
    setError('');
    try {
      const consumeCheckIn = browserBookingClient.consumeCheckIn;
      if (!consumeCheckIn) return;
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

  if (!canManage) {
    return <Feedback kind="error">Anda tidak memiliki akses untuk memindai QR check-in.</Feedback>;
  }

  return (
    <section className="grid gap-6" aria-labelledby="scanner-title">
      <PageHeader
        eyebrow="Attendance branch-scoped"
        title="Scan QR check-in"
        titleId="scanner-title"
        description="Pindai QR pass customer saat datang. Backend memvalidasi booking, cabang, status, dan window jadwal."
        context={
          <span className="rounded-full bg-dd-success-soft px-3 py-1 text-xs font-bold text-dd-success">
            Kamera + fallback manual
          </span>
        }
      />
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
            Paste payload `dd-checkin:v1:…` atau URL pass dari WhatsApp.
          </p>
          <textarea
            className="mt-4 min-h-28 w-full rounded-dd-md border border-dd-line p-3 text-sm"
            value={manual}
            onChange={(event) => setManual(event.target.value)}
            aria-label="Token QR manual"
          />
          <Button className="mt-3" disabled={!manual.trim()} onClick={() => void consume(manual)}>
            Validasi check-in
          </Button>
        </Panel>
      </div>
      {error && <Feedback kind="error">{error}</Feedback>}
      {result && (
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
