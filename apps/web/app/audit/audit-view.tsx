'use client';

import { useCallback, useState } from 'react';
import {
  browserIdentityClient,
  failureCode,
  type AuditSummary,
  type IdentityClient,
  type LookupOption,
  type AuditExportSummary,
  type UiFailure,
} from '@/api-clients/identity-client';
import { EmptyState, Feedback, Skeleton, StatusBadge } from '../ui';
import { AdminPageHeader } from '../components/admin/admin-page-header';
import { useSessionContext } from '../session-context';
import { Badge, DataTable, FilterBar, Pagination, Panel } from '../components/admin/admin-ui';
import { Button } from '../components/actions';
import { AsyncSearchSelect, DateInput, SelectInput, TextInput } from '../components/forms';
import { pageOffset } from '../lib/pagination';

const failureCopy: Record<UiFailure, string> = {
  AUTHENTICATION_REQUIRED: 'Sesi berakhir. Silakan masuk kembali.',
  CONFIGURATION_REQUIRED: 'Audit belum dapat dimuat.',
  INTERNAL_ERROR: 'Audit mengalami gangguan internal.',
  RATE_LIMITED: 'Terlalu banyak permintaan. Coba kembali nanti.',
  SERVICE_UNAVAILABLE: 'Layanan audit tidak dapat dihubungi.',
  FORBIDDEN: 'Anda tidak memiliki hak akses untuk melihat audit.',
  IDENTITY_CONFLICT: 'Filter audit tidak dapat diterapkan.',
  STALE_VERSION: 'Data audit berubah. Muat ulang.',
  SESSION_REVOKED: 'Sesi berakhir. Silakan masuk kembali.',
};

const exportStatusLabels: Record<string, string> = {
  READY: 'Siap diunduh',
  FAILED: 'Gagal diproses',
  QUEUED: 'Dalam antrean',
  PROCESSING: 'Sedang diproses',
};

const actionLabels: Record<string, string> = {
  'payment-proof.viewed': 'Bukti pembayaran dilihat',
  'security.identity_document_viewed': 'Dokumen identitas dilihat',
  'security.identity_document_view_authorized': 'Akses dokumen identitas diterbitkan',
  'security.user_roles_changed': 'Role dan cakupan pengguna diubah',
  'security.user_profile_updated': 'Profil pengguna diperbarui',
};

const humanizeAction = (action: string) =>
  actionLabels[action] ??
  action.replace(/[._-]+/gu, ' ').replace(/\b\w/gu, (character) => character.toUpperCase());

