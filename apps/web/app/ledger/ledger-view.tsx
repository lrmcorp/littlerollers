'use client';

import { History, RefreshCw, UsersRound } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  browserLedgerClient,
  ledgerFailure,
  type Adjustment,
  type AdjustmentSummary,
  type LedgerBalance,
  type LedgerClient,
  type LedgerSummary,
} from '@/api-clients/ledger-client';
import { EmptyState, Feedback, PageHeader, Skeleton } from '../ui';
import { useActiveBranchState, useSessionContext } from '../session-context';
import { Button, ButtonLink } from '../components/actions';
import { Drawer, Modal, useAppFeedback } from '../components/app-feedback';
import { Badge, FilterBar, Pagination, Panel, StatCard, Tabs } from '../components/admin/admin-ui';
import {
  AsyncSearchSelect,
  DateInput,
  SelectInput,
  Textarea,
  TextInput,
} from '../components/forms';

type PackageOption = LedgerBalance & { label: string; description: string };
type PackageStatus = '' | 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
type AdjustmentMode = 'PENDING' | 'HISTORY';

const packageStatus: Record<
  LedgerBalance['status'],
  { label: string; tone: 'success' | 'warning' | 'neutral' }
> = {
  ACTIVE: { label: 'Aktif', tone: 'success' },
  EXPIRED: { label: 'Berakhir', tone: 'warning' },
  INACTIVE: { label: 'Tidak aktif', tone: 'neutral' },
};

const adjustmentStatus: Record<
  Adjustment['status'],
  { label: string; tone: 'warning' | 'success' | 'danger' }
> = {
  PENDING: { label: 'Menunggu keputusan', tone: 'warning' },
  POSTED: { label: 'Diposting', tone: 'success' },
  REJECTED: { label: 'Ditolak', tone: 'danger' },
};

const adjustmentReasonLabels: Record<string, string> = {
  MIGRATION_CORRECTION: 'Koreksi migrasi',
  ATTENDANCE_CORRECTION: 'Koreksi kehadiran',
  PACKAGE_COMPENSATION: 'Kompensasi paket',
  SUPPORT_RECONCILIATION: 'Rekonsiliasi bantuan',
  CORRECTION_VERIFIED: 'Koreksi telah diverifikasi',
  INVALID_EVIDENCE: 'Bukti tidak valid',
  DUPLICATE_REQUEST: 'Permintaan duplikat',
  OUT_OF_SCOPE: 'Di luar cakupan',
};

const eligibilityMessages: Record<string, string> = {
  ADJUSTMENT_ALREADY_DECIDED: 'Permintaan ini sudah diputuskan.',
  PACKAGE_NOT_ACTIVE: 'Paket tidak lagi aktif.',
  LEDGER_INVARIANT_VIOLATION:
    'Proyeksi saldo akan lebih kecil dari nol atau reservation yang masih aktif.',
};

function date(value: Date | string | null | undefined, withTime = false) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' as const } : {}),
    timeZone: 'Asia/Jakarta',
  }).format(parsed);
}

function BalanceValues({ item }: { item: LedgerBalance }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div>
        <span className="block text-xs text-dd-muted">Saldo</span>
        <strong>{item.ledgerBalance}</strong>
      </div>
      <div>
        <span className="block text-xs text-dd-muted">Tertahan</span>
        <strong>{item.reserved}</strong>
      </div>
      <div>
        <span className="block text-xs text-dd-muted">Tersedia</span>
        <strong className="text-dd-success">{item.available}</strong>
      </div>
    </div>
  );
}

