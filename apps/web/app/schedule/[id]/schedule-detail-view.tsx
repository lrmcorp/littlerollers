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
  DetailFactTag,
  DetailFailure,
  DetailHero,
  DetailLoading,
  PublicDetailFrame,
  publicSecondaryButton,
} from '../../components/public/public-detail-shared';
import { classLevelLabel } from '../../lib/class-level';

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
              <div className="flex flex-wrap gap-2 text-sm">
                {/* Tanggal */}
                <DetailFactTag icon={CalendarDays}>
                  {new Intl.DateTimeFormat('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    timeZone: item.timezone,
                  }).format(start)}
                </DetailFactTag>

                {/* Jam Mulai - Selesai */}
                <DetailFactTag icon={Clock3}>
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
                </DetailFactTag>

                {/* Durasi Jadwal */}
                <DetailFactTag icon={Timer} variant="accent">
                  Durasi {durationMinutes} Menit
                </DetailFactTag>

                {/* Instruktur */}
                <DetailFactTag icon={UserCheck}>
                  {item.instructor?.displayName
                    ? `Instruktur: ${item.instructor.displayName}`
                    : 'Instruktur: Tim Daily Dose'}
                </DetailFactTag>

                {/* Ketersediaan Tempat */}
                <DetailFactTag
                  icon={UsersRound}
                  variant={isFull ? 'danger' : item.available <= 2 ? 'warning' : 'default'}
                >
                  {isFull
                    ? 'Kelas Penuh (0 tempat)'
                    : `${item.available} dari ${item.capacity} tempat tersisa`}
                </DetailFactTag>

                {/* Level */}
                {item.classProfile.level && (
                  <DetailFactTag icon={Gauge}>
                    {classLevelLabel(item.classProfile.level)}
                  </DetailFactTag>
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
          <section className="ed-wrap grid gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Kolom Kiri: Tentang Kelas */}
            <article className="space-y-6">
              <div>
                <p className="ed-eyebrow text-ed-green">
                  Tentang Kelas Ini
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-ed-ink sm:text-3xl">
                  {item.classType.name}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-ed-muted">
                  {item.classProfile.description || item.classProfile.summary}
                </p>
              </div>

              {/* Manfaat Kelas */}
              {item.classProfile.benefits && item.classProfile.benefits.length > 0 && (
                <div className="rounded-none border border-ed-line bg-white p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-ed-ink">
                    <Check className="size-4 text-ed-green" />
                    Manfaat Latihan
                  </h3>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {item.classProfile.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-2.5 rounded-none border border-ed-line bg-ed-tint p-3 text-sm font-medium text-ed-ink"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-ed-green" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Perlengkapan */}
              {item.classProfile.equipment && item.classProfile.equipment.length > 0 && (
                <div className="rounded-none border border-ed-line bg-white p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-ed-ink">
                    <Info className="size-4 text-ed-green" />
                    Perlengkapan Sesi
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.classProfile.equipment.map((eq) => (
                      <span
                        key={eq}
                        className="inline-flex items-center gap-2 rounded-none border border-ed-line bg-ed-tint px-3 py-1 text-[13px] font-bold text-ed-ink"
                      >
                        <span className="size-1 bg-ed-green" />
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
              <div className="rounded-none border border-ed-line bg-white p-6 ">
                <div className="flex items-center gap-2 text-[13px] font-bold text-ed-green">
                  <MapPin className="size-4" />
                  Lokasi Studio
                </div>
                <h3 className="mt-2 text-xl font-bold text-ed-ink">{item.branch.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ed-muted">
                  {item.branch.publicProfile.address}
                </p>

                {item.branch.publicProfile.arrivalInformation && (
                  <div className="mt-4 rounded-none border border-ed-line bg-ed-cream p-3.5 text-xs leading-relaxed text-ed-muted">
                    <strong className="block font-semibold text-ed-ink">Akses Masuk:</strong>
                    {item.branch.publicProfile.arrivalInformation}
                  </div>
                )}

                {item.branch.publicProfile.parkingInformation && (
                  <div className="mt-2 rounded-none border border-ed-line bg-ed-cream p-3.5 text-xs leading-relaxed text-ed-muted">
                    <strong className="block font-semibold text-ed-ink">Info Parkir:</strong>
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
                      className="inline-flex min-h-11 items-center gap-2 rounded-none border border-ed-green/30 bg-ed-tint px-4 text-[13px] font-bold text-ed-forest no-underline transition-colors hover:bg-ed-mist"
                      href={`https://wa.me/${item.branch.supportWhatsappE164.replace(/\D/g, '')}?text=${encodeURIComponent(`Halo Daily Dose, saya ingin bertanya seputar jadwal ${item.classType.name} di ${item.branch.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="size-4 text-ed-green" />
                      Chat WhatsApp Studio
                    </a>
                  )}
                </div>
              </div>

              {/* Panduan Sebelum Datang */}
              <div className="rounded-none border border-ed-line bg-ed-tint/60 p-6">
                <h3 className="text-lg font-bold text-ed-ink">Sebelum Datang ke Studio</h3>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ed-muted">
                  <li className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-none bg-ed-green text-[11px] font-bold text-white">
                      1
                    </span>
                    <span>
                      <strong className="font-semibold text-ed-ink">
                        Datang 15 menit lebih awal
                      </strong>{' '}
                      untuk proses check-in QR pass dan persiapan sesi.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-none bg-ed-green text-[11px] font-bold text-white">
                      2
                    </span>
                    <span>
                      <strong className="font-semibold text-ed-ink">
                        Wajib memakai grip socks
                      </strong>{' '}
                      demi keamanan dan kenyamanan selama di studio.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-none bg-ed-green text-[11px] font-bold text-white">
                      3
                    </span>
                    <span>
                      <strong className="font-semibold text-ed-ink">
                        Fasilitas studio tersedia
                      </strong>{' '}
                      seperti loker penyimpanan barang, ruang ganti, dan air minum.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-none bg-ed-green text-[11px] font-bold text-white">
                      4
                    </span>
                    <span>
                      <strong className="font-semibold text-ed-ink">Kebijakan pembatalan</strong>{' '}
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
