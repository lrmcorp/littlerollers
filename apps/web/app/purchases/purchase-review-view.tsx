'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Eye, RefreshCw, Search } from 'lucide-react';
import {
  browserPurchaseReviewClient,
  purchaseFailure,
  type PaymentReviewFilters,
  type PurchaseReviewClient,
  type ReviewPurchase,
  type ReviewSummary,
} from '@/api-clients/purchase-client';
import { PageHeader, Skeleton } from '../ui';
import { useTrackedRouter } from '../components/app-loading';
import { Badge, DataTable, FilterBar, Pagination, Panel } from '../components/admin/admin-ui';
import { Button, ButtonLink } from '../components/actions';
import { AlertBanner, PreviewModal, useOptionalAppFeedback } from '../components/app-feedback';
import { useSessionContext } from '../session-context';
import { DateInput, SearchInput, SearchSelect, SelectInput } from '../components/forms';
import { formatRupiah } from '../lib/formatters';

const statusLabels: Record<string, string> = {
  AWAITING_PAYMENT: 'Menunggu pembayaran',
  PENDING: 'Menunggu pemeriksaan',
  ACTION_REQUIRED: 'Perlu perbaikan',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  EXPIRED: 'Kedaluwarsa',
};
type Filters = PaymentReviewFilters & { status?: string };

const emptySummary: ReviewSummary = {
  pending: 0,
  actionRequired: 0,
  approved: 0,
  rejected: 0,
  expired: 0,
  totalAmountRp: 0,
  agingOver24Hours: 0,
};

const readFilters = (): Filters => {
  if (typeof window === 'undefined') return { status: 'ALL', limit: 20 };
  const query = new URLSearchParams(window.location.search);
  const date = (name: string) => {
    const value = query.get(name);
    return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : undefined;
  };
  return {
    branchId: query.get('branch') || undefined,
    status: query.get('status') || 'ALL',
    q: query.get('q') || undefined,
    from: date('from'),
    until: date('until'),
    cursor: query.get('cursor') || undefined,
    purchaseId: query.get('purchaseId') || undefined,
    limit: 20,
  };
};

const dateInput = (value?: Date) =>
  value && Number.isFinite(value.getTime())
    ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
    : '';

export const paymentStatusTone = (status: string): 'neutral' | 'success' | 'warning' | 'danger' =>
  status === 'APPROVED'
    ? 'success'
    : status === 'REJECTED' || status === 'EXPIRED'
      ? 'danger'
      : status === 'PENDING' || status === 'ACTION_REQUIRED'
        ? 'warning'
        : 'neutral';

export type PaymentRowState = 'danger' | 'success' | 'warning' | 'neutral' | 'default';

export function paymentRowState(item: ReviewPurchase, now = new Date()): PaymentRowState {
  const activation = item.activationSummary;
  if (
    item.status === 'REJECTED' ||
    item.status === 'EXPIRED' ||
    activation?.status === 'EXPIRED' ||
    Boolean(activation && activation.expiryAt.getTime() <= now.getTime())
  )
    return 'danger';
  if (item.status === 'APPROVED' && activation?.status === 'ACTIVE') return 'success';
  if (item.status === 'PENDING' || item.status === 'ACTION_REQUIRED') return 'warning';
  if (item.status === 'AWAITING_PAYMENT' || !activation || activation.status === 'INACTIVE')
    return 'neutral';
  return 'default';
}

const rowClasses: Record<PaymentRowState, string> = {
  danger: 'border-l-4 border-l-dd-danger bg-red-50/70',
  success: 'border-l-4 border-l-dd-forest bg-emerald-50/60',
  warning: 'border-l-4 border-l-dd-brass bg-amber-50/70',
  neutral: 'border-l-4 border-l-stone-400 bg-stone-50/85',
  default: 'border-l-4 border-l-transparent bg-white',
};

