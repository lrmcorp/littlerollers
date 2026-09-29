'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Check, Ticket } from 'lucide-react';
import {
  browserPublicClassCatalogClient,
  publicCatalogFailure,
  type PublicBranch,
  type PublicClassCatalogClient,
  type PublicClassSlot,
} from '@/api-clients/public-class-catalog-client';
import {
  browserLedgerClient,
  type LedgerBalance,
  type LedgerClient,
} from '@/api-clients/ledger-client';
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
import { SearchSelect } from '../components/forms';
import { isCustomerOnlySession } from '@/lib/session-audience';

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

function durationLabel(startAt: string, endAt: string) {
  const minutes = Math.max(
    0,
    Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60_000),
  );
  return `${minutes} menit`;
}

export function PublicClassesView({
  client = browserPublicClassCatalogClient,
  ledgerClient = browserLedgerClient,
}: {
  client?: PublicClassCatalogClient;
  ledgerClient?: LedgerClient;
}) {
  const sessionContext = useSessionContext();
  const session = sessionContext?.session;
  const inCustomerShell = isCustomerOnlySession(session);
  const isCustomer = Boolean(session && inCustomerShell);
  const isStaff = Boolean(session && !isCustomerOnlySession(session));
  // Staf hanya diarahkan ke workspace (cutoff booking tidak relevan); customer/tamu mengikuti canBook.
  const isActionable = (slot: PublicClassSlot) => (isStaff ? slot.available > 0 : slot.canBook);
  const [branches, setBranches] = useState<PublicBranch[]>([]);
  const [branchId, setBranchId] = useState('');
  const [slots, setSlots] = useState<PublicClassSlot[]>([]);
  const [day, setDay] = useState('');
  const [classType, setClassType] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [customerPackages, setCustomerPackages] = useState<LedgerBalance[]>([]);
  const [onlyEligible, setOnlyEligible] = useState(false);

  useEffect(() => {
    let active = true;
    if (session && inCustomerShell) {
      ledgerClient
        .list(undefined, undefined, undefined, 'ACTIVE')
        .then((res) => {
          if (!active) return;
          setCustomerPackages(
            res.items.filter((item) => item.status === 'ACTIVE' && item.available > 0),
          );
        })
        .catch(() => {
          if (!active) return;
          setCustomerPackages([]);
        });
    } else {
      setCustomerPackages([]);
    }
    return () => {
      active = false;
    };
  }, [session, inCustomerShell, ledgerClient]);

  const findMatchingPackage = (slot: PublicClassSlot) => {
    if (!customerPackages.length) return null;
    return customerPackages.find((pkg) => {
      const branchMatches =
        !pkg.packageBranchId ||
        pkg.packageBranchId === 'global' ||
        pkg.packageBranchId === slot.branchId;
      const classTypeMatches = !pkg.classTypeId || pkg.classTypeId === slot.classType.id;
      const hasAvailable = pkg.available > 0;
      const notExpired = new Date(pkg.expiryAt) > new Date();
      return branchMatches && classTypeMatches && hasAvailable && notExpired;
    });
  };

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
        setDay(query.get('date') ?? '');
        setClassType(query.get('classType') ?? '');
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

  useEffect(() => {
    if (branches.length > 0 && customerPackages.length > 0) {
      const query = new URLSearchParams(window.location.search);
      if (query.get('branch') || query.get('studio')) return;
      const pkgBranchId = customerPackages[0]?.packageBranchId || customerPackages[0]?.branchId;
      const hasActivePkgInCurrentBranch = customerPackages.some(
        (pkg) =>
          !pkg.packageBranchId ||
          pkg.packageBranchId === 'global' ||
          pkg.packageBranchId === branchId,
      );
      if (!hasActivePkgInCurrentBranch && pkgBranchId) {
        const matchingBranch = branches.find((b) => b.id === pkgBranchId);
        if (matchingBranch && matchingBranch.id !== branchId) {
          setBranchId(matchingBranch.id);
          void load(matchingBranch.id);
        }
      }
    }
  }, [branches, branchId, customerPackages]);

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

  const retryCatalog = async () => {
    if (branchId) {
      await load(branchId);
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const result = await client.list({});
      setBranches(result.branches);
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
        await load(preferredBranch.id);
      } else {
        setStatus('ready');
      }
    } catch (error) {
      setMessage(publicCatalogFailure(error));
      setStatus('error');
    }
  };

  const branch = branches.find((item) => item.id === branchId);
  const classTypes = useMemo(
    () => [...new Map(slots.map((slot) => [slot.classType.id, slot.classType])).values()],
    [slots],
  );
  const visible = slots.filter((slot) => {
    if (day && dayKey(slot.startAt, slot.timezone) !== day) return false;
    if (classType && slot.classType.id !== classType) return false;
    if (onlyEligible && (!isActionable(slot) || !findMatchingPackage(slot))) return false;
    return true;
  });
  const grouped = visible.reduce<Record<string, PublicClassSlot[]>>((groups, slot) => {
    const key = dayKey(slot.startAt, slot.timezone);
    groups[key] = [...(groups[key] ?? []), slot];
    return groups;
  }, {});
  const availableDays = [
    ...new Set(slots.map((slot) => dayKey(slot.startAt, slot.timezone))),
  ].slice(0, 14);
  const updateQuery = (updates: Record<string, string>) => {
    const query = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) query.set(key, value);
      else query.delete(key);
    });
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${query.size ? `?${query}` : ''}${window.location.hash}`,
    );
  };

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
          variant={inCustomerShell ? 'compact' : 'default'}
        />
        <section
          className={inCustomerShell ? 'py-7 sm:py-10' : 'py-12 sm:py-16'}
          id="schedule"
          aria-labelledby="catalog-filter-title"
        >
          <div className={publicContainer}>
            <PublicSectionHeading
              eyebrow="01 — Pilih jadwal"
              title="Kelas dua minggu ke depan"
              titleId="catalog-filter-title"
              description="Temukan kelas berdasarkan studio, tanggal, dan tipe latihan."
              aside={
                inCustomerShell ? undefined : branch ? (
                  <p className="rounded-dd-md border border-dd-line bg-white px-4 py-3 text-sm shadow-sm">
                    <strong className="block">{branch.name}</strong>
                    <span className="text-dd-muted">{branch.timezone}</span>
                  </p>
                ) : (
                  <p className="text-sm text-dd-muted">Pilih studio tanpa pilihan otomatis.</p>
                )
              }
            />

            {isCustomer && session?.identityVerificationStatus && session.identityVerificationStatus !== 'APPROVED' && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-dd-lg border border-amber-200 bg-amber-50 p-4 text-xs sm:text-sm text-amber-900">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="size-4 text-amber-700 shrink-0" />
                  <span>
                    Verifikasi identitas (KTP &amp; Selfie) Anda sedang ditinjau atau perlu dilengkapi sebelum sesi dapat direservasi mandiri.
                  </span>
                </div>
                <Link href="/account/verification" className="font-semibold text-amber-800 underline shrink-0 hover:text-amber-950">
                  Cek Status Verifikasi →
                </Link>
              </div>
            )}

            {isCustomer && customerPackages.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-dd-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs sm:text-sm shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-dd-forest">
                    <Ticket className="size-3.5" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-semibold text-dd-forest">Paket Aktif: </span>
                    <strong className="text-dd-ink">{customerPackages[0]!.packageName}</strong>
                    <span className="text-dd-muted"> · {customerPackages[0]!.branchName}</span>
                    <span className="text-dd-muted"> · Sisa </span>
                    <strong className="text-emerald-800 font-semibold">{customerPackages[0]!.available} sesi</strong>
                    <span className="text-dd-muted">
                      {' '}(Berlaku s/d{' '}
                      {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(customerPackages[0]!.expiryAt))})
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {branchId !== (customerPackages[0]?.packageBranchId || customerPackages[0]?.branchId) && (
                    <button
                      type="button"
                      onClick={() => {
                        const targetBranchId = customerPackages[0]?.packageBranchId || customerPackages[0]?.branchId;
                        if (targetBranchId) {
                          setBranchId(targetBranchId);
                          void load(targetBranchId);
                        }
                      }}
                      className="font-semibold text-dd-forest underline hover:text-dd-forest-dark cursor-pointer"
                    >
                      Buka jadwal di {customerPackages[0]!.branchName} →
                    </button>
                  )}
                  <label className="inline-flex items-center gap-2 font-medium text-dd-forest cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={onlyEligible}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setOnlyEligible(checked);
                        if (checked) {
                          const targetBranchId = customerPackages[0]?.packageBranchId || customerPackages[0]?.branchId;
                          if (targetBranchId && branchId !== targetBranchId) {
                            setBranchId(targetBranchId);
                            void load(targetBranchId);
                          }
                        }
                      }}
                      className="size-4 accent-dd-forest rounded"
                    />
                    <span>Hanya kelas sesuai paket saya</span>
                  </label>
                  <Link href="/account/packages" className="font-semibold text-dd-forest hover:underline">
                    Kelola paket →
                  </Link>
                </div>
              </div>
            )}

            {branchId && availableDays.length > 0 && (
              <div
                className="mb-4 flex gap-2 overflow-x-auto pb-1"
                role="group"
                aria-label="Pilih tanggal cepat"
              >
                <button
                  type="button"
                  className={`${!day ? 'border-dd-forest bg-dd-forest text-white' : 'border-dd-line bg-white text-dd-ink'} min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold`}
                  onClick={() => {
                    setDay('');
                    updateQuery({ date: '' });
                  }}
                >
                  Semua
                </button>
                {availableDays.map((date) => (
                  <button
                    type="button"
                    key={date}
                    className={`${day === date ? 'border-dd-forest bg-dd-forest text-white' : 'border-dd-line bg-white text-dd-ink'} min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold`}
                    onClick={() => {
                      setDay(date);
                      updateQuery({ date });
                    }}
                  >
                    {dateLabel(
                      slots.find((slot) => dayKey(slot.startAt, slot.timezone) === date)!.startAt,
                      branch?.timezone ?? 'Asia/Jakarta',
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-4 rounded-dd-lg border border-dd-line bg-white p-4 shadow-dd-card md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
              <SearchSelect
                label="Pilih Lokasi Studio"
                value={branchId}
                placeholder="Pilih lokasi studio..."
                options={branches.map((item) => ({
                  id: item.id,
                  label: item.name,
                  description: item.code,
                }))}
                onChange={(value) => {
                  setBranchId(value);
                  setSlots([]);
                  setDay('');
                  setClassType('');
                  updateQuery({ branch: value, studio: '', date: '', classType: '' });
                  if (value) void load(value);
                }}
              />
              <label className="grid gap-2 text-sm font-semibold">
                Tanggal
                <input
                  className={publicField}
                  aria-label="Tanggal"
                  type="date"
                  value={day}
                  disabled={!branchId}
                  onChange={(event) => {
                    setDay(event.target.value);
                    updateQuery({ date: event.target.value });
                  }}
                />
              </label>
              <SearchSelect
                label="Tipe kelas"
                value={classType}
                disabled={!branchId}
                placeholder="Semua tipe"
                options={classTypes.map((item) => ({ id: item.id, label: item.name }))}
                onChange={(value) => {
                  setClassType(value);
                  updateQuery({ classType: value });
                }}
              />
              <button
                className={publicSecondaryButton}
                type="button"
                disabled={!day && !classType}
                onClick={() => {
                  setDay('');
                  setClassType('');
                  updateQuery({ date: '', classType: '' });
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
                Memuat jadwal kelas…
              </div>
            ) : status === 'error' ? (
              <div
                className="mt-8 rounded-dd-lg border border-dd-danger/30 bg-dd-danger-soft p-10 text-center"
                role="alert"
              >
                <strong className="font-sans text-2xl">Jadwal belum tersedia</strong>
                <p className="mt-2">{message}</p>
                <button
                  className={`${publicSecondaryButton} mt-5`}
                  type="button"
                  onClick={() => void retryCatalog()}
                >
                  Coba lagi
                </button>
              </div>
            ) : !branchId ? (
              <div className="mt-8 rounded-dd-lg border border-dd-line bg-white p-10 text-center shadow-dd-card">
                <strong className="font-sans text-2xl">Pilih studio untuk melihat kelas</strong>
                <p className="mt-2 text-dd-muted">
                  Silakan pilih studio terlebih dahulu untuk menampilkan jadwal kelas yang tersedia.
                </p>
              </div>
            ) : visible.length === 0 ? (
              <div className="mt-8 rounded-dd-lg border border-dd-line bg-white p-10 text-center shadow-dd-card">
                <strong className="font-sans text-2xl">Belum ada kelas pada filter ini</strong>
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
                      <h3 className="mt-1 font-sans text-2xl font-semibold" id={`day-${date}`}>
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
                              sampai {timeLabel(slot.endAt, slot.timezone)} ·{' '}
                              {durationLabel(slot.startAt, slot.endAt)}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-dd-forest">
                              {slot.classType.code}
                            </span>
                            <h4 className="mt-1 font-sans text-xl font-semibold">
                              {slot.classType.name}
                            </h4>
                            <p className="mt-1 text-sm text-dd-muted">
                              {slot.status === 'CONFIRMED'
                                ? 'Kelas dikonfirmasi'
                                : 'Terbuka untuk booking'}
                            </p>
                            {slot.instructor?.displayName && (
                              <p className="mt-1 text-xs font-semibold text-dd-muted">
                                Instruktur · {slot.instructor.displayName}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold">
                              <Link
                                href={`/schedule/${slot.id}`}
                                className="text-dd-forest underline-offset-4 hover:underline"
                              >
                                Detail jadwal
                              </Link>
                              <Link
                                href={`/classes/${
                                  slot.classType.code === 'GROUP_CLASS'
                                    ? 'group-class'
                                    : slot.classType.code === 'PRIVATE_CLASS'
                                      ? 'private-class'
                                      : slot.classType.code === 'SEMI_PRIVATE'
                                        ? 'semi-private'
                                        : 'private-group'
                                }`}
                                className="text-dd-forest underline-offset-4 hover:underline"
                              >
                                Detail kelas
                              </Link>
                            </div>
                          </div>
                          <div>
                            <span className="block text-xs text-dd-muted">Ketersediaan</span>
                            <strong className="mt-1 block">
                              {slot.available > 0
                                ? `${slot.available}/${slot.capacity} tempat`
                                : `Penuh · 0/${slot.capacity}`}
                            </strong>
                            {isCustomer && slot.canBook && findMatchingPackage(slot) && (
                              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                                <Check className="size-3" /> Paket Sesuai ({findMatchingPackage(slot)!.available} sesi)
                              </span>
                            )}
                            {isCustomer && slot.canBook && !findMatchingPackage(slot) && customerPackages.length > 0 && (
                              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200">
                                Perlu paket studio/kelas ini
                              </span>
                            )}
                          </div>
                          <a
                            className={`${
                              isActionable(slot)
                                ? isCustomer && !findMatchingPackage(slot)
                                  ? `${publicSecondaryButton} border-dd-forest text-dd-forest hover:bg-emerald-50`
                                  : publicPrimaryButton
                                : `${publicSecondaryButton} pointer-events-none opacity-50`
                            } w-full sm:w-auto`}
                            aria-disabled={!isActionable(slot)}
                            href={
                              isActionable(slot)
                                ? isStaff
                                  ? '/workspace/classes'
                                  : isCustomer
                                    ? findMatchingPackage(slot)
                                      ? `/bookings/new?slot=${slot.id}`
                                      : `/packages?branch=${encodeURIComponent(slot.branchId)}&classType=${encodeURIComponent(slot.classType.id)}&slot=${encodeURIComponent(slot.id)}`
                                    : session
                                      ? `/bookings/new?slot=${slot.id}`
                                      : `/sign-in?returnTo=${encodeURIComponent(`/bookings/new?slot=${slot.id}`)}`
                                : undefined
                            }
                          >
                            {slot.available < 1
                              ? 'Penuh'
                              : !isActionable(slot)
                                ? 'Pemesanan ditutup'
                                : isStaff
                                ? 'Buka workspace kelas'
                                : isCustomer && !findMatchingPackage(slot)
                                ? 'Beli paket untuk kelas ini'
                                : 'Lanjutkan booking'}
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
