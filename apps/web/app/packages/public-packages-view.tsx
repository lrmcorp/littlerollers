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
import {
  PublicPageHero,
  PublicSectionHeading,
  PublicStatePanel,
} from '../components/public/public-page';
import {
  publicContainer,
  publicField,
  publicPrimaryButton,
} from '../components/public/public-styles';
import { signInReturnTo } from '../routes';
import { useSessionContext } from '../session-context';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const packageBenefits = [
  'Harga dan masa aktif langsung dari sistem',
  'Booking kelas sesuai studio pilihan',
  'Riwayat paket dan sesi tersedia di akun',
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

export function PublicPackagesView({
  client = browserPublicPackageCatalogClient,
}: {
  client?: PublicPackageCatalogClient;
}) {
  const session = useSessionContext()?.session;
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
        if (requestedBranch && result.branches.some(({ id }) => id === requestedBranch)) {
          setBranchId(requestedBranch);
          const selected = await client.list(requestedBranch);
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
  }, [client]);

  const selectBranch = async (selected: string) => {
    setBranchId(selected);
    setClassTypeId('');
    await loadBranch(selected);
  };

  const branch = branches.find((item) => item.id === branchId);
  const classTypes = useMemo(
    () => [...new Map(items.map((item) => [item.classType.id, item.classType])).values()],
    [items],
  );
  const visible = items.filter((item) => !classTypeId || item.classType.id === classTypeId);
  const recommendedId = recommendedPackageId(visible);

  return (
    <div className="min-w-0 overflow-x-clip bg-dd-cream font-sans text-dd-ink">
      <a className="skip-link" href="#packages-main">
        Langsung ke paket
      </a>
      <PublicHeader current="/packages" />
      <main id="packages-main">
        <PublicPageHero
          eyebrow="Paket Daily Dose"
          title="Komitmen yang sesuai dengan ritme Anda."
          description="Pilih studio, bandingkan paket aktif, lalu lanjutkan pembelian dengan harga dan masa berlaku yang tercatat langsung di sistem."
        >
          <ul className="grid max-w-3xl list-none gap-3 p-0 text-sm text-dd-muted sm:grid-cols-3">
            {packageBenefits.map((benefit) => (
              <li className="flex items-start gap-2" key={benefit}>
                <Check className="mt-0.5 size-4 shrink-0 text-dd-forest" aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
        </PublicPageHero>

        <section className="py-12 sm:py-16" aria-labelledby="package-discovery-title">
          <div className={publicContainer}>
            <PublicSectionHeading
              eyebrow="01 — Pilih studio"
              title="Harga mengikuti studio pilihan."
              titleId="package-discovery-title"
              description="Kami tidak memilih studio secara otomatis agar paket dan harga selalu sesuai dengan lokasi latihan Anda."
              aside={
                branch ? (
                  <div className="rounded-dd-md border border-dd-line bg-white px-4 py-3 text-sm shadow-sm">
                    <strong className="block text-dd-ink">{branch.name}</strong>
                    <span className="text-dd-muted">{branch.timezone}</span>
                  </div>
                ) : undefined
              }
            />

            {status === 'loading' && !branches.length ? (
              <div className="grid gap-4 sm:grid-cols-2" role="status" aria-label="Memuat studio">
                {[0, 1].map((item) => (
                  <div
                    className="h-28 animate-pulse rounded-dd-lg border border-dd-line bg-white"
                    key={item}
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {branches.map((item) => {
                  const selected = item.id === branchId;
                  return (
                    <button
                      type="button"
                      className={`flex min-h-28 items-center gap-4 rounded-dd-lg border p-5 text-left shadow-dd-card transition ${
                        selected
                          ? 'border-dd-forest bg-dd-forest text-white'
                          : 'border-dd-line bg-white text-dd-ink hover:-translate-y-0.5 hover:border-dd-forest/50'
                      }`}
                      aria-pressed={selected}
                      key={item.id}
                      onClick={() => void selectBranch(item.id)}
                    >
                      <span
                        className={`grid size-11 shrink-0 place-items-center rounded-full ${
                          selected ? 'bg-white/15' : 'bg-dd-success-soft text-dd-forest'
                        }`}
                      >
                        <MapPin className="size-5" aria-hidden="true" />
                      </span>
                      <span>
                        <strong className="block">{item.name}</strong>
                        <span className={selected ? 'text-white/70' : 'text-dd-muted'}>
                          {item.code} · {item.timezone}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-8 grid gap-4 rounded-dd-lg border border-dd-line bg-white p-4 shadow-dd-card sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-5">
              <label className="grid gap-2 text-sm font-semibold">
                Tipe kelas
                <select
                  className={publicField}
                  aria-label="Tipe kelas"
                  value={classTypeId}
                  disabled={!branchId}
                  onChange={(event) => setClassTypeId(event.target.value)}
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
                  onClick={() => setClassTypeId('')}
                >
                  Reset filter
                </button>
              )}
            </div>

            <div className="mt-8" aria-live="polite">
              {status === 'loading' && branchId && (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" role="status">
                  {[0, 1, 2].map((item) => (
                    <div
                      className="h-80 animate-pulse rounded-dd-lg border border-dd-line bg-white"
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
                    onClick={() => void (branchId ? loadBranch(branchId) : client.list())}
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
              <div
                className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                aria-label="Daftar paket aktif"
              >
                {visible.map((item) => {
                  const recommended = item.id === recommendedId;
                  const purchase = `/checkout?package=${item.id}&branch=${item.branchId}${continuationSlot ? `&slot=${encodeURIComponent(continuationSlot)}` : ''}`;
                  const href = !session
                    ? signInReturnTo(purchase)
                    : session.identityVerificationStatus !== 'APPROVED'
                      ? `/account/verification?returnTo=${encodeURIComponent(purchase)}`
                      : purchase;
                  return (
                    <article
                      className={`relative flex min-h-[360px] flex-col rounded-dd-lg border bg-white p-6 shadow-dd-card ${
                        recommended ? 'border-dd-brass ring-1 ring-dd-brass/30' : 'border-dd-line'
                      }`}
                      key={item.id}
                    >
                      {recommended && (
                        <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-dd-brass-soft px-3 py-1 text-xs font-bold text-dd-warning">
                          <Sparkles className="size-3.5" aria-hidden="true" />
                          Direkomendasikan
                        </span>
                      )}
                      <span className="text-xs font-bold tracking-[0.12em] text-dd-forest uppercase">
                        {item.classType.name}
                      </span>
                      <h3 className="mt-3 pr-16 font-serif text-3xl font-semibold">{item.name}</h3>
                      <p className="mt-5 text-3xl font-bold tracking-tight">
                        {rupiah.format(item.priceRp)}
                      </p>
                      <p className="mt-1 text-sm text-dd-muted">
                        {rupiah.format(Math.round(item.priceRp / item.sessionCount))} per sesi
                      </p>
                      <dl className="mt-6 grid grid-cols-2 gap-3 border-y border-dd-line py-5">
                        <div>
                          <dt className="text-xs text-dd-muted">Jumlah sesi</dt>
                          <dd className="mt-1 font-bold">{item.sessionCount} sesi</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-dd-muted">Masa berlaku</dt>
                          <dd className="mt-1 font-bold">{item.durationDays} hari</dd>
                        </div>
                      </dl>
                      <p className="mt-4 flex items-center gap-2 text-xs text-dd-muted">
                        <CalendarDays className="size-4" aria-hidden="true" />
                        {item.effectiveUntil
                          ? `Tersedia sampai ${new Intl.DateTimeFormat('id-ID', {
                              dateStyle: 'medium',
                            }).format(new Date(item.effectiveUntil))}`
                          : 'Paket aktif tanpa tanggal akhir katalog'}
                      </p>
                      <Link className={`${publicPrimaryButton} mt-auto w-full`} href={href}>
                        Pilih paket <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
