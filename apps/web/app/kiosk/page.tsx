'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ChevronRight,
  Navigation,
  ShieldCheck,
} from 'lucide-react';
import { getKioskBranches, type KioskBranchItem } from '../api-clients/booking-client';
import { formatStudioName } from '../lib/system-dictionary';
import { Skeleton } from '../ui';

export default function KioskPortalPage() {
  const [branches, setBranches] = useState<KioskBranchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getKioskBranches()
      .then((res) => {
        setBranches(res.items);
      })
      .catch(() => {
        setError('Daftar cabang belum dapat dimuat. Pastikan server aktif.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-dd-canvas text-dd-ink selection:bg-dd-forest selection:text-white">
      {/* Header */}
      <header className="border-b border-dd-line bg-white/90 px-6 py-8 text-center backdrop-blur-md shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-dd-xl bg-dd-forest text-white font-extrabold text-xl shadow-md">
          DD
        </div>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="size-2 rounded-full bg-dd-forest animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-dd-forest">
            Studio Public Kiosk Portal
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-black text-dd-ink sm:text-3xl">
          Layar Kiosk Presensi Studio Daily Dose
        </h1>
        <p className="mt-2 max-w-lg mx-auto text-sm text-dd-muted">
          Pilih cabang studio tempat tablet kiosk ini dipasang untuk menampilkan jadwal dan QR presensi instruktur secara live.
        </p>
      </header>

      {/* Branch Cards Grid */}
      <div className="flex-1 p-6 lg:p-12">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between border-b border-dd-line pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-dd-ink">
              Pilih Cabang Studio
            </h2>
            <span className="text-xs text-dd-muted font-medium">{branches.length} Cabang Aktif</span>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton label="Memuat daftar cabang..." />
            </div>
          ) : error ? (
            <div className="rounded-dd-xl border border-dd-danger/30 bg-dd-danger-soft p-6 text-center text-sm text-dd-danger">
              {error}
            </div>
          ) : branches.length === 0 ? (
            <div className="rounded-dd-xl border border-dd-line bg-dd-surface p-8 text-center text-sm text-dd-muted shadow-sm">
              Belum ada cabang studio aktif yang terdaftar.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {branches.map((b) => (
                <Link
                  key={b.id}
                  href={`/kiosk/${encodeURIComponent(b.code.toLowerCase())}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-dd-2xl border border-dd-line bg-dd-surface p-6 shadow-dd-card transition hover:scale-[1.02] hover:border-dd-forest hover:shadow-dd-soft"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex size-10 items-center justify-center rounded-dd-lg bg-dd-success-soft text-dd-forest group-hover:bg-dd-forest group-hover:text-white transition shadow-sm">
                        <Building2 className="size-5" />
                      </div>
                      <span className="rounded-full bg-dd-canvas border border-dd-line px-3 py-1 text-xs font-bold text-dd-forest">
                        {formatStudioName(b.code, 'short')}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-dd-ink group-hover:text-dd-forest transition">
                        {b.name}
                      </h3>
                      <p className="mt-1 text-xs text-dd-muted line-clamp-2 leading-relaxed">
                        {b.address || 'Studio Pilates Daily Dose'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-dd-line pt-3 text-xs text-dd-muted">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Navigation className="size-3.5 text-dd-forest" />
                      Tablet presensi studio
                    </span>
                    <span className="flex items-center gap-1 font-bold text-dd-forest group-hover:translate-x-1 transition">
                      Buka Kiosk <ChevronRight className="size-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Security & Instruction Card */}
          <div className="mt-10 rounded-dd-2xl border border-dd-line bg-dd-surface-muted p-6 text-xs text-dd-muted space-y-3 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-dd-ink">
              <ShieldCheck className="size-4 text-dd-forest" />
              <span>Keamanan Tablet Kiosk Studio &amp; Integrasi Geofence:</span>
            </div>
            <p className="leading-relaxed">
              Setiap tablet studio diamankan dengan 6 digit PIN otorisasi studio sebelum menampilkan jadwal kelas. Ketika instruktur memindai QR code dari aplikasi ponselnya, sistem memverifikasi bahwa koordinat GPS ponsel berada di dalam area radius cabang tempat sesi kelas berlangsung. QR presensi diperbarui secara otomatis setiap 60 detik untuk mencegah penyalahgunaan tangkapan layar.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-dd-line bg-white px-6 py-3 text-center text-xs text-dd-muted">
        Daily Dose Studio Management · Kiosk Public Mode
      </footer>
    </main>
  );
}