const sessionSummary = (item: ReviewPurchase) => {
  const activation = item.activationSummary;
  if (!activation) return <span className="text-xs text-dd-muted">Paket belum diaktifkan</span>;
  return (
    <div className="text-xs leading-5">
      <strong className="block text-sm text-dd-ink">
        {activation.available} tersedia
        {activation.available === 0 && activation.status === 'ACTIVE' ? ' · sesi telah habis' : ''}
      </strong>
      <span className="text-dd-muted">
        {activation.reserved} dipesan · {activation.used} terpakai
      </span>
      <span className="block text-dd-muted">
        {activation.status === 'EXPIRED'
          ? '0 sesi dapat digunakan'
          : `Berlaku hingga ${activation.expiryAt.toLocaleDateString('id-ID')}`}
      </span>
    </div>
  );
};

const ageLabel = (submittedAt: Date) => {
  const hours = Math.max(0, Math.floor((Date.now() - submittedAt.getTime()) / 3_600_000));
  if (hours < 1) return 'Kurang dari 1 jam';
  if (hours < 24) return `${hours} jam`;
  return `${Math.floor(hours / 24)} hari`;
};

const queueUrlWithoutLegacyDetail = () => {
  if (typeof window === 'undefined') return '/workspace/payments';
  const query = new URLSearchParams(window.location.search);
  query.delete('purchaseId');
  return `/workspace/payments${query.size ? `?${query}` : ''}`;
};

const detailHref = (id: string) =>
  `/workspace/payments/${encodeURIComponent(id)}?returnTo=${encodeURIComponent(queueUrlWithoutLegacyDetail())}`;

