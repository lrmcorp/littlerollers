'use client';

import { useState } from 'react';
import {
  assignmentFailure,
  browserAssignmentClient,
  type AssignmentClient,
  type AssignmentFailure,
  type AssignmentSummary,
} from '../assignment-client';
import { ConfirmationPanel, EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { useActiveBranchState, useSessionContext } from '../session-context';

export function AssignmentsView({
  client = browserAssignmentClient,
}: {
  client?: AssignmentClient;
}) {
  const [branchId, setBranchId] = useActiveBranchState();
  const sessionContext = useSessionContext();
  const canManage = !sessionContext || sessionContext.hasCapability('assignment:manage');
  const hasMfa = !sessionContext || sessionContext.session?.assurance === 'MFA';
  const [items, setItems] = useState<AssignmentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>();
  const [failure, setFailure] = useState<AssignmentFailure>();

  const load = async () => {
    setLoading(true);
    setFailure(undefined);
    try {
      setItems(await client.list(branchId));
    } catch (error) {
      setFailure(assignmentFailure(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card" aria-labelledby="assignment-title">
      <PageHeader
        eyebrow="Role dan cabang"
        title="Assignment Owner dan Instructor"
        titleId="assignment-title"
        description="Periode memakai interval [mulai, selesai) pada timezone cabang. Backend tetap menjadi batas otorisasi."
        context={
          <>
            <StatusBadge tone="info">SUPER OWNER</StatusBadge>
            <StatusBadge tone="warning">MFA wajib</StatusBadge>
          </>
        }
      />
      <label>
        ID cabang aktif
        <input
          aria-describedby="branch-help"
          value={branchId}
          onChange={(event) => setBranchId(event.target.value)}
          required
        />
      </label>
      <small id="branch-help">
        Mutation selalu memakai satu cabang; tidak ada pilihan semua cabang.
      </small>
      <button disabled={!branchId || loading} onClick={load}>
        {loading ? 'Memuat…' : 'Muat assignment'}
      </button>

      <form
        aria-label="Buat assignment"
        onSubmit={async (event) => {
          event.preventDefault();
          setFailure(undefined);
          const data = new FormData(event.currentTarget);
          try {
            await client.create({
              userId: String(data.get('userId')),
              branchId,
              assignmentType: String(data.get('assignmentType')) as 'OWNER' | 'INSTRUCTOR',
              activeFrom: String(data.get('activeFrom')),
              activeUntil: String(data.get('activeUntil')) || null,
              reason: String(data.get('reason')),
            });
            setMessage('Assignment berhasil dibuat.');
            await load();
          } catch (error) {
            setFailure(assignmentFailure(error));
          }
        }}
      >
        <h2>Buat assignment</h2>
        <label>
          ID pengguna
          <input name="userId" required />
        </label>
        <label>
          Tipe
          <select name="assignmentType" defaultValue="INSTRUCTOR">
            <option>INSTRUCTOR</option>
            <option>OWNER</option>
          </select>
        </label>
        <label>
          Aktif mulai
          <input name="activeFrom" type="date" required />
        </label>
        <label>
          Aktif sampai (eksklusif)
          <input name="activeUntil" type="date" />
        </label>
        <label>
          Alasan
          <input name="reason" minLength={3} required />
        </label>
        <button disabled={!branchId || !canManage || !hasMfa} type="submit">
          Buat assignment
        </button>
      </form>

      <h2>Daftar scoped</h2>
      {loading && <Skeleton label="Memuat assignment" />}
      {!loading && items.length === 0 && (
        <EmptyState
          title="Belum ada assignment"
          description="Pilih cabang dan muat data, atau buat assignment baru."
        />
      )}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.assignmentType}</strong> · {item.userId} · {item.activeFrom} sampai{' '}
            {item.activeUntil ?? 'tanpa akhir'}
            {!item.activeUntil && (
              <form
                aria-label={`Akhiri assignment ${item.id}`}
                onSubmit={async (event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  try {
                    await client.end(
                      item.id,
                      String(data.get('effectiveAt')),
                      item.version,
                      String(data.get('reason')),
                    );
                    setMessage('Assignment berhasil diakhiri.');
                    await load();
                  } catch (error) {
                    setFailure(assignmentFailure(error));
                  }
                }}
              >
                <ConfirmationPanel title="Akhiri assignment">
                  Role projection berhenti pada awal tanggal efektif di timezone cabang.
                </ConfirmationPanel>
                <label>
                  Efektif berakhir
                  <input name="effectiveAt" type="datetime-local" required />
                </label>
                <label>
                  Alasan akhir
                  <input name="reason" minLength={3} required />
                </label>
                <button disabled={!canManage || !hasMfa} type="submit">
                  Konfirmasi akhiri
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
      {message && !loading && <Feedback kind="status">{message}</Feedback>}
      {failure && <Feedback kind="error">{failure}</Feedback>}
    </section>
  );
}
