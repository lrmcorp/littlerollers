'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Check, MapPin, Sparkles } from 'lucide-react';
import {
  browserPublicPackageCatalogClient,
  publicPackageFailure,
  type PublicPackageCatalogClient,
  type PublicPackage,
  type PublicPackageBranch,
} from '../public-package-catalog-client';
import { PublicFooter } from '../components/public/public-footer';
import { PublicHeader } from '../components/public/public-header';
import { PublicPageHero, PublicStatePanel } from '../components/public/public-page';
import {
  publicContainer,
  publicField,
  publicPrimaryButton,
} from '../components/public/public-styles';
import { signInReturnTo } from '../routes';
import type { WebSession } from '../session-client';
import { useSessionContext } from '../session-context';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

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
      left.priceRp / left.sessionCount - right.priceRp / right.sessionCount ||
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
  if (!session) return 'Masuk untuk memilih';
  return session.identityVerificationStatus === 'APPROVED'
    ? 'Pilih paket'
    : 'Verifikasi untuk memilih';
}

export function packageJourneyCopy(session: WebSession | null) {
  if (!session) return 'Masuk atau buat akun untuk melanjutkan pembelian.';
  return session.identityVerificationStatus === 'APPROVED'
    ? 'Pilih paket yang sesuai, lalu lanjutkan ke pembayaran.'
    : 'Selesaikan verifikasi akun untuk melanjutkan pembelian.';
}

