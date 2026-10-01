'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Layers,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import {
  browserPublicPackageCatalogClient,
  publicPackageFailure,
  type PublicPackageCatalogClient,
  type PublicPackage,
  type PublicPackageBranch,
} from '@/api-clients/public-package-catalog-client';
import { PackagePrice } from '../components/public/package-price';
import { PublicFooter } from '../components/public/public-footer';
import { PublicHeader } from '../components/public/public-header';
import { PublicPageHero, PublicStatePanel } from '../components/public/public-page';
import {
  publicContainer,
  publicPrimaryButton,
  publicSecondaryButton,
} from '../components/public/public-styles';
import { signInReturnTo } from '@/lib/routes';
import type { WebSession } from '@/api-clients/session-client';
import {
  isCustomerOnlySession,
  packageAudienceState,
  type PackageAudienceState,
} from '@/lib/session-audience';
import { useSessionContext } from '../session-context';
import { SearchSelect } from '../components/forms';

export const PRICE_RANGES = [
  { id: 'under-2m', label: '< Rp 2.000.000', min: 0, max: 1_999_999 },
  { id: '2m-5m', label: 'Rp 2.000.000 – Rp 5.000.000', min: 2_000_000, max: 5_000_000 },
  { id: '5m-10m', label: 'Rp 5.000.000 – Rp 10.000.000', min: 5_000_001, max: 10_000_000 },
  { id: 'above-10m', label: '> Rp 10.000.000', min: 10_000_001, max: Infinity },
] as const;

export const SESSION_RANGES = [
  { id: '1-5', label: '1 – 5 sesi', min: 1, max: 5 },
  { id: '6-10', label: '6 – 10 sesi', min: 6, max: 10 },
  { id: '11-20', label: '11 – 20 sesi', min: 11, max: 20 },
  { id: 'above-20', label: '> 20 sesi', min: 21, max: Infinity },
] as const;

const packageBenefits = [
  'Harga terbaru dan transparan',
  'Masa aktif jelas di setiap paket',
  'Riwayat sesi tersedia di akun',
] as const;

export function recommendedPackageId(items: PublicPackage[]) {
  if (items.length < 2) return null;
  return [...items].sort(
    (left, right) =>
      right.sessionCount - left.sessionCount ||
      (left.effectivePriceRp ?? left.priceRp) / left.sessionCount -
        (right.effectivePriceRp ?? right.priceRp) / right.sessionCount ||
      left.id.localeCompare(right.id),
  )[0]!.id;
}

export function recommendedFirst(items: PublicPackage[], recommendedId: string | null) {
  if (!recommendedId) return items;
  const recommended = items.find((item) => item.id === recommendedId);
  return recommended ? [recommended, ...items.filter((item) => item.id !== recommendedId)] : items;
}

export function publicBranchLocation(branch: PublicPackageBranch) {
  const location = branch.name.replace(/^Daily Dose\s+/i, '').trim() || branch.name;
  const timezone = branch.timezone === 'Asia/Jakarta' ? 'WIB' : branch.timezone;
  return `${location} · ${timezone}`;
}

export function packageDescriptor(
  item: PublicPackage,
  items: PublicPackage[],
  recommendedId: string | null,
) {
  if (item.id === recommendedId) return 'Nilai terbaik untuk latihan rutin';
  const minimumSessions = Math.min(...items.map((candidate) => candidate.sessionCount));
  return item.sessionCount === minimumSessions
    ? 'Cocok untuk mulai mencoba'
    : 'Fleksibel untuk latihan mingguan';
}

export function packageCtaLabel(session: WebSession | null) {
  const audience = packageAudienceState(session);
  if (audience === 'GUEST') return 'Masuk untuk memilih';
  if (audience === 'STAFF') return 'Buka Workspace';
  return 'Pilih paket';
}

export function packageJourneyCopy(session: WebSession | null) {
  const audience = packageAudienceState(session);
  if (audience === 'GUEST') return 'Masuk atau buat akun untuk melanjutkan pembelian.';
  if (audience === 'STAFF')
    return 'Anda sedang menggunakan akun staf. Pembelian paket menggunakan akun customer.';
  return 'Pilih paket yang sesuai, lalu lanjutkan ke pembayaran.';
}

