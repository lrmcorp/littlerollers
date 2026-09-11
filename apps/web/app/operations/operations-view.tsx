'use client';
import { useEffect, useState } from 'react';
import {
  browserOperationsClient,
  operationsFailure,
  type NotificationOccurrence,
  type NotificationOccurrencePage,
  type OperationalJobPage,
  type OperationsClient,
} from '@/api-clients/operations-client';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { useSessionContext } from '../session-context';
import { Button } from '../components/actions';
import {
  Badge,
  DataTable,
  FilterBar,
  Pagination,
  Panel,
  StatCard,
} from '../components/admin/admin-ui';
import { SelectInput, TextInput } from '../components/forms';

const statusLabel: Record<string, string> = {
  QUEUED: 'Menunggu',
  RETRYING: 'Mencoba kembali',
  RUNNING: 'Sedang berjalan',
  SUCCEEDED: 'Berhasil',
  FAILED: 'Gagal',
  DEAD_LETTER: 'Dead-letter',
  PENDING: 'Menunggu',
  SENDING: 'Sedang dikirim',
  ACCEPTED_BY_SMTP: 'Diterima server email',
  FAILED_RETRYABLE: 'Gagal—dapat dicoba lagi',
  FAILED_TERMINAL: 'Gagal permanen',
  EXPIRED: 'Kedaluwarsa',
  FALLBACK_IN_APP: 'Dialihkan ke notifikasi aplikasi',
};

const safeFailureLabel = (code?: string | null) =>
  code ? 'Memerlukan pemeriksaan operasional' : '—';