function syncCatalogQuery(branchId: string, classTypeId: string) {
  const query = new URLSearchParams(window.location.search);
  if (branchId) query.set('branch', branchId);
  else query.delete('branch');
  if (classTypeId) query.set('classType', classTypeId);
  else query.delete('classType');
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
  const inCustomerShell = Boolean(
    session?.roles.includes('CUSTOMER') && session.roles.every((role) => role === 'CUSTOMER'),
  );
  const [branches, setBranches] = useState<PublicPackageBranch[]>([]);
  const [items, setItems] = useState<PublicPackage[]>([]);
  const [branchId, setBranchId] = useState('');
  const [classTypeId, setClassTypeId] = useState('');
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
        setContinuationSlot(query.get('slot') ?? '');
        if (requestedClassType) setClassTypeId(requestedClassType);
        const initialBranch =
          requestedBranch && result.branches.some(({ id }) => id === requestedBranch)
            ? requestedBranch
            : result.branches.find(({ id }) => id === session?.preferredBranch?.id)?.id;
        if (initialBranch) {
          setBranchId(initialBranch);
          const selected = await client.list(initialBranch);
          if (!active) return;
          setBranches(selected.branches);
          setItems(selected.items);
        }
        setStatus('ready');
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
    setBranchId(selected);
    setClassTypeId('');
    syncCatalogQuery(selected, '');
    await loadBranch(selected);
  };

  const classTypes = useMemo(
    () => [...new Map(items.map((item) => [item.classType.id, item.classType])).values()],
    [items],
  );
  const visible = items.filter((item) => !classTypeId || item.classType.id === classTypeId);
  const recommendedId = recommendedPackageId(visible);
  const orderedVisible = recommendedFirst(visible, recommendedId);
  const ctaLabel = packageCtaLabel(session ?? null);

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

        <section className="py-5 sm:py-7" aria-labelledby="package-discovery-title">
          <div className={publicContainer}>
            <header className="mb-4 max-w-3xl">
              <p className="text-xs font-bold tracking-[0.14em] text-dd-forest uppercase">
                01 — Pilih studio
              </p>
              <h2
                className="mt-2 font-serif text-[clamp(2rem,4vw,3rem)] leading-tight font-semibold"
                id="package-discovery-title"
              >
                Pilih studio tempat Anda berlatih.
              </h2>
              <p className="mt-2 max-w-2xl leading-6 text-dd-muted">
                Harga dan ketersediaan paket mengikuti studio pilihan Anda.
              </p>
            </header>

            {status === 'loading' && !branches.length ? (
              <div className="grid grid-cols-2 gap-3" role="status" aria-label="Memuat studio">
                {[0, 1].map((item) => (
                  <div
                    className="h-20 animate-pulse rounded-dd-md border border-dd-line bg-white"
                    key={item}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {branches.map((item) => {
                  const selected = item.id === branchId;
                  return (
                    <button
                      type="button"
                      className={`flex min-h-20 items-center gap-3 rounded-dd-md border p-3 text-left shadow-dd-card transition sm:p-4 ${
                        selected
                          ? 'border-dd-forest bg-dd-forest text-white'
                          : 'border-dd-line bg-white text-dd-ink hover:-translate-y-0.5 hover:border-dd-forest/50'
                      }`}
                      aria-pressed={selected}
                      key={item.id}
                      onClick={() => void selectBranch(item.id)}
                    >
                      <span
                        className={`hidden size-10 shrink-0 place-items-center rounded-full sm:grid ${
                          selected ? 'bg-white/15' : 'bg-dd-success-soft text-dd-forest'
                        }`}
                      >
                        <MapPin className="size-5" aria-hidden="true" />
                      </span>
                      <span>
                        <strong className="block text-sm sm:text-base">{item.name}</strong>
                        <span
                          className={`block text-xs sm:text-sm ${
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

            <div className="mt-5 grid gap-3 rounded-dd-md border border-dd-line bg-white p-3 shadow-dd-card sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-4">
              <label className="grid gap-2 text-sm font-semibold">
                Tipe kelas
                <select
                  className={publicField}
                  aria-label="Tipe kelas"
                  value={classTypeId}
                  disabled={!branchId}
                  onChange={(event) => {
                    const selected = event.target.value;
                    setClassTypeId(selected);
                    syncCatalogQuery(branchId, selected);
                  }}
                >
                  <option value="">Semua tipe kelas</option>
                  {classTypes.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              {classTypeId && (
                <button
                  type="button"
                  className="min-h-12 rounded-dd-sm border border-dd-line bg-dd-surface-muted px-5 text-sm font-bold text-dd-forest"
                  onClick={() => {
                    setClassTypeId('');
                    syncCatalogQuery(branchId, '');
                  }}
                >
                  Reset filter
                </button>
              )}
            </div>

            <div className="mt-5" aria-live="polite">
              {status === 'loading' && branchId && (
                <div className="grid gap-5 md:grid-cols-2" role="status">
                  {[0, 1].map((item) => (
                    <div
                      className="h-72 animate-pulse rounded-dd-lg border border-dd-line bg-white"
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
                    className="mt-4 min-h-11 rounded-dd-sm border border-dd-danger/30 bg-white px-5 font-bold"
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
                <PublicStatePanel title="Belum ada paket aktif">
                  Coba tipe kelas lain atau pilih studio berbeda.
                </PublicStatePanel>
              )}
            </div>

            {status === 'ready' && visible.length > 0 && (
              <>
                <p className="mt-5 text-sm text-dd-muted">{packageJourneyCopy(session ?? null)}</p>
                <div className="mt-4 grid gap-5 md:grid-cols-2" aria-label="Daftar paket aktif">
                  {orderedVisible.map((item) => {
                    const recommended = item.id === recommendedId;
                    const purchase = `/checkout?package=${item.id}&branch=${item.branchId}${continuationSlot ? `&slot=${encodeURIComponent(continuationSlot)}` : ''}`;
                    const href = !session
                      ? signInReturnTo(purchase)
                      : session.identityVerificationStatus !== 'APPROVED'
                        ? `/account/verification?returnTo=${encodeURIComponent(purchase)}`
                        : purchase;
                    return (
                      <article
                        className={`flex min-h-[320px] flex-col rounded-dd-lg border bg-white p-5 shadow-dd-card sm:p-6 ${
                          recommended ? 'border-dd-brass ring-1 ring-dd-brass/30' : 'border-dd-line'
                        }`}
                        key={item.id}
                      >
                        <div className="flex min-h-7 flex-wrap items-start justify-between gap-2">
                          <span className="text-xs font-bold tracking-[0.12em] text-dd-forest uppercase">
                            {item.classType.name}
                          </span>
                          {recommended && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-dd-brass-soft px-3 py-1 text-xs font-bold text-dd-warning">
                              <Sparkles className="size-3.5" aria-hidden="true" />
                              Direkomendasikan
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-dd-muted">
                          {packageDescriptor(item, visible, recommendedId)}
                        </p>
                        <p className="mt-4 text-3xl font-bold tracking-tight">
                          {rupiah.format(item.priceRp)}
                        </p>
                        <p className="mt-1 text-sm text-dd-muted">
                          {rupiah.format(Math.round(item.priceRp / item.sessionCount))} per sesi
                        </p>
                        <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-dd-line py-4">
                          <div>
                            <dt className="text-xs text-dd-muted">Jumlah sesi</dt>
                            <dd className="mt-1 font-bold">{item.sessionCount} sesi</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-dd-muted">Masa berlaku</dt>
                            <dd className="mt-1 font-bold">{item.durationDays} hari</dd>
                          </div>
                        </dl>
                        <p className="mt-3 flex items-center gap-2 text-xs text-dd-muted">
                          <CalendarDays className="size-4" aria-hidden="true" />
                          {item.effectiveUntil
                            ? `Tersedia sampai ${new Intl.DateTimeFormat('id-ID', {
                                dateStyle: 'medium',
                              }).format(new Date(item.effectiveUntil))}`
                            : 'Tersedia untuk pembelian'}
                        </p>
                        <Link className={`${publicPrimaryButton} mt-auto w-full`} href={href}>
                          {ctaLabel} <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                      </article>
                    );
                  })}
                </div>
                <div className="mt-6 grid gap-3 rounded-dd-md border border-dd-line bg-white p-4 text-sm text-dd-muted shadow-dd-card sm:grid-cols-3">
                  {[
                    'Harga final mengikuti studio pilihan.',
                    'Paket aktif setelah pembayaran disetujui.',
                    'Sisa sesi dapat dipantau melalui akun.',
                  ].map((item) => (
                    <p className="flex items-start gap-2" key={item}>
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
