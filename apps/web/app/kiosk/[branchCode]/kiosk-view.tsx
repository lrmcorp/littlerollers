'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, MapPin, ShieldCheck } from 'lucide-react';
import {
  getKioskDisplay as defaultGetKioskDisplay,
  unlockKiosk as defaultUnlockKiosk,
  type KioskDisplayData,
} from '../../api-clients/booking-client';
import { ApiError } from '../../lib/api-client';
import { Button } from '../../components/actions';
import { Skeleton } from '../../ui';
import { StudioScannerScreen, type StudioScannerClient } from './studio-scanner-screen';

interface KioskViewProps {
  branchCode: string;
  client?: {
    getKioskDisplay: (code: string, token: string) => Promise<KioskDisplayData>;
    unlockKiosk: (code: string, pin: string) => Promise<{ token: string; expiresAt: string }>;
  };
  /** Hanya untuk tes: anggap tablet sudah punya token. */
  initialToken?: string | null;
  scannerClient?: StudioScannerClient;
  /** Hanya untuk tes: tanpa kamera. */
  kameraAktif?: boolean;
}

export function KioskView({
  branchCode,
  client = { getKioskDisplay: defaultGetKioskDisplay, unlockKiosk: defaultUnlockKiosk },
  initialToken,
  scannerClient,
  kameraAktif = true,
}: KioskViewProps) {
  const normalizedBranch = branchCode.toLowerCase();
  const storageKey = `dd_kiosk_token_${normalizedBranch}`;

  // Token tablet dari server (didapat setelah PIN cabang benar). PIN dan keputusan akses ada di server.
  // Token dibaca setelah halaman terpasang, bukan saat render pertama: server tidak punya
  // localStorage, jadi membacanya lebih awal membuat HTML server dan browser berbeda.
  const [token, setToken] = useState<string | null>(initialToken ?? null);
  const [tokenTerbaca, setTokenTerbaca] = useState(initialToken !== undefined);
  useEffect(() => {
    if (initialToken !== undefined) return;
    try {
      setToken(window.localStorage?.getItem(storageKey) ?? null);
    } catch {
      setToken(null);
    }
    setTokenTerbaca(true);
  }, [initialToken, storageKey]);
  const isAuthorized = Boolean(token);
  const [unlocking, setUnlocking] = useState(false);

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Data Jadwal & Sesi Kiosk
  const [data, setData] = useState<KioskDisplayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data kiosk dari server
  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await client.getKioskDisplay(branchCode, token ?? '');
      setData(res);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        // PIN cabang diganti atau token kedaluwarsa: kembali ke layar PIN.
        if (typeof window !== 'undefined' && window.localStorage)
          window.localStorage.removeItem(storageKey);
        setToken(null);
        setPinError('Akses tablet berakhir atau PIN cabang diganti. Masukkan PIN terbaru.');
        return;
      }
      setError(
        'Layar Kiosk belum dapat memuat jadwal cabang ini. Periksa kode cabang atau koneksi studio.',
      );
    } finally {
      setLoading(false);
    }
  }, [branchCode, client, token, storageKey]);

  // Initial load saat sudah terotorisasi
  useEffect(() => {
    if (isAuthorized) {
      void load();
    }
  }, [isAuthorized, load]);

  const kunciKarenaKedaluwarsa = () => {
    if (typeof window !== 'undefined' && window.localStorage)
      window.localStorage.removeItem(storageKey);
    setToken(null);
    setData(null);
    setPinError('Akses tablet berakhir atau PIN cabang diganti. Masukkan PIN terbaru.');
  };

  const lockKiosk = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(storageKey);
    }
    setToken(null);
    setData(null);
    setPinInput('');
    setPinError(null);
  };

  const unlockMessage = (cause: unknown) => {
    const status = cause instanceof ApiError ? cause.status : 0;
    const code = (cause as { data?: { error?: { code?: string } } })?.data?.error?.code;
    if (code === 'KIOSK_NOT_CONFIGURED')
      return 'PIN kiosk cabang ini belum dibuat. Minta admin membuatnya di menu PIN Kiosk.';
    if (status === 429) return 'Terlalu banyak percobaan. Tunggu 15 menit lalu coba lagi.';
    if (status === 403) return 'PIN salah. Masukkan 6 digit PIN kiosk cabang ini.';
    return 'PIN belum dapat diperiksa. Periksa koneksi studio lalu coba lagi.';
  };

  const submitPin = async (pin: string) => {
    if (pin.length !== 6 || unlocking) return;
    setUnlocking(true);
    setPinError(null);
    try {
      const result = await client.unlockKiosk(branchCode, pin);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(storageKey, result.token);
      }
      setLoading(true);
      setToken(result.token);
      setPinInput('');
    } catch (cause) {
      setPinError(unlockMessage(cause));
    } finally {
      setUnlocking(false);
    }
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    void submitPin(pinInput.trim());
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
      if (nextPin.length === 6) void submitPin(nextPin);
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
  if (!tokenTerbaca) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dd-canvas p-6">
        <Skeleton label="Memuat layar Kiosk Studio..." />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-dd-canvas p-6 text-dd-ink">
        <div className="w-full max-w-md rounded-2xl border border-dd-line bg-white p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-dd-forest text-white shadow-md">
            <Lock className="size-7" />
          </div>

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-dd-forest/10 px-3 py-1 text-[13px] font-bold text-dd-forest">
            <ShieldCheck className="size-3.5" />
            <span>Otorisasi Tablet Studio</span>
          </div>

          <h1 className="mt-3 text-2xl font-bold text-dd-ink">Kunci Akses Tablet Kiosk</h1>
          <p className="mt-2 text-sm text-dd-muted">
            Perangkat ini belum dipasangkan sebagai tablet resmi studio{' '}
            <strong className="text-dd-ink">{branchCode.toUpperCase()}</strong>. Masukkan 6 digit
            PIN otorisasi studio untuk mengaktifkan layar presensi.
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

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={unlocking || pinInput.length !== 6}
            >
              {unlocking ? 'Memeriksa PIN…' : 'Aktifkan Layar Kiosk'}
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
        <div className="max-w-md space-y-4 rounded-2xl border border-dd-danger/30 bg-white p-8">
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

  // 4. LAYAR PEMINDAI STUDIO: tablet memindai QR tetap milik member dan instruktur.
  return (
    <StudioScannerScreen
      branchCode={branchCode}
      token={token ?? ''}
      namaCabang={data.branch.name}
      timezone={data.branch.timezone}
      onLock={lockKiosk}
      onExpired={kunciKarenaKedaluwarsa}
      client={scannerClient}
      kameraAktif={kameraAktif}
    />
  );
}
