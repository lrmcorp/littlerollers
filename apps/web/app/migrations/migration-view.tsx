'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '../components/actions';
import { Badge, Pagination, Panel } from '../components/admin/admin-ui';
import { Feedback, PageHeader, Skeleton } from '../ui';
import {
  browserMigrationClient,
  type MigrationBatchSummary,
  type MigrationCdcOverview,
  type MigrationControlTotal,
  type MigrationReject,
  type MigrationResolution,
} from './migration-client';

const statusTone = (status: string) =>
  status === 'MATCH' || status === 'COMPLETED' || status === 'APPLIED'
    ? 'success'
    : status === 'MISMATCH' || status === 'FAILED' || status === 'OPEN'
      ? 'danger'
      : 'warning';

export function MigrationView() {
  const [batches, setBatches] = useState<MigrationBatchSummary[]>([]);
  const [batchCursor, setBatchCursor] = useState<string>();
  const [batchCursorHistory, setBatchCursorHistory] = useState<string[]>([]);
  const [batchNextCursor, setBatchNextCursor] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [controls, setControls] = useState<MigrationControlTotal[]>([]);
  const [rejects, setRejects] = useState<MigrationReject[]>([]);
  const [rejectCursor, setRejectCursor] = useState<string>();
  const [rejectCursorHistory, setRejectCursorHistory] = useState<string[]>([]);
  const [rejectNextCursor, setRejectNextCursor] = useState<string | null>(null);
  const [resolutions, setResolutions] = useState<MigrationResolution[]>([]);
  const [resolutionCursor, setResolutionCursor] = useState<string>();
  const [resolutionCursorHistory, setResolutionCursorHistory] = useState<string[]>([]);
  const [resolutionNextCursor, setResolutionNextCursor] = useState<string | null>(null);
  const [cdc, setCdc] = useState<MigrationCdcOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [decisionId, setDecisionId] = useState('');
  const [reason, setReason] = useState('');
  const [decisionJson, setDecisionJson] = useState('{}');
  const [stepUpToken, setStepUpToken] = useState('');

  const loadBatch = useCallback(
    async (batchId: string, rejectPageCursor?: string, resolutionPageCursor?: string) => {
      const [controlResult, rejectResult, resolutionResult] = await Promise.all([
        browserMigrationClient.controls(batchId),
        browserMigrationClient.rejects(batchId, rejectPageCursor),
        browserMigrationClient.resolutions(batchId, resolutionPageCursor),
      ]);
      setControls(controlResult.items);
      setRejects(rejectResult.items);
      setRejectNextCursor(rejectResult.nextCursor);
      setResolutions(resolutionResult.items);
      setResolutionNextCursor(resolutionResult.nextCursor);
    },
    [],
  );

  const load = useCallback(
    async (cursor?: string, preferredBatchId?: string) => {
      setLoading(true);
      setError('');
      try {
        const [result, cdcResult] = await Promise.all([
          browserMigrationClient.listBatches(cursor),
          browserMigrationClient.cdc(),
        ]);
        setCdc(cdcResult);
        setBatches(result.items);
        setBatchNextCursor(result.nextCursor);
        const batchId = result.items.some(({ id }) => id === preferredBatchId)
          ? preferredBatchId!
          : result.items[0]?.id || '';
        setSelectedId(batchId);
        setRejectCursor(undefined);
        setRejectCursorHistory([]);
        setResolutionCursor(undefined);
        setResolutionCursorHistory([]);
        if (batchId) await loadBatch(batchId, undefined, undefined);
      } catch {
        setError('Data migrasi tidak dapat dimuat. Periksa capability dan status API.');
      } finally {
        setLoading(false);
      }
    },
    [loadBatch],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (approve: boolean) => {
    if (!decisionId || reason.trim().length < 3 || !stepUpToken) {
      setError('Pilih resolution, isi alasan, dan masukkan step-up token.');
      return;
    }
    try {
      const decision = JSON.parse(decisionJson) as Record<string, unknown>;
      await browserMigrationClient.decide(decisionId, {
        approve,
        reason: reason.trim(),
        decision,
        stepUpToken,
        idempotencyKey: crypto.randomUUID(),
      });
      setStepUpToken('');
      await loadBatch(selectedId, rejectCursor, resolutionCursor);
    } catch {
      setStepUpToken('');
      setError(
        'Keputusan ditolak. Pastikan MFA masih berlaku, payload aman, dan versi belum berubah.',
      );
    }
  };

  return (
    <section className="space-y-6" aria-labelledby="migration-page-title">
      <Panel className="p-6 sm:p-8">
        <PageHeader
          eyebrow="Super Admin"
          title="Kontrol migrasi v1 → v2"
          titleId="migration-page-title"
          description="Pantau batch, control total, reject, dan resolution. Import tetap dijalankan melalui CLI operator terbatas."
          context={<Badge tone="warning">FAIL-CLOSED</Badge>}
        />
      </Panel>

      {error && <Feedback kind="error">{error}</Feedback>}
      {loading ? (
        <Skeleton label="Memuat kontrol migrasi" />
      ) : (
        <>
          <Panel className="p-5">
            <div className="flex flex-wrap items-end gap-3">
              <label className="grid min-w-64 gap-1 text-sm font-semibold text-dd-ink">
                Batch
                <select
                  aria-label="Batch migrasi"
                  className="min-h-11 rounded-dd-md border border-dd-line bg-white px-3"
                  value={selectedId}
                  onChange={async (event) => {
                    setSelectedId(event.target.value);
                    setRejectCursor(undefined);
                    setRejectCursorHistory([]);
                    setResolutionCursor(undefined);
                    setResolutionCursorHistory([]);
                    await loadBatch(event.target.value, undefined, undefined);
                  }}
                >
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.phase} — {batch.status}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void load(batchCursor, selectedId)}
              >
                Muat ulang
              </Button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {batches
                .filter((batch) => batch.id === selectedId)
                .map((batch) => (
                  <div key={batch.id} className="rounded-dd-md bg-dd-surface-muted p-4 text-sm">
                    <Badge tone={statusTone(batch.status)}>{batch.status}</Badge>
                    <p className="mt-3 font-semibold">{batch.phase}</p>
                    <p className="mt-1 text-dd-muted">Mapping {batch.mappingVersion}</p>
                    <p className="mt-1 text-dd-muted">{batch._count.sourceKeys} source keys</p>
                    <p className="mt-1 text-dd-muted">
                      {batch._count.deferredMediaReferences ?? 0} media ditunda (nonblocking)
                    </p>
                  </div>
                ))}
            </div>
            <div className="mt-4">
              <Pagination
                hasPrevious={batchCursorHistory.length > 0}
                hasNext={Boolean(batchNextCursor)}
                currentPage={batchCursorHistory.length + 1}
                onPrevious={() => {
                  const previous = batchCursorHistory.at(-1) ?? '';
                  setBatchCursorHistory((current) => current.slice(0, -1));
                  setBatchCursor(previous || undefined);
                  void load(previous || undefined);
                }}
                onNext={() => {
                  if (!batchNextCursor) return;
                  setBatchCursorHistory((current) => [...current, batchCursor ?? '']);
                  setBatchCursor(batchNextCursor);
                  void load(batchNextCursor);
                }}
              />
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">CDC dan cutover cabang</h2>
                <p className="mt-1 text-sm text-dd-muted">
                  Checkpoint GTID, lag capture, event gagal, dan status rollback pilot.
                </p>
              </div>
              <Badge tone={cdc?.failures.length ? 'danger' : 'success'}>
                {cdc?.failures.length ?? 0} event terblokir/gagal
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-dd-md bg-dd-surface-muted p-4 text-sm">
                <p className="text-dd-muted">CDC lag</p>
                <strong>
                  {cdc?.lagSeconds == null ? 'Belum ada checkpoint' : `${cdc.lagSeconds}s`}
                </strong>
              </div>
              {Object.entries(cdc?.events ?? {}).map(([status, count]) => (
                <div className="rounded-dd-md bg-dd-surface-muted p-4 text-sm" key={status}>
                  <Badge tone={statusTone(status)}>{status}</Badge>
                  <p className="mt-2 font-semibold">{count} event</p>
                </div>
              ))}
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-dd-surface-muted text-dd-muted">
                  <tr>
                    <th className="p-3">Cabang</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">High-water GTID</th>
                    <th className="p-3">Order</th>
                  </tr>
                </thead>
                <tbody>
                  {(cdc?.branches ?? []).map((branch) => (
                    <tr className="border-t border-dd-line" key={branch.branchId}>
                      <td className="p-3 font-medium">
                        {branch.code} — {branch.name}
                      </td>
                      <td className="p-3">
                        <Badge tone={statusTone(branch.status)}>{branch.status}</Badge>
                      </td>
                      <td className="p-3 font-mono text-xs">{branch.highWaterGtid ?? '—'}</td>
                      <td className="p-3">{branch.highWaterOrder ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel className="overflow-hidden">
              <h2 className="border-b border-dd-line p-5 text-lg font-semibold">Control totals</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-dd-surface-muted text-dd-muted">
                    <tr>
                      <th className="p-3">Control</th>
                      <th className="p-3">Expected</th>
                      <th className="p-3">Actual</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {controls.map((control) => (
                      <tr className="border-t border-dd-line" key={control.id}>
                        <td className="p-3 font-medium">{control.controlKey}</td>
                        <td className="p-3">{control.expectedValue}</td>
                        <td className="p-3">{control.actualValue ?? '—'}</td>
                        <td className="p-3">
                          <Badge tone={statusTone(control.status)}>{control.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel className="overflow-hidden">
              <h2 className="border-b border-dd-line p-5 text-lg font-semibold">Reject terbuka</h2>
              <ul className="divide-y divide-dd-line">
                {rejects.map((reject) => (
                  <li className="p-4 text-sm" key={reject.id}>
                    <div className="flex items-center justify-between gap-3">
                      <strong>{reject.reasonCode}</strong>
                      <Badge tone="danger">{reject.status}</Badge>
                    </div>
                    <p className="mt-1 text-dd-muted">
                      {reject.sourceTable} · source key {reject.sourceId}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="p-4">
                <Pagination
                  hasPrevious={rejectCursorHistory.length > 0}
                  hasNext={Boolean(rejectNextCursor)}
                  currentPage={rejectCursorHistory.length + 1}
                  onPrevious={() => {
                    const previous = rejectCursorHistory.at(-1) ?? '';
                    setRejectCursorHistory((current) => current.slice(0, -1));
                    setRejectCursor(previous || undefined);
                    void loadBatch(selectedId, previous || undefined, resolutionCursor);
                  }}
                  onNext={() => {
                    if (!rejectNextCursor) return;
                    setRejectCursorHistory((current) => [...current, rejectCursor ?? '']);
                    setRejectCursor(rejectNextCursor);
                    void loadBatch(selectedId, rejectNextCursor, resolutionCursor);
                  }}
                />
              </div>
            </Panel>
          </div>

          <Panel className="p-5">
            <h2 className="text-lg font-semibold">Keputusan resolution</h2>
            <p className="mt-1 text-sm text-dd-muted">
              Jangan masukkan password, token, NIK, file bytes, atau path privat ke payload
              keputusan.
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold">
                Resolution
                <select
                  aria-label="Resolution migrasi"
                  className="min-h-11 rounded-dd-md border border-dd-line px-3"
                  value={decisionId}
                  onChange={(event) => setDecisionId(event.target.value)}
                >
                  <option value="">Pilih resolution</option>
                  {resolutions
                    .filter((item) => item.status !== 'APPLIED')
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.reasonCode} — {item.status}
                      </option>
                    ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Alasan
                <input
                  aria-label="Alasan keputusan"
                  className="min-h-11 rounded-dd-md border border-dd-line px-3"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold lg:col-span-2">
                Decision JSON
                <textarea
                  aria-label="Payload keputusan"
                  className="min-h-28 rounded-dd-md border border-dd-line p-3 font-mono text-sm"
                  value={decisionJson}
                  onChange={(event) => setDecisionJson(event.target.value)}
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Step-up token
                <input
                  type="password"
                  autoComplete="off"
                  aria-label="Step-up token"
                  className="min-h-11 rounded-dd-md border border-dd-line px-3"
                  value={stepUpToken}
                  onChange={(event) => setStepUpToken(event.target.value)}
                />
              </label>
              <div className="flex items-end gap-3">
                <Button type="button" onClick={() => void decide(true)}>
                  Setujui
                </Button>
                <Button type="button" variant="secondary" onClick={() => void decide(false)}>
                  Tolak
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <Pagination
                hasPrevious={resolutionCursorHistory.length > 0}
                hasNext={Boolean(resolutionNextCursor)}
                currentPage={resolutionCursorHistory.length + 1}
                onPrevious={() => {
                  const previous = resolutionCursorHistory.at(-1) ?? '';
                  setResolutionCursorHistory((current) => current.slice(0, -1));
                  setResolutionCursor(previous || undefined);
                  void loadBatch(selectedId, rejectCursor, previous || undefined);
                }}
                onNext={() => {
                  if (!resolutionNextCursor) return;
                  setResolutionCursorHistory((current) => [...current, resolutionCursor ?? '']);
                  setResolutionCursor(resolutionNextCursor);
                  void loadBatch(selectedId, rejectCursor, resolutionNextCursor);
                }}
              />
            </div>
          </Panel>
        </>
      )}
    </section>
  );
}