export function OperationsView({
  client = browserOperationsClient,
  access,
}: {
  client?: OperationsClient;
  access?: { canRecover: boolean };
}) {
  const [jobPage, setJobPage] = useState<OperationalJobPage>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [failure, setFailure] = useState<string>();
  const [statusFilter, setStatusFilter] = useState('');
  const [jobCursor, setJobCursor] = useState<string>();
  const [jobCursorHistory, setJobCursorHistory] = useState<(string | undefined)[]>([]);
  const [jobRecoveryReason, setJobRecoveryReason] = useState('');
  const [emailPage, setEmailPage] = useState<NotificationOccurrencePage>();
  const [emailStatusFilter, setEmailStatusFilter] = useState('');
  const [emailCursor, setEmailCursor] = useState<string>();
  const [emailCursorHistory, setEmailCursorHistory] = useState<(string | undefined)[]>([]);
  const [emailRetryReason, setEmailRetryReason] = useState('');
  const sessionContext = useSessionContext();
  const canRecover =
    access?.canRecover ??
    (sessionContext?.status === 'authenticated' &&
      sessionContext.hasCapability('operations:recover'));
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
  useEffect(() => {
    let active = true;
    setBusy(true);
    setFailure(undefined);
    Promise.all([
      client.list(statusFilter || undefined, jobCursor),
      client.listEmails
        ? client.listEmails(emailStatusFilter || undefined, emailCursor)
        : Promise.resolve(undefined),
    ])
      .then(([jobs, email]) => {
        if (!active) return;
        setJobPage(jobs);
        if (email) setEmailPage(email);
      })
      .catch((error) => {
        if (active) setFailure(operationsFailure(error));
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [client, emailCursor, emailStatusFilter, jobCursor, statusFilter]);
  const items = jobPage?.items ?? [];
  return (
    <section className="space-y-6" aria-labelledby="operations-title">
      <Panel className="p-6 sm:p-8">
        <PageHeader
          eyebrow="Pemulihan operasional"
          title="Evaluasi kuota H-24"
          titleId="operations-title"
          description="Antrean evaluasi otomatis berjalan oleh sistem. Pemulihan manual memerlukan izin operasional dan dicatat dalam log audit."
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
        <SelectInput
          label="Filter status job"
          aria-label="Filter status job"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setJobCursor(undefined);
            setJobCursorHistory([]);
          }}
        >
          <option value="">Semua status</option>
          {['QUEUED', 'RETRYING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'DEAD_LETTER'].map((status) => (
            <option key={status} value={status}>
              {statusLabel[status]}
            </option>
          ))}
        </SelectInput>
        <TextInput
          label="Alasan recovery job"
          aria-label="Alasan recovery job"
          value={jobRecoveryReason}
          onChange={(event) => setJobRecoveryReason(event.target.value)}
          placeholder="Minimal 3 karakter"
        />
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
                  {statusLabel[job.status] ?? 'Status tidak dikenal'}
                </Badge>
              ),
            },
            { id: 'due', header: 'Jadwal', cell: (job) => job.dueAt.toLocaleString('id-ID') },
            {
              id: 'attempt',
              header: 'Percobaan',
              cell: (job) => `${job.attemptCount}/${job.maxAttempts}`,
            },
            {
              id: 'failure',
              header: 'Kendala',
              cell: (job) => safeFailureLabel(job.lastErrorCode),
            },
            {
              id: 'action',
              header: 'Recovery',
              cell: (job) => (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    disabled={busy || job.status === 'SUCCEEDED' || !canRecover}
                    onClick={() =>
                      void run(async () => {
                        const result = await client.run(job);
                        setJobPage((current) =>
                          current
                            ? {
                                ...current,
                                items: current.items.map((item) =>
                                  item.id === job.id
                                    ? { ...item, status: 'SUCCEEDED', progress: 100 }
                                    : item,
                                ),
                              }
                            : current,
                        );
                        setMessage(
                          `${result.status}: ${result.bookingCount}/${result.minimumQuota}`,
                        );
                      }, 'Evaluasi selesai.')
                    }
                  >
                    Jalankan recovery
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={
                      busy ||
                      !canRecover ||
                      !client.retryJob ||
                      job.status !== 'FAILED' ||
                      jobRecoveryReason.trim().length < 3
                    }
                    onClick={() =>
                      void run(async () => {
                        if (!client.retryJob) return;
                        const result = await client.retryJob(job.id, jobRecoveryReason.trim());
                        setJobPage((current) =>
                          current
                            ? {
                                ...current,
                                items: current.items.map((item) =>
                                  item.id === job.id
                                    ? {
                                        ...item,
                                        status: result.status as typeof item.status,
                                        attemptCount: result.attemptCount,
                                        maxAttempts: result.maxAttempts,
                                      }
                                    : item,
                                ),
                              }
                            : current,
                        );
                      }, 'Penjadwalan ulang job berhasil.')
                    }
                  >
                    Coba lagi
                  </Button>
                  <Button
                    variant="danger"
                    disabled={
                      busy ||
                      !canRecover ||
                      !client.deadLetterJob ||
                      !['QUEUED', 'RETRYING', 'FAILED'].includes(job.status) ||
                      jobRecoveryReason.trim().length < 3
                    }
                    onClick={() =>
                      void run(async () => {
                        if (!client.deadLetterJob) return;
                        const result = await client.deadLetterJob(job.id, jobRecoveryReason.trim());
                        setJobPage((current) =>
                          current
                            ? {
                                ...current,
                                items: current.items.map((item) =>
                                  item.id === job.id
                                    ? { ...item, status: result.status as typeof item.status }
                                    : item,
                                ),
                              }
                            : current,
                        );
                      }, 'Job ditandai gagal permanen (dead-letter).')
                    }
                  >
                    Tandai gagal
                  </Button>
                </div>
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
                  {statusLabel[job.status] ?? 'Status tidak dikenal'}
                </Badge>
                <span className="text-xs text-dd-muted">
                  {job.attemptCount}/{job.maxAttempts} percobaan
                </span>
              </div>
              <p className="mt-3 text-sm">Due {job.dueAt.toLocaleString('id-ID')}</p>
              {job.lastErrorCode && (
                <p className="mt-1 text-xs text-dd-danger">{safeFailureLabel(job.lastErrorCode)}</p>
              )}
              <Button
                className="mt-4 w-full"
                variant="secondary"
                disabled={busy || job.status === 'SUCCEEDED' || !canRecover}
                onClick={() =>
                  void run(async () => {
                    await client.run(job);
                    setJobPage((current) =>
                      current
                        ? {
                            ...current,
                            items: current.items.map((item) =>
                              item.id === job.id
                                ? { ...item, status: 'SUCCEEDED', progress: 100 }
                                : item,
                            ),
                          }
                        : current,
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
      <Pagination
        hasPrevious={jobCursorHistory.length > 0}
        hasNext={Boolean(jobPage?.page.nextCursor)}
        totalLabel={`${items.length.toLocaleString('id-ID')} job pada halaman ini`}
        onPrevious={() => {
          const history = [...jobCursorHistory];
          setJobCursor(history.pop());
          setJobCursorHistory(history);
        }}
        onNext={() => {
          const next = jobPage?.page.nextCursor;
          if (!next) return;
          setJobCursorHistory((current) => [...current, jobCursor]);
          setJobCursor(next);
        }}
      />
      <Panel className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-dd-muted">
              Email transaksional
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-dd-ink">Pengiriman email</h2>
            <p className="mt-2 text-sm text-dd-muted">
              Penerima tetap dimasking dan percobaan ulang manual selalu masuk audit.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="info">SMTP terkonfigurasi</StatusBadge>
            <StatusBadge tone="warning">Kegagalan terlihat</StatusBadge>
          </div>
        </div>
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
          <StatCard label="Percobaan ulang" value={String(emailPage?.metrics.retryCount ?? 0)} />
          <StatCard
            label="Queue age"
            value={`${emailPage?.metrics.queueAgeSeconds ?? 0}s`}
            helper={`Rate-limit waits: ${emailPage?.metrics.rateLimitWaitCount ?? 0}`}
          />
        </div>
      </Panel>
      <FilterBar>
        <SelectInput
          label="Filter status email"
          aria-label="Filter status email"
          value={emailStatusFilter}
          onChange={(event) => {
            setEmailStatusFilter(event.target.value);
            setEmailCursor(undefined);
            setEmailCursorHistory([]);
          }}
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
              {statusLabel[status]}
            </option>
          ))}
        </SelectInput>
        <TextInput
          label="Alasan mencoba kembali"
          aria-label="Alasan mencoba kembali pengiriman email"
          value={emailRetryReason}
          onChange={(event) => setEmailRetryReason(event.target.value)}
          placeholder="Contoh: konfigurasi email sudah diperbaiki"
        />
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
                  {statusLabel[item.status] ?? 'Status tidak dikenal'}
                </Badge>
              ),
            },
            {
              id: 'recipient',
              header: 'Penerima',
              cell: (item) => item.recipientMasked,
            },
            { id: 'event', header: 'Peristiwa', cell: (item) => humanizeEvent(item.eventType) },
            {
              id: 'attempt',
              header: 'Percobaan',
              cell: (item) => `${item.attemptCount}/${item.maxAttempts}`,
            },
            {
              id: 'action',
              header: 'Pemulihan',
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
                    }, 'Pengiriman ulang email dijadwalkan.')
                  }
                >
                  Coba kirim kembali
                </Button>
              ),
            },
          ]}
          mobileCard={(item) => (
            <div>
              <div className="flex items-center justify-between gap-3">
                <Badge tone={item.status === 'ACCEPTED_BY_SMTP' ? 'success' : 'warning'}>
                  {statusLabel[item.status] ?? 'Status tidak dikenal'}
                </Badge>
                <span className="text-xs text-dd-muted">{item.recipientMasked}</span>
              </div>
              <p className="mt-3 break-all text-sm">{humanizeEvent(item.eventType)}</p>
              <p className="mt-1 text-xs text-dd-muted">
                {item.attemptCount}/{item.maxAttempts} percobaan · {item.rateLimitWaitCount} jeda
              </p>
            </div>
          )}
        />
      ) : null}
      {emailPage && (
        <Pagination
          hasPrevious={emailCursorHistory.length > 0}
          hasNext={Boolean(emailPage.page.nextCursor)}
          totalLabel={`${emailPage.items.length.toLocaleString('id-ID')} email pada halaman ini`}
          onPrevious={() => {
            const history = [...emailCursorHistory];
            setEmailCursor(history.pop());
            setEmailCursorHistory(history);
          }}
          onNext={() => {
            const next = emailPage.page.nextCursor;
            if (!next) return;
            setEmailCursorHistory((current) => [...current, emailCursor]);
            setEmailCursor(next);
          }}
        />
      )}
    </section>
  );
}

function humanizeEvent(value: string) {
  return value.replace(/[._-]+/gu, ' ').replace(/\b\w/gu, (character) => character.toUpperCase());
}
