'use client';
import { useState } from 'react';
import {
  browserMasterClient,
  masterFailure,
  type MasterClient,
  type MasterKind,
} from '../master-client';
import { EmptyState, Feedback, PageHeader, StatusBadge } from '../ui';
import { useActiveBranchState, useSessionContext } from '../session-context';

export function MasterView({ client = browserMasterClient }: { client?: MasterClient }) {
  const [branchId, setBranchId] = useActiveBranchState();
  const sessionContext = useSessionContext();
  const canManage = !sessionContext || sessionContext.hasCapability('master:manage');
  const canFinance = !sessionContext || sessionContext.hasCapability('finance:manage');
  const hasMfa = !sessionContext || sessionContext.session?.assurance === 'MFA';
  const [classTypeId, setClassTypeId] = useState('');
  const [branches, setBranches] = useState<Awaited<ReturnType<MasterClient['listBranches']>>>([]);
  const [classTypes, setClassTypes] = useState<Awaited<ReturnType<MasterClient['listClassTypes']>>>(
    [],
  );
  const [message, setMessage] = useState<string>();
  const [failure, setFailure] = useState<string>();
  const run = async (action: () => Promise<void>, success: string) => {
    setFailure(undefined);
    try {
      await action();
      setMessage(success);
    } catch (error) {
      setFailure(masterFailure(error));
    }
  };
  const load = async () =>
    run(async () => {
      setBranches(await client.listBranches());
      if (branchId) setClassTypes(await client.listClassTypes(branchId));
    }, 'Master data berhasil dimuat.');

  return (
    <section className="card" aria-labelledby="master-title">
      <PageHeader
        eyebrow="Master operasional"
        title="Branch, Class Type, dan Effective Master"
        titleId="master-title"
        description="Nilai produksi tetap configuration-required. Periode menggunakan [mulai, selesai)."
        context={
          <>
            <StatusBadge tone="info">SUPER OWNER</StatusBadge>
            <StatusBadge tone="warning">MFA wajib</StatusBadge>
          </>
        }
      />
      <button onClick={load}>Muat master data</button>
      <label>
        ID cabang aktif
        <input value={branchId} onChange={(event) => setBranchId(event.target.value)} />
      </label>
      <label>
        ID class type
        <input value={classTypeId} onChange={(event) => setClassTypeId(event.target.value)} />
      </label>

      <form
        aria-label="Buat branch"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void run(
            () =>
              client.createBranch({
                code: String(data.get('code')),
                name: String(data.get('name')),
                timezone: String(data.get('timezone')),
              }),
            'Branch berhasil dibuat.',
          );
        }}
      >
        <h2>Buat branch</h2>
        <label>
          Kode branch
          <input name="code" required />
        </label>
        <label>
          Nama branch
          <input name="name" required />
        </label>
        <label>
          Timezone IANA
          <input name="timezone" placeholder="Asia/Jakarta" required />
        </label>
        <button type="submit" disabled={!canManage || !hasMfa}>
          Buat branch
        </button>
      </form>
      <form
        aria-label="Buat class type"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void run(
            () =>
              client.createClassType({
                branchId,
                code: String(data.get('code')),
                name: String(data.get('name')),
              }),
            'Class type berhasil dibuat.',
          );
        }}
      >
        <h2>Buat class type</h2>
        <label>
          Kode class
          <input name="code" required />
        </label>
        <label>
          Nama class
          <input name="name" required />
        </label>
        <button type="submit" disabled={!branchId || !canManage || !hasMfa}>
          Buat class type
        </button>
      </form>
      <form
        aria-label="Buat effective setting"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const kind = String(data.get('kind')) as MasterKind;
          void run(
            () =>
              client.createSetting({
                kind,
                branchId,
                classTypeId,
                instructorUserId: String(data.get('instructorUserId')) || undefined,
                value: Number(data.get('value')),
                capacity: data.get('capacity') ? Number(data.get('capacity')) : undefined,
                effectiveFrom: String(data.get('effectiveFrom')),
                effectiveUntil: String(data.get('effectiveUntil')) || undefined,
                reason: String(data.get('reason')),
              }),
            'Effective setting berhasil dibuat.',
          );
        }}
      >
        <h2>Buat effective setting</h2>
        <label>
          Jenis setting
          <select name="kind" defaultValue="QUOTA_CAPACITY">
            <option>QUOTA_CAPACITY</option>
            <option>PROJECTION_RATE</option>
            <option>INSTRUCTOR_FEE</option>
          </select>
        </label>
        <label>
          ID instructor (khusus fee)
          <input name="instructorUserId" />
        </label>
        <label>
          Nilai Rupiah atau minimum quota
          <input name="value" type="number" min="0" required />
        </label>
        <label>
          Capacity (khusus quota)
          <input name="capacity" type="number" min="1" />
        </label>
        <label>
          Efektif mulai
          <input name="effectiveFrom" type="date" required />
        </label>
        <label>
          Efektif sampai (eksklusif)
          <input name="effectiveUntil" type="date" />
        </label>
        <label>
          Alasan
          <input name="reason" minLength={3} required />
        </label>
        <button
          type="submit"
          disabled={!branchId || !classTypeId || !canManage || !canFinance || !hasMfa}
        >
          Buat setting
        </button>
      </form>
      <h2>Branch scoped</h2>
      {branches.length ? (
        <ul>
          {branches.map((item) => (
            <li key={item.id}>
              {item.code} · {item.timezone} · {item.active ? 'ACTIVE' : 'INACTIVE'}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Belum ada branch"
          description="Muat master data atau buat branch baru."
        />
      )}
      <h2>Class type scoped</h2>
      {classTypes.length ? (
        <ul>
          {classTypes.map((item) => (
            <li key={item.id}>
              {item.code} · {item.active ? 'ACTIVE' : 'INACTIVE'}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Belum ada class type"
          description="Pilih branch lalu muat class type terkait."
        />
      )}
      {message && <Feedback kind="status">{message}</Feedback>}
      {failure && <Feedback kind="error">{failure}</Feedback>}
    </section>
  );
}
