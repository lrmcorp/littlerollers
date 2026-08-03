'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
import { Pagination, Tabs } from '../components/admin/admin-ui';
import { Button, ButtonLink } from '../components/actions';
import { PublicProfileEditor } from './public-profile-editor';
import {
  AsyncSearchSelect,
  DateInput,
  SearchInput,
  SearchSelect,
  SelectInput,
  TextInput,
} from '../components/forms';
import { Drawer, useAppFeedback } from '../components/app-feedback';

type BranchPage = Awaited<ReturnType<MasterClient['listBranches']>>;
type Branches = BranchPage['items'];
type ClassTypes = Awaited<ReturnType<MasterClient['listClassTypes']>>;
export type MasterTab =
  | 'branches'
  | 'classTypes'
  | 'packages'
  | 'projection'
  | 'capacity'
  | 'fees'
  | 'accounts'
  | 'publicProfiles';

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
  { id: 'publicProfiles', label: 'Profil Publik' },
];

export function MasterView({
  client = browserMasterClient,
  activeTab = 'branches',
  onTabChange,
  access,
}: {
  client?: MasterClient;
  activeTab?: MasterTab;
  onTabChange?: (tab: MasterTab) => void;
  access?: { canManage: boolean; canFinance: boolean };
}) {
  const [branchId, setBranchId] = useActiveBranchState();
  const [selectedTab, setSelectedTab] = useState<MasterTab>(activeTab);
  useEffect(() => setSelectedTab(activeTab), [activeTab]);
  const sessionContext = useSessionContext();
  const testAccess = process.env.NODE_ENV === 'test' ? access : undefined;
  const canManage =
    testAccess?.canManage ??
    (sessionContext?.status === 'authenticated' && sessionContext.hasCapability('master:manage'));
  const canFinance =
    testAccess?.canFinance ??
    (sessionContext?.status === 'authenticated' && sessionContext.hasCapability('finance:manage'));
  const [classTypeId, setClassTypeId] = useState('');
  const [kind, setKind] = useState<MasterKind>('QUOTA_CAPACITY');
  const [branches, setBranches] = useState<Branches>([]);
  const [branchCursor, setBranchCursor] = useState<string>();
  const [branchCursorHistory, setBranchCursorHistory] = useState<string[]>([]);
  const [branchNextCursor, setBranchNextCursor] = useState<string | null>();
  const [branchSummary, setBranchSummary] = useState({ total: 0, active: 0, inactive: 0 });
  const [branchSearch, setBranchSearch] = useState('');
  const [branchStatus, setBranchStatus] = useState<'' | 'ACTIVE' | 'INACTIVE'>('');
  const branchFilterInitialized = useRef(false);
  const [classTypes, setClassTypes] = useState<ClassTypes>([]);
  const [settings, setSettings] = useState<MasterSetting[]>([]);
  const [message, setMessage] = useState<string>();
  const [failure, setFailure] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [settingSubmitting, setSettingSubmitting] = useState(false);
  const [editingClassType, setEditingClassType] = useState<ClassTypes[number]>();
  const [classTypeName, setClassTypeName] = useState('');
  const [classTypeReason, setClassTypeReason] = useState('');
  const feedback = useAppFeedback();
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

  const loadBranchPage = async (pageCursor?: string) => {
    const page = await client.listBranches({
      q: branchSearch.trim() || undefined,
      status: branchStatus || undefined,
      cursor: pageCursor,
      limit: 20,
    });
    setBranches(page.items);
    setBranchSummary(page.summary);
    setBranchNextCursor(page.page.nextCursor);
    setBranchCursor(pageCursor);
    return page;
  };

  const load = async () =>
    run(async () => {
      const page = await loadBranchPage();
      setBranchCursorHistory([]);
      const nextBranches = page.items;
      const selectedBranchId =
        nextBranches.find((item) => item.id === branchId && item.active)?.id ??
        (branchId || undefined) ??
        (testAccess ? nextBranches.find((item) => item.active)?.id : undefined) ??
        '';
      setBranchId(selectedBranchId);
      await loadBranchContent(selectedBranchId);
    }, 'Master data berhasil dimuat.');

  const reloadCurrent = async () => {
    await loadBranchPage(branchCursor);
    await loadBranchContent(branchId);
  };

  useEffect(() => {
    if (!sessionContext && !testAccess) return;
    if (!branchFilterInitialized.current) {
      branchFilterInitialized.current = true;
      return;
    }
    const timer = window.setTimeout(() => {
      setBranchCursorHistory([]);
      void run(async () => {
        await loadBranchPage();
      }, 'Daftar cabang diperbarui.');
    }, 250);
    return () => window.clearTimeout(timer);
    // Filter list cabang tidak mengubah konteks cabang aktif.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchSearch, branchStatus]);

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
        <div className="my-5">
          <Tabs
            items={tabItems.map((tab) => ({ value: tab.id, label: tab.label }))}
            value={selectedTab}
            onChange={(value) => {
              const tab = tabItems.find((item) => item.id === value);
              if (!tab) return;
              setSelectedTab(tab.id);
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
          />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          {testAccess && !sessionContext && (
            <AsyncSearchSelect
              label="Cabang aktif"
              wrapperClassName="min-w-[240px] flex-1"
              value={branchId}
              placeholder="Pilih cabang"
              selectedOption={
                branches.find((item) => item.id === branchId)
                  ? {
                      id: branchId,
                      label: branches.find((item) => item.id === branchId)!.name,
                      description: branches.find((item) => item.id === branchId)!.code,
                    }
                  : undefined
              }
              loadOptions={async (q, cursor) => {
                const page = await client.listBranches({
                  q: q.trim() || undefined,
                  status: 'ACTIVE',
                  cursor,
                  limit: 20,
                });
                return {
                  items: page.items.map((item) => ({
                    id: item.id,
                    label: item.name,
                    description: item.code,
                  })),
                  nextCursor: page.page.nextCursor ?? undefined,
                };
              }}
              onChange={(selected) => {
                setBranchId(selected);
                void run(() => loadBranchContent(selected), 'Data cabang berhasil dimuat.');
              }}
            />
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
          <Button type="button" variant="secondary" onClick={load} disabled={loading}>
            {loading ? 'Memuat…' : testAccess ? 'Muat master data' : 'Refresh master data'}
          </Button>
        </div>
        {message && <Feedback kind="status">{message}</Feedback>}
        {failure && <Feedback kind="error">{failure}</Feedback>}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {selectedTab === 'branches' && (
          <section className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card">
            <h2>Branch Management</h2>
            <p className="mt-2 text-sm leading-6 text-dd-muted">
              Pembuatan, detail, dependency, edit, deactivate, dan reactivate cabang kini dikelola
              pada workspace khusus.
            </p>
            <ButtonLink className="mt-4" href="/workspace/branches">
              Buka Branch Management
            </ButtonLink>
          </section>
        )}

        {selectedTab === 'classTypes' && (
          <form
            className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
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
            <TextInput label="Kode kelas" name="code" placeholder="Contoh: REFORMER" required />
            <TextInput label="Nama kelas" name="name" placeholder="Reformer Pilates" required />
            <Button type="submit" disabled={!branchId || !canManage || loading}>
              Simpan tipe kelas
            </Button>
          </form>
        )}
      </div>

      {['projection', 'capacity', 'fees'].includes(selectedTab) && (
        <form
          className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
          aria-label="Buat effective setting"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            setSettingSubmitting(true);
            void run(async () => {
              try {
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
              } finally {
                setSettingSubmitting(false);
              }
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
              <SelectInput
                label="Jenis konfigurasi"
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
              </SelectInput>
              <SearchSelect
                label="Tipe kelas"
                value={classTypeId}
                placeholder="Pilih tipe kelas"
                options={classTypes
                  .filter((item) => item.active)
                  .map((item) => ({
                    id: item.id,
                    label: item.name,
                    description: item.code,
                  }))}
                onChange={setClassTypeId}
                required
              />
              {kind === 'INSTRUCTOR_FEE' && (
                <AsyncSearchSelect
                  label="Instructor aktif"
                  value={instructor?.id ?? ''}
                  selectedOption={instructor}
                  loadOptions={lookupInstructors}
                  onChange={(_id, option) => setInstructor(option as LookupOption | undefined)}
                  placeholder="Cari nama instructor"
                />
              )}
              <TextInput
                label={kind === 'QUOTA_CAPACITY' ? 'Minimum peserta' : 'Nilai rupiah'}
                name="value"
                type="number"
                min={kind === 'QUOTA_CAPACITY' ? 1 : 0}
                required
              />
              {kind === 'QUOTA_CAPACITY' && (
                <TextInput
                  label="Kapasitas maksimum"
                  name="capacity"
                  type="number"
                  min="1"
                  required
                />
              )}
              <DateInput label="Efektif mulai" name="effectiveFrom" required />
              <DateInput label="Efektif sampai (opsional)" name="effectiveUntil" />
              <TextInput
                label="Alasan perubahan"
                wrapperClassName="sm:col-span-2"
                name="reason"
                placeholder="Jelaskan kebutuhan bisnis"
                minLength={3}
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={
              !branchId ||
              !classTypeId ||
              (kind === 'INSTRUCTOR_FEE' && !instructor) ||
              !canManage ||
              ((kind === 'INSTRUCTOR_FEE' || kind === 'PROJECTION_RATE') && !canFinance) ||
              settingSubmitting
            }
          >
            {settingSubmitting ? 'Menyimpan…' : 'Simpan konfigurasi'}
          </Button>
        </form>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {selectedTab === 'branches' && (
          <section
            className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
            aria-labelledby="branch-list-title"
          >
            <h2 id="branch-list-title">Daftar cabang</h2>
            <div className="my-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
              <SearchInput
                label="Cari cabang"
                value={branchSearch}
                placeholder="Kode, nama, area, atau kota"
                onChange={(event) => setBranchSearch(event.currentTarget.value)}
              />
              <SelectInput
                label="Status cabang"
                value={branchStatus}
                onChange={(event) =>
                  setBranchStatus(event.currentTarget.value as '' | 'ACTIVE' | 'INACTIVE')
                }
              >
                <option value="">Semua status</option>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Nonaktif</option>
              </SelectInput>
            </div>
            {branches.length ? (
              <>
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
                      <ButtonLink
                        className="mt-3"
                        size="sm"
                        variant="secondary"
                        href={`/workspace/branches/${item.id}`}
                      >
                        Lihat detail cabang
                      </ButtonLink>
                    </li>
                  ))}
                </ul>
                <Pagination
                  hasPrevious={branchCursorHistory.length > 0 && !loading}
                  hasNext={Boolean(branchNextCursor) && !loading}
                  totalLabel={`Halaman ${branchCursorHistory.length + 1} · ${branches.length.toLocaleString('id-ID')} data dari ${branchSummary.total.toLocaleString('id-ID')} cabang`}
                  onPrevious={() => {
                    const previous = branchCursorHistory.at(-1) ?? '';
                    void run(async () => {
                      await loadBranchPage(previous || undefined);
                      setBranchCursorHistory((current) => current.slice(0, -1));
                    }, 'Halaman cabang sebelumnya dimuat.');
                  }}
                  onNext={() => {
                    if (!branchNextCursor) return;
                    void run(async () => {
                      await loadBranchPage(branchNextCursor);
                      setBranchCursorHistory((current) => [...current, branchCursor ?? '']);
                    }, 'Halaman cabang berikutnya dimuat.');
                  }}
                />
              </>
            ) : (
              <EmptyState
                title="Belum ada cabang"
                description="Muat data atau tambahkan cabang baru."
              />
            )}
          </section>
        )}

        {selectedTab === 'classTypes' && (
          <section
            className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
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
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          type="button"
                          disabled={!canManage || loading}
                          onClick={() => {
                            setEditingClassType(item);
                            setClassTypeName(item.name);
                            setClassTypeReason('');
                          }}
                        >
                          Edit tipe kelas
                        </Button>
                        <Button
                          variant="ghost"
                          type="button"
                          disabled={!canManage || loading}
                          onClick={() =>
                            void run(async () => {
                              await client.deactivateClassType(item.id, item.version);
                              await loadBranchContent(branchId);
                            }, 'Tipe kelas berhasil dinonaktifkan.')
                          }
                        >
                          Nonaktifkan
                        </Button>
                      </div>
                    )}
                    {!item.active && (
                      <Button
                        className="mt-3"
                        variant="secondary"
                        type="button"
                        disabled={!canManage || loading}
                        onClick={() =>
                          void (async () => {
                            const confirmed = await feedback.confirm({
                              title: 'Aktifkan kembali tipe kelas?',
                              message: `${item.name} kembali tersedia untuk konfigurasi dan kelas baru.`,
                              confirmLabel: 'Aktifkan kembali',
                            });
                            if (!confirmed) return;
                            await run(async () => {
                              await client.reactivateClassType(item.id, {
                                expectedVersion: item.version,
                                reason: 'Mengaktifkan kembali tipe kelas melalui Master Data.',
                              });
                              await loadBranchContent(branchId);
                            }, 'Tipe kelas berhasil diaktifkan kembali.');
                          })()
                        }
                      >
                        Aktifkan kembali
                      </Button>
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
        )}
      </div>

      <Drawer
        open={Boolean(editingClassType)}
        title="Edit tipe kelas"
        description="Nama dapat diperbarui. Kode dan cabang tetap agar histori kelas konsisten."
        busy={loading}
        dirty={Boolean(
          editingClassType &&
          (classTypeName.trim() !== editingClassType.name || classTypeReason.trim()),
        )}
        onClose={() => {
          setEditingClassType(undefined);
          setClassTypeReason('');
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => setEditingClassType(undefined)}
            >
              Batal
            </Button>
            <Button
              type="button"
              loading={loading}
              disabled={
                !editingClassType ||
                classTypeName.trim().length < 2 ||
                classTypeReason.trim().length < 3
              }
              onClick={() =>
                void (async () => {
                  if (!editingClassType) return;
                  const confirmed = await feedback.confirm({
                    title: 'Simpan perubahan tipe kelas?',
                    message: `Nama ${editingClassType.code} akan diperbarui tanpa mengubah kode atau cabang.`,
                    confirmLabel: 'Simpan perubahan',
                  });
                  if (!confirmed) return;
                  await run(async () => {
                    await client.updateClassType(editingClassType.id, {
                      name: classTypeName.trim(),
                      expectedVersion: editingClassType.version,
                      reason: classTypeReason.trim(),
                    });
                    setEditingClassType(undefined);
                    setClassTypeReason('');
                    await loadBranchContent(branchId);
                  }, 'Tipe kelas berhasil diperbarui.');
                })()
              }
            >
              Simpan perubahan
            </Button>
          </div>
        }
      >
        {editingClassType && (
          <div className="grid gap-4">
            <TextInput label="Kode kelas" value={editingClassType.code} disabled />
            <TextInput
              label="Nama kelas"
              value={classTypeName}
              onChange={(event) => setClassTypeName(event.target.value)}
            />
            <TextInput
              label="Alasan perubahan"
              value={classTypeReason}
              onChange={(event) => setClassTypeReason(event.target.value)}
              minLength={3}
              required
            />
          </div>
        )}
      </Drawer>

      {['projection', 'capacity', 'fees'].includes(selectedTab) && (
        <section
          className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
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
      )}
      {selectedTab === 'publicProfiles' && (
        <PublicProfileEditor branchId={branchId} canManage={canManage} />
      )}
    </section>
  );
}
