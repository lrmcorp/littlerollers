'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  browserMasterClient,
  masterFailure,
  type MasterClient,
  type MasterKind,
  type MasterSetting,
} from '../master-client';
import { EmptyState, Feedback, PageHeader, StatusBadge } from '../ui';
import { useActiveBranchState, useSessionContext } from '../session-context';
import { browserIdentityClient, type LookupOption } from '../identity-client';
import { SearchableLookup } from '../components/admin/admin-ui';

type Branches = Awaited<ReturnType<MasterClient['listBranches']>>;
type ClassTypes = Awaited<ReturnType<MasterClient['listClassTypes']>>;
export type MasterTab =
  'branches' | 'classTypes' | 'packages' | 'projection' | 'capacity' | 'fees' | 'accounts';

const kindLabels: Record<MasterKind, string> = {
  QUOTA_CAPACITY: 'Kuota & kapasitas kelas',
  PROJECTION_RATE: 'Nilai proyeksi per sesi',
  INSTRUCTOR_FEE: 'Honor instructor',
};

const dateValue = (value: Date | string | null) =>
  value
    ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value))
    : 'Tanpa batas';

function settingValue(item: MasterSetting) {
  const value = item.value as Record<string, unknown>;
  if (item.kind === 'QUOTA_CAPACITY')
    return `Minimum ${value.minimumQuota ?? '—'} · kapasitas ${value.defaultCapacity ?? '—'}`;
  const amount = Number(item.kind === 'INSTRUCTOR_FEE' ? value.feeRp : value.rateRp);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(amount)
    : '—';
}

const tabItems: { id: MasterTab; label: string; kind?: MasterKind }[] = [
  { id: 'branches', label: 'Cabang' },
  { id: 'classTypes', label: 'Tipe Kelas' },
  { id: 'packages', label: 'Paket' },
  { id: 'projection', label: 'Proyeksi', kind: 'PROJECTION_RATE' },
  { id: 'capacity', label: 'Kuota/Kapasitas', kind: 'QUOTA_CAPACITY' },
  { id: 'fees', label: 'Honor', kind: 'INSTRUCTOR_FEE' },
  { id: 'accounts', label: 'Rekening' },
];