export function PurchaseReviewView({
  client = browserPurchaseReviewClient,
  branchOverride,
}: {
  client?: PurchaseReviewClient;
  branchOverride?: { id: string; name: string; timezone: string; code?: string };
}) {
  const router = useTrackedRouter();
  const sessionContext = useSessionContext();
  const feedback = useOptionalAppFeedback();
  const testAuthority = Boolean(branchOverride);
  const sessionReady = testAuthority || sessionContext?.status === 'authenticated';
  const canReview =
    testAuthority || Boolean(sessionContext?.hasCapability('payment:review', 'purchase:review'));
  const canDecide =
    testAuthority || Boolean(sessionContext?.hasCapability('payment:decide', 'purchase:decide'));
  const activeBranch = branchOverride ?? sessionContext?.activeBranch ?? null;
  const branches = branchOverride ? [branchOverride] : (sessionContext?.session?.branches ?? []);
  const isGlobal = Boolean(
    sessionContext?.hasCapability('branch:all') ||
    sessionContext?.hasCapability('finance:reconcile'),
  );
  const [filters, setFilters] = useState<Filters>(readFilters);
  const [search, setSearch] = useState(() => readFilters().q ?? '');
  const [items, setItems] = useState<ReviewPurchase[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>(emptySummary);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<ReviewPurchase | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const requestRef = useRef(0);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  const changeFilters = useCallback(
    (patch: Partial<Filters>, replace = false) => {
      if (patch.cursor === undefined) {
        setCursorHistory([]);
      }
      setFilters((current) => {
        const next = { ...current, ...patch, purchaseId: undefined };
        return next;
      });

      if (typeof window !== 'undefined') {
        const query = new URLSearchParams();
        const current = readFilters();
        const next = { ...current, ...patch, purchaseId: undefined };
        if (next.branchId) query.set('branch', next.branchId);
        if (next.status && next.status !== 'ALL') query.set('status', next.status);
        if (next.q) query.set('q', next.q);
        if (next.from) query.set('from', dateInput(next.from));
        if (next.until) query.set('until', dateInput(next.until));
        if (next.cursor) query.set('cursor', next.cursor);
        const url = `/workspace/payments${query.size ? `?${query.toString()}` : ''}`;
        router.replace(url, { scroll: false });
      }
    },
    [router],
  );

  const onNext = () => {
    if (!nextCursor) return;
    setCursorHistory((current) => [...current, filters.cursor ?? '']);
    changeFilters({ cursor: nextCursor }, true);
  };

  const onPrevious = () => {
    const previous = cursorHistory.at(-1) ?? '';
    setCursorHistory((current) => current.slice(0, -1));
    changeFilters({ cursor: previous || undefined }, true);
  };

  useEffect(() => {
    const legacyPurchaseId = readFilters().purchaseId;
    if (legacyPurchaseId) router.replace(detailHref(legacyPurchaseId));
  }, [router]);

  useEffect(() => {
    const onPopState = () => {
      const next = readFilters();
      setFilters(next);
      setSearch(next.q ?? '');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if ((filters.q ?? '') !== search.trim())
        changeFilters({ q: search.trim() || undefined, cursor: undefined }, true);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [changeFilters, filters.q, search]);

  const requestFilters = useMemo<PaymentReviewFilters>(
    () => ({
      ...filters,
      purchaseId: undefined,
      branchId: activeBranch?.id ?? filters.branchId,
      status: filters.status === 'ALL' ? undefined : filters.status,
    }),
    [activeBranch?.id, filters],
  );

  const load = useCallback(async () => {
    if (!sessionReady || !canReview) return;
    const requestId = ++requestRef.current;
    setLoading(true);
    setError('');
    try {
      const result = await client.list(requestFilters);
      if (requestId !== requestRef.current) return;
      setItems(result.items);
      setSummary(result.summary);
      setGeneratedAt(result.generatedAt);
      setNextCursor(result.page.nextCursor ?? null);
    } catch (cause) {
      if (requestId === requestRef.current) setError(purchaseFailure(cause));
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [canReview, client, requestFilters, sessionReady]);

  useEffect(() => void load(), [load]);

  const closePreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setPreviewType('');
    setPreviewItem(null);
  }, [previewUrl]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const openPreview = async (item: ReviewPurchase) => {
    if (!item.paymentProof || item.paymentProof.scanStatus !== 'CLEAN') return;
    setPreviewItem(item);
    setPreviewLoading(true);
    setError('');
    try {
      const blob = await client.loadProof(item.paymentProof.id);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewType(blob.type || item.paymentProof.mimeType);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (cause) {
      setError(purchaseFailure(cause));
    } finally {
      setPreviewLoading(false);
    }
  };

  const approve = async (item: ReviewPurchase) => {
    if (!canDecide || item.status !== 'PENDING') return;
    const confirmed = feedback
      ? await feedback.confirm({
          tone: 'warning',
          title: 'Setujui pembayaran',
          message: `${item.customer.displayName} · ${item.branch.name} · ${item.packageNameSnapshot} · ${formatRupiah(item.payableAmountRpSnapshot ?? item.priceRpSnapshot)}. Paket customer akan diaktifkan dan ledger pembelian dibuat. Versi ${item.version}.`,
          confirmLabel: 'Setujui dan aktifkan paket',
        })
      : testAuthority;
    if (!confirmed) return;
    try {
      const latest = await client.detail(item.id).catch(() => null);
      const versionToUse = latest?.purchase?.version ?? item.version;
      const result = await client.approve(item.id, versionToUse, crypto.randomUUID());
      feedback?.showToast({
        tone: 'success',
        title: 'Pembayaran disetujui',
        message: `${result.customerPackage.packageName ?? item.packageNameSnapshot} aktif dengan ${result.customerPackage.available} sesi. Ledger ${result.ledgerEntry.id}.`,
        correlationReference: result.purchase.auditReference ?? undefined,
      });
      await load();
    } catch (cause) {
      await load();
      setError(purchaseFailure(cause));
    } finally {
      setMutatingId(null);
    }
  };

  if (sessionContext?.status === 'unauthenticated' && !testAuthority)
    return (
      <AlertBanner
        tone="warning"
        title="Sesi telah berakhir"
        message="Masuk kembali sebelum membuka antrean pembayaran."
      />
    );
  if (!sessionReady) return <Skeleton label="Memuat sesi dan izin pembayaran" />;
  if (!canReview)
    return (
      <AlertBanner
        tone="danger"
        title="Akses antrean tidak tersedia"
        message="Role Anda tidak memiliki capability untuk memeriksa pembayaran."
      />
    );

  const scopeLabel = activeBranch?.name ?? (isGlobal ? 'Semua cabang' : 'Cabang assignment');
  const summaryCards = [
    ['PENDING', 'Menunggu', summary.pending],
    ['ACTION_REQUIRED', 'Perlu perbaikan', summary.actionRequired],
    ['APPROVED', 'Disetujui', summary.approved],
    ['REJECTED', 'Ditolak', summary.rejected],
    ['EXPIRED', 'Kedaluwarsa', summary.expired],
  ] as const;

  const actions = (item: ReviewPurchase, compact = false) => (
    <div
      className={`flex flex-wrap gap-2 ${compact ? 'justify-end' : ''}`}
      onClick={(event) => event.stopPropagation()}
    >
      <ButtonLink
        variant="secondary"
        size="sm"
        href={detailHref(item.id)}
        leadingIcon={<Eye className="size-4" />}
      >
        Periksa detail
      </ButtonLink>
      <Button
        variant="secondary"
        disabled={previewLoading || !item.paymentProof || item.paymentProof.scanStatus !== 'CLEAN'}
        onClick={() => void openPreview(item)}
      >
        Preview bukti
      </Button>
      {canDecide && item.status === 'PENDING' && (
        <Button disabled={mutatingId === item.id} onClick={() => void approve(item)}>
          <CheckCircle2 className="size-4" /> {mutatingId === item.id ? 'Memproses…' : 'Setujui'}
        </Button>
      )}
    </div>
  );

  return (
    <section className="space-y-5" aria-labelledby="payment-review-title">
      <Panel className="p-5 sm:p-7">
        <PageHeader
          eyebrow={`Scope · ${scopeLabel}`}
          title="Antrean Pembayaran"
          titleId="payment-review-title"
          description="Periksa bukti privat dan snapshot transaksi. Keputusan hanya tersedia bagi Finance dan Super Admin."
          context={
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-dd-muted">
                {generatedAt ? `Diperbarui ${generatedAt.toLocaleString('id-ID')}` : 'Belum dimuat'}
              </span>
              <Button
                variant="secondary"
                disabled={loading}
                leadingIcon={
                  <RefreshCw
                    className={`size-4 ${loading ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                }
                onClick={() => void load()}
              >
                Segarkan
              </Button>
            </div>
          }
        />
      </Panel>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {summaryCards.map(([value, label, count]) => (
          <button
            key={value}
            type="button"
            aria-pressed={filters.status === value}
            onClick={() => changeFilters({ status: value, cursor: undefined })}
            className={`rounded-dd-lg border bg-white p-4 text-left shadow-sm transition hover:border-dd-forest ${filters.status === value ? 'border-dd-forest ring-1 ring-dd-forest/20' : 'border-dd-line'}`}
          >
            <span className="block text-xs font-semibold text-dd-muted">{label}</span>
            <strong className="mt-2 block text-2xl text-dd-ink">
              {count.toLocaleString('id-ID')}
            </strong>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Panel className="p-4">
          <span className="text-xs font-semibold text-dd-muted">Nilai dalam hasil filter</span>
          <strong className="mt-1 block text-xl text-dd-ink">
            {formatRupiah(summary.totalAmountRp)}
          </strong>
        </Panel>
        <Panel className="p-4">
          <span className="text-xs font-semibold text-dd-muted">Menunggu lebih dari 24 jam</span>
          <strong className="mt-1 block text-xl text-dd-ink">{summary.agingOver24Hours}</strong>
        </Panel>
      </div>

      <FilterBar>
        <SearchInput
          wrapperClassName="min-w-56 flex-1"
          label="Cari customer atau transaksi"
          leadingIcon={<Search className="size-4" />}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nama, telepon, atau ID transaksi"
        />
        <SelectInput
          label="Status"
          value={filters.status ?? 'ALL'}
          onChange={(event) => changeFilters({ status: event.target.value, cursor: undefined })}
        >
          <option value="ALL">Semua status</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectInput>
        {branches.length > 1 && !activeBranch && (
          <SearchSelect
            label="Cabang"
            value={filters.branchId ?? ''}
            placeholder={isGlobal ? 'Semua cabang' : 'Cabang assignment'}
            options={branches.map((branch) => ({ id: branch.id, label: branch.name }))}
            onChange={(branchId) =>
              changeFilters({ branchId: branchId || undefined, cursor: undefined })
            }
          />
        )}
        <DateInput
          label="Dari"
          value={dateInput(filters.from)}
          onChange={(event) =>
            changeFilters({
              from: event.target.value ? new Date(`${event.target.value}T00:00:00`) : undefined,
              cursor: undefined,
            })
          }
        />
        <DateInput
          label="Sampai"
          value={dateInput(filters.until)}
          onChange={(event) =>
            changeFilters({
              until: event.target.value ? new Date(`${event.target.value}T23:59:59`) : undefined,
              cursor: undefined,
            })
          }
        />
        <Button
          variant="ghost"
          onClick={() => {
            setSearch('');
            changeFilters({
              branchId: undefined,
              status: 'ALL',
              q: undefined,
              from: undefined,
              until: undefined,
              cursor: undefined,
            });
          }}
        >
          Reset filter
        </Button>
      </FilterBar>

      {error && (
        <AlertBanner
          tone="danger"
          title="Antrean belum dapat diproses"
          message={error}
          action={{ label: 'Coba lagi', onSelect: () => void load() }}
        />
      )}

      <div
        className="flex flex-wrap gap-x-5 gap-y-2 rounded-dd-md border border-dd-line bg-white px-4 py-3 text-xs text-dd-muted"
        aria-label="Legenda status baris pembayaran"
      >
        {[
          ['bg-emerald-100 border-dd-forest', 'Paket aktif'],
          ['bg-amber-100 border-dd-brass', 'Menunggu tindakan'],
          ['bg-red-100 border-dd-danger', 'Ditolak atau kedaluwarsa'],
          ['bg-stone-100 border-stone-400', 'Belum dibayar atau belum aktif'],
        ].map(([classes, label]) => (
          <span key={label} className="inline-flex items-center gap-2">
            <span className={`size-3 rounded-sm border-l-2 ${classes}`} aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>

      <DataTable
        items={items}
        loading={loading}
        rowKey={(item) => item.id}
        emptyTitle={filters.q ? 'Transaksi tidak ditemukan' : 'Antrean pembayaran kosong'}
        emptyDescription={
          filters.q
            ? 'Ubah pencarian atau reset filter untuk melihat hasil lain.'
            : 'Tidak ada transaksi yang perlu ditampilkan pada scope ini.'
        }
        onRowClick={(item) => router.push(detailHref(item.id))}
        rowClassName={(item) => rowClasses[paymentRowState(item)]}
        mobileCardClassName={(item) => rowClasses[paymentRowState(item)]}
        rowDescription={(item) =>
          `${item.customer.displayName}, ${statusLabels[item.status] ?? item.status}, ${item.activationSummary?.status === 'ACTIVE' ? 'paket aktif' : 'paket belum aktif'}`
        }
        columns={[
          {
            id: 'customer',
            header: 'Customer',
            cell: (item) => (
              <div>
                <strong>{item.customer.displayName}</strong>
                <p className="text-xs text-dd-muted">
                  {item.customer.phoneMasked ?? 'Kontak termasking tidak tersedia'}
                </p>
              </div>
            ),
          },
          { id: 'branch', header: 'Cabang', cell: (item) => <Badge>{item.branch.name}</Badge> },
          {
            id: 'package',
            header: 'Paket',
            cell: (item) => (
              <div>
                <strong>{item.packageNameSnapshot}</strong>
                <p className="text-xs text-dd-muted">
                  {item.sessionCountSnapshot} sesi · {item.durationDaysSnapshot} hari
                </p>
              </div>
            ),
          },
          {
            id: 'amount',
            header: 'Nominal',
            cell: (item) => (
              <div>
                <strong>
                  {formatRupiah(item.payableAmountRpSnapshot ?? item.priceRpSnapshot)}
                </strong>
                <p className="text-xs text-dd-muted">
                  Harga {formatRupiah(item.priceRpSnapshot)}
                  {item.packagePromotionId && (
                    <>
                      {' '}
                      · Promo {item.packagePromotionNameSnapshot} −
                      {formatRupiah(item.packagePromotionDiscountRpSnapshot ?? 0)}
                    </>
                  )}
                  {item.voucherCodeSnapshot && (
                    <>
                      {' '}
                      · {item.voucherCodeSnapshot} −
                      {formatRupiah(item.voucherDiscountRpSnapshot ?? 0)}
                    </>
                  )}
                </p>
              </div>
            ),
          },
          {
            id: 'sessions',
            header: 'Sesi paket',
            cell: sessionSummary,
          },
          {
            id: 'proof',
            header: 'Bukti',
            cell: (item) =>
              item.paymentProof ? (
                <div>
                  <Badge
                    tone={
                      item.paymentProof.scanStatus === 'CLEAN'
                        ? 'success'
                        : item.paymentProof.scanStatus === 'REJECTED' ||
                            item.paymentProof.scanStatus === 'INFECTED'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {item.paymentProof.scanStatus === 'CLEAN'
                      ? 'Siap diperiksa'
                      : item.paymentProof.scanStatus}
                  </Badge>
                  <p className="mt-1 text-xs text-dd-muted">
                    Dikirim {item.submittedAt.toLocaleString('id-ID')}
                  </p>
                </div>
              ) : (
                <Badge tone="warning">Belum ada</Badge>
              ),
          },
          {
            id: 'age',
            header: 'Usia / batas',
            cell: (item) => (
              <div>
                {ageLabel(item.submittedAt)}
                <p className="text-xs text-dd-muted">
                  {item.paymentExpiresAt
                    ? `Berakhir ${item.paymentExpiresAt.toLocaleString('id-ID')}`
                    : 'Tanpa batas pembayaran'}
                </p>
              </div>
            ),
          },
          {
            id: 'status',
            header: 'Status',
            cell: (item) => (
              <Badge tone={paymentStatusTone(item.status)}>
                {statusLabels[item.status] ?? item.status}
              </Badge>
            ),
          },
          { id: 'action', header: 'Tindakan', cell: (item) => actions(item) },
        ]}
        mobileCard={(item) => (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <strong>{item.customer.displayName}</strong>
                <p className="text-sm text-dd-muted">
                  {item.branch.name} · {item.packageNameSnapshot}
                </p>
              </div>
              <Badge tone={paymentStatusTone(item.status)}>
                {statusLabels[item.status] ?? item.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-dd-muted">Nominal transfer</p>
              <strong>{formatRupiah(item.payableAmountRpSnapshot ?? item.priceRpSnapshot)}</strong>
              <p className="mt-1 text-xs text-dd-muted">
                Bukti dikirim {item.submittedAt.toLocaleString('id-ID')}
              </p>
            </div>
            <div>{sessionSummary(item)}</div>
            {actions(item, true)}
          </div>
        )}
      />

      <Pagination
        hasPrevious={cursorHistory.length > 0}
        hasNext={Boolean(nextCursor)}
        totalLabel={
          cursorHistory.length > 0
            ? `Halaman ${cursorHistory.length + 1} · ${items.length} transaksi pada halaman ini`
            : `${items.length} transaksi pada halaman ini`
        }
        onPrevious={onPrevious}
        onNext={onNext}
      />

      <PreviewModal
        open={Boolean(previewItem)}
        title={
          previewItem ? `Bukti pembayaran ${previewItem.customer.displayName}` : 'Bukti pembayaran'
        }
        description="File privat hanya ditampilkan selama pemeriksaan ini."
        onClose={closePreview}
        className="max-w-4xl"
      >
        <div className="min-h-72">
          {previewLoading && <Skeleton label="Memuat bukti pembayaran" />}
          {!previewLoading && previewUrl && previewType.startsWith('image/') && (
            <img
              src={previewUrl}
              alt={`Bukti pembayaran ${previewItem?.customer.displayName ?? ''}`}
              className="max-h-[65vh] w-full rounded-dd-lg border border-dd-line bg-white object-contain"
            />
          )}
          {!previewLoading && previewUrl && previewType === 'application/pdf' && (
            <object
              data={previewUrl}
              type={previewType}
              title="Preview bukti pembayaran privat"
              className="h-[65vh] w-full rounded-dd-lg border border-dd-line bg-white"
            >
              <p>Preview PDF tidak didukung browser ini.</p>
            </object>
          )}
          {!previewLoading &&
            previewUrl &&
            !previewType.startsWith('image/') &&
            previewType !== 'application/pdf' && (
              <AlertBanner
                tone="warning"
                title="Format tidak didukung"
                message="Unduh atau minta bukti dalam format JPEG, PNG, WebP, atau PDF."
              />
            )}
          {!previewLoading && !previewUrl && (
            <AlertBanner
              tone="warning"
              title="Bukti belum dapat ditampilkan"
              message="Tutup preview lalu coba kembali dari antrean."
            />
          )}
        </div>
      </PreviewModal>
    </section>
  );
}
