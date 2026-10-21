'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Navigation,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { getKioskBranches, type KioskBranchItem } from '../api-clients/booking-client';
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
    <main className="flex min-h-screen flex-col bg-slate-900 text-white selection:bg-dd-forest selection:text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 px-6 py-6 text-center backdrop-blur-md">
        <div className="mx-auto flex size-12 items-center justify-center rounded-dd-xl bg-dd-forest text-white font-extrabold text-xl shadow-lg">
          DD
        </div>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Studio Public Kiosk Portal
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
          Layar Kiosk Presensi Studio Daily Dose
        </h1>
        <p className="mt-2 max-w-lg mx-auto text-sm text-slate-400">
          Pilih cabang studio tempat tablet kiosk ini dipasang untuk menampilkan jadwal dan QR presensi instruktur secara live.
        </p>
      </header>

      {/* Branch Cards Grid */}
      <div className="flex-1 p-6 lg:p-12">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Pilih Cabang Studio
            </h2>
            <span className="text-xs text-slate-400">{branches.length} Cabang Aktif</span>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton label="Memuat daftar cabang..." />
            </div>
          ) : error ? (
            <div className="rounded-dd-xl border border-rose-500/30 bg-rose-950/30 p-6 text-center text-sm text-rose-300">
              {error}
            </div>
          ) : branches.length === 0 ? (
            <div className="rounded-dd-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
              Belum ada cabang studio aktif yang terdaftar.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {branches.map((b) => (
                <Link
                  key={b.id}
                  href={`/kiosk/${encodeURIComponent(b.code.toLowerCase())}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-dd-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-lg transition hover:scale-[1.02] hover:border-emerald-500/50 hover:bg-white/10"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex size-10 items-center justify-center rounded-dd-lg bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition">
                        <Building2 className="size-5" />
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs font-bold text-slate-300">
                        {b.code}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">
                        {b.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                        {b.address || 'Studio Pilates Daily Dose'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Navigation className="size-3.5 text-emerald-400" />
                      {b.hasGeofence
                        ? `Geofence: ${b.geofenceRadiusMeters}m`
                        : 'Lokasi cabang: Aktif'}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-400 group-hover:translate-x-1 transition">
                      Buka Kiosk <ChevronRight className="size-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Security & Instruction Card */}
          <div className="mt-10 rounded-dd-2xl border border-white/10 bg-black/30 p-6 text-xs text-slate-400 space-y-3">
            <div className="flex items-center gap-2 font-bold text-white">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span>Keamanan Lokasi &amp; Geofencing Presensi:</span>
            </div>
            <p className="leading-relaxed">
              Layar Kiosk dapat dibuka secara publik pada tablet atau TV display studio tanpa memerlukan login akun staf. Ketika instruktur memindai QR code dari aplikasi ponselnya, sistem akan secara otomatis memverifikasi bahwa koordinat GPS ponsel berada di dalam area radius cabang tempat sesi kelas berlangsung.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 px-6 py-3 text-center text-xs text-slate-400">
        Daily Dose Studio Management · Kiosk Public Mode
      </footer>
    </main>
  );
}
