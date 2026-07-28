'use client';
import { useState } from 'react';
import {
  browserOperationsClient,
  operationsFailure,
  type NotificationOccurrence,
  type NotificationOccurrencePage,
  type OperationalJob,
  type OperationsClient,
} from '../operations-client';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { useSessionContext } from '../session-context';
import { Badge, Button, DataTable, FilterBar, Panel, StatCard } from '../components/admin/admin-ui';
import { controlClassName } from '../components/forms';

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
  const [emailPage, setEmailPage] = useState<NotificationOccurrencePage>();
  const [emailStatusFilter, setEmailStatusFilter] = useState('');
  const [emailRetryReason, setEmailRetryReason] = useState('');
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
            className={controlClassName}
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
      <Panel className="p-6 sm:p-8">
        <PageHeader
          eyebrow="Transactional email"
          title="SMTP delivery dashboard"
          description="Status tertinggi adalah ACCEPTED_BY_SMTP. Recipient tetap dimasking dan retry manual masuk audit."
          context={
            <>
              <StatusBadge tone="info">NIAGAHOSTER SMTP</StatusBadge>
              <StatusBadge tone="warning">Dead-letter terlihat</StatusBadge>
            </>
          }
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Pending" value={String(emailPage?.metrics.pendingCount ?? 0)} />
          <StatCard
            label="Accepted"
            value={`${((emailPage?.metrics.acceptedRateBasisPoints ?? 0) / 100).toFixed(2)}%`}
            tone="success"
          />
          <StatCard
            label="Terminal"
            value={String(emailPage?.metrics.terminalFailureCount ?? 0)}
            tone="warning"
          />
          <StatCard label="Retry" value={String(emailPage?.metrics.retryCount ?? 0)} />
          <StatCard
            label="Queue age"
            value={`${emailPage?.metrics.queueAgeSeconds ?? 0}s`}
            helper={`Rate-limit waits: ${emailPage?.metrics.rateLimitWaitCount ?? 0}`}
          />
        </div>
      </Panel>
      <FilterBar>
        <Button
          disabled={busy || !client.listEmails}
          onClick={() =>
            void run(async () => {
              if (!client.listEmails) return;
              setEmailPage(await client.listEmails(emailStatusFilter || undefined));
            }, 'Status email diperbarui.')
          }
        >
          Muat email
        </Button>
        <label>
          Filter status email
          <select
            className={controlClassName}
            aria-label="Filter status email"
            value={emailStatusFilter}
            onChange={(event) => setEmailStatusFilter(event.target.value)}
          >
            <option value="">Semua status</option>
            {[
              'PENDING',
              'SENDING',
              'ACCEPTED_BY_SMTP',
              'FAILED_RETRYABLE',
              'FAILED_TERMINAL',
              'EXPIRED',
              'FALLBACK_IN_APP',
            ].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          Alasan retry
          <input
            className={controlClassName}
            aria-label="Alasan retry email"
            value={emailRetryReason}
            onChange={(event) => setEmailRetryReason(event.target.value)}
            placeholder="Contoh: credential SMTP sudah diperbaiki"
          />
        </label>
      </FilterBar>
      {emailPage && emailPage.items.length === 0 ? (
        <EmptyState
          title="Belum ada delivery email"
          description="Ubah filter atau muat ulang antrean."
        />
      ) : emailPage ? (
        <DataTable
          items={emailPage.items}
          rowKey={(item) => item.id}
          columns={[
            {
              id: 'status',
              header: 'Status',
              cell: (item) => (
                <Badge
                  tone={
                    item.status === 'ACCEPTED_BY_SMTP'
                      ? 'success'
                      : ['FAILED_TERMINAL', 'FALLBACK_IN_APP', 'EXPIRED'].includes(item.status)
                        ? 'danger'
                        : 'warning'
                  }
                >
                  {item.status}
                </Badge>
              ),
            },
            {
              id: 'recipient',
              header: 'Recipient',
              cell: (item) => item.recipientMasked,
            },
            { id: 'event', header: 'Event', cell: (item) => item.eventType },
            {
              id: 'attempt',
              header: 'Attempt',
              cell: (item) => `${item.attemptCount}/${item.maxAttempts}`,
            },
            {
              id: 'action',
              header: 'Recovery',
              cell: (item) => (
                <Button
                  variant="secondary"
                  disabled={
                    busy ||
                    !canRecover ||
                    !client.retryEmail ||
                    emailRetryReason.trim().length < 3 ||
                    !['FAILED_TERMINAL', 'FAILED_RETRYABLE', 'FALLBACK_IN_APP'].includes(
                      item.status,
                    )
                  }
                  onClick={() =>
                    void run(async () => {
                      if (!client.retryEmail) return;
                      const result = await client.retryEmail(item.id, emailRetryReason.trim());
                      setEmailPage((current) =>
                        current
                          ? {
                              ...current,
                              items: current.items.map((delivery) =>
                                delivery.id === item.id
                                  ? ({
                                      ...delivery,
                                      status: result.status,
                                      nextAttemptAt: result.nextAttemptAt,
                                    } as NotificationOccurrence)
                                  : delivery,
                              ),
                            }
                          : current,
                      );
                    }, 'Retry email dijadwalkan.')
                  }
                >
                  Retry email
                </Button>
              ),
            },
          ]}
          mobileCard={(item) => (
            <div>
              <div className="flex items-center justify-between gap-3">
                <Badge tone={item.status === 'ACCEPTED_BY_SMTP' ? 'success' : 'warning'}>
                  {item.status}
                </Badge>
                <span className="text-xs text-dd-muted">{item.recipientMasked}</span>
              </div>
              <p className="mt-3 break-all text-sm">{item.eventType}</p>
              <p className="mt-1 text-xs text-dd-muted">
                {item.attemptCount}/{item.maxAttempts} attempt · {item.rateLimitWaitCount} wait
              </p>
            </div>
          )}
        />
      ) : null}
    </section>
  );
}