export function AuditView({ client = browserIdentityClient }: { client?: IdentityClient }) {
  const context = useSessionContext();
  // Cakupan cabang mengikuti pemilih "Cabang aktif" di topbar.
  const branchId = context?.activeBranchId ?? '';
  const [items, setItems] = useState<AuditSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState<UiFailure>();
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string>();
  const [cursorHistory, setCursorHistory] = useState<Array<string | undefined>>([]);
  const [actor, setActor] = useState<LookupOption>();
  const [target, setTarget] = useState<LookupOption>();
  const [exportJob, setExportJob] = useState<AuditExportSummary>();
  const [exportFormat, setExportFormat] = useState<'CSV' | 'JSONL'>('CSV');
  const [exportReason, setExportReason] = useState('Audit operasional berkala');
  const [filters, setFilters] = useState({
    actorId: '',
    targetUserId: '',
    action: '',
    correlationId: '',
    from: '',
    until: '',
  });
  const exportPeriodError =
    filters.from && filters.until && filters.from > filters.until
      ? 'Tanggal awal tidak boleh melewati tanggal akhir.'
      : !filters.from || !filters.until
        ? 'Pilih tanggal awal dan tanggal akhir untuk membuat export.'
        : '';
  const lookup = useCallback(
    (q: string) =>
      client
        .lookupUsers({ q, branchId: branchId || undefined, limit: 10 })
        .then(({ items }) => items),
    [client, branchId],
  );

  const load = async (requestedCursor?: string) => {
    setLoading(true);
    setFailure(undefined);
    try {
      const result = await client.listAuditLogs({
        ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
        ...(branchId ? { branchId } : {}),
        ...(filters.from ? { from: new Date(`${filters.from}T00:00:00`).toISOString() } : {}),
        ...(filters.until
          ? { until: new Date(`${filters.until}T23:59:59.999`).toISOString() }
          : {}),
        cursor: requestedCursor,
      });
      setItems(result.items);
      setNextCursor(result.page.nextCursor);
    } catch (error) {
      setFailure(failureCode(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="audit-workspace space-y-6" aria-labelledby="audit-page-title">
      <AdminPageHeader
        title="Audit akses"
        titleId="audit-page-title"
        description="Riwayat perubahan akses yang sudah dimasking. Token, password, OTP, dan data privat tidak ditampilkan."
        actions={<StatusBadge tone="info">SUPER OWNER</StatusBadge>}
      />

      <FilterBar
        label="Filter audit akses"
        applying={loading}
        onApply={() => {
          setCursor(undefined);
          setCursorHistory([]);
          void load();
        }}
      >
        <AsyncSearchSelect
          label="Aktor"
          value={actor?.id ?? ''}
          selectedOption={actor}
          loadOptions={lookup}
          onChange={(_id, option) => {
            setActor(option as LookupOption | undefined);
            setFilters({ ...filters, actorId: option?.id ?? '' });
          }}
          placeholder="Cari nama aktor"
        />
        <AsyncSearchSelect
          label="Target pengguna"
          value={target?.id ?? ''}
          selectedOption={target}
          loadOptions={lookup}
          onChange={(_id, option) => {
            setTarget(option as LookupOption | undefined);
            setFilters({ ...filters, targetUserId: option?.id ?? '' });
          }}
          placeholder="Cari nama target"
        />
        <TextInput
          label="Tindakan"
          value={filters.action}
          onChange={(event) => setFilters({ ...filters, action: event.target.value })}
          placeholder="Contoh: role pengguna diubah"
        />
        <DateInput
          label="Dari tanggal"
          value={filters.from}
          onChange={(event) => setFilters({ ...filters, from: event.target.value })}
        />
        <DateInput
          label="Sampai tanggal"
          value={filters.until}
          onChange={(event) => setFilters({ ...filters, until: event.target.value })}
        />
        <TextInput
          label="Referensi permintaan"
          value={filters.correlationId}
          onChange={(event) => setFilters({ ...filters, correlationId: event.target.value })}
          placeholder="Correlation ID"
        />
      </FilterBar>

      {loading && items.length === 0 && <Skeleton label="Memuat audit akses" />}
      {failure && <Feedback kind="error">{failureCopy[failure]}</Feedback>}
      {!loading && !failure && items.length === 0 && (
        <EmptyState
          title="Belum ada hasil audit"
          description="Terapkan filter untuk menampilkan riwayat perubahan akses."
        />
      )}
      {items.length > 0 && (
        <DataTable
          rowNumberOffset={pageOffset(cursorHistory.length)}
          items={items}
          rowKey={(item) => item.id}
          columns={[
            {
              id: 'time',
              header: 'Waktu',
              cell: (item) => new Date(item.occurredAt).toLocaleString('id-ID'),
            },
            {
              id: 'action',
              header: 'Tindakan',
              cell: (item) => <strong>{humanizeAction(item.action)}</strong>,
            },
            {
              id: 'actor',
              header: 'Aktor',
              cell: (item) => item.actor?.displayName ?? 'Sistem',
            },
            {
              id: 'target',
              header: 'Target',
              cell: (item) => item.target?.displayName ?? '—',
            },
            {
              id: 'branch',
              header: 'Cabang',
              cell: (item) => item.branch?.name ?? 'Global',
            },
            {
              id: 'reference',
              header: 'Referensi',
              cell: (item) => (
                <details>
                  <summary className="cursor-pointer text-dd-forest">Lihat referensi</summary>
                  <code className="mt-1 block max-w-48 break-all text-xs">
                    {item.correlationId}
                  </code>
                </details>
              ),
            },
          ]}
          mobileCard={(item) => (
            <div>
              <div className="flex items-start justify-between gap-3">
                <strong>{humanizeAction(item.action)}</strong>
                <time className="text-xs text-dd-muted">
                  {new Date(item.occurredAt).toLocaleString('id-ID')}
                </time>
              </div>
              <p className="mt-2 text-sm text-dd-muted">
                Aktor: {item.actor?.displayName ?? 'Sistem'}
              </p>
              <p className="mt-1 text-xs text-dd-muted">Cabang: {item.branch?.name ?? 'Global'}</p>
            </div>
          )}
        />
      )}
      <Pagination
        hasPrevious={cursorHistory.length > 0}
        hasNext={Boolean(nextCursor)}
        currentPage={cursorHistory.length + 1}
        onPrevious={() => {
          const previous = cursorHistory.at(-1);
          setCursorHistory((current) => current.slice(0, -1));
          setCursor(previous);
          void load(previous);
        }}
        onNext={() => {
          if (!nextCursor) return;
          setCursorHistory((current) => [...current, cursor]);
          setCursor(nextCursor);
          void load(nextCursor);
        }}
      />
      <Panel className="p-5">
        <h2 className="text-lg font-semibold text-dd-ink">Export audit privat</h2>
        <p className="mt-1 text-sm text-dd-muted">
          Export berjalan asynchronous, kedaluwarsa dalam 24 jam, dan setiap unduhan memerlukan
          otorisasi singkat.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <SelectInput
            label="Format"
            value={exportFormat}
            onChange={(event) => setExportFormat(event.target.value as 'CSV' | 'JSONL')}
          >
            <option>CSV</option>
            <option>JSONL</option>
          </SelectInput>
          <TextInput
            label="Alasan"
            wrapperClassName="min-w-72 flex-1"
            value={exportReason}
            minLength={3}
            onChange={(event) => setExportReason(event.target.value)}
          />
          <Button
            type="button"
            disabled={loading || exportReason.trim().length < 3 || Boolean(exportPeriodError)}
            onClick={() =>
              void (async () => {
                setLoading(true);
                try {
                  const branchIds = branchId
                    ? [branchId]
                    : (context?.session?.branches ?? []).map(({ id }) => id);
                  setExportJob(
                    await client.createAuditExport(
                      {
                        branchIds,
                        from: new Date(`${filters.from}T00:00:00`).toISOString(),
                        to: new Date(`${filters.until}T23:59:59.999`).toISOString(),
                        actorId: actor?.id,
                        format: exportFormat,
                        reason: exportReason,
                      },
                      crypto.randomUUID(),
                    ),
                  );
                } catch (error) {
                  setFailure(failureCode(error));
                } finally {
                  setLoading(false);
                }
              })()
            }
          >
            Buat export
          </Button>
        </div>
        {exportPeriodError && (
          <p className="mt-3 text-sm text-dd-warning" role="status">
            {exportPeriodError}
          </p>
        )}
        {exportJob && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-dd-md bg-dd-surface-muted p-4">
            <div>
              <Badge
                tone={
                  exportJob.status === 'READY'
                    ? 'success'
                    : exportJob.status === 'FAILED'
                      ? 'danger'
                      : 'warning'
                }
              >
                {exportStatusLabels[exportJob.status] ?? exportJob.status}
              </Badge>
              <p className="mt-2 text-sm text-dd-muted">
                {exportJob.rowCount.toLocaleString('id-ID')} baris · kedaluwarsa{' '}
                {new Date(exportJob.expiresAt).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="flex gap-2">
              {exportJob.status !== 'READY' && exportJob.status !== 'FAILED' && (
                <Button
                  variant="secondary"
                  onClick={() =>
                    void client
                      .getAuditExport(exportJob.id)
                      .then(setExportJob)
                      .catch((error) => setFailure(failureCode(error)))
                  }
                >
                  Periksa status
                </Button>
              )}
              {exportJob.status === 'READY' && (
                <Button
                  onClick={() =>
                    void client
                      .authorizeAuditExport(exportJob.id)
                      .then(({ url }) => window.open(url, '_blank', 'noopener,noreferrer'))
                      .catch((error) => setFailure(failureCode(error)))
                  }
                >
                  Unduh file ekspor
                </Button>
              )}
            </div>
          </div>
        )}
      </Panel>
    </section>
  );
}
