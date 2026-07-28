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
} from '../identity-client';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { useSessionContext } from '../session-context';
import {
  Badge,
  Button,
  DataTable,
  FilterBar,
  Panel,
  SearchableLookup,
} from '../components/admin/admin-ui';
import { DateInput, SelectInput, TextInput } from '../components/forms';

const failureCopy: Record<UiFailure, string> = {
  CONFIGURATION_REQUIRED: 'Audit belum dapat dimuat.',
  RATE_LIMITED: 'Terlalu banyak permintaan. Coba kembali nanti.',
  FORBIDDEN: 'Anda tidak memiliki permission untuk melihat audit.',
  IDENTITY_CONFLICT: 'Filter audit tidak dapat diterapkan.',
  STALE_VERSION: 'Data audit berubah. Muat ulang.',
  SESSION_REVOKED: 'Sesi berakhir. Silakan masuk kembali.',
};

export function AuditView({ client = browserIdentityClient }: { client?: IdentityClient }) {
  const context = useSessionContext();
  const [items, setItems] = useState<AuditSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState<UiFailure>();
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [actor, setActor] = useState<LookupOption>();
  const [target, setTarget] = useState<LookupOption>();
  const [exportJob, setExportJob] = useState<AuditExportSummary>();
  const [exportFormat, setExportFormat] = useState<'CSV' | 'JSONL'>('CSV');
  const [exportReason, setExportReason] = useState('Audit operasional berkala');
  const [filters, setFilters] = useState({
    actorId: '',
    targetUserId: '',
    action: '',
    branchId: '',
    correlationId: '',
    from: '',
    until: '',
  });
  const lookup = useCallback(
    (q: string) =>
      client
        .lookupUsers({ q, branchId: filters.branchId || undefined, limit: 10 })
        .then(({ items }) => items),
    [client, filters.branchId],
  );

  const load = async (cursor?: string) => {
    setLoading(true);
    setFailure(undefined);
    try {
      const result = await client.listAuditLogs({
        ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
        ...(filters.from ? { from: new Date(`${filters.from}T00:00:00`).toISOString() } : {}),
        ...(filters.until
          ? { until: new Date(`${filters.until}T23:59:59.999`).toISOString() }
          : {}),
        cursor,
      });
      setItems(cursor ? (current) => [...current, ...result.items] : result.items);
      setNextCursor(result.page.nextCursor);
    } catch (error) {
      setFailure(failureCode(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="audit-workspace space-y-6" aria-labelledby="audit-page-title">
      <Panel className="p-6 sm:p-8">
        <PageHeader
          eyebrow="Keamanan dan akses"
          title="Audit akses"
          titleId="audit-page-title"
          description="Riwayat perubahan akses yang sudah dimasking. Token, password, OTP, dan data privat tidak ditampilkan."
          context={<StatusBadge tone="info">SUPER OWNER</StatusBadge>}
        />
      </Panel>

      <form
        className="space-y-4"
        aria-label="Filter audit akses"
        onSubmit={(event) => {
          event.preventDefault();
          void load();
        }}
      >
        <FilterBar>
          <SearchableLookup
            label="Aktor"
            value={actor}
            load={lookup}
            onChange={(option) => {
              setActor(option);
              setFilters({ ...filters, actorId: option?.id ?? '' });
            }}
            placeholder="Cari nama aktor"
          />
          <SearchableLookup
            label="Target pengguna"
            value={target}
            load={lookup}
            onChange={(option) => {
              setTarget(option);
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
          <SelectInput
            label="Cabang"
            value={filters.branchId}
            onChange={(event) => setFilters({ ...filters, branchId: event.target.value })}
          >
            <option value="">Semua cabang</option>
            {(context?.session?.branches ?? []).map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.code} · {branch.name}
              </option>
            ))}
          </SelectInput>
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
          <Button type="submit" disabled={loading}>
            {loading ? 'Memuat…' : 'Terapkan filter'}
          </Button>
        </FilterBar>
      </form>

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
          items={items}
          rowKey={(item) => item.id}
          columns={[
            {
              id: 'time',
              header: 'Waktu',
              cell: (item) => new Date(item.occurredAt).toLocaleString('id-ID'),
            },
            { id: 'action', header: 'Tindakan', cell: (item) => <strong>{item.action}</strong> },
            { id: 'actor', header: 'Aktor', cell: (item) => item.actorId ?? 'SYSTEM' },
            {
              id: 'target',
              header: 'Target',
              cell: (item) =>
                item.targetUserId ?? (item.objectType === 'User' ? item.objectId : '—'),
            },
            { id: 'branch', header: 'Cabang', cell: (item) => item.branchId ?? 'Global' },
            { id: 'reference', header: 'Referensi', cell: (item) => item.correlationId },
          ]}
          mobileCard={(item) => (
            <div>
              <div className="flex items-start justify-between gap-3">
                <strong>{item.action}</strong>
                <time className="text-xs text-dd-muted">
                  {new Date(item.occurredAt).toLocaleString('id-ID')}
                </time>
              </div>
              <p className="mt-2 text-sm text-dd-muted">Aktor: {item.actorId ?? 'SYSTEM'}</p>
              <p className="mt-1 text-xs text-dd-muted">Ref: {item.correlationId}</p>
            </div>
          )}
        />
      )}
      {nextCursor && (
        <Button variant="secondary" disabled={loading} onClick={() => void load(nextCursor)}>
          Muat audit berikutnya
        </Button>
      )}
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
            disabled={loading || exportReason.trim().length < 3 || !filters.from || !filters.until}
            onClick={() =>
              void (async () => {
                setLoading(true);
                try {
                  const branchIds = filters.branchId
                    ? [filters.branchId]
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
                {exportJob.status}
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
                  onClick={() => void client.getAuditExport(exportJob.id).then(setExportJob)}
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
                  }
                >
                  Unduh privat
                </Button>
              )}
            </div>
          </div>
        )}
      </Panel>
    </section>
  );
}
