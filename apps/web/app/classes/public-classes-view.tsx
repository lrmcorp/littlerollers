'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Check, MapPin, Ticket } from 'lucide-react';
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
import { publicField, publicPrimaryButton, publicSecondaryButton } from '../components/public/public-styles';
import { useSessionContext } from '../session-context';
import { SearchSelect } from '../components/forms';
import { isCustomerOnlySession } from '@/lib/session-audience';
import { timezoneLabel } from './class-slot-presenters';

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
        pkg.isMultiBranch === true ||
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
        let savedBranchId: string | null = null;
        try {
          savedBranchId = window.localStorage.getItem('dd_last_selected_branch');
        } catch {}
        const preferredBranch =
          requestedBranch ??
          result.branches.find(({ id }) => id === session?.preferredBranch?.id) ??
          (savedBranchId ? result.branches.find(({ id }) => id === savedBranchId) : undefined);
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
          handleSelectBranch(matchingBranch.id);
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

  const handleSelectBranch = (selectedId: string) => {
    setBranchId(selectedId);
    try {
      if (selectedId) {
        window.localStorage.setItem('dd_last_selected_branch', selectedId);
      } else {
        window.localStorage.removeItem('dd_last_selected_branch');
      }
    } catch {}
    setSlots([]);
    setDay('');
    setClassType('');
    updateQuery({ branch: selectedId, studio: '', date: '', classType: '' });
    if (selectedId) void load(selectedId);
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
      let savedBranchId: string | null = null;
      try {
        savedBranchId = window.localStorage.getItem('dd_last_selected_branch');
      } catch {}
      const preferredBranch =
        requestedBranch ??
        result.branches.find(({ id }) => id === session?.preferredBranch?.id) ??
        (savedBranchId ? result.branches.find(({ id }) => id === savedBranchId) : undefined);
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

  const calendarDays = useMemo(() => {
    if (!branch) return [];
    const tz = branch.timezone || 'Asia/Jakarta';
    const now = new Date();
    let baseDate = now;
    if (slots.length > 0) {
      const earliestSlotTime = Math.min(...slots.map((s) => new Date(s.startAt).getTime()));
      if (Math.abs(earliestSlotTime - now.getTime()) > 14 * 86_400_000) {
        baseDate = new Date(earliestSlotTime);
      }
    }

    const days: {
      key: string;
      label: string;
      weekday: string;
      dayNum: string;
      count: number;
    }[] = [];

    for (let i = 0; i < 14; i++) {
      const d = new Date(baseDate.getTime() + i * 86_400_000);
      const key = dayKey(d.toISOString(), tz);
      const count = slots.filter((slot) => dayKey(slot.startAt, slot.timezone) === key).length;
      const weekday = new Intl.DateTimeFormat('id-ID', { timeZone: tz, weekday: 'short' }).format(d);
      const dayNum = new Intl.DateTimeFormat('id-ID', { timeZone: tz, day: 'numeric', month: 'short' }).format(d);
      const label = dateLabel(d.toISOString(), tz);
      days.push({ key, label, weekday, dayNum, count });
    }

    const generatedKeys = new Set(days.map((d) => d.key));
    slots.forEach((s) => {
      const key = dayKey(s.startAt, s.timezone);
      if (!generatedKeys.has(key)) {
        generatedKeys.add(key);
        const d = new Date(s.startAt);
        const count = slots.filter((slot) => dayKey(slot.startAt, slot.timezone) === key).length;
        const weekday = new Intl.DateTimeFormat('id-ID', { timeZone: tz, weekday: 'short' }).format(d);
        const dayNum = new Intl.DateTimeFormat('id-ID', { timeZone: tz, day: 'numeric', month: 'short' }).format(d);
        const label = dateLabel(s.startAt, tz);
        days.push({ key, label, weekday, dayNum, count });
      }
    });

    return days;
  }, [branch, slots]);

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
    <div className="ed-scope min-w-0 overflow-x-clip bg-ed-cream text-ed-ink">
      <a className="skip-link" href="#catalog-main">
        Langsung ke jadwal
      </a>
      {!inCustomerShell && <PublicHeader variant="editorial" />}

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
          <div className="ed-wrap">
            <PublicSectionHeading
              eyebrow="01 — Pilih jadwal"
              title="Kelas dua minggu ke depan"
              titleId="catalog-filter-title"
              description="Temukan kelas berdasarkan studio, tanggal, dan tipe latihan."
              aside={
                inCustomerShell ? undefined : branch ? (
                  <p className="rounded-none border border-ed-line bg-white px-4 py-3 text-sm ">
                    <strong className="block">{branch.name}</strong>
                    <span className="text-ed-muted">{timezoneLabel(branch.timezone)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-ed-muted">Pilih studio untuk melihat jadwal kelas.</p>
                )
              }
            />

            {isCustomer &&
              session?.identityVerificationStatus &&
              session.identityVerificationStatus !== 'APPROVED' && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-none border border-dd-warning/30 bg-dd-warning-soft p-4 text-xs sm:text-sm text-dd-warning">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="size-4 text-dd-warning shrink-0" />
                    <span>
                      Verifikasi identitas (KTP &amp; Selfie) Anda sedang ditinjau atau perlu
                      dilengkapi sebelum sesi dapat direservasi mandiri.
                    </span>
                  </div>
                  <Link
                    href="/account/verification"
                    className="font-semibold text-dd-warning underline shrink-0 hover:text-ed-ink"
                  >
                    Cek Status Verifikasi →
                  </Link>
                </div>
              )}

            {isCustomer && customerPackages.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-none border border-dd-success/30 bg-dd-success-soft/70 p-4 text-xs sm:text-sm ">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-dd-success/20 text-ed-green">
                    <Ticket className="size-3.5" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-semibold text-ed-green">Paket Aktif: </span>
                    <strong className="text-ed-ink">{customerPackages[0]!.packageName}</strong>
                    <span className="text-ed-muted"> · {customerPackages[0]!.branchName}</span>
                    <span className="text-ed-muted"> · Sisa </span>
                    <strong className="text-dd-success font-semibold">
                      {customerPackages[0]!.available} sesi
                    </strong>
                    <span className="text-ed-muted">
                      {' '}
                      (Berlaku s/d{' '}
                      {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(
                        new Date(customerPackages[0]!.expiryAt),
                      )}
                      )
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {branchId !==
                    (customerPackages[0]?.packageBranchId || customerPackages[0]?.branchId) && (
                    <button
                      type="button"
                      onClick={() => {
                        const targetBranchId =
                          customerPackages[0]?.packageBranchId || customerPackages[0]?.branchId;
                        if (targetBranchId) {
                          handleSelectBranch(targetBranchId);
                        }
                      }}
                      className="font-semibold text-ed-green underline hover:text-ed-forest cursor-pointer"
                    >
                      Buka jadwal di {customerPackages[0]!.branchName} →
                    </button>
                  )}
                  <label className="inline-flex items-center gap-2 font-medium text-ed-green cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={onlyEligible}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setOnlyEligible(checked);
                        if (checked) {
                          const targetBranchId =
                            customerPackages[0]?.packageBranchId || customerPackages[0]?.branchId;
                          if (targetBranchId && branchId !== targetBranchId) {
                            handleSelectBranch(targetBranchId);
                          }
                        }
                      }}
                      className="size-4 accent-ed-green rounded"
                    />
                    <span>Hanya kelas sesuai paket saya</span>
                  </label>
                  <Link
                    href="/account/packages"
                    className="font-semibold text-ed-green hover:underline"
                  >
                    Kelola paket →
                  </Link>
                </div>
              </div>
            )}

            {/* Studio Quick Buttons (UAT #23) */}
            {branches.length > 0 && (
              <div className="mb-6 rounded-none border border-ed-line bg-white p-4 sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-ed-green">
                      Pilih Lokasi Studio
                    </span>
                    <h3 className="font-sans text-base font-bold text-ed-ink sm:text-lg">
                      Mau latihan di studio mana?
                    </h3>
                  </div>
                  {branch && (
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-ed-green/10 px-3 py-1 text-xs font-semibold text-ed-green sm:self-auto">
                      <MapPin className="size-3.5" /> Studio Aktif: {branch.name}
                    </span>
                  )}
                </div>
                <div
                  className="mt-3 flex flex-wrap gap-2.5"
                  role="group"
                  aria-label="Pilihan Cepat Studio"
                >
                  {branches.map((b) => {
                    const isSelected = b.id === branchId;
                    return (
                      <button
                        type="button"
                        key={b.id}
                        onClick={() => handleSelectBranch(b.id)}
                        className={`min-h-[44px] rounded-none px-4 py-2 text-sm font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                          isSelected
                            ? 'border-ed-green bg-ed-green text-white  ring-2 ring-ed-green/20'
                            : 'border-ed-line bg-ed-cream text-ed-ink hover:border-ed-green/50 hover:bg-white'
                        }`}
                      >
                        <MapPin className={`size-4 ${isSelected ? 'text-white' : 'text-ed-green'}`} />
                        <span>{b.name}</span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-ed-line/50 text-ed-muted'
                          }`}
                        >
                          {b.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 14 Days Calendar Strip (UAT #23) */}
            {branchId && status !== 'loading' && calendarDays.length > 0 && (
              <div className="mb-6 rounded-none border border-ed-line bg-white p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-ed-green">
                      Jadwal 14 Hari ke Depan
                    </span>
                    <h4 className="font-sans text-sm font-bold text-ed-ink sm:text-base">
                      Pilih tanggal untuk melihat sesi
                    </h4>
                  </div>
                  {day && (
                    <button
                      type="button"
                      onClick={() => {
                        setDay('');
                        updateQuery({ date: '' });
                      }}
                      className="text-xs font-semibold text-ed-green underline hover:text-ed-forest cursor-pointer"
                    >
                      Lihat Semua Tanggal
                    </button>
                  )}
                </div>
                <div
                  className="flex gap-2 overflow-x-auto pb-2 pt-1"
                  role="group"
                  aria-label="Pilih tanggal cepat"
                >
                  <button
                    type="button"
                    className={`${
                      !day
                        ? 'border-ed-green bg-ed-green text-white  ring-2 ring-ed-green/20'
                        : 'border-ed-line bg-ed-cream text-ed-ink hover:border-ed-green/50 hover:bg-white'
                    } min-h-[50px] shrink-0 rounded-none border px-4 py-2 text-center text-sm font-semibold transition-all cursor-pointer flex flex-col items-center justify-center`}
                    onClick={() => {
                      setDay('');
                      updateQuery({ date: '' });
                    }}
                  >
                    <span>Semua</span>
                    <span className="text-[10px] opacity-80">{slots.length} sesi</span>
                  </button>
                  {calendarDays.map((item) => {
                    const isSelected = day === item.key;
                    return (
                      <button
                        type="button"
                        key={item.key}
                        className={`${
                          isSelected
                            ? 'border-ed-green bg-ed-green text-white  ring-2 ring-ed-green/20'
                            : 'border-ed-line bg-ed-cream text-ed-ink hover:border-ed-green/50 hover:bg-white'
                        } min-h-[50px] min-w-[76px] shrink-0 rounded-none border px-3 py-1.5 text-center transition-all cursor-pointer flex flex-col items-center justify-center`}
                        onClick={() => {
                          setDay(item.key);
                          updateQuery({ date: item.key });
                        }}
                        aria-label={`${item.label}, ${item.count} kelas tersedia`}
                      >
                        <span
                          className={`text-[11px] font-medium uppercase ${
                            isSelected ? 'text-white/80' : 'text-ed-muted'
                          }`}
                        >
                          {item.weekday}
                        </span>
                        <span className="text-sm font-bold leading-tight">{item.dayNum}</span>
                        <span
                          className={`mt-0.5 rounded px-1 text-[10px] font-semibold ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : item.count > 0
                                ? 'bg-ed-green/10 text-ed-green'
                                : 'text-ed-muted/60'
                          }`}
                        >
                          {item.count > 0 ? `${item.count} sesi` : '0 sesi'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid gap-4 rounded-none border border-ed-line bg-white p-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
              <SearchSelect
                variant="editorial"
                label="Pilih Lokasi Studio"
                value={branchId}
                placeholder="Pilih lokasi studio..."
                options={branches.map((item) => ({
                  id: item.id,
                  label: item.name,
                  description: item.code,
                }))}
                onChange={(value) => {
                  handleSelectBranch(value);
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
                variant="editorial"
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
                className="mt-8 rounded-none border border-ed-line bg-white p-10 text-center "
                role="status"
              >
                Memuat jadwal kelas…
              </div>
            ) : status === 'error' ? (
              <div
                className="mt-8 rounded-none border border-dd-danger/30 bg-dd-danger-soft p-10 text-center"
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
              <div className="mt-8 rounded-none border border-ed-line bg-white p-10 text-center ">
                <strong className="font-sans text-2xl">Pilih studio untuk melihat kelas</strong>
                <p className="mt-2 text-ed-muted">
                  Silakan pilih studio terlebih dahulu untuk menampilkan jadwal kelas yang tersedia.
                </p>
              </div>
            ) : visible.length === 0 ? (
              <div className="mt-8 rounded-none border border-ed-line bg-white p-10 text-center ">
                <strong className="font-sans text-2xl">Belum ada kelas pada filter ini</strong>
                <p className="mt-2 text-ed-muted">
                  Ubah tanggal atau tipe kelas untuk melihat pilihan lain.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  {day && (
                    <button
                      type="button"
                      className={publicSecondaryButton}
                      onClick={() => {
                        setDay('');
                        updateQuery({ date: '' });
                      }}
                    >
                      Lihat Semua Tanggal
                    </button>
                  )}
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Daily%20Dose,%20saya%20ingin%20tanya%20jadwal%20kelas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${publicPrimaryButton} inline-flex items-center gap-2`}
                  >
                    Bantuan CS WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-8 grid gap-6" aria-live="polite">
                {Object.entries(grouped).map(([date, items]) => (
                  <section
                    className="overflow-hidden rounded-none border border-ed-line bg-white "
                    aria-labelledby={`day-${date}`}
                    key={date}
                  >
                    <header className="border-b border-ed-line bg-ed-cream px-5 py-4">
                      <span className="text-xs font-bold tracking-wider text-ed-green">{date}</span>
                      <h3 className="mt-1 font-sans text-2xl font-semibold" id={`day-${date}`}>
                        {dateLabel(items[0]!.startAt, items[0]!.timezone)}
                      </h3>
                    </header>
                    <div className="divide-y divide-ed-line">
                      {items.map((slot) => (
                        <article
                          className="grid gap-4 p-5 sm:grid-cols-[100px_minmax(0,1fr)_120px_auto] sm:items-center"
                          key={slot.id}
                        >
                          <div>
                            <strong className="block text-lg">
                              {timeLabel(slot.startAt, slot.timezone)}
                            </strong>
                            <span className="text-sm text-ed-muted">
                              sampai {timeLabel(slot.endAt, slot.timezone)} ·{' '}
                              {durationLabel(slot.startAt, slot.endAt)}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-ed-green">
                              {slot.classType.code}
                            </span>
                            <h4 className="mt-1 font-sans text-xl font-semibold">
                              {slot.classType.name}
                            </h4>
                            <p className="mt-1 text-sm text-ed-muted">
                              {slot.status === 'CONFIRMED'
                                ? 'Kelas dikonfirmasi'
                                : 'Terbuka untuk booking'}
                            </p>
                            {slot.instructor?.displayName && (
                              <p className="mt-1 text-xs font-semibold text-ed-muted">
                                Instruktur · {slot.instructor.displayName}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold">
                              <Link
                                href={`/schedule/${slot.id}`}
                                className="text-ed-green underline-offset-4 hover:underline"
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
                                className="text-ed-green underline-offset-4 hover:underline"
                              >
                                Detail kelas
                              </Link>
                            </div>
                          </div>
                          <div>
                            <span className="block text-xs text-ed-muted">Ketersediaan</span>
                            <strong className="mt-1 block">
                              {slot.available > 0 ? `Sisa ${slot.available} tempat` : 'Kelas penuh'}
                            </strong>
                            {isCustomer && slot.canBook && findMatchingPackage(slot) && (
                              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-dd-success-soft px-2 py-0.5 text-[11px] font-semibold text-dd-success border border-dd-success/30">
                                <Check className="size-3" /> Paket Sesuai (
                                {findMatchingPackage(slot)!.available} sesi)
                              </span>
                            )}
                            {isCustomer &&
                              slot.canBook &&
                              !findMatchingPackage(slot) &&
                              customerPackages.length > 0 && (
                                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-dd-warning-soft px-2 py-0.5 text-[11px] font-medium text-dd-warning border border-dd-warning/30">
                                  Perlu paket studio/kelas ini
                                </span>
                              )}
                          </div>
                          <a
                            className={`${
                              isActionable(slot)
                                ? isCustomer && !findMatchingPackage(slot)
                                ? `${publicSecondaryButton} border-ed-green text-ed-green hover:bg-dd-success-soft`
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
                                    : !session
                                      ? 'Masuk untuk booking'
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
      {!inCustomerShell && <PublicFooter variant="editorial" />}
    </div>
  );
}

