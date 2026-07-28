'use client';

import Link from 'next/link';
import { CalendarDays, Clock3, MapPin, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  publicDetailClient,
  publicDetailFailure,
  type PublicScheduleDetail,
} from '../../public-detail-client';
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
      {item && start && (
        <>
          <DetailHero
            eyebrow="Jadwal kelas"
            title={item.classType.name}
            summary={`${new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeZone: item.timezone }).format(start)} di ${item.branch.name}.`}
            imageKey={item.classProfile.heroImageKey}
            facts={
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-line bg-white px-4 py-2">
                  <CalendarDays className="size-4 text-dd-forest" />
                  {new Intl.DateTimeFormat('id-ID', {
                    dateStyle: 'medium',
                    timeZone: item.timezone,
                  }).format(start)}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-line bg-white px-4 py-2">
                  <Clock3 className="size-4 text-dd-forest" />
                  {new Intl.DateTimeFormat('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: item.timezone,
                  }).format(start)}{' '}
                  WIB
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-line bg-white px-4 py-2">
                  <UsersRound className="size-4 text-dd-forest" />
                  {item.available} dari {item.capacity} tempat tersisa
                </span>
              </div>
            }
            actions={
              <>
                <AudienceAction kind="schedule" id={item.id} disabled={item.available < 1} />
                <Link className={publicSecondaryButton} href={`/classes/${item.classProfile.slug}`}>
                  Detail kelas
                </Link>
              </>
            }
          />
          <section className={`${publicContainer} grid gap-6 py-10 md:grid-cols-2`}>
            <article className="rounded-dd-lg border border-dd-line bg-white p-6 shadow-dd-card">
              <MapPin className="size-6 text-dd-forest" />
              <h2 className="mt-4 text-2xl font-semibold">{item.branch.name}</h2>
              <p className="mt-2 text-sm leading-6 text-dd-muted">
                {item.branch.publicProfile.address}
              </p>
              <p className="mt-4 text-sm leading-6 text-dd-muted">
                {item.branch.publicProfile.arrivalInformation}
              </p>
              <Link
                className={`${publicSecondaryButton} mt-5`}
                href={`/locations/${item.branch.publicProfile.slug}`}
              >
                Lihat detail studio
              </Link>
            </article>
            <article className="rounded-dd-lg border border-dd-line bg-dd-paper p-6">
              <h2 className="text-2xl font-semibold">Sebelum datang</h2>
              <ul className="mt-4 grid gap-3 pl-5 text-sm leading-6 text-dd-muted">
                <li>Datang 15 menit sebelum kelas dimulai.</li>
                <li>Gunakan pakaian latihan yang nyaman dan grip socks.</li>
                <li>Booking hanya dapat dilakukan selama tempat masih tersedia.</li>
              </ul>
            </article>
          </section>
        </>
      )}
    </PublicDetailFrame>
  );
}
