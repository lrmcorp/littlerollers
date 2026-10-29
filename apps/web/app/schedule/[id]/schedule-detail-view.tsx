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

function blockSummary(startAt: string, endAt: string) {
  const minutes = (new Date(endAt).getTime() - new Date(startAt).getTime()) / 60_000;
  if (minutes >= 120)
    return 'A 2-hour block: 1-hour packages join the first hour, 2-hour packages stay for both.';
  if (minutes >= 60) return 'A 1-hour session.';
  return '';
}

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
        { label: 'Timetable', href: '/classes#schedule' },
        { label: item?.classType.name ?? 'Session' },
      ]}
    >
      {!item && !failure && <DetailLoading label="session" />}
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
            eyebrow="Session"
            title={item.classType.name}
            summary={`${new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeZone: item.timezone }).format(start)} at ${item.branch.name}. ${blockSummary(item.startAt, item.endAt)}`}
            imageKey={item.classProfile.heroImageKey}
            facts={
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-line bg-white px-4 py-2">
                  <CalendarDays className="size-4 text-dd-forest" aria-hidden="true" />
                  {new Intl.DateTimeFormat('en-GB', {
                    dateStyle: 'medium',
                    timeZone: item.timezone,
                  }).format(start)}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-line bg-white px-4 py-2">
                  <Clock3 className="size-4 text-dd-forest" aria-hidden="true" />
                  {new Intl.DateTimeFormat('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: item.timezone,
                  }).format(start)}{' '}
                  WIB
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-line bg-white px-4 py-2">
                  <UsersRound className="size-4 text-dd-forest" aria-hidden="true" />
                  {item.available} of {item.capacity} places left
                </span>
              </div>
            }
            actions={
              <>
                <AudienceAction kind="schedule" id={item.id} disabled={item.available < 1} />
                <Link className={publicSecondaryButton} href={`/classes/${item.classProfile.slug}`}>
                  About this class
                </Link>
              </>
            }
          />
          <section className={`${publicContainer} grid gap-6 py-10 md:grid-cols-2`}>
            <article className="rounded-[15px] border border-dd-line bg-white p-6">
              <MapPin className="size-6 text-dd-forest" aria-hidden="true" />
              <h2 className="mt-4 font-display text-2xl text-dd-forest">{item.branch.name}</h2>
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
                Club details
              </Link>
            </article>
            <article className="rounded-[15px] bg-lr-sky p-6">
              <h2 className="m-0 font-display text-2xl text-dd-forest">Before you come</h2>
              <ul className="mt-4 grid gap-3 pl-5 text-sm leading-6 text-dd-ink">
                <li>Arrive about 10 minutes early so your child can settle in.</li>
                <li>Dress them in comfortable clothes and grip socks.</li>
                <li>You can book while places are left.</li>
              </ul>
            </article>
          </section>
        </>
      )}
    </PublicDetailFrame>
  );
}
