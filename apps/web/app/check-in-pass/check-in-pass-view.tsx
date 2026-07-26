'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

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
    <main className="grid min-h-dvh place-items-center bg-dd-canvas px-4 py-10">
      <meta name="referrer" content="no-referrer" />
      <section className="w-full max-w-md rounded-dd-xl border border-dd-line bg-dd-surface p-6 text-center shadow-dd-card">
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
              className="mx-auto mt-6 rounded-dd-md bg-white p-3"
              aria-label="QR check-in"
            />
            <button type="button" className="mt-4" onClick={downloadQr}>
              Download QR
            </button>
            <p className="mt-4 text-xs text-dd-muted">
              Pass terenkripsi · jangan teruskan ke pihak lain
            </p>
          </>
        )}
      </section>
    </main>
  );
}
