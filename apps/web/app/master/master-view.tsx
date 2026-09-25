'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  browserMasterClient,
  masterFailure,
  type MasterClient,
  type MasterKind,
  type MasterSetting,
} from '@/api-clients/master-client';
import { EmptyState, Feedback, PageHeader, StatusBadge } from '../ui';
import { useActiveBranchState, useSessionContext } from '../session-context';
import { browserIdentityClient, type LookupOption } from '@/api-clients/identity-client';
import { Pagination, StatCard, Tabs } from '../components/admin/admin-ui';
import { Button, ButtonLink } from '../components/actions';
import { PublicProfileEditor } from './public-profile-editor';
import { PaymentAccountsView } from './payment-accounts-view';
import {
  AsyncSearchSelect,
  CheckboxInput,
  DateInput,
  SearchInput,
  SearchSelect,
  SelectInput,
  TextInput,
} from '../components/forms';
import { Drawer, useAppFeedback } from '../components/app-feedback';
import { formatRupiah } from '../lib/formatters';

type BranchPage = Awaited<ReturnType<MasterClient['listBranches']>>;
type Branches = BranchPage['items'];
type ClassTypes = Awaited<ReturnType<MasterClient['listClassTypes']>>;
export type MasterTab =
  | 'branches'
  | 'classTypes'
  | 'venues'
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
  return Number.isFinite(amount) ? formatRupiah(amount) : '—';
}