export function MasterView({
  client = browserMasterClient,
  activeTab = 'branches',
  onTabChange,
}: {
  client?: MasterClient;
  activeTab?: MasterTab;
  onTabChange?: (tab: MasterTab) => void;
}) {
  const [branchId, setBranchId] = useActiveBranchState();
  const sessionContext = useSessionContext();
  const canManage = !sessionContext || sessionContext.hasCapability('master:manage');
  const canFinance = !sessionContext || sessionContext.hasCapability('finance:manage');
  const [classTypeId, setClassTypeId] = useState('');
  const [kind, setKind] = useState<MasterKind>('QUOTA_CAPACITY');
  const [branches, setBranches] = useState<Branches>([]);
  const [classTypes, setClassTypes] = useState<ClassTypes>([]);
  const [settings, setSettings] = useState<MasterSetting[]>([]);
  const [message, setMessage] = useState<string>();
  const [failure, setFailure] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [instructor, setInstructor] = useState<LookupOption>();
  const lookupInstructors = useCallback(
    (q: string) =>
      browserIdentityClient
        .lookupUsers({ q, branchId: branchId || undefined, instructorsOnly: true, limit: 10 })
        .then(({ items }) => items),
    [branchId],
  );

  const run = async (action: () => Promise<void>, success: string) => {
    setFailure(undefined);
    setMessage(undefined);
    setLoading(true);
    try {
      await action();
      setMessage(success);
    } catch (error) {
      setFailure(masterFailure(error));
    } finally {
      setLoading(false);
    }
  };

  const loadBranchContent = async (selectedBranchId: string, selectedKind = kind) => {
    if (!selectedBranchId) {
      setClassTypes([]);
      setSettings([]);
      setClassTypeId('');
      return;
    }
    const [nextClassTypes, nextSettings] = await Promise.all([
      client.listClassTypes(selectedBranchId),
      client.listSettings(selectedKind, selectedBranchId),
    ]);
    setClassTypes(nextClassTypes);
    setSettings(nextSettings);
    if (!nextClassTypes.some((item) => item.id === classTypeId))
      setClassTypeId(nextClassTypes.find((item) => item.active)?.id ?? '');
  };

  const load = async () =>
    run(async () => {
      const nextBranches = await client.listBranches();
      setBranches(nextBranches);
      const selectedBranchId =
        nextBranches.find((item) => item.id === branchId && item.active)?.id ??
        (!sessionContext ? nextBranches.find((item) => item.active)?.id : undefined) ??
        '';
      setBranchId(selectedBranchId);
      await loadBranchContent(selectedBranchId);
    }, 'Master data berhasil dimuat.');

  const reloadCurrent = async () => {
    const nextBranches = await client.listBranches();
    setBranches(nextBranches);
    await loadBranchContent(branchId);
  };

  useEffect(() => {
    if (sessionContext) {
      void load();
    }
    // Initial authoritative load; subsequent branch changes are driven by the global context.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sessionContext && branchId) {
      void run(() => loadBranchContent(branchId), 'Data cabang berhasil dimuat.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  return (
    <section className="grid gap-6" aria-labelledby="master-title">
      <div className="min-w-0 max-w-full rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card">
        <PageHeader
          eyebrow="Master operasional"
          title="Data Master"
          titleId="master-title"
          description="Kelola cabang, tipe kelas, kapasitas, proyeksi, dan honor instructor dalam satu panel."
          context={
            <>
              <StatusBadge tone={canManage ? 'success' : 'neutral'}>
                {canManage ? 'Dapat mengelola' : 'Akses baca'}
              </StatusBadge>
              <StatusBadge tone="success">Permission terverifikasi</StatusBadge>
            </>
          }
        />
        <div
          className="-mx-1 mb-5 flex w-full min-w-0 max-w-full gap-2 overflow-x-auto px-1 pb-2"
          role="tablist"
          aria-label="Bagian data master"
        >
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={
                activeTab === tab.id
                  ? '!w-auto shrink-0 border-dd-forest bg-dd-forest text-white'
                  : '!w-auto shrink-0 border-dd-line bg-dd-surface text-dd-ink'
              }
              onClick={() => {
                onTabChange?.(tab.id);
                if (tab.kind) {
                  setKind(tab.kind);
                  if (branchId)
                    void run(
                      async () => setSettings(await client.listSettings(tab.kind!, branchId)),
                      'Daftar konfigurasi diperbarui.',
                    );
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          {!sessionContext && (
            <label className="grid min-w-[240px] flex-1 gap-2">
              Cabang aktif
              <select
                value={branchId}
                onChange={(event) => {
                  const selected = event.target.value;
                  setBranchId(selected);
                  void run(() => loadBranchContent(selected), 'Data cabang berhasil dimuat.');
                }}
              >
                <option value="">Pilih cabang</option>
                {branches.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.code}){item.active ? '' : ' — nonaktif'}
                  </option>
                ))}
              </select>
            </label>
          )}
          {sessionContext && (
            <div className="rounded-dd-md border border-dd-line bg-dd-surface-muted px-4 py-3">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-dd-muted">
                Konteks cabang
              </span>
              <strong className="mt-1 block text-sm">
                {sessionContext.activeBranch?.name ?? 'Pilih cabang dari topbar'}
              </strong>
            </div>
          )}
          <button type="button" onClick={load} disabled={loading}>
            {loading ? 'Memuat…' : sessionContext ? 'Refresh master data' : 'Muat master data'}
          </button>
        </div>
        {message && <Feedback kind="status">{message}</Feedback>}
        {failure && <Feedback kind="error">{failure}</Feedback>}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <form
          className={`${activeTab === 'branches' ? '' : '!hidden'} rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card`}
          aria-label="Buat branch"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            void run(async () => {
              await client.createBranch({
                code: String(data.get('code')).trim().toUpperCase(),
                name: String(data.get('name')).trim(),
                timezone: String(data.get('timezone')).trim(),
              });
              form.reset();
              await reloadCurrent();
            }, 'Cabang berhasil dibuat.');
          }}
        >
          <h2>Tambah cabang</h2>
          <p className="text-dd-muted">Gunakan kode singkat yang konsisten untuk operasional.</p>
          <label>
            Kode cabang
            <input name="code" placeholder="Contoh: DD-BDG" required />
          </label>
          <label>
            Nama cabang
            <input name="name" placeholder="Daily Dose Bandung" required />
          </label>
          <label>
            Zona waktu
            <input name="timezone" defaultValue="Asia/Jakarta" required />
          </label>
          <button type="submit" disabled={!canManage || loading}>
            Simpan cabang
          </button>
        </form>

        <form
          className={`${activeTab === 'classTypes' ? '' : '!hidden'} rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card`}
          aria-label="Buat class type"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            void run(async () => {
              await client.createClassType({
                branchId,
                code: String(data.get('code')).trim().toUpperCase(),
                name: String(data.get('name')).trim(),
              });
              form.reset();
              await loadBranchContent(branchId);
            }, 'Tipe kelas berhasil dibuat.');
          }}
        >
          <h2>Tambah tipe kelas</h2>
          <p className="text-dd-muted">Tipe kelas selalu terhubung ke cabang yang dipilih.</p>
          <label>
            Kode kelas
            <input name="code" placeholder="Contoh: REFORMER" required />
          </label>
          <label>
            Nama kelas
            <input name="name" placeholder="Reformer Pilates" required />
          </label>
          <button type="submit" disabled={!branchId || !canManage || loading}>
            Simpan tipe kelas
          </button>
        </form>
      </div>

      <form
        className={`${['projection', 'capacity', 'fees'].includes(activeTab) ? '' : '!hidden'} rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card`}
        aria-label="Buat effective setting"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          void run(async () => {
            await client.createSetting({
              kind,
              branchId,
              classTypeId,
              instructorUserId: instructor?.id,
              value: Number(data.get('value')),
              capacity: data.get('capacity') ? Number(data.get('capacity')) : undefined,
              effectiveFrom: String(data.get('effectiveFrom')),
              effectiveUntil: String(data.get('effectiveUntil')) || undefined,
              reason: String(data.get('reason')).trim(),
            });
            form.reset();
            setInstructor(undefined);
            await loadBranchContent(branchId, kind);
          }, 'Konfigurasi efektif berhasil dibuat.');
        }}
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h2>Tambah konfigurasi efektif</h2>
            <p className="text-dd-muted">
              Versi baru berlaku pada periode yang dipilih dan tidak boleh tumpang tindih.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              Jenis konfigurasi
              <select
                name="kind"
                value={kind}
                onChange={(event) => {
                  const selected = event.target.value as MasterKind;
                  setKind(selected);
                  void run(
                    async () => setSettings(await client.listSettings(selected, branchId)),
                    'Daftar konfigurasi diperbarui.',
                  );
                }}
              >
                {Object.entries(kindLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tipe kelas
              <select
                value={classTypeId}
                onChange={(event) => setClassTypeId(event.target.value)}
                required
              >
                <option value="">Pilih tipe kelas</option>
                {classTypes
                  .filter((item) => item.active)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.code})
                    </option>
                  ))}
              </select>
            </label>
            {kind === 'INSTRUCTOR_FEE' && (
              <SearchableLookup<LookupOption>
                label="Instructor aktif"
                value={instructor}
                load={lookupInstructors}
                onChange={setInstructor}
                placeholder="Cari nama instructor"
              />
            )}
            <label>
              {kind === 'QUOTA_CAPACITY' ? 'Minimum peserta' : 'Nilai rupiah'}
              <input name="value" type="number" min={kind === 'QUOTA_CAPACITY' ? 1 : 0} required />
            </label>
            {kind === 'QUOTA_CAPACITY' && (
              <label>
                Kapasitas maksimum
                <input name="capacity" type="number" min="1" required />
              </label>
            )}
            <label>
              Efektif mulai
              <input name="effectiveFrom" type="date" required />
            </label>
            <label>
              Efektif sampai (opsional)
              <input name="effectiveUntil" type="date" />
            </label>
            <label className="sm:col-span-2">
              Alasan perubahan
              <input name="reason" placeholder="Jelaskan kebutuhan bisnis" minLength={3} required />
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={
            !branchId ||
            !classTypeId ||
            (kind === 'INSTRUCTOR_FEE' && !instructor) ||
            !canManage ||
            ((kind === 'INSTRUCTOR_FEE' || kind === 'PROJECTION_RATE') && !canFinance) ||
            loading
          }
        >
          Simpan konfigurasi
        </button>
      </form>

      <div className="grid gap-6 xl:grid-cols-2">
        <section
          className={`${activeTab === 'branches' ? '' : '!hidden'} rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card`}
          aria-labelledby="branch-list-title"
        >
          <h2 id="branch-list-title">Daftar cabang</h2>
          {branches.length ? (
            <ul className="grid list-none gap-3 p-0">
              {branches.map((item) => (
                <li className="rounded-dd-sm border border-dd-line p-4" key={item.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <strong>{item.name}</strong>
                      <div className="text-sm text-dd-muted">
                        {item.code} · {item.timezone}
                      </div>
                    </div>
                    <StatusBadge tone={item.active ? 'success' : 'neutral'}>
                      {item.active ? 'Aktif' : 'Nonaktif'}
                    </StatusBadge>
                  </div>
                  {item.active && (
                    <button
                      className="mt-3"
                      type="button"
                      disabled={!canManage || loading}
                      onClick={() =>
                        void run(async () => {
                          await client.deactivateBranch(item.id, item.version);
                          await reloadCurrent();
                        }, 'Cabang berhasil dinonaktifkan.')
                      }
                    >
                      Nonaktifkan cabang
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Belum ada cabang"
              description="Muat data atau tambahkan cabang baru."
            />
          )}
        </section>

        <section
          className={`${activeTab === 'classTypes' ? '' : '!hidden'} rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card`}
          aria-labelledby="class-list-title"
        >
          <h2 id="class-list-title">Tipe kelas</h2>
          {classTypes.length ? (
            <ul className="grid list-none gap-3 p-0">
              {classTypes.map((item) => (
                <li className="rounded-dd-sm border border-dd-line p-4" key={item.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <strong>{item.name}</strong>
                      <div className="text-sm text-dd-muted">{item.code}</div>
                    </div>
                    <StatusBadge tone={item.active ? 'success' : 'neutral'}>
                      {item.active ? 'Aktif' : 'Nonaktif'}
                    </StatusBadge>
                  </div>
                  {item.active && (
                    <button
                      className="mt-3"
                      type="button"
                      disabled={!canManage || loading}
                      onClick={() =>
                        void run(async () => {
                          await client.deactivateClassType(item.id, item.version);
                          await loadBranchContent(branchId);
                        }, 'Tipe kelas berhasil dinonaktifkan.')
                      }
                    >
                      Nonaktifkan tipe kelas
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Belum ada tipe kelas"
              description="Pilih cabang dan tambahkan tipe kelas."
            />
          )}
        </section>
      </div>

      <section
        className={`${['projection', 'capacity', 'fees'].includes(activeTab) ? '' : '!hidden'} rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card`}
        aria-labelledby="setting-list-title"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="setting-list-title">{kindLabels[kind]}</h2>
            <p className="text-dd-muted">Riwayat konfigurasi untuk cabang yang dipilih.</p>
          </div>
          <StatusBadge tone="info">{settings.length} versi</StatusBadge>
        </div>
        {settings.length ? (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Tipe kelas</th>
                  <th>Nilai</th>
                  <th>Mulai</th>
                  <th>Sampai</th>
                  <th>Versi</th>
                </tr>
              </thead>
              <tbody>
                {settings.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {classTypes.find((type) => type.id === item.classTypeId)?.name ??
                        item.classTypeId}
                    </td>
                    <td>{settingValue(item)}</td>
                    <td>{dateValue(item.effectiveFrom)}</td>
                    <td>{dateValue(item.effectiveUntil)}</td>
                    <td>v{item.version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Belum ada konfigurasi"
            description="Pilih cabang lalu tambahkan konfigurasi efektif pertama."
          />
        )}
      </section>
    </section>
  );
}
