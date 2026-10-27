'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { AlertCircle, ArrowLeft, Check, Download } from 'lucide-react';
import { useSessionContext } from '../session-context';

function formatPassSchedule(startAtStr: string, endAtStr: string, timezone = 'Asia/Jakarta') {
  try {
    const start = new Date(startAtStr);
    const end = new Date(endAtStr);
    if (isNaN(start.getTime())) return null;

    const dateFormatted = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: timezone,
    }).format(start);

    const startTime = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: timezone,
    }).format(start);

    const endTime = isNaN(end.getTime())
      ? ''
      : new Intl.DateTimeFormat('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          hourCycle: 'h23',
          timeZone: timezone,
        }).format(end);

    return {
      date: dateFormatted,
      time: endTime ? `${startTime} - ${endTime} WIB` : `${startTime} WIB`,
    };
  } catch {
    return null;
  }
}

export function CheckInPassView() {
  const session = useSessionContext()?.session;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [payload, setPayload] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Metadata per Spesifikasi 5.8
  const [classTitle, setClassTitle] = useState('Reformer Flow');
  const [studioName, setStudioName] = useState('Daily Dose Studio');
  const [instructorName, setInstructorName] = useState('Instruktur Daily Dose');
  const [passHolder, setPassHolder] = useState(session?.displayName ?? 'Member Daily Dose');
  const [dateStr, setDateStr] = useState('Hari ini');
  const [timeStr, setTimeStr] = useState('Sesuai jadwal');

  const downloadQr = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'daily-dose-qr-pass.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  useEffect(() => {
    // 1. Screen Wake Lock (Spesifikasi 5.8: "Kecerahan layar dinaikkan saat halaman dibuka, kalau platform mengizinkan")
    let wakeLockSentinel: any = null;
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      navigator.wakeLock
        .request('screen')
        .then((lock) => {
          wakeLockSentinel = lock;
        })
        .catch(() => {
          // Gracefully continue if wake lock is denied or unsupported
        });
    }

    // 2. Parse URL hash & search parameters
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/u, ''));

    const rawToken = hashParams.get('token') ?? searchParams.get('token') ?? '';
    const bookingId = searchParams.get('bookingId') ?? hashParams.get('bookingId') ?? '';

    // Metadata overrides
    const paramClass =
      searchParams.get('class') ??
      hashParams.get('class') ??
      searchParams.get('className') ??
      hashParams.get('className');
    const paramStudio =
      searchParams.get('branch') ??
      hashParams.get('branch') ??
      searchParams.get('studio') ??
      hashParams.get('studio');
    const paramInstructor = searchParams.get('instructor') ?? hashParams.get('instructor');
    const paramHolder =
      searchParams.get('holder') ??
      hashParams.get('holder') ??
      searchParams.get('holderName') ??
      hashParams.get('holderName');
    const paramStart = searchParams.get('start') ?? hashParams.get('start') ?? searchParams.get('startAt');
    const paramEnd = searchParams.get('end') ?? hashParams.get('end') ?? searchParams.get('endAt');
    const paramTz = searchParams.get('tz') ?? hashParams.get('timezone') ?? 'Asia/Jakarta';

    if (paramClass) setClassTitle(paramClass);
    if (paramStudio) setStudioName(paramStudio);
    if (paramInstructor) setInstructorName(paramInstructor);
    if (paramHolder) setPassHolder(paramHolder);
    else if (session?.displayName) setPassHolder(session.displayName);

    if (paramStart) {
      const schedule = formatPassSchedule(paramStart, paramEnd ?? '', paramTz);
      if (schedule) {
        setDateStr(schedule.date);
        setTimeStr(schedule.time);
      }
    }

    const decoded = rawToken ? decodeURIComponent(rawToken) : '';
    if (decoded.startsWith('dd-checkin:v1:')) {
      setPayload(decoded);
      void QRCode.toCanvas(canvasRef.current, decoded, {
        width: 260,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#17392d', light: '#ffffff' },
      }).catch(() => setError('QR tidak dapat dirender pada perangkat ini.'));
    } else if (bookingId) {
      // Dynamic fetch check-in token from booking ID
      fetch(`/api/v1/bookings/${encodeURIComponent(bookingId)}/customer-check-in-links`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('CHECKIN_UNAVAILABLE');
          return res.json() as Promise<{ qrPayload?: string; token?: string }>;
        })
        .then((data) => {
          const fetchedPayload = data.qrPayload ?? (data.token ? `dd-checkin:v1:${data.token}` : '');
          if (fetchedPayload.startsWith('dd-checkin:v1:')) {
            setPayload(fetchedPayload);
            void QRCode.toCanvas(canvasRef.current, fetchedPayload, {
              width: 260,
              margin: 2,
              errorCorrectionLevel: 'M',
              color: { dark: '#17392d', light: '#ffffff' },
            }).catch(() => setError('QR tidak dapat dirender pada perangkat ini.'));
          } else {
            setError('Pass QR tidak valid atau sudah tidak tersedia.');
          }
        })
        .catch(() => setError('Pass QR tidak valid atau sudah tidak tersedia.'));
    } else {
      setError('Pass QR tidak valid atau sudah tidak tersedia.');
    }

    return () => {
      try {
        void wakeLockSentinel?.release?.();
      } catch {
        // Ignore
      }
    };
  }, [session?.displayName]);

  return (
    <main className="flex min-h-dvh min-w-0 flex-col items-center justify-center overflow-x-hidden bg-[#24483a] px-4 py-8 text-white">
      <meta name="referrer" content="no-referrer" />
      
      <header className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#faeceb]">
          Daily Dose Pilates
        </p>
        <h1 className="mt-1 font-serif text-2xl font-normal tracking-tight text-white sm:text-3xl">
          QR Pass Kelas
        </h1>
        <p className="mt-2 max-w-sm text-center text-sm font-normal text-white/85">
          Tunjukkan QR ini ke pemindai tablet di meja resepsionis atau kiosk studio.
        </p>
      </header>

      {error ? (
        <section
          role="alert"
          className="mt-6 box-border w-full max-w-sm rounded-2xl bg-white p-6 text-center text-ed-ink shadow-2xl"
        >
          <AlertCircle className="mx-auto size-12 text-ed-danger" />
          <h2 className="mt-3 font-serif text-lg font-bold text-ed-ink">Pass Tidak Tersedia</h2>
          <p className="mt-2 text-sm text-ed-muted">{error}</p>
          <div className="mt-6">
            <Link
              href="/account"
              className="inline-flex h-11 min-h-[44px] w-full items-center justify-center rounded-xl bg-[#396552] text-sm font-bold text-white transition hover:bg-[#2e5243]"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="box-border mt-6 w-full max-w-sm rounded-2xl bg-white p-6 text-center text-ed-ink shadow-2xl">
            <canvas
              ref={canvasRef}
              className="mx-auto box-border rounded-xl bg-white p-2 shadow-inner"
              style={{ width: 'min(260px, 100%)', minWidth: '230px', height: 'auto' }}
              aria-label="QR check-in"
            />

            <div className="mt-5 border-t border-ed-line pt-4 text-left space-y-1.5">
              <h2 className="font-serif text-lg font-bold text-ed-ink">{classTitle}</h2>
              <p className="text-sm font-semibold text-ed-forest">{dateStr} · {timeStr}</p>
              <div className="pt-1 space-y-1 text-xs text-ed-muted">
                <p>Studio: <span className="font-medium text-ed-ink">{studioName}</span></p>
                <p>Instruktur: <span className="font-medium text-ed-ink">{instructorName}</span></p>
                <p>Pemegang Pass: <span className="font-medium text-ed-ink">{passHolder}</span></p>
              </div>
            </div>

            <p className="mt-4 rounded-xl border border-[#396552]/20 bg-[#faeceb]/60 p-2.5 text-center text-xs leading-relaxed text-[#396552]">
              Kode berlaku mulai 30 menit sebelum sesi dimulai hingga kelas selesai.
            </p>

            <button
              type="button"
              onClick={downloadQr}
              aria-label="Simpan ke galeri"
              className="mt-4 inline-flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#396552] px-6 text-sm font-bold text-white shadow-xs transition hover:bg-[#2e5243] active:scale-[0.99]"
            >
              {saved ? <Check className="size-4" /> : <Download className="size-4" />}
              <span>{saved ? 'Tersimpan di galeri ✓' : 'Simpan ke galeri'}</span>
            </button>

            <p className="mt-3 text-[11px] text-ed-muted">
              Pass terenkripsi · jangan teruskan ke pihak lain
            </p>
          </section>

          <nav className="mt-6">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"
            >
              <ArrowLeft className="size-4" />
              <span>Kembali ke Beranda</span>
            </Link>
          </nav>
        </>
      )}
    </main>
  );
}