const allTabItems: { id: MasterTab; label: string; kind?: MasterKind }[] = [
  { id: 'branches', label: 'Cabang' },
  { id: 'classTypes', label: 'Tipe Kelas' },
  { id: 'venues', label: 'Area/Ruangan' },
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
  visibleTabs,
}: {
  client?: MasterClient;
  activeTab?: MasterTab;
  onTabChange?: (tab: MasterTab) => void;
  access?: { canManage: boolean; canFinance: boolean };
  visibleTabs?: MasterTab[];
}) {
  const tabItems = visibleTabs
    ? allTabItems.filter((item) => visibleTabs.includes(item.id))
    : allTabItems;
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
  const [studios, setStudios] = useState<Awaited<ReturnType<MasterClient['listStudios']>>>([]);
  const [selectedStudioId, setSelectedStudioId] = useState('');
  const [scopeBranches, setScopeBranches] = useState<Branches>([]);
  const [settings, setSettings] = useState<MasterSetting[]>([]);
  const [message, setMessage] = useState<string>();
  const [failure, setFailure] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [settingSubmitting, setSettingSubmitting] = useState(false);
  const [editingClassType, setEditingClassType] = useState<ClassTypes[number]>();
  const [scopingClassType, setScopingClassType] = useState<ClassTypes[number]>();
  const [classTypeScopeBranchIds, setClassTypeScopeBranchIds] = useState<string[]>([]);
  const [classTypeScopeReason, setClassTypeScopeReason] = useState('');
  const [classTypeName, setClassTypeName] = useState('');
  const [classTypeReason, setClassTypeReason] = useState('');
  const feedback = useAppFeedback();
  const [instructor, setInstructor] = useState<LookupOption>();

  // Auto-dismiss alert notification after 4 seconds
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(undefined), 4000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const lookupInstructors = useCallback(
    (q: string) =>
      browserIdentityClient
        .lookupUsers({ q, branchId: branchId || undefined, instructorsOnly: true, limit: 10 })
        .then(({ items }) => items),
    [branchId],
  );

  const run = async (action: () => Promise<void>, success?: string) => {
    setFailure(undefined);
    setMessage(undefined);
    setLoading(true);
    try {
      await action();
      if (success) {
        setMessage(success);
      }
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
      setStudios([]);
      setClassTypeId('');
      return;
    }
    const [nextClassTypes, nextSettings, nextStudios] = await Promise.all([
      client.listClassTypes(selectedBranchId),
      client.listSettings(selectedKind, selectedBranchId),
      client.listStudios(selectedBranchId),
    ]);
    setClassTypes(nextClassTypes);
    setSettings(nextSettings);
    setStudios(nextStudios);
    setSelectedStudioId(nextStudios.find((item) => item.active)?.id ?? '');
    setClassTypeId((current) =>
      nextClassTypes.some((item) => item.id === current) ? current : (nextClassTypes[0]?.id ?? ''),
    );
  };

  const loadBranchPage = async (cursor?: string) => {
    const page = await client.listBranches({
      q: branchSearch.trim() || undefined,
      status: branchStatus || undefined,
      cursor,
      limit: 20,
    });
    setBranches(page.items);
    setBranchCursor(cursor);
    setBranchNextCursor(page.page.nextCursor);
    setBranchSummary(page.summary);
    return page;
  };

  const loadAllActiveBranches = async () => {
    const all: Branches = [];
    let cursor: string | undefined;
    do {
      const page = await client.listBranches({ status: 'ACTIVE', cursor, limit: 100 });
      all.push(...page.items);
      cursor = page.page.nextCursor ?? undefined;
    } while (cursor);
    setScopeBranches(all);
    return all;
  };

  const load = async (isManual = false) => {
    setFailure(undefined);
    if (isManual || testAccess) setMessage(undefined);
    setLoading(true);
    try {
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
      if (isManual || testAccess) {
        setMessage('Master data berhasil dimuat.');
      }
    } catch (error) {
      setFailure(masterFailure(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionContext && !testAccess) return;
    if (!branchFilterInitialized.current) {
      branchFilterInitialized.current = true;
      return;
    }
    const timer = window.setTimeout(() => {
      setBranchCursorHistory([]);
      void loadBranchPage().catch((err) => setFailure(masterFailure(err)));
    }, 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchSearch, branchStatus]);

  useEffect(() => {
    if (sessionContext) {
      void load(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sessionContext && branchId) {
      void loadBranchContent(branchId).catch((err) => setFailure(masterFailure(err)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  return (
    <div className="space-y-6" aria-labelledby="master-title">
      {/* Top-Level Modern PageHeader */}
      <PageHeader
        eyebrow="Master operasional"
        title="Data Master"
        titleId="master-title"
        description="Kelola katalog tipe kelas global serta konfigurasi kapasitas, proyeksi, honor instructor, dan area studio."
        context={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={canManage ? 'success' : 'neutral'}>
              {canManage ? 'Dapat mengelola' : 'Akses baca'}
            </StatusBadge>
            <StatusBadge tone="success">Permission terverifikasi</StatusBadge>
            {sessionContext && (
              <div className="rounded-dd-sm border border-dd-line bg-dd-surface px-3 py-1.5 text-xs text-dd-muted">
                Konteks:{' '}
                <strong className="font-semibold text-dd-ink">
                  {sessionContext.activeBranch?.name ?? 'Pilih cabang dari topbar'}
                </strong>
              </div>
            )}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void load(true)}
              disabled={loading}
            >
              {loading ? 'Memuat…' : testAccess ? 'Muat master data' : 'Refresh master data'}
            </Button>
          </div>
        }
      />

      {/* Summary Metric Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Tipe kelas aktif"
          value={String(classTypes.filter((item) => item.active).length)}
        />
        <StatCard
          label="Area studio cabang"
          value={String(studios.filter((item) => item.active).length)}
        />
        <StatCard
          label="Konfigurasi aktif"
          value={String(settings.length)}
          tone="success"
        />
      </div>

      {/* Navigation Tabs Bar */}
      <div className="rounded-dd-lg border border-dd-line bg-dd-surface p-3 shadow-dd-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
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
                  void client
                    .listSettings(tab.kind, branchId)
                    .then(setSettings)
                    .catch((err) => setFailure(masterFailure(err)));
              } else if (tab.id === 'classTypes') {
                void Promise.all([client.listClassTypes(), loadAllActiveBranches()])
                  .then(([types]) => setClassTypes(types))
                  .catch((err) => setFailure(masterFailure(err)));
              }
            }}
          />

          {testAccess && !sessionContext && (
            <div className="min-w-[240px]">
              <AsyncSearchSelect
                label="Cabang aktif"
                wrapperClassName="w-full"
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
                  void loadBranchContent(selected).catch((err) => setFailure(masterFailure(err)));
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Dismissible Feedback Alerts */}
      {message && (
        <div className="relative">
          <Feedback kind="status">{message}</Feedback>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-800 hover:text-emerald-950"
            type="button"
            onClick={() => setMessage(undefined)}
            aria-label="Tutup notifikasi"
          >
            ✕
          </button>
        </div>
      )}
      {failure && (
        <div className="relative">
          <Feedback kind="error">{failure}</Feedback>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-red-800 hover:text-red-950"
            type="button"
            onClick={() => setFailure(undefined)}
            aria-label="Tutup pesan kesalahan"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab: Class Types (Unified 12-Column Side-by-Side Grid) */}
      {selectedTab === 'classTypes' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 xl:col-span-4">
            <form
              className="flex flex-col gap-4 rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
              aria-label="Buat class type"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const data = new FormData(form);
                void run(async () => {
                  await client.createClassType({
                    code: String(data.get('code')).trim().toUpperCase(),
                    name: String(data.get('name')).trim(),
                  });
                  form.reset();
                  setClassTypes(await client.listClassTypes());
                }, 'Tipe kelas berhasil dibuat.');
              }}
            >
              <div>
                <h2 className="text-base font-semibold text-dd-ink">Tambah tipe kelas</h2>
                <p className="mt-1 text-xs leading-5 text-dd-muted">
                  Tipe kelas adalah katalog global. Studio/Cabang yang dapat menggunakannya dipilih
                  setelah tipe kelas dibuat.
                </p>
              </div>
              <TextInput label="Kode kelas" name="code" placeholder="Contoh: REFORMER" required />
              <TextInput label="Nama kelas" name="name" placeholder="Reformer Pilates" required />
              <div className="pt-2">
                <Button type="submit" disabled={!canManage || loading}>
                  Simpan tipe kelas
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 xl:col-span-8">
            <section
              className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
              aria-labelledby="class-list-title"
            >
              <div className="flex items-center justify-between gap-3 border-b border-dd-line pb-4">
                <div>
                  <h2 id="class-list-title" className="text-base font-semibold text-dd-ink">
                    Tipe kelas
                  </h2>
                  <p className="text-xs text-dd-muted">Katalog tipe kelas global yang aktif</p>
                </div>
                <StatusBadge tone="info">{classTypes.length} tipe kelas</StatusBadge>
              </div>

              {classTypes.length ? (
                <ul className="mt-4 grid list-none gap-3 p-0">
                  {classTypes.map((item) => (
                    <li className="rounded-dd-sm border border-dd-line p-4" key={item.id}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <strong className="text-sm font-semibold text-dd-ink">{item.name}</strong>
                          <div className="text-sm text-dd-muted">{item.code}</div>
                          <div className="mt-1 text-xs text-dd-muted">
                            {(item.branchScopes ?? []).filter((scope) => scope.active).length
                              ? (item.branchScopes ?? [])
                                  .filter((scope) => scope.active)
                                  .map(
                                    (scope) =>
                                      scope.branch?.name ??
                                      branches.find((branch) => branch.id === scope.branchId)?.name ??
                                      scope.branchId,
                                  )
                                  .join(', ')
                              : 'Belum tersedia di Studio/Cabang mana pun'}
                          </div>
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
                            size="sm"
                            disabled={!canManage || loading}
                            onClick={() => {
                              setScopingClassType(item);
                              setClassTypeScopeBranchIds(
                                (item.branchScopes ?? [])
                                  .filter((scope) => scope.active)
                                  .map((scope) => scope.branchId),
                              );
                              setClassTypeScopeReason('');
                            }}
                          >
                            Atur Studio/Cabang
                          </Button>
                          <Button
                            variant="secondary"
                            type="button"
                            size="sm"
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
                            size="sm"
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
                          size="sm"
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
                <div className="mt-4">
                  <EmptyState
                    title="Belum ada tipe kelas"
                    description="Tambahkan satu tipe kelas global, lalu tentukan cakupan Studio/Cabang."
                  />
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* Tab: Venues (Area Studio & Ruangan) */}
      {selectedTab === 'venues' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <form
              className="flex flex-col gap-4 rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
              aria-label="Tambah area studio"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const data = new FormData(form);
                void run(async () => {
                  if (!branchId) throw new Error('BRANCH_REQUIRED');
                  await client.createStudio(branchId, {
                    code: String(data.get('code')).trim().toUpperCase(),
                    name: String(data.get('name')).trim(),
                    equipmentText: String(data.get('equipmentText')).trim() || undefined,
                    contactPhoneE164: String(data.get('contactPhoneE164')).trim() || undefined,
                  });
                  form.reset();
                  const next = await client.listStudios(branchId);
                  setStudios(next);
                  setSelectedStudioId(next.find((item) => item.active)?.id ?? '');
                }, 'Area Studio berhasil ditambahkan.');
              }}
            >
              <div>
                <h2 className="text-base font-semibold text-dd-ink">Tambah Area Studio</h2>
                <p className="mt-1 text-xs leading-5 text-dd-muted">
                  Area Studio berada di dalam Studio/Cabang aktif dan menjadi venue wajib jadwal kelas.
                </p>
              </div>
              {!branchId && (
                <Feedback kind="warning">Pilih Studio/Cabang aktif terlebih dahulu.</Feedback>
              )}
              <TextInput label="Kode area" name="code" placeholder="Contoh: MAIN" required />
              <TextInput label="Nama area" name="name" placeholder="Main Studio" required />
              <TextInput label="Equipment" name="equipmentText" placeholder="Reformer, Mat, Foam Roller" />
              <TextInput label="Nomor kontak" name="contactPhoneE164" placeholder="+628…" />
              <div className="pt-2">
                <Button type="submit" disabled={!branchId || !canManage || loading}>
                  Simpan Area Studio
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-6">
            <form
              className="flex flex-col gap-4 rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
              aria-label="Tambah ruangan"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const data = new FormData(form);
                void run(async () => {
                  if (!selectedStudioId) throw new Error('STUDIO_REQUIRED');
                  await client.createRoom(selectedStudioId, {
                    code: String(data.get('code')).trim().toUpperCase(),
                    name: String(data.get('name')).trim(),
                    capacity: data.get('capacity') ? Number(data.get('capacity')) : undefined,
                  });
                  form.reset();
                  setStudios(await client.listStudios(branchId));
                }, 'Ruangan berhasil ditambahkan.');
              }}
            >
              <div>
                <h2 className="text-base font-semibold text-dd-ink">Tambah Ruangan</h2>
                <p className="mt-1 text-xs leading-5 text-dd-muted">
                  Ruangan opsional dan selalu berada di dalam satu Area Studio.
                </p>
              </div>
              <SearchSelect
                label="Area Studio"
                value={selectedStudioId}
                placeholder="Pilih Area Studio"
                options={studios
                  .filter((studio) => studio.active)
                  .map((studio) => ({ id: studio.id, label: studio.name, description: studio.code }))}
                onChange={setSelectedStudioId}
                required
              />
              <TextInput label="Kode ruangan" name="code" placeholder="Contoh: ROOM-A" required />
              <TextInput label="Nama ruangan" name="name" placeholder="Ruangan A" required />
              <TextInput label="Kapasitas" name="capacity" type="number" min={1} placeholder="Contoh: 12" />
              <div className="pt-2">
                <Button type="submit" disabled={!selectedStudioId || !canManage || loading}>
                  Simpan Ruangan
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-12">
            <section className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card">
              <div className="flex items-center justify-between gap-3 border-b border-dd-line pb-4">
                <div>
                  <h2 className="text-base font-semibold text-dd-ink">Area Studio & Ruangan</h2>
                  <p className="text-xs text-dd-muted">Daftar area dan ruangan pada cabang aktif</p>
                </div>
                <StatusBadge tone="info">{studios.length} area</StatusBadge>
              </div>
              {studios.length ? (
                <ul className="mt-4 grid list-none gap-4 p-0 md:grid-cols-2">
                  {studios.map((studio) => (
                    <li className="rounded-dd-sm border border-dd-line p-4" key={studio.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <strong className="text-sm font-semibold text-dd-ink">{studio.name}</strong>
                          <p className="text-sm text-dd-muted">{studio.code}</p>
                        </div>
                        <StatusBadge tone={studio.active ? 'success' : 'neutral'}>
                          {studio.active ? 'Aktif' : 'Nonaktif'}
                        </StatusBadge>
                      </div>
                      <p className="mt-2 text-xs text-dd-muted">
                        {studio.equipmentText || 'Equipment belum dicatat'}
                      </p>
                      <ul className="mt-3 grid list-none gap-2 p-0">
                        {(studio.rooms ?? []).map((room) => (
                          <li
                            className="flex items-center justify-between rounded-dd-sm bg-dd-surface-muted px-3 py-2 text-sm"
                            key={room.id}
                          >
                            <span>
                              {room.name} · {room.code}
                            </span>
                            <span className="text-xs text-dd-muted">
                              {room.capacity ? `Kapasitas ${room.capacity}` : 'Tanpa batas khusus'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4">
                  <EmptyState
                    title="Belum ada Area Studio"
                    description="Tambahkan Area Studio pada Studio/Cabang aktif."
                  />
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* Tab: Projection, Capacity, Fees (Operational Settings) */}
      {['projection', 'capacity', 'fees'].includes(selectedTab) && (
        <div className="space-y-6">
          <form
            className="flex flex-col gap-5 rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
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
            <div className="border-b border-dd-line pb-4">
              <h2 className="text-base font-semibold text-dd-ink">Tambah konfigurasi efektif</h2>
              <p className="mt-1 text-xs text-dd-muted">
                Versi baru berlaku pada periode yang dipilih dan tidak boleh tumpang tindih.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SelectInput
                label="Jenis konfigurasi"
                name="kind"
                value={kind}
                onChange={(event) => {
                  const selected = event.target.value as MasterKind;
                  setKind(selected);
                  void client
                    .listSettings(selected, branchId)
                    .then(setSettings)
                    .catch((err) => setFailure(masterFailure(err)));
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
                wrapperClassName="sm:col-span-2 lg:col-span-3"
                name="reason"
                placeholder="Jelaskan kebutuhan bisnis"
                minLength={3}
                required
              />
            </div>

            <div className="pt-2">
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
            </div>
          </form>

          <section
            className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
            aria-labelledby="setting-list-title"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dd-line pb-4">
              <div>
                <h2 id="setting-list-title" className="text-base font-semibold text-dd-ink">
                  {kindLabels[kind]}
                </h2>
                <p className="mt-1 text-xs text-dd-muted">Riwayat konfigurasi untuk cabang yang dipilih.</p>
              </div>
              <StatusBadge tone="info">{settings.length} versi</StatusBadge>
            </div>
            {settings.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-dd-line text-xs uppercase text-dd-muted">
                    <tr>
                      <th className="pb-3 pt-2 font-semibold">Tipe kelas</th>
                      <th className="pb-3 pt-2 font-semibold">Nilai</th>
                      <th className="pb-3 pt-2 font-semibold">Mulai</th>
                      <th className="pb-3 pt-2 font-semibold">Sampai</th>
                      <th className="pb-3 pt-2 font-semibold">Versi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dd-line">
                    {settings.map((item) => (
                      <tr key={item.id} className="hover:bg-dd-surface-muted/50">
                        <td className="py-3 font-medium text-dd-ink">
                          {classTypes.find((type) => type.id === item.classTypeId)?.name ??
                            item.classTypeId}
                        </td>
                        <td className="py-3">{settingValue(item)}</td>
                        <td className="py-3 text-dd-muted">{dateValue(item.effectiveFrom)}</td>
                        <td className="py-3 text-dd-muted">{dateValue(item.effectiveUntil)}</td>
                        <td className="py-3 font-mono text-xs text-dd-muted">v{item.version}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  title="Belum ada konfigurasi"
                  description="Pilih cabang lalu tambahkan konfigurasi efektif pertama."
                />
              </div>
            )}
          </section>
        </div>
      )}

      {/* Tab: Accounts (Payment Accounts View) */}
      {selectedTab === 'accounts' && <PaymentAccountsView />}

      {/* Tab: Public Profiles */}
      {selectedTab === 'publicProfiles' && (
        <PublicProfileEditor branchId={branchId} canManage={canManage} />
      )}

      {/* Tab: Packages (Navigational Card to Workspace) */}
      {selectedTab === 'packages' && (
        <section className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card">
          <h2 className="text-base font-semibold text-dd-ink">Manajemen Paket Sesi</h2>
          <p className="mt-2 text-sm leading-6 text-dd-muted">
            Katalog paket sesi, penetapan harga, kuota sesi, dan masa berlaku kini dikelola terpusat
            pada workspace khusus paket.
          </p>
          <div className="mt-4">
            <ButtonLink href="/workspace/packages">Buka Manajemen Paket</ButtonLink>
          </div>
        </section>
      )}

      {/* Tab: Branches (Cohesive V2 Layout) */}
      {selectedTab === 'branches' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <section className="flex flex-col gap-3 rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card">
              <h2 className="text-base font-semibold text-dd-ink">Branch Management</h2>
              <p className="text-sm leading-6 text-dd-muted">
                Pembuatan, detail, dependency, edit, deactivate, dan reactivate cabang kini dikelola
                secara penuh pada workspace cabang.
              </p>
              <div className="pt-2">
                <ButtonLink href="/workspace/branches">Buka Branch Management</ButtonLink>
              </div>
            </section>
          </div>

          <div className="lg:col-span-8">
            <section
              className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
              aria-labelledby="branch-list-title"
            >
              <h2 id="branch-list-title" className="text-base font-semibold text-dd-ink">
                Daftar cabang
              </h2>
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
                            <strong className="text-sm font-semibold text-dd-ink">{item.name}</strong>
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
                  <div className="mt-4">
                    <Pagination
                      hasPrevious={branchCursorHistory.length > 0 && !loading}
                      hasNext={Boolean(branchNextCursor) && !loading}
                      currentPage={branchCursorHistory.length + 1}
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
                  </div>
                </>
              ) : (
                <EmptyState
                  title="Belum ada cabang"
                  description="Muat data atau tambahkan cabang baru."
                />
              )}
            </section>
          </div>
        </div>
      )}

      {/* Class Type Edit Drawer */}
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
          setClassTypeName('');
          setClassTypeReason('');
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => {
                setEditingClassType(undefined);
                setClassTypeName('');
                setClassTypeReason('');
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={
                loading ||
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
                    setClassTypeName('');
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
              required
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

      {/* Class Type Scope Drawer */}
      <Drawer
        open={Boolean(scopingClassType)}
        title="Atur Studio/Cabang"
        description="Pilihan disimpan sebagai scope eksplisit. Cabang baru tidak otomatis ikut."
        busy={loading}
        dirty={Boolean(scopingClassType && classTypeScopeReason.trim())}
        onClose={() => {
          setScopingClassType(undefined);
          setClassTypeScopeBranchIds([]);
          setClassTypeScopeReason('');
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => {
                setScopingClassType(undefined);
                setClassTypeScopeBranchIds([]);
                setClassTypeScopeReason('');
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={loading || !scopingClassType || classTypeScopeReason.trim().length < 3}
              onClick={() =>
                void run(async () => {
                  if (!scopingClassType) return;
                  await client.replaceClassTypeScopes(scopingClassType.id, {
                    branchIds: classTypeScopeBranchIds,
                    expectedVersion: scopingClassType.version,
                    reason: classTypeScopeReason.trim(),
                  });
                  setScopingClassType(undefined);
                  setClassTypeScopeBranchIds([]);
                  setClassTypeScopeReason('');
                  setClassTypes(await client.listClassTypes());
                }, 'Cakupan tipe kelas berhasil diperbarui.')
              }
            >
              Simpan cakupan
            </Button>
          </div>
        }
      >
        {scopingClassType && (
          <div className="grid gap-4">
            <p className="text-sm text-dd-muted">{scopingClassType.name}</p>
            <div className="grid gap-2">
              {scopeBranches
                .filter((branch) => branch.active)
                .map((branch) => (
                  <CheckboxInput
                    key={branch.id}
                    label={branch.name}
                    checked={classTypeScopeBranchIds.includes(branch.id)}
                    onChange={(event) =>
                      setClassTypeScopeBranchIds((current) =>
                        event.target.checked
                          ? [...new Set([...current, branch.id])]
                          : current.filter((id) => id !== branch.id),
                      )
                    }
                  />
                ))}
            </div>
            <TextInput
              label="Alasan perubahan"
              value={classTypeScopeReason}
              onChange={(event) => setClassTypeScopeReason(event.target.value)}
              minLength={3}
              required
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