export function LedgerView({
  client = browserLedgerClient,
  initialWorkspaceTab = 'balances',
  onWorkspaceTabChange,
  access,
  adjustmentsOnly = false,
  customerUserId,
  initialAdjustmentMode = 'PENDING',
  onAdjustmentModeChange,
  initialSearch = '',
  initialStatus = '',
  initialCursor = '',
  onBalanceFiltersChange,
  onBalancePageChange,
  initialAdjustmentSearch = '',
  initialAdjustmentFrom = '',
  initialAdjustmentUntil = '',
  initialAdjustmentCursor = '',
  onAdjustmentFiltersChange,
}: {
  client?: LedgerClient;
  initialWorkspaceTab?: 'balances' | 'adjustments';
  onWorkspaceTabChange?(value: 'balances' | 'adjustments'): void;
  access?: { canRequest: boolean; canDecide: boolean; canReview: boolean };
  adjustmentsOnly?: boolean;
  customerUserId?: string;
  initialAdjustmentMode?: AdjustmentMode;
  onAdjustmentModeChange?(value: AdjustmentMode): void;
  initialSearch?: string;
  initialStatus?: PackageStatus;
  onBalanceFiltersChange?(search: string, status: PackageStatus): void;
  initialCursor?: string;
  onBalancePageChange?(cursor: string): void;
  initialAdjustmentSearch?: string;
  initialAdjustmentFrom?: string;
  initialAdjustmentUntil?: string;
  initialAdjustmentCursor?: string;
  onAdjustmentFiltersChange?(filters: {
    q: string;
    from: string;
    until: string;
    cursor: string;
  }): void;
}) {
  const [branchId, setBranchId] = useActiveBranchState();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnTo = `${pathname ?? '/ledger'}${searchParams?.size ? `?${searchParams.toString()}` : ''}`;
  const sessionContext = useSessionContext();
  const feedback = useAppFeedback();
  const [workspaceTab, setWorkspaceTab] = useState<'balances' | 'adjustments'>(initialWorkspaceTab);
  const injectedAccess = process.env.NODE_ENV === 'test' ? access : undefined;
  const canRequest =
    injectedAccess?.canRequest ?? Boolean(sessionContext?.hasCapability('ledger:adjust:request'));
  const canDecide =
    injectedAccess?.canDecide ?? Boolean(sessionContext?.hasCapability('ledger:adjust:decide'));
  const canReview =
    injectedAccess?.canReview ?? Boolean(sessionContext?.hasCapability('ledger:adjust:read'));

  const [items, setItems] = useState<LedgerBalance[]>([]);
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>();
  const [previousCursor, setPreviousCursor] = useState<string | null>();
  const [balanceCursor, setBalanceCursor] = useState(initialCursor);
  const [search, setSearch] = useState(initialSearch);
  const [appliedSearch, setAppliedSearch] = useState(initialSearch);
  const [status, setStatus] = useState<PackageStatus>(initialStatus);
  const [appliedStatus, setAppliedStatus] = useState<PackageStatus>(initialStatus);
  const [loading, setLoading] = useState(true);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [adjustmentMode, setAdjustmentMode] = useState<AdjustmentMode>(initialAdjustmentMode);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [adjustmentSummary, setAdjustmentSummary] = useState<AdjustmentSummary | null>(null);
  const [adjustmentCursor, setAdjustmentCursor] = useState<string | null>();
  const [adjustmentPreviousCursor, setAdjustmentPreviousCursor] = useState<string | null>();
  const [activeAdjustmentCursor, setActiveAdjustmentCursor] = useState(initialAdjustmentCursor);
  const [adjustmentSearch, setAdjustmentSearch] = useState(initialAdjustmentSearch);
  const [appliedAdjustmentSearch, setAppliedAdjustmentSearch] = useState(initialAdjustmentSearch);
  const [adjustmentFrom, setAdjustmentFrom] = useState(initialAdjustmentFrom);
  const [appliedAdjustmentFrom, setAppliedAdjustmentFrom] = useState(initialAdjustmentFrom);
  const [adjustmentUntil, setAdjustmentUntil] = useState(initialAdjustmentUntil);
  const [appliedAdjustmentUntil, setAppliedAdjustmentUntil] = useState(initialAdjustmentUntil);
  const [adjustmentLoading, setAdjustmentLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageOption>();
  const [quantity, setQuantity] = useState('');
  const [reasonCode, setReasonCode] = useState('MIGRATION_CORRECTION');
  const [decisionIntent, setDecisionIntent] = useState<{
    item: Adjustment;
    decision: 'approve' | 'reject';
  }>();
  const [requestOpen, setRequestOpen] = useState(false);
  const [decisionReason, setDecisionReason] = useState('INVALID_EVIDENCE');
  const [decisionNote, setDecisionNote] = useState('');

  const listRequest = useRef(0);
  const adjustmentRequest = useRef(0);
  const requestIntent = useRef<{ signature: string; key: string } | undefined>(undefined);
  const decisionKeys = useRef(new Map<string, string>());

  useEffect(() => setWorkspaceTab(initialWorkspaceTab), [initialWorkspaceTab]);
  useEffect(() => setAdjustmentMode(initialAdjustmentMode), [initialAdjustmentMode]);
  useEffect(() => setBalanceCursor(initialCursor), [initialCursor]);
  useEffect(() => setActiveAdjustmentCursor(initialAdjustmentCursor), [initialAdjustmentCursor]);
  useEffect(() => {
    setSearch(initialSearch);
    setAppliedSearch(initialSearch);
    setStatus(initialStatus);
    setAppliedStatus(initialStatus);
  }, [initialSearch, initialStatus]);

  const stableRequestKey = (signature: string) => {
    if (requestIntent.current?.signature !== signature)
      requestIntent.current = { signature, key: crypto.randomUUID() };
    return requestIntent.current.key;
  };

  const loadBalances = useCallback(async () => {
    const request = ++listRequest.current;
    setLoading(true);
    setError('');
    try {
      const result = await client.list(
        branchId || undefined,
        balanceCursor || undefined,
        appliedSearch || undefined,
        appliedStatus || undefined,
        customerUserId,
      );
      if (request !== listRequest.current) return;
      setItems(result.items);
      setSummary(result.summary);
      setNextCursor(result.nextCursor ?? null);
      setPreviousCursor(result.previousCursor ?? null);
    } catch (cause) {
      if (request === listRequest.current) setError(await ledgerFailure(cause));
    } finally {
      if (request === listRequest.current) setLoading(false);
    }
  }, [appliedSearch, appliedStatus, balanceCursor, branchId, client, customerUserId]);

  const loadAdjustments = useCallback(async () => {
    if (!canReview) return;
    const request = ++adjustmentRequest.current;
    setAdjustmentLoading(true);
    setError('');
    try {
      const result = await client.listAdjustments(
        branchId || undefined,
        adjustmentMode,
        activeAdjustmentCursor || undefined,
        appliedAdjustmentSearch || undefined,
        customerUserId,
        appliedAdjustmentFrom
          ? new Date(`${appliedAdjustmentFrom}T00:00:00`).toISOString()
          : undefined,
        appliedAdjustmentUntil
          ? new Date(`${appliedAdjustmentUntil}T00:00:00`).toISOString()
          : undefined,
      );
      if (request !== adjustmentRequest.current) return;
      setAdjustments(result.items);
      setAdjustmentSummary(result.summary ?? null);
      setAdjustmentCursor(result.nextCursor ?? null);
      setAdjustmentPreviousCursor(result.previousCursor ?? null);
    } catch (cause) {
      if (request === adjustmentRequest.current) setError(await ledgerFailure(cause));
    } finally {
      if (request === adjustmentRequest.current) setAdjustmentLoading(false);
    }
  }, [
    activeAdjustmentCursor,
    adjustmentMode,
    appliedAdjustmentFrom,
    appliedAdjustmentSearch,
    appliedAdjustmentUntil,
    branchId,
    canReview,
    client,
    customerUserId,
  ]);

  useEffect(() => {
    listRequest.current += 1;
    adjustmentRequest.current += 1;
    setItems([]);
    setSummary(null);
    setNextCursor(null);
    setPreviousCursor(null);
    setAdjustments([]);
    setAdjustmentSummary(null);
    setAdjustmentCursor(null);
    setAdjustmentPreviousCursor(null);
    setSelectedPackage(undefined);
    if (!adjustmentsOnly) void loadBalances();
    if (canReview) void loadAdjustments();
  }, [
    branchId,
    appliedSearch,
    appliedStatus,
    balanceCursor,
    adjustmentMode,
    activeAdjustmentCursor,
    appliedAdjustmentSearch,
    appliedAdjustmentFrom,
    appliedAdjustmentUntil,
    canReview,
    adjustmentsOnly,
    loadAdjustments,
    loadBalances,
  ]);

  const searchPackages = useCallback(
    async (query: string) => {
      const result = await client.list(branchId || undefined, undefined, query, 'ACTIVE');
      return result.items.map((item) => ({
        ...item,
        label: `${item.customer?.displayName ?? 'Customer'} · ${item.packageName ?? 'Paket'}`,
        description: `${item.branchName ?? 'Cabang'} · tersedia ${item.available} sesi · berakhir ${date(item.expiryAt)}`,
      }));
    },
    [branchId, client],
  );

  const refreshOperationalData = async () => {
    await Promise.all([loadBalances(), canReview ? loadAdjustments() : Promise.resolve()]);
  };

  const runMutation = async (action: () => Promise<void>) => {
    setMutationLoading(true);
    setError('');
    try {
      await action();
    } catch (cause) {
      setError(await ledgerFailure(cause));
    } finally {
      setMutationLoading(false);
    }
  };

  const applyFilters = () => {
    const normalized = search.trim();
    setAppliedSearch(normalized);
    setAppliedStatus(status);
    setBalanceCursor('');
    onBalanceFiltersChange?.(normalized, status);
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setAppliedSearch('');
    setAppliedStatus('');
    setBalanceCursor('');
    onBalanceFiltersChange?.('', '');
  };
  const requestDirty = Boolean(selectedPackage || quantity);
  const confirmDiscardRequest = () =>
    feedback.confirm({
      tone: 'warning',
      title: 'Batalkan penyesuaian sesi?',
      message: 'Customer, paket, dan perubahan sesi yang dipilih akan dikosongkan.',
      confirmLabel: 'Buang input',
    });
  const closeRequest = async () => {
    if (!requestDirty || (await confirmDiscardRequest())) {
      setSelectedPackage(undefined);
      setQuantity('');
      setRequestOpen(false);
    }
  };
  const submitAdjustmentRequest = async () => {
    if (!selectedPackage || !quantity || Number(quantity) === 0) return;
    const projectedAvailable =
      selectedPackage.ledgerBalance + Number(quantity) - selectedPackage.reserved;
    const accepted = await feedback.confirm({
      tone: projectedAvailable < 0 ? 'danger' : 'warning',
      title: 'Konfirmasi permintaan penyesuaian',
      message: `${selectedPackage.customer?.displayName ?? 'Customer'} · ${selectedPackage.packageName} · perubahan ${quantity} sesi · saldo tersedia setelah perubahan ${projectedAvailable} sesi · scope ${selectedPackage.branchName ?? 'cabang aktif'} · alasan ${adjustmentReasonLabels[reasonCode] ?? 'tercatat'}.`,
      confirmLabel: 'Buat permintaan',
    });
    if (!accepted) return;
    await runMutation(async () => {
      const payload = {
        customerPackageId: selectedPackage.id,
        quantity: Number(quantity),
        reasonCode,
      };
      const signature = JSON.stringify(payload);
      await client.requestAdjustment(payload, stableRequestKey(signature));
      requestIntent.current = undefined;
      setSelectedPackage(undefined);
      setQuantity('');
      setRequestOpen(false);
      setAdjustmentMode('PENDING');
      await refreshOperationalData();
      setMessage('Permintaan penyesuaian dibuat dan menunggu keputusan tanpa mengubah saldo.');
    });
  };
  const submitAdjustmentDecision = async () => {
    if (!decisionIntent) return;
    const { item, decision } = decisionIntent;
    const reason = decision === 'approve' ? 'CORRECTION_VERIFIED' : decisionReason;
    const accepted = await feedback.confirm({
      tone: decision === 'approve' ? 'warning' : 'danger',
      title: decision === 'approve' ? 'Setujui penyesuaian sesi' : 'Tolak penyesuaian sesi',
      message: `${item.customer?.displayName ?? 'Customer'} · perubahan ${item.quantity} sesi · proyeksi tersedia ${item.projectedAvailable ?? 'tidak tersedia'} · scope ${item.branch?.name ?? 'cabang aktif'} · alasan ${adjustmentReasonLabels[reason] ?? 'tercatat'} · versi ${item.version}.`,
      confirmLabel: decision === 'approve' ? 'Setujui dan posting' : 'Tolak permintaan',
    });
    if (!accepted) return;
    await runMutation(async () => {
      const intent = `${item.id}:${decision}:${item.version}:${reason}`;
      const key = decisionKeys.current.get(intent) ?? crypto.randomUUID();
      decisionKeys.current.set(intent, key);
      const result = await client.decideAdjustment(
        item.id,
        decision,
        {
          reasonCode: reason,
          note: decisionNote.trim() || undefined,
          expectedVersion: item.version,
        },
        key,
      );
      decisionKeys.current.delete(intent);
      setDecisionIntent(undefined);
      setDecisionNote('');
      await refreshOperationalData();
      setMessage(
        `Permintaan ${decision === 'approve' ? 'disetujui dan diposting' : 'ditolak'}${result.auditReference ? ` · referensi audit ${result.auditReference}` : ''}.`,
      );
    });
  };

  return (
    <section className="space-y-6" aria-labelledby="ledger-title">
      <Panel className="p-6 sm:p-8">
        <PageHeader
          eyebrow={adjustmentsOnly ? 'Kontrol saldo' : 'Operasional customer'}
          title={adjustmentsOnly ? 'Penyesuaian Sesi' : 'Sesi Customer'}
          titleId="ledger-title"
          description={
            adjustmentsOnly
              ? 'Tinjau permintaan perubahan sesi sesuai permission, scope cabang, dan separation of duties.'
              : 'Pantau saldo paket, sesi terpakai, tertahan, dan tersedia berdasarkan ledger authoritative.'
          }
          context={
            <Button
              variant="secondary"
              disabled={loading || adjustmentLoading}
              leadingIcon={<RefreshCw className="size-4" aria-hidden="true" />}
              onClick={() => void refreshOperationalData()}
            >
              Perbarui data
            </Button>
          }
        />
      </Panel>

      {!adjustmentsOnly && (
        <Tabs
          items={[
            { value: 'balances', label: 'Saldo & Riwayat', count: summary?.packageCount },
            {
              value: 'adjustments',
              label: 'Penyesuaian Sesi',
              count: adjustmentMode === 'PENDING' ? adjustments.length : undefined,
            },
          ]}
          value={workspaceTab}
          onChange={(value) => {
            const next = value as 'balances' | 'adjustments';
            setWorkspaceTab(next);
            onWorkspaceTabChange?.(next);
          }}
        />
      )}

      {!adjustmentsOnly && workspaceTab === 'balances' && (
        <>
          <FilterBar>
            {injectedAccess && !sessionContext && (
              <TextInput
                wrapperClassName="min-w-52"
                label="Cabang"
                value={branchId}
                onChange={(event) => setBranchId(event.target.value)}
                placeholder="ID cabang untuk pengujian"
              />
            )}
            <TextInput
              wrapperClassName="min-w-64 flex-1"
              label="Cari customer atau paket"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  applyFilters();
                }
              }}
              placeholder="Nama customer, paket, atau tipe kelas"
            />
            <SelectInput
              wrapperClassName="min-w-44"
              label="Status paket"
              value={status}
              onChange={(event) => setStatus(event.target.value as PackageStatus)}
            >
              <option value="">Semua status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="EXPIRED">Berakhir</option>
              <option value="INACTIVE">Tidak aktif</option>
            </SelectInput>
            <Button disabled={loading} onClick={applyFilters}>
              Terapkan
            </Button>
            {(appliedSearch || appliedStatus) && (
              <Button variant="ghost" onClick={resetFilters}>
                Reset filter
              </Button>
            )}
          </FilterBar>

          {summary ? (
            <section
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
              aria-label="Ringkasan sesi"
            >
              <StatCard
                label="Paket aktif"
                value={(summary.activePackageCount ?? summary.packageCount).toLocaleString('id-ID')}
                helper={`${summary.expiringSoon ?? 0} segera berakhir`}
              />
              <StatCard
                label="Sesi tertahan"
                value={summary.reserved.toLocaleString('id-ID')}
                tone="warning"
              />
              <StatCard
                label="Sesi tersedia"
                value={summary.available.toLocaleString('id-ID')}
                tone="success"
              />
              <StatCard
                label="Sesi terpakai"
                value={(summary.usedSessions ?? 0).toLocaleString('id-ID')}
              />
            </section>
          ) : (
            <Skeleton label="Memuat ringkasan sesi" />
          )}

          <Panel className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dd-line px-5 py-4">
              <div>
                <h2 className="font-semibold text-dd-ink">Paket dan saldo customer</h2>
                <p className="mt-1 text-sm text-dd-muted">
                  Pilih paket untuk melihat histori sesi secara lengkap.
                </p>
              </div>
              {summary && <Badge tone="info">{summary.packageCount} paket</Badge>}
            </div>

            {loading && items.length === 0 ? (
              <div className="p-5">
                <Skeleton label="Memuat paket customer" />
              </div>
            ) : items.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="Paket customer tidak ditemukan"
                  description="Ubah cabang atau filter pencarian untuk melihat data lainnya."
                />
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-dd-surface-muted text-xs uppercase tracking-wider text-dd-muted">
                      <tr>
                        <th className="px-5 py-3">Customer</th>
                        <th className="px-4 py-3">Paket</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-center">Saldo / tertahan / tersedia</th>
                        <th className="px-5 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dd-line">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-dd-surface-muted/60">
                          <td className="px-5 py-4">
                            <strong className="block text-dd-ink">
                              {item.customer?.displayName ?? 'Customer'}
                            </strong>
                            <span className="mt-1 block text-xs text-dd-muted">
                              {item.customer?.phoneMasked ?? 'Telepon tidak tersedia'} ·{' '}
                              {item.branchName ?? 'Cabang'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <strong className="block text-dd-ink">
                              {item.packageName ?? 'Paket'}
                            </strong>
                            <span className="mt-1 block text-xs text-dd-muted">
                              {item.classTypeName ?? 'Semua tipe kelas'} · berakhir{' '}
                              {date(item.expiryAt)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <Badge tone={packageStatus[item.status].tone}>
                              {packageStatus[item.status].label}
                            </Badge>
                          </td>
                          <td className="min-w-60 px-4 py-4">
                            <BalanceValues item={item} />
                          </td>
                          <td className="px-5 py-4 text-right">
                            <ButtonLink
                              variant="ghost"
                              href={`/ledger/${item.id}?returnTo=${encodeURIComponent(returnTo)}`}
                            >
                              Lihat detail sesi
                            </ButtonLink>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <ul className="divide-y divide-dd-line md:hidden" aria-label="Daftar saldo paket">
                  {items.map((item) => (
                    <li key={item.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <strong className="text-dd-ink">
                            {item.customer?.displayName ?? 'Customer'}
                          </strong>
                          <span className="mt-1 block text-xs text-dd-muted">
                            {item.packageName ?? 'Paket'} · {item.branchName ?? 'Cabang'}
                          </span>
                        </div>
                        <Badge tone={packageStatus[item.status].tone}>
                          {packageStatus[item.status].label}
                        </Badge>
                      </div>
                      <div className="my-4 rounded-dd-md bg-dd-surface-muted p-3">
                        <BalanceValues item={item} />
                      </div>
                      <ButtonLink
                        variant="secondary"
                        className="w-full"
                        leadingIcon={<History className="size-4" aria-hidden="true" />}
                        href={`/ledger/${item.id}?returnTo=${encodeURIComponent(returnTo)}`}
                        aria-label={`Lihat histori ${item.customer?.displayName ?? 'customer'} ${item.packageName ?? 'paket'}`}
                      >
                        Lihat detail sesi
                      </ButtonLink>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="border-t border-dd-line p-4">
              <Pagination
                hasPrevious={balanceCursor !== ''}
                hasNext={Boolean(nextCursor)}
                totalLabel={`${summary?.packageCount ?? items.length} paket customer`}
                onPrevious={() => {
                  const previous = previousCursor ?? '';
                  setBalanceCursor(previous);
                  onBalancePageChange?.(previous);
                }}
                onNext={() => {
                  if (!nextCursor) return;
                  setBalanceCursor(nextCursor);
                  onBalancePageChange?.(nextCursor);
                }}
              />
            </div>
          </Panel>
        </>
      )}

      {(canRequest || canReview) && (adjustmentsOnly || workspaceTab === 'adjustments') && (
        <Panel className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-dd-forest">
                Kontrol saldo
              </p>
              <h2 className="mt-1 text-xl font-semibold text-dd-ink">Penyesuaian sesi</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-dd-muted">
                Permintaan tidak langsung mengubah saldo dan harus diputuskan actor berizin yang
                berbeda.
              </p>
            </div>
            <UsersRound className="size-6 text-dd-brass" aria-hidden="true" />
          </div>

          {canRequest && (
            <div className="mt-5">
              <Button onClick={() => setRequestOpen(true)}>Buat permintaan penyesuaian</Button>
            </div>
          )}

          {!canRequest && canDecide && (
            <div className="mt-5">
              <Feedback kind="status">
                Anda berperan sebagai approver. Permintaan dibuat oleh Admin dan harus diputuskan
                oleh actor berbeda agar pemisahan tugas tetap terjaga.
              </Feedback>
            </div>
          )}

          {canReview && (
            <div className="mt-6">
              <FilterBar>
                <TextInput
                  wrapperClassName="min-w-56 flex-1"
                  label="Cari customer atau paket"
                  value={adjustmentSearch}
                  onChange={(event) => setAdjustmentSearch(event.target.value)}
                />
                <DateInput
                  label="Dari tanggal"
                  value={adjustmentFrom}
                  onChange={(event) => setAdjustmentFrom(event.target.value)}
                />
                <DateInput
                  label="Sampai tanggal"
                  value={adjustmentUntil}
                  onChange={(event) => setAdjustmentUntil(event.target.value)}
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    const normalized = adjustmentSearch.trim();
                    setAppliedAdjustmentSearch(normalized);
                    setAppliedAdjustmentFrom(adjustmentFrom);
                    setAppliedAdjustmentUntil(adjustmentUntil);
                    setActiveAdjustmentCursor('');
                    onAdjustmentFiltersChange?.({
                      q: normalized,
                      from: adjustmentFrom,
                      until: adjustmentUntil,
                      cursor: '',
                    });
                  }}
                >
                  Terapkan filter
                </Button>
              </FilterBar>
              {adjustmentSummary && (
                <section
                  className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                  aria-label="Ringkasan penyesuaian sesi"
                >
                  <StatCard label="Total permintaan" value={String(adjustmentSummary.total)} />
                  <StatCard
                    label="Menunggu keputusan"
                    value={String(adjustmentSummary.pending)}
                    tone="warning"
                  />
                  <StatCard
                    label="Diposting"
                    value={String(adjustmentSummary.posted)}
                    tone="success"
                  />
                  <StatCard
                    label="Ditolak"
                    value={String(adjustmentSummary.rejected)}
                    tone="danger"
                  />
                </section>
              )}
              <Tabs
                items={[
                  { value: 'PENDING', label: 'Menunggu keputusan' },
                  { value: 'HISTORY', label: 'Riwayat' },
                ]}
                value={adjustmentMode}
                onChange={(value) => {
                  const next = value as AdjustmentMode;
                  setAdjustmentMode(next);
                  setActiveAdjustmentCursor('');
                  onAdjustmentModeChange?.(next);
                }}
              />

              {adjustmentLoading && adjustments.length === 0 ? (
                <div className="mt-4">
                  <Skeleton label="Memuat penyesuaian sesi" />
                </div>
              ) : adjustments.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    title={
                      adjustmentMode === 'PENDING'
                        ? 'Tidak ada permintaan yang menunggu'
                        : 'Belum ada riwayat keputusan'
                    }
                    description="Data akan tampil sesuai cabang dan status yang dipilih."
                  />
                </div>
              ) : (
                <ul className="mt-4 grid gap-3" aria-label="Antrean adjustment">
                  {adjustments.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-dd-lg border border-dd-line bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <strong className="text-dd-ink">
                            {item.customer?.displayName ?? 'Customer legacy'}
                          </strong>
                          <span className="mt-1 block text-sm text-dd-muted">
                            {item.package?.name ?? 'Paket'} · {item.classType?.name ?? 'Tipe kelas'}{' '}
                            · {item.branch?.name ?? 'Cabang'}
                          </span>
                        </div>
                        <Badge tone={adjustmentStatus[item.status].tone}>
                          {adjustmentStatus[item.status].label}
                        </Badge>
                      </div>
                      <div className="mt-4 grid gap-3 rounded-dd-md bg-dd-surface-muted p-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
                        <span>
                          <small className="block text-dd-muted">Perubahan</small>
                          <strong>{item.quantity > 0 ? `+${item.quantity}` : item.quantity}</strong>
                        </span>
                        <span>
                          <small className="block text-dd-muted">Saldo saat diminta</small>
                          <strong>{item.ledgerBalanceAtRequest ?? 'Legacy'}</strong>
                        </span>
                        <span>
                          <small className="block text-dd-muted">Tertahan sekarang</small>
                          <strong>{item.currentReserved ?? '—'}</strong>
                        </span>
                        <span>
                          <small className="block text-dd-muted">Saldo sekarang</small>
                          <strong>{item.currentBalance ?? '—'}</strong>
                        </span>
                        <span>
                          <small className="block text-dd-muted">Proyeksi saldo</small>
                          <strong>{item.projectedLedgerBalance ?? '—'}</strong>
                        </span>
                        <span>
                          <small className="block text-dd-muted">Proyeksi tersedia</small>
                          <strong>{item.projectedAvailable ?? '—'}</strong>
                        </span>
                      </div>
                      <div className="mt-3 text-xs leading-5 text-dd-muted">
                        Diminta oleh {item.requestedBy?.displayName ?? 'data legacy'} ·{' '}
                        {date(item.createdAt, true)} ·{' '}
                        {adjustmentReasonLabels[item.reasonCode] ?? 'Alasan tercatat'}
                        {item.decidedBy
                          ? ` · diputuskan ${item.decidedBy.displayName} pada ${date(item.decidedAt, true)}`
                          : ''}
                      </div>
                      {item.eligibilityReason && item.status === 'PENDING' && (
                        <div className="mt-3">
                          <Feedback kind="warning">
                            {eligibilityMessages[item.eligibilityReason] ??
                              'Permintaan perlu diperiksa ulang sebelum diputuskan.'}
                          </Feedback>
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <ButtonLink
                          variant="ghost"
                          href={`/ledger/adjustments/${item.id}?returnTo=${encodeURIComponent(returnTo)}`}
                        >
                          Lihat detail
                        </ButtonLink>
                      </div>
                      {item.status === 'PENDING' && canDecide && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            disabled={item.eligibleForApproval === false}
                            onClick={() => {
                              setDecisionReason('CORRECTION_VERIFIED');
                              setDecisionNote('');
                              setDecisionIntent({ item, decision: 'approve' });
                            }}
                          >
                            Setujui
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setDecisionReason('INVALID_EVIDENCE');
                              setDecisionNote('');
                              setDecisionIntent({ item, decision: 'reject' });
                            }}
                          >
                            Tolak
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4">
                <Pagination
                  hasPrevious={activeAdjustmentCursor !== ''}
                  hasNext={Boolean(adjustmentCursor)}
                  totalLabel={`${adjustmentSummary?.total ?? adjustments.length} penyesuaian`}
                  onPrevious={() => {
                    const previous = adjustmentPreviousCursor ?? '';
                    setActiveAdjustmentCursor(previous);
                    onAdjustmentFiltersChange?.({
                      q: appliedAdjustmentSearch,
                      from: appliedAdjustmentFrom,
                      until: appliedAdjustmentUntil,
                      cursor: previous,
                    });
                  }}
                  onNext={() => {
                    if (!adjustmentCursor) return;
                    setActiveAdjustmentCursor(adjustmentCursor);
                    onAdjustmentFiltersChange?.({
                      q: appliedAdjustmentSearch,
                      from: appliedAdjustmentFrom,
                      until: appliedAdjustmentUntil,
                      cursor: adjustmentCursor,
                    });
                  }}
                />
              </div>
            </div>
          )}
        </Panel>
      )}

      <Drawer
        open={requestOpen}
        title="Buat permintaan penyesuaian"
        description="Permintaan tidak langsung mengubah saldo dan harus diputuskan actor berbeda."
        busy={mutationLoading}
        dirty={requestDirty}
        onDirtyClose={confirmDiscardRequest}
        onClose={() => {
          setSelectedPackage(undefined);
          setQuantity('');
          setRequestOpen(false);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={mutationLoading}
              onClick={() => void closeRequest()}
            >
              Batal
            </Button>
            <Button
              type="button"
              loading={mutationLoading}
              disabled={!selectedPackage || !quantity || Number(quantity) === 0}
              onClick={() => void submitAdjustmentRequest()}
            >
              Tinjau dan buat permintaan
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <AsyncSearchSelect
            label="Cari customer atau paket aktif"
            value={selectedPackage?.id ?? ''}
            selectedOption={selectedPackage}
            placeholder="Ketik minimal 2 karakter"
            loadOptions={searchPackages}
            onChange={(_id, option) => {
              setSelectedPackage(option as PackageOption | undefined);
              requestIntent.current = undefined;
            }}
          />
          <TextInput
            label="Perubahan sesi"
            type="number"
            value={quantity}
            onChange={(event) => {
              setQuantity(event.target.value);
              requestIntent.current = undefined;
            }}
            placeholder="Contoh: 2 atau -1"
          />
          <SelectInput
            label="Alasan"
            value={reasonCode}
            onChange={(event) => {
              setReasonCode(event.target.value);
              requestIntent.current = undefined;
            }}
          >
            {[
              'MIGRATION_CORRECTION',
              'ATTENDANCE_CORRECTION',
              'PACKAGE_COMPENSATION',
              'SUPPORT_RECONCILIATION',
            ].map((code) => (
              <option key={code} value={code}>
                {adjustmentReasonLabels[code]}
              </option>
            ))}
          </SelectInput>
          {selectedPackage && quantity && Number(quantity) !== 0 && (
            <div className="rounded-dd-md border border-dd-line bg-dd-surface-muted p-4 text-sm">
              <strong className="block text-dd-ink">Proyeksi setelah perubahan</strong>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <span>
                  Saldo <strong>{selectedPackage.ledgerBalance + Number(quantity)}</strong>
                </span>
                <span>
                  Tersedia{' '}
                  <strong>
                    {selectedPackage.ledgerBalance + Number(quantity) - selectedPackage.reserved}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </Drawer>

      <Modal
        open={Boolean(decisionIntent)}
        title={
          decisionIntent?.decision === 'approve'
            ? 'Persetujuan penyesuaian'
            : 'Penolakan penyesuaian'
        }
        description="Keputusan dicatat dalam audit dan tidak dapat dilakukan oleh requester yang sama."
        busy={mutationLoading}
        dirty={Boolean(decisionNote)}
        onClose={() => {
          setDecisionIntent(undefined);
          setDecisionNote('');
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              disabled={mutationLoading}
              onClick={() => {
                setDecisionIntent(undefined);
                setDecisionNote('');
              }}
            >
              Batal
            </Button>
            <Button
              variant={decisionIntent?.decision === 'reject' ? 'danger' : 'primary'}
              loading={mutationLoading}
              disabled={
                decisionIntent?.decision === 'approve' &&
                decisionIntent.item.eligibleForApproval === false
              }
              onClick={() => void submitAdjustmentDecision()}
            >
              Konfirmasi keputusan
            </Button>
          </div>
        }
      >
        {decisionIntent && (
          <div className="grid gap-4">
            <p className="text-sm leading-6 text-dd-muted">
              {decisionIntent.item.customer?.displayName ?? 'Customer'} · perubahan{' '}
              {decisionIntent.item.quantity} · proyeksi tersedia{' '}
              {decisionIntent.item.projectedAvailable ?? '—'}.
            </p>
            <SelectInput
              label="Alasan keputusan"
              value={decisionReason}
              onChange={(event) => setDecisionReason(event.target.value)}
            >
              {(decisionIntent.decision === 'approve'
                ? ['CORRECTION_VERIFIED']
                : ['INVALID_EVIDENCE', 'DUPLICATE_REQUEST', 'OUT_OF_SCOPE']
              ).map((code) => (
                <option key={code} value={code}>
                  {adjustmentReasonLabels[code]}
                </option>
              ))}
            </SelectInput>
            <Textarea
              label="Catatan keputusan (opsional)"
              value={decisionNote}
              maxLength={500}
              onChange={(event) => setDecisionNote(event.target.value)}
              description={`${decisionNote.length}/500 karakter. Catatan aman akan disimpan pada keputusan.`}
            />
          </div>
        )}
      </Modal>

      {message && !mutationLoading && <Feedback kind="status">{message}</Feedback>}
      {error && <Feedback kind="error">{error}</Feedback>}
    </section>
  );
}