export function packageCtaHref(audience: PackageAudienceState, purchase: string): string {
  if (audience === 'GUEST') return signInReturnTo(purchase);
  if (audience === 'STAFF') return '/workspace';
  return purchase;
}

function syncCatalogQuery(
  branchId: string,
  classTypeId: string,
  searchQuery = '',
  priceRange = '',
  sessionRange = '',
) {
  const query = new URLSearchParams(window.location.search);
  if (branchId) query.set('branch', branchId);
  else query.delete('branch');
  if (classTypeId) query.set('classType', classTypeId);
  else query.delete('classType');
  if (searchQuery.trim()) query.set('q', searchQuery.trim());
  else query.delete('q');
  if (priceRange) query.set('price', priceRange);
  else query.delete('price');
  if (sessionRange) query.set('sessions', sessionRange);
  else query.delete('sessions');
  const search = query.toString();
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`,
  );
}

export function PublicPackagesView({
  client = browserPublicPackageCatalogClient,
}: {
  client?: PublicPackageCatalogClient;
}) {
  const session = useSessionContext()?.session;
  const inCustomerShell = isCustomerOnlySession(session);
  const audience = packageAudienceState(session);
  const [branches, setBranches] = useState<PublicPackageBranch[]>([]);
  const [items, setItems] = useState<PublicPackage[]>([]);
  const [branchId, setBranchId] = useState('');
  const [classTypeId, setClassTypeId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sessionRange, setSessionRange] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [continuationSlot, setContinuationSlot] = useState('');

  const loadBranch = async (selected: string) => {
    if (!selected) {
      setItems([]);
      setStatus('ready');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const result = await client.list(selected);
      setBranches(result.branches);
      setItems(result.items);
      setStatus('ready');
    } catch (error) {
      setItems([]);
      setStatus('error');
      setMessage(publicPackageFailure(error));
    }
  };

  const retryCatalog = async () => {
    if (branchId) {
      await loadBranch(branchId);
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const result = await client.list();
      setBranches(result.branches);
      setItems([]);
      setStatus('ready');
    } catch (error) {
      setMessage(publicPackageFailure(error));
      setStatus('error');
    }
  };

  useEffect(() => {
    let active = true;
    void client
      .list()
      .then(async (result) => {
        if (!active) return;
        setBranches(result.branches);
        const query = new URLSearchParams(window.location.search);
        const requestedBranch = query.get('branch');
        const requestedClassType = query.get('classType');
        const requestedQ = query.get('q') ?? '';
        const requestedPrice = query.get('price') ?? '';
        const requestedSessions = query.get('sessions') ?? '';
        setContinuationSlot(query.get('slot') ?? '');
        if (requestedClassType) setClassTypeId(requestedClassType);
        if (requestedQ) setSearchQuery(requestedQ);
        if (requestedPrice) setPriceRange(requestedPrice);
        if (requestedSessions) setSessionRange(requestedSessions);
        const storedBranch =
          typeof window !== 'undefined' ? window.sessionStorage.getItem('dd_active_branch') : null;
        const initialBranch =
          requestedBranch && result.branches.some(({ id }) => id === requestedBranch)
            ? requestedBranch
            : result.branches.find(({ id }) => id === session?.preferredBranch?.id)?.id ||
              result.branches.find(({ id }) => id === storedBranch)?.id;
        if (initialBranch) {
          setBranchId(initialBranch);
          try {
            const selected = await client.list(initialBranch);
            if (!active) return;
            setBranches(selected.branches);
            setItems(selected.items);
            setStatus('ready');
          } catch (innerError) {
            if (!active) return;
            setMessage(publicPackageFailure(innerError));
            setStatus('error');
          }
        } else {
          setStatus('ready');
        }
      })
      .catch((error) => {
        if (!active) return;
        setMessage(publicPackageFailure(error));
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [client, session?.preferredBranch?.id]);

  const selectBranch = async (selected: string) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('dd_active_branch', selected);
    }
    setBranchId(selected);
    setClassTypeId('');
    setSearchQuery('');
    setPriceRange('');
    setSessionRange('');
    syncCatalogQuery(selected, '', '', '', '');
    await loadBranch(selected);
  };

  const classTypes = useMemo(
    () => [
      ...new Map(
        items
          .filter((item) => item.classType && item.classType.id)
          .map((item) => [item.classType.id, item.classType]),
      ).values(),
    ],
    [items],
  );

  const visible = useMemo(() => {
    return items.filter((item) => {
      // 1. Tipe Kelas
      if (classTypeId && item.classType?.id !== classTypeId) {
        return false;
      }

      // 2. Pencarian Nama Paket / Deskripsi / Tipe Kelas
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase().trim();
        const nameMatch = item.name.toLowerCase().includes(queryLower);
        const descMatch = (item.description ?? '').toLowerCase().includes(queryLower);
        const classTypeMatch = (item.classType?.name ?? '').toLowerCase().includes(queryLower);
        if (!nameMatch && !descMatch && !classTypeMatch) {
          return false;
        }
      }

      // 3. Rentang Harga
      if (priceRange) {
        const range = PRICE_RANGES.find((r) => r.id === priceRange);
        if (range) {
          const effectivePrice = item.effectivePriceRp ?? item.priceRp;
          if (effectivePrice < range.min || effectivePrice > range.max) {
            return false;
          }
        }
      }

      // 4. Jumlah Sesi
      if (sessionRange) {
        const range = SESSION_RANGES.find((r) => r.id === sessionRange);
        if (range) {
          if (item.sessionCount < range.min || item.sessionCount > range.max) {
            return false;
          }
        }
      }

      return true;
    });
  }, [items, classTypeId, searchQuery, priceRange, sessionRange]);

  const hasActiveFilters = Boolean(classTypeId || searchQuery || priceRange || sessionRange);

  const resetAllFilters = () => {
    setClassTypeId('');
    setSearchQuery('');
    setPriceRange('');
    setSessionRange('');
    syncCatalogQuery(branchId, '', '', '', '');
  };

  const recommendedId = recommendedPackageId(visible);
  const orderedVisible = recommendedFirst(visible, recommendedId);
  const ctaLabel = packageCtaLabel(session ?? null);
  const showCatalogState =
    status !== 'ready' || !branchId || (branchId.length > 0 && visible.length === 0);

  return (
    <div className="min-w-0 overflow-x-clip bg-dd-cream font-sans text-dd-ink">
      <a className="skip-link" href="#packages-main">
        Langsung ke paket
      </a>
      {!inCustomerShell && <PublicHeader />}
      <main id="packages-main">
        <PublicPageHero
          eyebrow="Paket Daily Dose"
          title="Komitmen yang sesuai dengan ritme Anda."
          description="Pilih studio, bandingkan paket yang tersedia, lalu temukan ritme latihan yang paling sesuai untuk Anda."
          variant="compact"
        >
          <ul className="grid max-w-3xl list-none gap-2 p-0 text-sm text-dd-muted sm:grid-cols-3 sm:gap-4">
            {packageBenefits.map((benefit) => (
              <li className="flex items-start gap-2" key={benefit}>
                <Check className="mt-0.5 size-4 shrink-0 text-dd-forest" aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
        </PublicPageHero>

        <section className="py-2 sm:py-6" aria-labelledby="package-discovery-title">
          <div className={publicContainer}>
            <header className="mb-6 max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-wider text-dd-forest">
                01 — Pilih studio
              </span>
              <h2
                className="mt-1 font-sans text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-dd-ink"
                id="package-discovery-title"
              >
                Pilih studio tempat Anda <span className="italic text-dd-forest">berlatih</span>.
              </h2>
              <p className="mt-1 max-w-2xl text-sm sm:text-base leading-relaxed text-dd-muted">
                Harga dan ketersediaan paket mengikuti studio pilihan Anda.
              </p>
            </header>

            {status === 'loading' && !branches.length ? (
              <div className="grid grid-cols-2 gap-3" role="status" aria-label="Memuat studio">
                {[0, 1].map((item) => (
                  <div
                    className="h-20 animate-pulse rounded-2xl border border-dd-line/80 bg-white shadow-sm"
                    key={item}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {branches.map((item) => {
                  const selected = item.id === branchId;
                  return (
                    <button
                      type="button"
                      className={`flex min-h-16 items-center gap-3.5 rounded-2xl border p-4 text-left shadow-dd-card transition-all duration-200 cursor-pointer ${
                        selected
                          ? 'border-dd-forest bg-dd-forest text-white shadow-dd-soft ring-2 ring-dd-forest/20'
                          : 'border-dd-line/80 bg-white/95 text-dd-ink hover:-translate-y-0.5 hover:border-dd-forest/60'
                      }`}
                      aria-pressed={selected}
                      key={item.id}
                      onClick={() => void selectBranch(item.id)}
                    >
                      <span
                        className={`grid size-11 shrink-0 place-items-center rounded-xl transition ${
                          selected ? 'bg-white/20 text-white' : 'bg-dd-success-soft text-dd-forest border border-emerald-200'
                        }`}
                      >
                        <MapPin className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-sm sm:text-base font-bold">{item.name}</strong>
                        <span
                          className={`block truncate text-xs font-medium ${
                            selected ? 'text-white/80' : 'text-dd-muted'
                          }`}
                        >
                          {publicBranchLocation(item)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="mt-5 rounded-2xl border border-dd-line/80 bg-white/95 p-4 sm:p-5 shadow-dd-card">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-dd-forest">
                  <SlidersHorizontal className="size-3.5" aria-hidden="true" />
                  02 — Filter &amp; Pencarian Paket
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-dd-line bg-dd-surface-muted px-2.5 py-1 text-xs font-bold text-dd-forest transition hover:bg-dd-surface-muted/80 cursor-pointer"
                    onClick={resetAllFilters}
                  >
                    <RotateCcw className="size-3" aria-hidden="true" />
                    Reset filter
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 items-end">
                {/* 1. Nama Paket */}
                <div className="grid min-w-0 gap-1.5">
                  <label htmlFor="package-search-input" className="text-sm font-semibold text-dd-ink">
                    Nama paket
                  </label>
                  <div className="relative min-w-0">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dd-muted"
                      aria-hidden="true"
                    />
                    <input
                      id="package-search-input"
                      type="search"
                      value={searchQuery}
                      disabled={!branchId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSearchQuery(val);
                        syncCatalogQuery(branchId, classTypeId, val, priceRange, sessionRange);
                      }}
                      placeholder="Cari nama paket…"
                      className="min-h-11 w-full rounded-dd-md border border-dd-line bg-white pl-9 pr-8 font-sans text-sm text-dd-ink shadow-sm transition placeholder:text-dd-muted hover:border-dd-forest/40 focus:border-dd-forest focus:outline-hidden focus:ring-2 focus:ring-dd-forest/15 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-dd-muted"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        aria-label="Hapus kata kunci pencarian"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-dd-muted transition hover:bg-dd-surface-muted hover:text-dd-ink cursor-pointer"
                        onClick={() => {
                          setSearchQuery('');
                          syncCatalogQuery(branchId, classTypeId, '', priceRange, sessionRange);
                        }}
                      >
                        <X className="size-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Tipe Kelas */}
                <div className="min-w-0">
                  <SearchSelect
                    label="Tipe kelas"
                    compact
                    value={classTypeId}
                    disabled={!branchId}
                    placeholder="Semua tipe kelas"
                    options={classTypes.map((item) => ({ id: item.id, label: item.name }))}
                    onChange={(selected) => {
                      setClassTypeId(selected);
                      syncCatalogQuery(branchId, selected, searchQuery, priceRange, sessionRange);
                    }}
                  />
                </div>

                {/* 3. Rentang Harga */}
                <div className="min-w-0">
                  <SearchSelect
                    label="Rentang harga"
                    compact
                    value={priceRange}
                    disabled={!branchId}
                    placeholder="Semua harga"
                    options={PRICE_RANGES.map((item) => ({ id: item.id, label: item.label }))}
                    onChange={(selected) => {
                      setPriceRange(selected);
                      syncCatalogQuery(branchId, classTypeId, searchQuery, selected, sessionRange);
                    }}
                  />
                </div>

                {/* 4. Jumlah Sesi */}
                <div className="min-w-0">
                  <SearchSelect
                    label="Jumlah sesi"
                    compact
                    value={sessionRange}
                    disabled={!branchId}
                    placeholder="Semua sesi"
                    options={SESSION_RANGES.map((item) => ({ id: item.id, label: item.label }))}
                    onChange={(selected) => {
                      setSessionRange(selected);
                      syncCatalogQuery(branchId, classTypeId, searchQuery, priceRange, selected);
                    }}
                  />
                </div>
              </div>

              {/* Status Bar */}
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-dd-line/60 pt-3 text-xs text-dd-muted">
                <p>
                  {branchId ? (
                    <>
                      Menampilkan <strong className="font-semibold text-dd-ink">{visible.length}</strong> dari{' '}
                      <strong className="font-semibold text-dd-ink">{items.length}</strong> paket tersedia
                    </>
                  ) : (
                    'Pilih salah satu studio di atas untuk melihat paket yang tersedia.'
                  )}
                </p>
                {hasActiveFilters && (
                  <span className="font-medium text-dd-forest">
                    Filter aktif diterapkan
                  </span>
                )}
              </div>
            </div>

            {showCatalogState && (
              <div className="mt-4" aria-live="polite">
                {status === 'loading' && branchId && (
                  <div className="grid gap-5 md:grid-cols-2" role="status">
                    {[0, 1].map((item) => (
                      <div
                        className="h-72 animate-pulse rounded-2xl border border-dd-line/80 bg-white shadow-sm"
                        key={item}
                      />
                    ))}
                  </div>
                )}
                {status === 'error' && (
                  <PublicStatePanel title="Paket belum dapat dimuat" tone="error" role="alert">
                    <p>{message}</p>
                    <button
                      type="button"
                      className="mt-4 min-h-11 rounded-xl border border-dd-danger/30 bg-white px-5 font-bold text-sm shadow-sm transition hover:bg-dd-surface-muted"
                      onClick={() => void retryCatalog()}
                    >
                      Coba lagi
                    </button>
                  </PublicStatePanel>
                )}
                {status === 'ready' && !branchId && (
                  <PublicStatePanel title="Pilih studio untuk melihat paket">
                    Harga, tipe kelas, dan masa berlaku paket akan muncul setelah Anda menentukan
                    lokasi latihan.
                  </PublicStatePanel>
                )}
                {status === 'ready' && branchId && visible.length === 0 && (
                  <PublicStatePanel
                    title={items.length > 0 ? 'Tidak ada paket yang sesuai' : 'Belum ada paket aktif'}
                  >
                    <p>
                      {items.length > 0
                        ? 'Coba ubah kata kunci pencarian, longgarkan filter harga atau jumlah sesi untuk menemukan paket yang sesuai.'
                        : 'Paket untuk studio ini belum tersedia. Silakan pilih studio Daily Dose lainnya untuk melihat pilihan paket yang tersedia.'}
                    </p>
                    {items.length > 0 && hasActiveFilters && (
                      <button
                        type="button"
                        className="mt-4 min-h-11 rounded-xl border border-dd-forest/30 bg-white px-5 font-bold text-sm text-dd-forest shadow-sm transition hover:bg-dd-surface-muted cursor-pointer"
                        onClick={resetAllFilters}
                      >
                        Reset semua filter
                      </button>
                    )}
                    {items.length === 0 && branches.filter((b) => b.id !== branchId).length > 0 && (
                      <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                        {branches
                          .filter((b) => b.id !== branchId)
                          .map((otherBranch) => (
                            <button
                              key={otherBranch.id}
                              type="button"
                              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-dd-line/80 bg-white px-4 text-sm font-semibold text-dd-forest shadow-sm transition hover:border-dd-forest hover:bg-dd-forest/5 cursor-pointer"
                              onClick={() => void selectBranch(otherBranch.id)}
                            >
                              <MapPin className="size-4" />
                              <span>Lihat paket {otherBranch.name}</span>
                            </button>
                          ))}
                      </div>
                    )}
                  </PublicStatePanel>
                )}
              </div>
            )}

            {status === 'ready' && visible.length > 0 && (
              <>
                <p className="mt-4 pr-20 text-xs sm:text-sm font-medium text-dd-muted sm:pr-0">
                  {packageJourneyCopy(session ?? null)}
                </p>
                <div className="mt-4 grid gap-6 md:grid-cols-2" aria-label="Daftar paket aktif">
                  {orderedVisible.map((item) => {
                    const recommended = item.id === recommendedId;
                    const purchase = `/checkout?package=${item.id}&branch=${item.branchId}${classTypeId ? `&classType=${encodeURIComponent(classTypeId)}` : ''}${continuationSlot ? `&slot=${encodeURIComponent(continuationSlot)}` : ''}`;
                    const href = packageCtaHref(audience, purchase);
                    return (
                      <article
                        className={`flex min-h-[340px] flex-col rounded-2xl border bg-white/95 p-6 shadow-dd-card transition-all duration-300 hover:shadow-dd-float hover:-translate-y-0.5 sm:p-7 ${
                          recommended
                            ? 'border-dd-brass ring-1 ring-dd-brass/30'
                            : 'border-dd-line/80'
                        }`}
                        key={item.id}
                      >
                        <div className="flex min-h-7 flex-wrap items-start justify-between gap-2">
                          <span className="inline-flex items-center rounded-full bg-dd-forest/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-dd-forest">
                            {item.classType.name}
                          </span>
                          {recommended && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-dd-brass/40 bg-dd-brass-soft/80 px-3 py-0.5 text-[11px] font-semibold tracking-wider text-dd-brass-dark uppercase shadow-2xs">
                              <span className="size-1.5 rounded-full bg-dd-brass" />
                              Direkomendasikan
                            </span>
                          )}
                        </div>
                        <h3 className="mt-3 font-sans text-2xl sm:text-3xl font-bold tracking-tight text-dd-ink">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-dd-muted">
                          {packageDescriptor(item, visible, recommendedId)}
                        </p>
                        <div className="mt-4">
                          <PackagePrice
                            priceRp={item.priceRp}
                            effectivePriceRp={item.effectivePriceRp ?? item.priceRp}
                            promotion={item.promotion}
                            sessionCount={item.sessionCount}
                          />
                        </div>
                        <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-dd-line/60 py-4">
                          <div>
                            <dt className="text-xs font-semibold text-dd-muted">Jumlah sesi</dt>
                            <dd className="mt-1 font-sans text-lg sm:text-xl font-semibold text-dd-ink">{item.sessionCount} sesi</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold text-dd-muted">Masa berlaku</dt>
                            <dd className="mt-1 font-sans text-lg sm:text-xl font-semibold text-dd-ink">{item.durationDays} hari</dd>
                          </div>
                        </dl>
                        <div className="mt-auto grid gap-3 pt-5">
                          <p className="flex items-center gap-2 text-xs font-medium text-dd-muted">
                            <CalendarDays className="size-4 shrink-0 text-dd-forest" aria-hidden="true" />
                            {item.effectiveUntil
                              ? `Tersedia sampai ${new Intl.DateTimeFormat('id-ID', {
                                  dateStyle: 'medium',
                                }).format(new Date(item.effectiveUntil))}`
                              : 'Tersedia untuk pembelian'}
                          </p>
                          {audience === 'STAFF' && (
                            <p className="rounded-xl bg-dd-surface-muted px-3 py-2 text-xs leading-5 text-dd-muted">
                              Pembelian paket menggunakan akun customer.
                            </p>
                          )}
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            <Link
                              className={`${publicSecondaryButton} w-full text-center justify-center`}
                              href={`/packages/${item.id}`}
                            >
                              Lihat detail
                            </Link>
                            <Link className={`${publicPrimaryButton} w-full text-center justify-center`} href={href}>
                              {ctaLabel} <ArrowRight className="size-4" aria-hidden="true" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
                <div className="mt-6 grid gap-3.5 rounded-2xl border border-dd-line/80 bg-white/95 p-5 text-xs sm:text-sm font-medium text-dd-muted shadow-dd-card sm:grid-cols-3">
                  {[
                    'Harga final mengikuti studio pilihan.',
                    'Paket aktif setelah pembayaran disetujui.',
                    'Sisa sesi dapat dipantau melalui akun.',
                  ].map((item) => (
                    <p className="flex items-start gap-2 text-dd-ink" key={item}>
                      <Check className="mt-0.5 size-4 shrink-0 text-dd-forest" aria-hidden="true" />
                      {item}
                    </p>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      {!inCustomerShell && <PublicFooter />}
    </div>
  );
}
