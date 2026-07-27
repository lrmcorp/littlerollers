'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  browserPublicClassCatalogClient,
  publicCatalogFailure,
  type PublicBranch,
  type PublicClassCatalogClient,
  type PublicClassSlot,
} from '../public-class-catalog-client';
import { PublicFooter } from '../components/public/public-footer';
import { PublicHeader } from '../components/public/public-header';
import { PublicPageHero, PublicSectionHeading } from '../components/public/public-page';
import {
  publicContainer,
  publicField,
  publicPrimaryButton,
  publicSecondaryButton,
} from '../components/public/public-styles';
import { useSessionContext } from '../session-context';

function dayKey(value: string, timezone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

function dateLabel(value: string, timezone: string) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: timezone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(value));
}

function timeLabel(value: string, timezone: string) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(value));
}

export function PublicClassesView({
  client = browserPublicClassCatalogClient,
}: {
  client?: PublicClassCatalogClient;
}) {
  const session = useSessionContext()?.session;
  const inCustomerShell = Boolean(
    session?.roles.includes('CUSTOMER') && session.roles.every((role) => role === 'CUSTOMER'),
  );
  const [branches, setBranches] = useState<PublicBranch[]>([]);
  const [branchId, setBranchId] = useState('');
  const [slots, setSlots] = useState<PublicClassSlot[]>([]);
  const [day, setDay] = useState('');
  const [classType, setClassType] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    setStatus('loading');
    void client
      .list({})
      .then((result) => {
        if (!active) return;
        setBranches(result.branches);
        setStatus('ready');
        const query = new URLSearchParams(window.location.search);
        const requestedBranchId = query.get('branch');
        const requestedStudio = query.get('studio');
        const requestedBranch = result.branches.find(
          ({ id, name }) =>
            id === requestedBranchId ||
            name.toLocaleLowerCase('id-ID') === requestedStudio?.toLocaleLowerCase('id-ID'),
        );
        const preferredBranch =
          requestedBranch ?? result.branches.find(({ id }) => id === session?.preferredBranch?.id);
        if (preferredBranch) {
          setBranchId(preferredBranch.id);
          void load(preferredBranch.id);
        }
      })
      .catch((error) => {
        if (!active) return;
        setMessage(publicCatalogFailure(error));
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [client, session?.preferredBranch?.id]);

  const load = async (selectedBranch = branchId) => {
    if (!selectedBranch) return;
    setStatus('loading');
    setMessage('');
    try {
      const from = new Date();
      const until = new Date(from.getTime() + 14 * 86_400_000);
      const result = await client.list({ branchId: selectedBranch, from, until });
      setBranches(result.branches);
      setSlots(result.items);
      setStatus('ready');
    } catch (error) {
      setSlots([]);
      setMessage(publicCatalogFailure(error));
      setStatus('error');
    }
  };

  const branch = branches.find((item) => item.id === branchId);
  const classTypes = useMemo(
    () => [...new Map(slots.map((slot) => [slot.classType.id, slot.classType])).values()],
    [slots],
  );
  const visible = slots.filter(
    (slot) =>
      (!day || dayKey(slot.startAt, slot.timezone) === day) &&
      (!classType || slot.classType.id === classType),
  );
  const grouped = visible.reduce<Record<string, PublicClassSlot[]>>((groups, slot) => {
    const key = dayKey(slot.startAt, slot.timezone);
    groups[key] = [...(groups[key] ?? []), slot];
    return groups;
  }, {});

  return (
    <div className="min-w-0 overflow-x-clip bg-dd-cream font-sans text-dd-ink">
      <a className="skip-link" href="#catalog-main">
        Langsung ke jadwal
      </a>
      {!inCustomerShell && <PublicHeader />}

      <main id="catalog-main">
        <PublicPageHero
          eyebrow="Jadwal Daily Dose"
          title="Bergerak sesuai ritme Anda."
          description="Pilih studio dan temukan kelas aktif untuk dua minggu ke depan. Waktu dan kapasitas ditampilkan langsung dari sistem."
        />
        <section className="py-12 sm:py-16" id="schedule" aria-labelledby="catalog-filter-title">
          <div className={publicContainer}>
            <PublicSectionHeading
              eyebrow="01 — Pilih jadwal"
              title="Kelas dua minggu ke depan"
              titleId="catalog-filter-title"
              description="Temukan kelas berdasarkan studio, tanggal, dan tipe latihan."
              aside={
                branch ? (
                  <p className="rounded-dd-md border border-dd-line bg-white px-4 py-3 text-sm shadow-sm">
                    <strong className="block">{branch.name}</strong>
                    <span className="text-dd-muted">{branch.timezone}</span>
                  </p>
                ) : (
                  <p className="text-sm text-dd-muted">Pilih studio tanpa pilihan otomatis.</p>
                )
              }
            />

            <div className="grid gap-4 rounded-dd-lg border border-dd-line bg-white p-4 shadow-dd-card md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
              <label className="grid gap-2 text-sm font-semibold">
                Studio
                <select
                  className={publicField}
                  aria-label="Studio"
                  value={branchId}
                  onChange={(event) => {
                    const value = event.target.value;
                    setBranchId(value);
                    setSlots([]);
                    setDay('');
                    setClassType('');
                    const query = new URLSearchParams(window.location.search);
                    if (value) query.set('branch', value);
                    else query.delete('branch');
                    query.delete('studio');
                    window.history.replaceState(
                      window.history.state,
                      '',
                      `${window.location.pathname}${query.size ? `?${query}` : ''}${window.location.hash}`,
                    );
                    if (value) void load(value);
                  }}
                >
                  <option value="">Pilih studio</option>
                  {branches.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.name} · {item.code}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Tanggal
                <input
                  className={publicField}
                  aria-label="Tanggal"
                  type="date"
                  value={day}
                  disabled={!branchId}
                  onChange={(event) => setDay(event.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Tipe kelas
                <select
                  className={publicField}
                  aria-label="Tipe kelas"
                  value={classType}
                  disabled={!branchId}
                  onChange={(event) => setClassType(event.target.value)}
                >
                  <option value="">Semua tipe</option>
                  {classTypes.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className={publicSecondaryButton}
                type="button"
                disabled={!day && !classType}
                onClick={() => {
                  setDay('');
                  setClassType('');
                }}
              >
                Reset filter
              </button>
            </div>

            {status === 'loading' ? (
              <div
                className="mt-8 rounded-dd-lg border border-dd-line bg-white p-10 text-center shadow-dd-card"
                role="status"
              >
                Memuat jadwal authoritative…
              </div>
            ) : status === 'error' ? (
              <div
                className="mt-8 rounded-dd-lg border border-dd-danger/30 bg-dd-danger-soft p-10 text-center"
                role="alert"
              >
                <strong className="font-serif text-2xl">Jadwal belum tersedia</strong>
                <p className="mt-2">{message}</p>
                <button
                  className={`${publicSecondaryButton} mt-5`}
                  type="button"
                  onClick={() =>
                    void (branchId
                      ? load()
                      : client.list({}).then((result) => {
                          setBranches(result.branches);
                          setStatus('ready');
                        }))
                  }
                >
                  Coba lagi
                </button>
              </div>
            ) : !branchId ? (
              <div className="mt-8 rounded-dd-lg border border-dd-line bg-white p-10 text-center shadow-dd-card">
                <strong className="font-serif text-2xl">Pilih studio untuk melihat kelas</strong>
                <p className="mt-2 text-dd-muted">
                  Kami tidak memilih lokasi pertama secara otomatis agar jadwal selalu sesuai
                  pilihan Anda.
                </p>
              </div>
            ) : visible.length === 0 ? (
              <div className="mt-8 rounded-dd-lg border border-dd-line bg-white p-10 text-center shadow-dd-card">
                <strong className="font-serif text-2xl">Belum ada kelas pada filter ini</strong>
                <p className="mt-2 text-dd-muted">
                  Ubah tanggal atau tipe kelas untuk melihat pilihan lain.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-6" aria-live="polite">
                {Object.entries(grouped).map(([date, items]) => (
                  <section
                    className="overflow-hidden rounded-dd-lg border border-dd-line bg-white shadow-dd-card"
                    aria-labelledby={`day-${date}`}
                    key={date}
                  >
                    <header className="border-b border-dd-line bg-dd-paper px-5 py-4">
                      <span className="text-xs font-bold tracking-wider text-dd-brass">{date}</span>
                      <h3 className="mt-1 font-serif text-2xl font-semibold" id={`day-${date}`}>
                        {dateLabel(items[0]!.startAt, items[0]!.timezone)}
                      </h3>
                    </header>
                    <div className="divide-y divide-dd-line">
                      {items.map((slot) => (
                        <article
                          className="grid gap-4 p-5 sm:grid-cols-[100px_minmax(0,1fr)_120px_auto] sm:items-center"
                          key={slot.id}
                        >
                          <div>
                            <strong className="block text-lg">
                              {timeLabel(slot.startAt, slot.timezone)}
                            </strong>
                            <span className="text-sm text-dd-muted">
                              sampai {timeLabel(slot.endAt, slot.timezone)}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-dd-forest">
                              {slot.classType.code}
                            </span>
                            <h4 className="mt-1 font-serif text-xl font-semibold">
                              {slot.classType.name}
                            </h4>
                            <p className="mt-1 text-sm text-dd-muted">
                              {slot.status === 'CONFIRMED'
                                ? 'Kelas dikonfirmasi'
                                : 'Terbuka untuk booking'}
                            </p>
                          </div>
                          <div>
                            <span className="block text-xs text-dd-muted">Ketersediaan</span>
                            <strong className="mt-1 block">
                              {slot.available > 0 ? `${slot.available} tempat` : 'Penuh'}
                            </strong>
                          </div>
                          <a
                            className={`${slot.available > 0 ? publicPrimaryButton : `${publicSecondaryButton} pointer-events-none opacity-50`} w-full sm:w-auto`}
                            aria-disabled={slot.available < 1}
                            href={
                              slot.available > 0
                                ? session?.roles.some((role) => role !== 'CUSTOMER')
                                  ? '/workspace/classes'
                                  : session?.identityVerificationStatus === 'APPROVED'
                                    ? `/bookings/new?slot=${slot.id}`
                                    : session
                                      ? '/account/verification'
                                      : `/sign-in?returnTo=${encodeURIComponent(`/bookings/new?slot=${slot.id}`)}`
                                : undefined
                            }
                          >
                            {slot.available > 0 ? 'Pilih kelas' : 'Penuh'}
                          </a>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      {!inCustomerShell && <PublicFooter />}
    </div>
  );
}
