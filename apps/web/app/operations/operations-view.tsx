'use client';
import { useState } from 'react';
import {
  browserOperationsClient,
  operationsFailure,
  type OperationalJob,
  type OperationsClient,
} from '../operations-client';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { useSessionContext } from '../session-context';
import { Badge, Button, DataTable, FilterBar, Panel, StatCard } from '../components/admin/admin-ui';

export function OperationsView({
  client = browserOperationsClient,
}: {
  client?: OperationsClient;
}) {
  const [items, setItems] = useState<OperationalJob[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [failure, setFailure] = useState<string>();
  const [statusFilter, setStatusFilter] = useState('');
  const sessionContext = useSessionContext();
  const canRecover = !sessionContext || sessionContext.hasCapability('operations:recover');
  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    setFailure(undefined);
    try {
      await action();
      setMessage(success);
    } catch (error) {
      setFailure(operationsFailure(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="space-y-6" aria-labelledby="operations-title">
      <Panel className="p-6 sm:p-8">
        <PageHeader
          eyebrow="Operational recovery"
          title="H-24 quota evaluation"
          titleId="operations-title"
          description="Job berjalan sebagai SYSTEM. Recovery manual wajib capability operations dan dicatat di audit."
          context={
            <>
              <StatusBadge tone="info">OPS / SUPER OWNER</StatusBadge>
              <StatusBadge tone="warning">Recovery terbatas</StatusBadge>
            </>
          }
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Job ditampilkan"
            value={String(items.length)}
            helper="Sesuai filter aktif"
          />
          <StatCard
            label="Perlu recovery"
            value={String(
              items.filter((item) => item.status === 'FAILED' || item.status === 'RETRYING').length,
            )}
            tone="warning"
          />
          <StatCard
            label="Selesai"
            value={String(items.filter((item) => item.status === 'SUCCEEDED').length)}
            tone="success"
          />
        </div>
      </Panel>
      <FilterBar>
        <Button
          disabled={busy}
          onClick={() =>
            void run(
              async () => setItems(await client.list(statusFilter || undefined)),
              'Job diperbarui.',
            )
          }
        >
          Muat job
        </Button>
        <label>
          Filter status
          <select
            aria-label="Filter status job"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">Semua status</option>
            <option value="QUEUED">QUEUED</option>
            <option value="RETRYING">RETRYING</option>
            <option value="RUNNING">RUNNING</option>
            <option value="SUCCEEDED">SUCCEEDED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </label>
      </FilterBar>
      {busy && <Skeleton label="Memuat antrean job" />}
      {failure && <Feedback kind="error">{failure}</Feedback>}
      {message && !busy && <Feedback kind="status">{message}</Feedback>}
      {items.length === 0 ? (
        <EmptyState
          title="Belum ada job quota"
          description="Muat ulang antrean atau ubah filter status."
        />
      ) : (
        <DataTable
          items={items}
          rowKey={(job) => job.id}
          columns={[
            {
              id: 'status',
              header: 'Status',
              cell: (job) => (
                <Badge
                  tone={
                    job.status === 'SUCCEEDED'
                      ? 'success'
                      : job.status === 'FAILED'
                        ? 'danger'
                        : 'warning'
                  }
                >
                  {job.status}
                </Badge>
              ),
            },
            { id: 'due', header: 'Jadwal', cell: (job) => job.dueAt.toLocaleString('id-ID') },
            {
              id: 'attempt',
              header: 'Percobaan',
              cell: (job) => `${job.attemptCount}/${job.maxAttempts}`,
            },
            { id: 'failure', header: 'Failure code', cell: (job) => job.lastErrorCode ?? '—' },
            {
              id: 'action',
              header: 'Recovery',
              cell: (job) => (
                <Button
                  variant="secondary"
                  disabled={busy || job.status === 'SUCCEEDED' || !canRecover}
                  onClick={() =>
                    void run(async () => {
                      const result = await client.run(job);
                      setItems((current) =>
                        current.map((item) =>
                          item.id === job.id
                            ? { ...item, status: 'SUCCEEDED', progress: 100 }
                            : item,
                        ),
                      );
                      setMessage(`${result.status}: ${result.bookingCount}/${result.minimumQuota}`);
                    }, 'Evaluasi selesai.')
                  }
                >
                  Jalankan recovery
                </Button>
              ),
            },
          ]}
          mobileCard={(job) => (
            <div>
              <div className="flex items-center justify-between">
                <Badge
                  tone={
                    job.status === 'SUCCEEDED'
                      ? 'success'
                      : job.status === 'FAILED'
                        ? 'danger'
                        : 'warning'
                  }
                >
                  {job.status}
                </Badge>
                <span className="text-xs text-dd-muted">
                  {job.attemptCount}/{job.maxAttempts} percobaan
                </span>
              </div>
              <p className="mt-3 text-sm">Due {job.dueAt.toLocaleString('id-ID')}</p>
              {job.lastErrorCode && (
                <p className="mt-1 font-mono text-xs text-dd-danger">{job.lastErrorCode}</p>
              )}
              <Button
                className="mt-4 w-full"
                variant="secondary"
                disabled={busy || job.status === 'SUCCEEDED' || !canRecover}
                onClick={() =>
                  void run(async () => {
                    await client.run(job);
                    setItems((current) =>
                      current.map((item) =>
                        item.id === job.id ? { ...item, status: 'SUCCEEDED', progress: 100 } : item,
                      ),
                    );
                  }, 'Evaluasi selesai.')
                }
              >
                Jalankan recovery
              </Button>
            </div>
          )}
        />
      )}
    </section>
  );
}
