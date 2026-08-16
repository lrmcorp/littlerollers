'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '../components/actions';
import { Panel } from '../components/admin/admin-ui';
import { controlClassName, TextInput } from '../components/forms';
import { Feedback } from '../ui';
import { useAppFeedback } from '../components/app-feedback';
import type { FinanceClient } from './finance-client';
import type { Correction } from '@dailydose/api-client-ts/generated';

const currentPeriod = () => new Date().toISOString().slice(0, 7);
const currentDate = () => new Date().toISOString().slice(0, 10);

export function FinanceCommandsPanel({
  client,
  branchId,
}: {
  client: FinanceClient;
  branchId: string;
}) {
  const feedback = useAppFeedback();
  const [period, setPeriod] = useState(currentPeriod);
  const [controlHash, setControlHash] = useState('');
  const [periodVersion, setPeriodVersion] = useState(0);
  const [periodStatus, setPeriodStatus] = useState('OPEN');
  const [description, setDescription] = useState('');
  const [occurredOn, setOccurredOn] = useState(currentDate);
  const [categoryCode, setCategoryCode] = useState('OPERATING_EXPENSE');
  const [amount, setAmount] = useState('');
  const [referencePeriod, setReferencePeriod] = useState(currentPeriod);
  const [correctionAmount, setCorrectionAmount] = useState('');
  const [correctionId, setCorrectionId] = useState('');
  const [correctionQueue, setCorrectionQueue] = useState<Correction[]>([]);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [failure, setFailure] = useState<string>();

  const refresh = useCallback(async () => {
    if (!client.financialReport || !client.periods) return;
    const [report, periods, corrections] = await Promise.all([
      client.financialReport(branchId, period),
      client.periods(branchId),
      client.corrections?.(branchId, period, 'PENDING') ?? Promise.resolve({ items: [], page: { hasMore: false, nextCursor: null } }),
    ]);
    const existing = periods.items.find((item) => item.period === period);
    setControlHash(report.report.controlHash);
    setPeriodVersion(existing?.version ?? 0);
    setPeriodStatus(existing?.status ?? 'OPEN');
    setCorrectionQueue(corrections.items);
    if (correctionId && !corrections.items.some((item) => item.id === correctionId)) setCorrectionId('');
  }, [branchId, client, period]);

  useEffect(() => {
    void refresh().catch(() => setFailure('Kontrol Finance gagal dimuat.'));
  }, [refresh]);

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    setFailure(undefined);
    try {
      await action();
      setMessage(success);
      await refresh();
    } catch {
      setFailure('Command ditolak. Periksa scope, periode, versi, dan separation of duties.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel className="space-y-5 p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-dd-muted">Finance command</p>
        <h2 className="mt-1 text-xl font-semibold">Biaya, tutup buku, dan koreksi</h2>
        <p className="mt-1 text-sm text-dd-muted">
          Perubahan memakai idempotency, audit, scope Studio/Cabang, dan tidak mengubah jurnal v1.
        </p>
      </div>
      {message && <Feedback kind="status">{message}</Feedback>}
      {failure && <Feedback kind="error">{failure}</Feedback>}
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-1 text-xs font-bold text-dd-muted">
          Periode
          <input
            className={controlClassName}
            type="month"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          />
        </label>
        <TextInput
          label="Alasan command"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Minimal 3 karakter"
        />
        <div className="rounded-dd-md border border-dd-line p-3 text-sm">
          <strong>Status {periodStatus}</strong>
          <p className="mt-1 truncate text-xs text-dd-muted" title={controlHash}>
            Control {controlHash || 'belum tersedia'}
          </p>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <fieldset className="space-y-3 rounded-dd-md border border-dd-line p-4">
          <legend className="px-1 font-semibold">Biaya lain</legend>
          <TextInput
            label="Deskripsi"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <TextInput
            label="Tanggal kejadian"
            type="date"
            value={occurredOn}
            onChange={(event) => setOccurredOn(event.target.value)}
          />
          <TextInput
            label="Kode kategori"
            value={categoryCode}
            onChange={(event) => setCategoryCode(event.target.value.toUpperCase())}
          />
          <TextInput
            label="Nominal Rupiah"
            type="number"
            min="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          <Button
            disabled={
              busy ||
              periodStatus === 'CLOSED' ||
              description.trim().length === 0 ||
              occurredOn.slice(0, 7) !== period ||
              !/^[A-Z][A-Z0-9_]{1,63}$/u.test(categoryCode) ||
              reason.trim().length < 3 ||
              Number(amount) < 1 ||
              !client.createOtherCost
            }
            onClick={() =>
              void run(async () => {
                await client.createOtherCost?.({
                  branchId,
                  period,
                  occurredOn: new Date(`${occurredOn}T00:00:00.000Z`),
                  categoryCode,
                  description: description.trim(),
                  reason: reason.trim(),
                  amountRp: Number(amount),
                });
                setDescription('');
                setAmount('');
              }, 'Biaya lain tercatat.')
            }
          >
            Simpan biaya
          </Button>
        </fieldset>
        <fieldset className="space-y-3 rounded-dd-md border border-dd-line p-4">
          <legend className="px-1 font-semibold">Correction request</legend>
          <label className="grid gap-1 text-xs font-bold text-dd-muted">
            Periode referensi
            <input
              className={controlClassName}
              type="month"
              value={referencePeriod}
              onChange={(event) => setReferencePeriod(event.target.value)}
            />
          </label>
          <TextInput
            label="Selisih Rupiah"
            type="number"
            value={correctionAmount}
            onChange={(event) => setCorrectionAmount(event.target.value)}
          />
          <Button
            variant="secondary"
            disabled={
              busy ||
              periodStatus === 'CLOSED' ||
              Number(correctionAmount) === 0 ||
              reason.trim().length < 3 ||
              !client.requestCorrection
            }
            onClick={() =>
              void run(async () => {
                const result = await client.requestCorrection?.({
                  branchId,
                  currentPeriod: period,
                  referencePeriod,
                  amountRp: Number(correctionAmount),
                  reason: reason.trim(),
                });
                if (result) setCorrectionId(result.id);
              }, 'Correction menunggu approver berbeda.')
            }
          >
            Ajukan correction
          </Button>
        </fieldset>
        <fieldset className="space-y-3 rounded-dd-md border border-dd-line p-4">
          <legend className="px-1 font-semibold">Approval dan close</legend>
          <label className="grid gap-1 text-xs font-bold text-dd-muted">
            Antrean correction
            <select className={controlClassName} value={correctionId} onChange={(event) => setCorrectionId(event.target.value)}>
              <option value="">Pilih correction menunggu keputusan</option>
              {correctionQueue.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.referencePeriod} · Rp{item.amount.amountMinor.toLocaleString('id-ID')} · {item.reason}
                </option>
              ))}
            </select>
          </label>
          {!correctionQueue.length && <p className="text-sm text-dd-muted">Tidak ada correction yang menunggu keputusan pada periode ini.</p>}
          <div className="flex flex-wrap gap-2">
            {(['approve', 'reject'] as const).map((decision) => (
              <Button
                key={decision}
                variant={decision === 'reject' ? 'danger' : 'secondary'}
                disabled={
                  busy ||
                  correctionId.length !== 36 ||
                  reason.trim().length < 3 ||
                  !client.decideCorrection
                }
                onClick={() =>
                  void run(
                    async () => {
                      await client.decideCorrection?.(correctionId, decision, reason.trim());
                    },
                    decision === 'approve' ? 'Correction diposting.' : 'Correction ditolak.',
                  )
                }
              >
                {decision === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            ))}
          </div>
          <Button
            variant="danger"
            disabled={
              busy ||
              periodStatus === 'CLOSED' ||
              !controlHash ||
              reason.trim().length < 3 ||
              !client.closeMonth
            }
            onClick={() =>
              void feedback
                .confirm({
                  tone: 'danger',
                  title: `Tutup periode ${period}?`,
                  message: 'Periode yang sudah ditutup tidak dapat dimutasi lagi.',
                  confirmLabel: 'Tutup periode',
                })
                .then((accepted) => {
                  if (!accepted) return;
                  void run(async () => {
                    await client.closeMonth?.({
                      branchId,
                      period,
                      controlHash,
                      reason: reason.trim(),
                      expectedVersion: periodVersion,
                    });
                  }, 'Periode berhasil ditutup.');
                })
            }
          >
            Tutup periode
          </Button>
        </fieldset>
      </div>
    </Panel>
  );
}
