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
  const hasMfa = !sessionContext || sessionContext.session?.assurance === 'MFA';
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
    <section className="card" aria-labelledby="operations-title">
      <PageHeader
        eyebrow="Operational recovery"
        title="H-24 quota evaluation"
        titleId="operations-title"
        description="Job berjalan sebagai SYSTEM. Recovery manual wajib capability operations dan MFA."
        context={
          <>
            <StatusBadge tone="info">OPS / SUPER OWNER</StatusBadge>
            <StatusBadge tone="warning">MFA recovery</StatusBadge>
          </>
        }
      />
      <button
        disabled={busy}
        onClick={() =>
          void run(
            async () => setItems(await client.list(statusFilter || undefined)),
            'Job diperbarui.',
          )
        }
      >
        Muat job
      </button>
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
      {busy && <Skeleton label="Memuat antrean job" />}
      {failure && <Feedback kind="error">{failure}</Feedback>}
      {message && !busy && <Feedback kind="status">{message}</Feedback>}
      {items.length === 0 ? (
        <EmptyState
          title="Belum ada job quota"
          description="Muat ulang antrean atau ubah filter status."
        />
      ) : (
        <ul aria-label="Daftar job quota">
          {items.map((job) => (
            <li key={job.id}>
              <strong>{job.status}</strong> · due {job.dueAt.toISOString()} · attempt{' '}
              {job.attemptCount}/{job.maxAttempts}
              {job.lastErrorCode ? ` · ${job.lastErrorCode}` : ''}
              <button
                disabled={busy || job.status === 'SUCCEEDED' || !canRecover || !hasMfa}
                onClick={() =>
                  void run(async () => {
                    const result = await client.run(job);
                    setItems((current) =>
                      current.map((item) =>
                        item.id === job.id ? { ...item, status: 'SUCCEEDED', progress: 100 } : item,
                      ),
                    );
                    setMessage(`${result.status}: ${result.bookingCount}/${result.minimumQuota}`);
                  }, 'Evaluasi selesai.')
                }
              >
                Jalankan recovery MFA
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
