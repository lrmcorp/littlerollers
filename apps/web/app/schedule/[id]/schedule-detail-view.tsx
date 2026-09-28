'use client';

import Link from 'next/link';
import {
  CalendarDays,
  Check,
  Clock3,
  Gauge,
  Info,
  MapPin,
  MessageCircle,
  Sparkles,
  Timer,
  UserCheck,
  UsersRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  publicDetailClient,
  publicDetailFailure,
  type PublicScheduleDetail,
} from '@/api-clients/public-detail-client';
import {
  AudienceAction,
  DetailFailure,
  DetailHero,
  DetailLoading,
  PublicDetailFrame,
  publicContainer,
  publicSecondaryButton,
} from '../../components/public/public-detail-shared';

export function ScheduleDetailView({
  id,
  initialData = null,
}: {
  id: string;
  initialData?: PublicScheduleDetail | null;
}) {
  const [item, setItem] = useState<PublicScheduleDetail | null>(initialData);
  const [failure, setFailure] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    if (initialData && attempt === 0) return;
    setFailure('');
    publicDetailClient
      .schedule(id)
      .then((value) => active && setItem(value))
      .catch((error) => active && setFailure(publicDetailFailure(error)));
    return () => {
      active = false;
    };
  }, [attempt, id, initialData]);

  const start = item ? new Date(item.startAt) : null;
  const end = item ? new Date(item.endAt) : null;

  // Calculate schedule duration in minutes
  const durationMinutes =
    start && end
      ? Math.max(15, Math.round((end.getTime() - start.getTime()) / 60_000))
      : (item?.classProfile.durationMinutes ?? 60);

  const isFull = item ? item.available < 1 : false;

  return (
    <PublicDetailFrame
      breadcrumb={[
        { label: 'Jadwal', href: '/classes#schedule' },
        { label: item?.classType.name ?? 'Detail' },
      ]}
    >
      {!item && !failure && <DetailLoading label="jadwal" />}
      {failure && (
        <DetailFailure
          message={failure}
          listHref="/classes#schedule"
          onRetry={() => setAttempt((value) => value + 1)}
        />
      )}
      {item && start && end && (
        <>
          <DetailHero
            eyebrow="Jadwal kelas"
            title={item.classType.name}
            summary={`${new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeZone: item.timezone }).format(start)} · Studio ${item.branch.name}.`}
            imageKey={item.classProfile.heroImageKey}
            facts={
              <div className="flex flex-wrap gap-2.5 text-sm">
                {/* Tanggal */}
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-line bg-white px-3.5 py-2 font-medium text-dd-ink shadow-xs">
                  <CalendarDays className="size-4 text-dd-forest" />
                  {new Intl.DateTimeFormat('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    timeZone: item.timezone,
                  }).format(start)}
                </span>

                {/* Jam Mulai - Selesai */}
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-line bg-white px-3.5 py-2 font-medium text-dd-ink shadow-xs">
                  <Clock3 className="size-4 text-dd-forest" />
                  {new Intl.DateTimeFormat('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: item.timezone,
                  }).format(start)}{' '}
                  –{' '}
                  {new Intl.DateTimeFormat('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: item.timezone,
                  }).format(end)}{' '}
                  WIB
                </span>

                {/* Durasi Jadwal */}
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-forest/30 bg-emerald-50 px-3.5 py-2 font-semibold text-dd-forest shadow-xs">
                  <Timer className="size-4 text-dd-forest" />
                  Durasi {durationMinutes} Menit
                </span>

                {/* Instruktur */}
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-line bg-white px-3.5 py-2 font-medium text-dd-ink shadow-xs">
                  <UserCheck className="size-4 text-dd-forest" />
                  {item.instructor?.displayName
                    ? `Instruktur: ${item.instructor.displayName}`
                    : 'Instruktur: Tim Daily Dose'}
                </span>

                {/* Ketersediaan Tempat */}
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-medium shadow-xs ${
                    isFull
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : item.available <= 2
                        ? 'border-amber-200 bg-amber-50 text-amber-800'
                        : 'border-dd-line bg-white text-dd-ink'
                  }`}
                >
                  <UsersRound className="size-4" />
                  {isFull
                    ? 'Kelas Penuh (0 tempat)'
                    : `${item.available} dari ${item.capacity} tempat tersisa`}
                </span>

                {/* Level */}
                {item.classProfile.level && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-dd-line bg-white px-3.5 py-2 font-medium text-dd-ink shadow-xs">
                    <Gauge className="size-4 text-dd-forest" />
                    {item.classProfile.level}
                  </span>
                )}
              </div>
            }
            actions={
              <>
                <AudienceAction
                  kind="schedule"
                  id={item.id}
                  disabled={!item.canBook}
                  disabledLabel={isFull ? 'Tempat tidak tersedia' : 'Pemesanan sudah ditutup'}
                />
                <Link className={publicSecondaryButton} href={`/classes/${item.classProfile.slug}`}>
                  Detail kelas
                </Link>
                <Link
                  className={publicSecondaryButton}
                  href={`/locations/${item.branch.publicProfile.slug}`}
                >
                  Detail studio
                </Link>
              </>
            }
          />

          {/* Section 1: Informasi Kelas & Sesi */}
          <section className={`${publicContainer} grid gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr]`}>
            {/* Kolom Kiri: Tentang Kelas */}
            <article className="space-y-6">
              <div>
                <p className="text-xs font-bold tracking-[0.14em] text-dd-forest uppercase">
                  Tentang Kelas Ini
                </p>
                <h2 className="mt-2 text-2xl font-bold text-dd-ink sm:text-3xl">
                  {item.classType.name}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-dd-muted">
                  {item.classProfile.description || item.classProfile.summary}
                </p>
              </div>

              {/* Manfaat Kelas */}
              {item.classProfile.benefits && item.classProfile.benefits.length > 0 && (
                <div className="rounded-dd-lg border border-dd-line bg-white p-6 shadow-dd-card">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-dd-ink">
                    <Sparkles className="size-5 text-dd-forest" />
                    Manfaat Latihan
                  </h3>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {item.classProfile.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-2.5 rounded-dd-sm bg-dd-surface-muted p-3 text-sm text-dd-ink"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-dd-forest" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Perlengkapan */}
              {item.classProfile.equipment && item.classProfile.equipment.length > 0 && (
                <div className="rounded-dd-lg border border-dd-line bg-white p-6 shadow-dd-card">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-dd-ink">
                    <Info className="size-5 text-dd-forest" />
                    Perlengkapan Sesi
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.classProfile.equipment.map((eq) => (
                      <span
                        key={eq}
                        className="inline-flex items-center gap-1.5 rounded-full border border-dd-line bg-dd-paper px-3 py-1.5 text-xs font-medium text-dd-ink"
                      >
                        <span className="size-1.5 rounded-full bg-dd-forest" />
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Kolom Kanan: Detail Lokasi & Persiapan */}
            <aside className="space-y-6">
              {/* Studio Card */}
              <div className="rounded-dd-lg border border-dd-line bg-white p-6 shadow-dd-card">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-dd-forest uppercase">
                  <MapPin className="size-4" />
                  Lokasi Studio
                </div>
                <h3 className="mt-2 text-xl font-bold text-dd-ink">{item.branch.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-dd-muted">
                  {item.branch.publicProfile.address}
                </p>

                {item.branch.publicProfile.arrivalInformation && (
                  <div className="mt-4 rounded-dd-sm border border-dd-line bg-dd-paper p-3.5 text-xs leading-relaxed text-dd-muted">
                    <strong className="block font-semibold text-dd-ink">Akses Masuk:</strong>
                    {item.branch.publicProfile.arrivalInformation}
                  </div>
                )}

                {item.branch.publicProfile.parkingInformation && (
                  <div className="mt-2 rounded-dd-sm border border-dd-line bg-dd-paper p-3.5 text-xs leading-relaxed text-dd-muted">
                    <strong className="block font-semibold text-dd-ink">Info Parkir:</strong>
                    {item.branch.publicProfile.parkingInformation}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    className={publicSecondaryButton}
                    href={`/locations/${item.branch.publicProfile.slug}`}
                  >
                    Detail studio
                  </Link>
                  {item.branch.supportWhatsappE164 && (
                    <a
                      className="inline-flex min-h-11 items-center gap-2 rounded-dd-sm border border-emerald-300 bg-emerald-50 px-4 text-xs font-semibold text-emerald-800 no-underline transition-colors hover:bg-emerald-100"
                      href={`https://wa.me/${item.branch.supportWhatsappE164.replace(/\D/g, '')}?text=${encodeURIComponent(`Halo Daily Dose, saya ingin bertanya seputar jadwal ${item.classType.name} di ${item.branch.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="size-4 text-emerald-600" />
                      Chat WhatsApp Studio
                    </a>
                  )}
                </div>
              </div>

              {/* Panduan Sebelum Datang */}
              <div className="rounded-dd-lg border border-dd-line bg-dd-paper p-6">
                <h3 className="text-lg font-bold text-dd-ink">Sebelum Datang ke Studio</h3>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-dd-muted">
                  <li className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-dd-forest text-[11px] font-bold text-white">
                      1
                    </span>
                    <span>
                      <strong className="font-semibold text-dd-ink">
                        Datang 15 menit lebih awal
                      </strong>{' '}
                      untuk proses check-in QR pass dan persiapan sesi.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-dd-forest text-[11px] font-bold text-white">
                      2
                    </span>
                    <span>
                      <strong className="font-semibold text-dd-ink">
                        Wajib memakai grip socks
                      </strong>{' '}
                      demi keamanan dan kenyamanan selama di studio.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-dd-forest text-[11px] font-bold text-white">
                      3
                    </span>
                    <span>
                      <strong className="font-semibold text-dd-ink">
                        Fasilitas studio tersedia
                      </strong>{' '}
                      seperti loker penyimpanan barang, ruang ganti, dan air minum.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-dd-forest text-[11px] font-bold text-white">
                      4
                    </span>
                    <span>
                      <strong className="font-semibold text-dd-ink">Kebijakan pembatalan</strong>{' '}
                      dapat dilakukan melalui dashboard akun sesuai ketentuan paket Anda.
                    </span>
                  </li>
                </ul>
              </div>
            </aside>
          </section>
        </>
      )}
    </PublicDetailFrame>
  );
}
