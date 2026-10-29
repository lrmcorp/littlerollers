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
      setError('This QR pass is not valid or is no longer available.');
      return;
    }
    setPayload(decoded);
    void QRCode.toCanvas(canvasRef.current, decoded, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#17392d', light: '#ffffff' },
    }).catch(() => setError('This device could not draw the QR code.'));
  }, []);

  return (
    <main className="grid min-h-dvh min-w-0 place-items-center overflow-x-hidden bg-lr-sky px-4 py-10">
      <meta name="referrer" content="no-referrer" />
      <section className="box-border w-full min-w-0 max-w-[calc(100vw-2rem)] rounded-[22px] border border-dd-line bg-dd-surface p-6 text-center sm:max-w-md">
        {/* eslint-disable-next-line @next/next/no-img-element -- small local badge on a standalone pass */}
        <img src="/images/logo.png" alt="Little Rollers" className="mx-auto size-16 rounded-full" />
        <h1 className="mt-3 mb-0 font-display text-3xl text-dd-forest">Check-in pass</h1>
        <p className="mt-2 text-sm leading-6 text-dd-muted">
          Show this QR code at the club desk. It works from 30 minutes before the session until the
          session ends.
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
              This pass is private. Please do not share it.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
