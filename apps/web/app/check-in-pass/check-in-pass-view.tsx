'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '../components/actions';

export function CheckInPassView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [payload, setPayload] = useState('');
  const [error, setError] = useState('');

  const downloadQr = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'daily-dose-check-in.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  useEffect(() => {
    const raw = new URLSearchParams(window.location.hash.slice(1)).get('token') ?? '';
    const decoded = raw ? decodeURIComponent(raw) : '';
    if (!decoded.startsWith('dd-checkin:v1:')) {
      setError('Pass QR tidak valid atau sudah tidak tersedia.');
      return;
    }
    setPayload(decoded);
    void QRCode.toCanvas(canvasRef.current, decoded, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#17392d', light: '#ffffff' },
    }).catch(() => setError('QR tidak dapat dirender pada perangkat ini.'));
  }, []);

  return (
    <main className="grid min-h-dvh min-w-0 place-items-center overflow-x-hidden bg-dd-canvas px-4 py-10">
      <meta name="referrer" content="no-referrer" />
      <section className="box-border w-full min-w-0 max-w-[calc(100vw-2rem)] rounded-dd-xl border border-dd-line bg-dd-surface p-6 text-center shadow-dd-card sm:max-w-md">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-dd-forest">
          Daily Dose Pilates
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Pass check-in kelas</h1>
        <p className="mt-2 text-sm leading-6 text-dd-muted">
          Tunjukkan QR ini kepada admin studio. QR hanya berlaku mulai 30 menit sebelum kelas sampai
          jadwal kelas selesai.
        </p>
        {error ? (
          <p
            role="alert"
            className="mt-6 rounded-dd-md bg-dd-danger-soft p-4 text-sm text-dd-danger"
          >
            {error}
          </p>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              className="mx-auto mt-6 box-border h-auto min-w-0 max-w-full rounded-dd-md bg-white p-3"
              style={{ width: 'min(320px, 100%)' }}
              aria-label="QR check-in"
            />
            <Button type="button" className="mx-auto mt-4" onClick={downloadQr}>
              Download QR
            </Button>
            <p className="mt-4 text-xs text-dd-muted">
              Pass terenkripsi · jangan teruskan ke pihak lain
            </p>
          </>
        )}
      </section>
    </main>
  );
}
