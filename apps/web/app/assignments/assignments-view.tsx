'use client';

import { useState } from 'react';
import {
  assignmentFailure,
  browserAssignmentClient,
  type AssignmentClient,
  type AssignmentFailure,
  type AssignmentSummary,
} from '../assignment-client';

export function AssignmentsView({
  client = browserAssignmentClient,
}: {
  client?: AssignmentClient;
}) {
  const [branchId, setBranchId] = useState('');
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
      <p className="muted">SUPER OWNER · MFA REQUIRED</p>
      <h1 id="assignment-title">Assignment Owner dan Instructor</h1>
      <p>
        Periode memakai interval [mulai, selesai) pada timezone cabang. Backend tetap menjadi batas
        otorisasi.
      </p>
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
        <button disabled={!branchId} type="submit">
          Buat assignment
        </button>
      </form>

      <h2>Daftar scoped</h2>
      {!loading && items.length === 0 && <p>Belum ada assignment pada cabang ini.</p>}
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
                <label>
                  Efektif berakhir
                  <input name="effectiveAt" type="datetime-local" required />
                </label>
                <label>
                  Alasan akhir
                  <input name="reason" minLength={3} required />
                </label>
                <button type="submit">Konfirmasi akhiri</button>
              </form>
            )}
          </li>
        ))}
      </ul>
      {message && <p role="status">{message}</p>}
      {failure && <p role="alert">{failure}</p>}
    </section>
  );
}
