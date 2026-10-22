'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  browserMasterClient,
  masterFailureMessage,
  type MasterClient,
  type MasterKind,
  type MasterSetting,
} from '@/api-clients/master-client';
import { EmptyState, Feedback, StatusBadge } from '../ui';
import { AdminPageHeader } from '../components/admin/admin-page-header';
import { useActiveBranchState, useSessionContext } from '../session-context';
import { browserIdentityClient, type LookupOption } from '@/api-clients/identity-client';
import { Pagination, StatCard, Tabs } from '../components/admin/admin-ui';
import { Button, ButtonLink } from '../components/actions';
import { PublicProfileEditor } from './public-profile-editor';
import { PaymentAccountsView } from './payment-accounts-view';
import { StudioVenueList } from './studio-venue-list';
import {
  AsyncSearchSelect,
  CheckboxInput,
  DateInput,
  SearchInput,
  SearchSelect,
  SelectInput,
  TextInput,
} from '../components/forms';
import { Drawer, Modal, useAppFeedback } from '../components/app-feedback';
import { Plus, Store } from 'lucide-react';
import { formatRupiah } from '../lib/formatters';
import { timezoneLabel } from '../classes/class-slot-presenters';

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
  INSTRUCTOR_FEE: 'Honor instruktur',
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
  const [classTypeSearch, setClassTypeSearch] = useState('');
  const [classTypeStatusFilter, setClassTypeStatusFilter] = useState<'' | 'ACTIVE' | 'INACTIVE'>('');
  const [isCreateClassTypeModalOpen, setIsCreateClassTypeModalOpen] = useState(false);

  // Tahap 2: States for Settings (Fees, Quota, Projection)
  const [isCreateSettingModalOpen, setIsCreateSettingModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<MasterSetting | null>(null);
  const [editingSettingValue, setEditingSettingValue] = useState('');
  const [editingSettingCapacity, setEditingSettingCapacity] = useState('');
  const [editingSettingEffectiveDate, setEditingSettingEffectiveDate] = useState('');
  const [editingSettingReason, setEditingSettingReason] = useState('');
  const [settingSearch, setSettingSearch] = useState('');

  // Tahap 3: States for Venues (Area Studio & Ruangan)
  const [isCreateStudioModalOpen, setIsCreateStudioModalOpen] = useState(false);
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [targetStudioIdForNewRoom, setTargetStudioIdForNewRoom] = useState('');
  const [venueSearch, setVenueSearch] = useState('');

  const filteredClassTypes = classTypes.filter((item) => {
    if (classTypeStatusFilter === 'ACTIVE' && !item.active) return false;
    if (classTypeStatusFilter === 'INACTIVE' && item.active) return false;
    if (classTypeSearch.trim()) {
      const q = classTypeSearch.toLowerCase().trim();
      return item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredSettings = useMemo(() => {
    if (!settingSearch.trim()) return settings;
    const q = settingSearch.toLowerCase().trim();
    return settings.filter((s) => {
      const classType = classTypes.find((c) => c.id === s.classTypeId);
      const ctMatch =
        classType?.name.toLowerCase().includes(q) || classType?.code.toLowerCase().includes(q);
      const instMatch = s.instructorName?.toLowerCase().includes(q);
      return Boolean(ctMatch || instMatch);
    });
  }, [settings, settingSearch, classTypes]);

  const filteredStudios = useMemo(() => {
    if (!venueSearch.trim()) return studios;
    const q = venueSearch.toLowerCase().trim();
    return studios.filter((s) => {
      const studioMatch =
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        Boolean(s.equipmentText && s.equipmentText.toLowerCase().includes(q));
      const roomMatch = (s.rooms ?? []).some(
        (r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q),
      );
      return studioMatch || roomMatch;
    });
  }, [studios, venueSearch]);

  const handleUpdateSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSetting) return;
    setSettingSubmitting(true);
    void run(async () => {
      try {
        const effDate =
          editingSettingEffectiveDate.trim() || new Date().toISOString().slice(0, 10);
        const reason =
          editingSettingReason.trim() || 'Pembaruan tarif langsung oleh admin';
        await client.createSetting({
          kind: editingSetting.kind,
          branchId: editingSetting.branchId || branchId,
          classTypeId: editingSetting.classTypeId,
          instructorUserId: editingSetting.instructorId,
          value: Number(editingSettingValue),
          capacity:
            editingSetting.kind === 'QUOTA_CAPACITY' ? Number(editingSettingCapacity) : undefined,
          effectiveFrom: effDate,
          reason,
        });
        setEditingSetting(null);
        await loadBranchContent(branchId, kind);
      } finally {
        setSettingSubmitting(false);
      }
    }, 'Konfigurasi berhasil diperbarui.');
  };

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
      setFailure(masterFailureMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const deleteSetting = async (item: MasterSetting) => {
    if (item.kind === 'QUOTA_CAPACITY') return;
    const accepted = await feedback.confirm({
      tone: 'danger',
      title: 'Hapus tarif yang belum berlaku?',
      message: `${settingValue(item)} yang berlaku mulai ${dateValue(item.effectiveFrom)} akan dihapus. Tarif yang sudah berlaku tidak dapat dihapus.`,
      confirmLabel: 'Hapus tarif',
    });
    if (!accepted) return;
    await run(async () => {
      await client.deleteSetting(item.kind as 'INSTRUCTOR_FEE' | 'PROJECTION_RATE', item.id);
      await loadBranchContent(branchId, kind);
    }, 'Tarif dihapus.');
  };

  const loadBranchContent = async (selectedBranchId: string, selectedKind = kind) => {
    try {
      const nextClassTypes = await client.listClassTypes(selectedBranchId || undefined);
      setClassTypes(nextClassTypes);
      setClassTypeId((current) =>
        nextClassTypes.some((item) => item.id === current) ? current : (nextClassTypes[0]?.id ?? ''),
      );
    } catch {
      // Tetap lanjutkan jika catalog global sedang offline
    }

    if (!selectedBranchId) {
      setSettings([]);
      setStudios([]);
      return;
    }
    const [nextSettings, nextStudios] = await Promise.all([
      client.listSettings(selectedKind, selectedBranchId),
      client.listStudios(selectedBranchId, { includeInactive: true }),
    ]);
    setSettings(nextSettings);
    setStudios(nextStudios);
    setSelectedStudioId(nextStudios.find((item) => item.active)?.id ?? '');
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
        nextBranches.find((item) => item.active)?.id ??
        '';
      setBranchId(selectedBranchId);
      await loadBranchContent(selectedBranchId);
      if (isManual || testAccess) {
        setMessage('Master data berhasil dimuat.');
      }
    } catch (error) {
      setFailure(masterFailureMessage(error));
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
      void loadBranchPage().catch((err) => setFailure(masterFailureMessage(err)));
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
      void loadBranchContent(branchId).catch((err) => setFailure(masterFailureMessage(err)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  return (
    <div className="space-y-6" aria-labelledby="master-title">
      {/* Top-Level Modern PageHeader */}
      <AdminPageHeader
        title="Data Master"
        titleId="master-title"
        description="Kelola katalog tipe kelas global serta konfigurasi kapasitas, proyeksi, honor instruktur, dan area studio."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={canManage ? 'success' : 'neutral'}>
              {canManage ? 'Dapat mengelola' : 'Akses baca'}
            </StatusBadge>
            <StatusBadge tone="success">Hak akses terverifikasi</StatusBadge>
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
              {loading ? 'Memuat…' : testAccess ? 'Muat master data' : 'Segarkan data master'}
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
          <div className="w-full overflow-x-auto pb-1 no-scrollbar lg:w-auto">
            <Tabs
              wrap={false}
              items={tabItems.map((tab) => ({ value: tab.id, label: tab.label }))}
              value={selectedTab}
              onChange={(value) => {
                const tab = tabItems.find((item) => item.id === value);
                if (!tab) return;
                setSelectedTab(tab.id);
                onTabChange?.(tab.id);
                if (tab.kind) {
                  setKind(tab.kind);
                  const effectiveBranch = branchId || branches.find((b) => b.active)?.id || '';
                  if (effectiveBranch) {
                    if (!branchId) setBranchId(effectiveBranch);
                    void client
                      .listSettings(tab.kind, effectiveBranch)
                      .then(setSettings)
                      .catch((err) => setFailure(masterFailureMessage(err)));
                  }
                  if (!classTypes.length) {
                    void client
                      .listClassTypes(effectiveBranch || undefined)
                      .then(setClassTypes)
                      .catch(() => {});
                  }
                } else if (tab.id === 'classTypes') {
                  void Promise.all([client.listClassTypes(), loadAllActiveBranches()])
                    .then(([types]) => setClassTypes(types))
                    .catch((err) => setFailure(masterFailureMessage(err)));
                } else if (tab.id === 'venues') {
                  const effectiveBranch = branchId || branches.find((b) => b.active)?.id || '';
                  if (effectiveBranch) {
                    if (!branchId) setBranchId(effectiveBranch);
                    void client
                      .listStudios(effectiveBranch, { includeInactive: true })
                      .then((nextStudios) => {
                        setStudios(nextStudios);
                        setSelectedStudioId(nextStudios.find((item) => item.active)?.id ?? '');
                      })
                      .catch((err) => setFailure(masterFailureMessage(err)));
                  }
                }
              }}
            />
          </div>

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
                  void loadBranchContent(selected).catch((err) => setFailure(masterFailureMessage(err)));
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
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-dd-success hover:text-dd-forest-dark"
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
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-dd-danger hover:text-dd-ink"
            type="button"
            onClick={() => setFailure(undefined)}
            aria-label="Tutup pesan kesalahan"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab: Class Types (Standard 1-Pintu Full-Width CRUD Table) */}
      {selectedTab === 'classTypes' && (
        <div className="space-y-4">
          <section
            className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
            aria-labelledby="class-list-title"
          >
            {/* Header: Title, Total Badge, and [+ Tambah Tipe Kelas] */}
            <div className="flex flex-col gap-4 border-b border-dd-line pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 id="class-list-title" className="text-base font-semibold text-dd-ink">
                    Tipe kelas
                  </h2>
                  <StatusBadge tone="info">{classTypes.length} tipe kelas</StatusBadge>
                </div>
                <p className="mt-1 text-xs text-dd-muted">
                  Katalog tipe kelas global yang digunakan pada jadwal kelas di seluruh cabang studio
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                disabled={!canManage || loading}
                onClick={() => setIsCreateClassTypeModalOpen(true)}
              >
                <Plus className="mr-1.5 size-4" />
                Tambah tipe kelas
              </Button>
            </div>

            {/* Instant Search & Status Filter */}
            <div className="my-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
              <SearchInput
                label="Cari tipe kelas"
                value={classTypeSearch}
                placeholder="Cari kode atau nama kelas..."
                onChange={(event) => setClassTypeSearch(event.currentTarget.value)}
              />
              <SelectInput
                label="Status tipe kelas"
                value={classTypeStatusFilter}
                onChange={(event) =>
                  setClassTypeStatusFilter(event.currentTarget.value as '' | 'ACTIVE' | 'INACTIVE')
                }
              >
                <option value="">Semua status</option>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Nonaktif</option>
              </SelectInput>
            </div>

            {/* Full-Width CRUD Data Table */}
            {filteredClassTypes.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-dd-line text-xs uppercase text-dd-muted">
                    <tr>
                      <th className="w-12 pb-3 pt-2 font-semibold">No</th>
                      <th className="pb-3 pt-2 font-semibold">Kode Kelas</th>
                      <th className="pb-3 pt-2 font-semibold">Nama Tipe Kelas</th>
                      <th className="pb-3 pt-2 font-semibold">Cakupan Cabang</th>
                      <th className="w-24 pb-3 pt-2 font-semibold">Status</th>
                      <th className="w-64 pb-3 pt-2 text-right font-semibold">
                        <span className="sr-only">Aksi</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dd-line">
                    {filteredClassTypes.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-dd-surface-muted/50">
                        <td className="py-3.5 text-xs text-dd-muted">{idx + 1}</td>
                        <td className="py-3.5 font-mono text-xs font-semibold text-dd-ink">
                          {item.code}
                        </td>
                        <td className="py-3.5 font-medium text-dd-ink">{item.name}</td>
                        <td className="py-3.5 text-xs text-dd-muted">
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
                        </td>
                        <td className="py-3.5">
                          <StatusBadge tone={item.active ? 'success' : 'neutral'}>
                            {item.active ? 'Aktif' : 'Nonaktif'}
                          </StatusBadge>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.active ? (
                              <>
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
                                  Edit
                                </Button>
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
                                  Atur Cabang
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
                              </>
                            ) : (
                              <Button
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  title={
                    classTypeSearch || classTypeStatusFilter
                      ? 'Tipe kelas tidak ditemukan'
                      : 'Belum ada tipe kelas'
                  }
                  description={
                    classTypeSearch || classTypeStatusFilter
                      ? 'Coba ubah kata kunci pencarian atau filter status tipe kelas.'
                      : 'Tambahkan satu tipe kelas global, lalu tentukan cakupan Studio/Cabang.'
                  }
                />
              </div>
            )}
          </section>

          {/* Modal Dialog: Tambah Tipe Kelas */}
          <Modal
            open={isCreateClassTypeModalOpen}
            title="Tambah tipe kelas"
            description="Tipe kelas adalah katalog global studio. Cabang yang dapat menggunakannya dipilih setelah tipe kelas dibuat."
            busy={loading}
            onClose={() => setIsCreateClassTypeModalOpen(false)}
            footer={
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={loading}
                  onClick={() => setIsCreateClassTypeModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  form="create-class-type-form"
                  disabled={!canManage || loading}
                >
                  Simpan tipe kelas
                </Button>
              </div>
            }
          >
            <form
              id="create-class-type-form"
              aria-label="Buat class type"
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const data = new FormData(form);
                void run(async () => {
                  await client.createClassType({
                    code: String(data.get('code')).trim().toUpperCase(),
                    name: String(data.get('name')).trim(),
                    description: String(data.get('description')).trim() || undefined,
                  });
                  form.reset();
                  setIsCreateClassTypeModalOpen(false);
                  setClassTypes(await client.listClassTypes());
                }, 'Tipe kelas berhasil dibuat.');
              }}
            >
              <TextInput label="Kode kelas" name="code" placeholder="Contoh: REFORMER" required />
              <TextInput label="Nama kelas" name="name" placeholder="Reformer Pilates" required />
              <TextInput
                label="Deskripsi (opsional)"
                name="description"
                placeholder="Contoh: Latihan pilates reformer untuk fleksibilitas dan kekuatan inti"
              />
            </form>
          </Modal>
        </div>
      )}

      {/* Tab: Venues (Area Studio & Ruangan) */}
      {selectedTab === 'venues' && (
        <div className="space-y-6">
          {/* Pemilih Cabang Area Studio Mandiri */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-dd-lg border border-dd-line bg-dd-surface p-4 shadow-dd-card">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-dd-sm bg-dd-sand/40 text-dd-forest">
                <Store className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-dd-ink">Cabang Studio</h3>
                <p className="text-xs text-dd-muted">
                  Kelola area studio dan kapasitas reformer ruangan untuk cabang terpilih.
                </p>
              </div>
            </div>
            {branches.length > 0 && (
              <div className="w-full sm:w-72">
                <SelectInput
                  aria-label="Pilih cabang studio"
                  value={branchId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setBranchId(newId);
                    void loadBranchContent(newId, kind);
                  }}
                >
                  {branches.filter((b) => b.active).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </SelectInput>
              </div>
            )}
          </div>

          {/* Section Tabel Penuh Area Studio & Ruangan */}
          <section
            className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
            aria-labelledby="venues-list-title"
          >
            {/* Header: Judul, Status & Tombol Tambah */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dd-line pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="venues-list-title" className="text-base font-semibold text-dd-ink">
                    Area Studio & Ruangan
                  </h2>
                  <StatusBadge tone="info">{studios.length} area</StatusBadge>
                </div>
                <p className="mt-1 text-xs text-dd-muted">
                  Daftar area dan ruangan pada cabang{' '}
                  <strong className="text-dd-ink">
                    {branches.find((b) => b.id === branchId)?.name ?? 'Studio terpilih'}
                  </strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="w-64">
                  <TextInput
                    placeholder="Cari area atau ruangan…"
                    value={venueSearch}
                    onChange={(e) => setVenueSearch(e.target.value)}
                    aria-label="Cari area studio atau ruangan"
                  />
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setTargetStudioIdForNewRoom(studios.find((s) => s.active)?.id ?? '');
                    setIsCreateRoomModalOpen(true);
                  }}
                  disabled={!branchId || !canManage || studios.filter((s) => s.active).length === 0}
                >
                  + Tambah Ruangan
                </Button>
                <Button
                  onClick={() => setIsCreateStudioModalOpen(true)}
                  disabled={!branchId || !canManage}
                >
                  + Tambah Area Studio
                </Button>
              </div>
            </div>

            {/* List / Tabel Area Studio */}
            {filteredStudios.length ? (
              <StudioVenueList
                studios={filteredStudios}
                canManage={canManage}
                client={client}
                onAddRoom={(studioId) => {
                  setTargetStudioIdForNewRoom(studioId);
                  setSelectedStudioId(studioId);
                  setIsCreateRoomModalOpen(true);
                }}
                onFailure={setFailure}
                onChanged={async (successMessage) => {
                  setFailure(undefined);
                  setMessage(successMessage);
                  setStudios(await client.listStudios(branchId, { includeInactive: true }));
                }}
              />
            ) : studios.length ? (
              <div className="mt-4 flex flex-col items-center gap-3">
                <EmptyState
                  title="Tidak ada hasil yang cocok"
                  description={`Tidak ditemukan area studio atau ruangan dengan kata kunci "${venueSearch}".`}
                />
                <Button variant="secondary" size="sm" onClick={() => setVenueSearch('')}>
                  Hapus filter pencarian
                </Button>
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center gap-3">
                <EmptyState
                  title="Belum ada Area Studio"
                  description="Tambahkan Area Studio pada Studio/Cabang aktif."
                />
                <Button
                  onClick={() => setIsCreateStudioModalOpen(true)}
                  disabled={!branchId || !canManage}
                >
                  + Tambah Area Studio
                </Button>
              </div>
            )}
          </section>

          {/* Modal 1: Tambah Area Studio */}
          <Modal
            open={isCreateStudioModalOpen}
            onClose={() => setIsCreateStudioModalOpen(false)}
            title="Tambah Area Studio"
          >
            <form
              className="flex flex-col gap-4"
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
                  setIsCreateStudioModalOpen(false);
                  const next = await client.listStudios(branchId, { includeInactive: true });
                  setStudios(next);
                  setSelectedStudioId(next.find((item) => item.active)?.id ?? '');
                }, 'Area Studio berhasil ditambahkan.');
              }}
            >
              <div className="rounded-dd-md border border-dd-line bg-dd-surface-muted/50 p-3 text-xs text-dd-muted">
                Studio/Cabang Aktif:{' '}
                <strong className="font-semibold text-dd-ink">
                  {branches.find((b) => b.id === branchId)?.name ?? 'Studio terpilih'}
                </strong>.
                Area Studio berada di dalam cabang dan menjadi venue wajib untuk jadwal kelas.
              </div>

              {!branchId && (
                <div className="rounded-dd-md border border-dd-warning/40 bg-dd-warning-soft p-3 text-xs font-medium text-dd-warning">
                  Pilih Studio/Cabang aktif pada pemilih cabang di atas terlebih dahulu.
                </div>
              )}

              <TextInput label="Kode area" name="code" placeholder="Contoh: MAIN" required />
              <TextInput label="Nama area" name="name" placeholder="Main Studio" required />
              <TextInput label="Equipment" name="equipmentText" placeholder="Reformer, Mat, Foam Roller" />
              <TextInput label="Nomor kontak" name="contactPhoneE164" placeholder="+628…" />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-dd-line">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateStudioModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={!branchId || !canManage || loading}>
                  Simpan Area Studio
                </Button>
              </div>
            </form>
          </Modal>

          {/* Modal 2: Tambah Ruangan */}
          <Modal
            open={isCreateRoomModalOpen}
            onClose={() => setIsCreateRoomModalOpen(false)}
            title="Tambah Ruangan"
          >
            <form
              className="flex flex-col gap-4"
              aria-label="Tambah ruangan"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const data = new FormData(form);
                void run(async () => {
                  const effectiveStudioId = targetStudioIdForNewRoom || selectedStudioId;
                  if (!effectiveStudioId) throw new Error('STUDIO_REQUIRED');
                  await client.createRoom(effectiveStudioId, {
                    code: String(data.get('code')).trim().toUpperCase(),
                    name: String(data.get('name')).trim(),
                    capacity: data.get('capacity') ? Number(data.get('capacity')) : undefined,
                  });
                  form.reset();
                  setIsCreateRoomModalOpen(false);
                  setTargetStudioIdForNewRoom('');
                  setStudios(await client.listStudios(branchId, { includeInactive: true }));
                }, 'Ruangan berhasil ditambahkan.');
              }}
            >
              <div className="rounded-dd-md border border-dd-line bg-dd-surface-muted/50 p-3 text-xs text-dd-muted">
                Studio/Cabang Aktif:{' '}
                <strong className="font-semibold text-dd-ink">
                  {branches.find((b) => b.id === branchId)?.name ?? 'Studio terpilih'}
                </strong>.
                Ruangan opsional dan selalu berada di dalam satu Area Studio.
              </div>

              <SearchSelect
                label="Area Studio"
                value={targetStudioIdForNewRoom || selectedStudioId}
                placeholder="Pilih Area Studio"
                options={studios
                  .filter((studio) => studio.active)
                  .map((studio) => ({ id: studio.id, label: studio.name, description: studio.code }))}
                onChange={(val) => {
                  setSelectedStudioId(val);
                  setTargetStudioIdForNewRoom(val);
                }}
                required
              />
              <TextInput label="Kode ruangan" name="code" placeholder="Contoh: ROOM-A" required />
              <TextInput label="Nama ruangan" name="name" placeholder="Ruangan A" required />
              <TextInput label="Kapasitas" name="capacity" type="number" min={1} placeholder="Contoh: 12" />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-dd-line">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateRoomModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={!(targetStudioIdForNewRoom || selectedStudioId) || !canManage || loading}
                >
                  Simpan Ruangan
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {/* Tab: Projection, Capacity, Fees (Operational Settings) */}
      {['projection', 'capacity', 'fees'].includes(selectedTab) && (
        <div className="space-y-6">
          {/* Pemilih Cabang Operasional Mandiri */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-dd-lg border border-dd-line bg-dd-surface p-4 shadow-dd-card">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-dd-sm bg-dd-sand/40 text-dd-forest">
                <Store className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-dd-ink">Cabang Operasional</h3>
                <p className="text-xs text-dd-muted">
                  Kelola {kindLabels[kind].toLowerCase()} khusus untuk studio/cabang terpilih.
                </p>
              </div>
            </div>
            {branches.length > 0 && (
              <div className="w-full sm:w-72">
                <SelectInput
                  aria-label="Pilih cabang operasional"
                  value={branchId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setBranchId(newId);
                    void loadBranchContent(newId, kind);
                  }}
                >
                  {branches.filter((b) => b.active).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </SelectInput>
              </div>
            )}
          </div>

          {/* Tabel Penuh CRUD Standar Konfigurasi */}
          <section
            className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
            aria-labelledby="setting-list-title"
          >
            {/* Header: Judul, Search Filter & Tombol Tambah */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dd-line pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="setting-list-title" className="text-base font-semibold text-dd-ink">
                    {kindLabels[kind]}
                  </h2>
                  <StatusBadge tone="info">
                    {settings.length} versi
                  </StatusBadge>
                </div>
                <p className="mt-1 text-xs text-dd-muted">
                  Daftar tarif dan kuota operasional yang berlaku di cabang{' '}
                  <strong className="text-dd-ink">
                    {branches.find((b) => b.id === branchId)?.name ?? 'terpilih'}
                  </strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="w-64">
                  <TextInput
                    placeholder="Cari tipe kelas / instruktur…"
                    value={settingSearch}
                    onChange={(e) => setSettingSearch(e.target.value)}
                    aria-label="Cari konfigurasi"
                  />
                </div>
                <Button
                  onClick={() => setIsCreateSettingModalOpen(true)}
                  disabled={
                    !canManage ||
                    ((kind === 'INSTRUCTOR_FEE' || kind === 'PROJECTION_RATE') && !canFinance)
                  }
                >
                  {kind === 'INSTRUCTOR_FEE'
                    ? '+ Atur honor baru'
                    : kind === 'QUOTA_CAPACITY'
                      ? '+ Atur kuota baru'
                      : '+ Atur proyeksi baru'}
                </Button>
              </div>
            </div>

            {/* List Data / Tabel */}
            {filteredSettings.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-dd-line text-xs uppercase tracking-wider text-dd-muted">
                    <tr>
                      <th className="w-12 pb-3 pt-2 text-center font-semibold">No</th>
                      <th className="pb-3 pt-2 font-semibold">Tipe kelas</th>
                      {kind === 'INSTRUCTOR_FEE' && (
                        <th className="pb-3 pt-2 font-semibold">Instruktur</th>
                      )}
                      <th className="pb-3 pt-2 font-semibold">
                        {kind === 'QUOTA_CAPACITY' ? 'Kuota & Kapasitas' : 'Nilai'}
                      </th>
                      <th className="pb-3 pt-2 font-semibold">Berlaku mulai</th>
                      <th className="pb-3 pt-2 font-semibold">Status</th>
                      <th className="pb-3 pt-2 text-right font-semibold">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dd-line">
                    {filteredSettings.map((item, index) => {
                      const classType = classTypes.find((type) => type.id === item.classTypeId);
                      return (
                        <tr key={item.id} className="transition-colors hover:bg-dd-surface-muted/50">
                          <td className="py-3 text-center text-xs text-dd-muted">{index + 1}</td>
                          <td className="py-3 font-medium text-dd-ink">
                            <span>{classType?.name ?? item.classTypeId}</span>
                            {classType?.code && (
                              <span className="ml-2 rounded bg-dd-surface-muted px-1.5 py-0.5 text-[11px] font-normal text-dd-muted">
                                {classType.code}
                              </span>
                            )}
                          </td>
                          {kind === 'INSTRUCTOR_FEE' && (
                            <td className="py-3 text-dd-ink">
                              {item.instructorName ? (
                                <span className="font-medium">{item.instructorName}</span>
                              ) : (
                                <span className="text-dd-muted italic">—</span>
                              )}
                            </td>
                          )}
                          <td className="py-3 font-semibold text-dd-ink">{settingValue(item)}</td>
                          <td className="py-3 text-dd-muted">{dateValue(item.effectiveFrom)}</td>
                          <td className="py-3">
                            {item.kind === 'QUOTA_CAPACITY' ? (
                              <StatusBadge tone="success">Berlaku</StatusBadge>
                            ) : item.deletable ? (
                              <StatusBadge tone="info">Akan berlaku</StatusBadge>
                            ) : (
                              <StatusBadge tone="neutral">Sudah berlaku</StatusBadge>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={
                                  !canManage ||
                                  ((kind === 'INSTRUCTOR_FEE' || kind === 'PROJECTION_RATE') &&
                                    !canFinance)
                                }
                                onClick={() => {
                                  setEditingSetting(item);
                                  const val = item.value as Record<string, unknown>;
                                  if (item.kind === 'INSTRUCTOR_FEE') {
                                    setEditingSettingValue(String(val.feeRp ?? ''));
                                  } else if (item.kind === 'PROJECTION_RATE') {
                                    setEditingSettingValue(String(val.rateRp ?? ''));
                                  } else {
                                    setEditingSettingValue(String(val.minimumQuota ?? '1'));
                                    setEditingSettingCapacity(
                                      String(val.defaultCapacity ?? val.capacity ?? '10'),
                                    );
                                  }
                                  setEditingSettingEffectiveDate(
                                    new Date().toISOString().slice(0, 10),
                                  );
                                  setEditingSettingReason('Pembaruan langsung oleh admin');
                                }}
                              >
                                Edit
                              </Button>
                              {kind !== 'QUOTA_CAPACITY' && canFinance && item.deletable && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-dd-danger hover:bg-dd-danger-soft hover:text-dd-danger"
                                  disabled={loading}
                                  onClick={() => void deleteSetting(item)}
                                >
                                  Hapus
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : settings.length ? (
              <div className="mt-4 flex flex-col items-center gap-3">
                <EmptyState
                  title="Tidak ada hasil yang cocok"
                  description={`Tidak ditemukan konfigurasi dengan kata kunci "${settingSearch}".`}
                />
                <Button variant="secondary" size="sm" onClick={() => setSettingSearch('')}>
                  Hapus filter pencarian
                </Button>
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center gap-3">
                <EmptyState
                  title="Belum ada konfigurasi"
                  description="Pilih cabang lalu tambahkan konfigurasi efektif pertama."
                />
                <Button
                  onClick={() => setIsCreateSettingModalOpen(true)}
                  disabled={
                    !canManage ||
                    ((kind === 'INSTRUCTOR_FEE' || kind === 'PROJECTION_RATE') && !canFinance)
                  }
                >
                  {kind === 'INSTRUCTOR_FEE'
                    ? '+ Atur honor pertama'
                    : kind === 'QUOTA_CAPACITY'
                      ? '+ Atur kuota pertama'
                      : '+ Atur proyeksi pertama'}
                </Button>
              </div>
            )}
          </section>

          {/* Modal 1: Tambah / Atur Konfigurasi Baru */}
          <Modal
            open={isCreateSettingModalOpen}
            onClose={() => setIsCreateSettingModalOpen(false)}
            title={`Atur ${kindLabels[kind]} Baru`}
          >
            <form
              className="flex flex-col gap-4"
              aria-label="Buat effective setting"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const data = new FormData(form);
                setSettingSubmitting(true);
                void run(async () => {
                  try {
                    const effectiveDate =
                      String(data.get('effectiveFrom') || '').trim() ||
                      new Date().toISOString().slice(0, 10);
                    const auditReason =
                      String(data.get('reason') || '').trim() || 'Pembaruan operasional';
                    await client.createSetting({
                      kind,
                      branchId,
                      classTypeId,
                      instructorUserId: instructor?.id,
                      value: Number(data.get('value')),
                      capacity: data.get('capacity') ? Number(data.get('capacity')) : undefined,
                      effectiveFrom: effectiveDate,
                      reason: auditReason,
                    });
                    form.reset();
                    setInstructor(undefined);
                    setIsCreateSettingModalOpen(false);
                    await loadBranchContent(branchId, kind);
                  } finally {
                    setSettingSubmitting(false);
                  }
                }, 'Konfigurasi efektif berhasil dibuat.');
              }}
            >
              <div className="rounded-dd-md border border-dd-line bg-dd-surface-muted/50 p-3 text-xs text-dd-muted">
                Cabang Aktif:{' '}
                <strong className="font-semibold text-dd-ink">
                  {branches.find((b) => b.id === branchId)?.name ?? 'Studio terpilih'}
                </strong>
                . Tarif atau kuota baru langsung berlaku saat disimpan.
              </div>

              {!branchId && (
                <div className="rounded-dd-md border border-dd-warning/40 bg-dd-warning-soft p-3 text-xs font-medium text-dd-warning">
                  Pilih Studio/Cabang aktif pada pemilih cabang di atas terlebih dahulu.
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
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
                      .catch((err) => setFailure(masterFailureMessage(err)));
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
              </div>

              {kind === 'INSTRUCTOR_FEE' && (
                <AsyncSearchSelect
                  label="Instruktur aktif"
                  value={instructor?.id ?? ''}
                  selectedOption={instructor}
                  loadOptions={lookupInstructors}
                  onChange={(_id, option) => setInstructor(option as LookupOption | undefined)}
                  placeholder="Cari nama instruktur"
                  required
                />
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label={kind === 'QUOTA_CAPACITY' ? 'Minimum peserta' : 'Nilai rupiah'}
                  name="value"
                  type="number"
                  min={kind === 'QUOTA_CAPACITY' ? 1 : 0}
                  placeholder={kind === 'QUOTA_CAPACITY' ? 'Contoh: 3' : 'Contoh: 150000'}
                  required
                />
                {kind === 'QUOTA_CAPACITY' && (
                  <TextInput
                    label="Kapasitas maksimum"
                    name="capacity"
                    type="number"
                    min="1"
                    placeholder="Contoh: 10"
                    required
                  />
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DateInput
                  label="Efektif mulai"
                  name="effectiveFrom"
                />
                <TextInput
                  label="Alasan perubahan"
                  name="reason"
                  placeholder="Jelaskan kebutuhan bisnis (opsional)"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-dd-line">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateSettingModalOpen(false)}
                >
                  Batal
                </Button>
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
          </Modal>

          {/* Modal 2: Edit Nilai / Honor / Kuota Baris Data */}
          <Modal
            open={Boolean(editingSetting)}
            onClose={() => setEditingSetting(null)}
            title={`Ubah ${
              editingSetting?.kind === 'INSTRUCTOR_FEE'
                ? 'Honor Instruktur'
                : editingSetting?.kind === 'QUOTA_CAPACITY'
                  ? 'Kuota & Kapasitas'
                  : 'Tarif Proyeksi'
            }`}
          >
            {editingSetting && (
              <form className="flex flex-col gap-4" onSubmit={handleUpdateSetting}>
                <div className="rounded-dd-md border border-dd-line bg-dd-surface-muted/50 p-3 text-xs space-y-1">
                  <div>
                    <span className="text-dd-muted">Cabang:</span>{' '}
                    <strong className="text-dd-ink">
                      {branches.find((b) => b.id === (editingSetting.branchId || branchId))?.name ??
                        'Cabang'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-dd-muted">Tipe Kelas:</span>{' '}
                    <strong className="text-dd-ink">
                      {classTypes.find((c) => c.id === editingSetting.classTypeId)?.name ??
                        editingSetting.classTypeId}
                    </strong>
                  </div>
                  {editingSetting.instructorName && (
                    <div>
                      <span className="text-dd-muted">Instruktur:</span>{' '}
                      <strong className="text-dd-ink">{editingSetting.instructorName}</strong>
                    </div>
                  )}
                </div>

                {editingSetting.kind === 'QUOTA_CAPACITY' ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput
                      label="Minimum peserta"
                      type="number"
                      min={1}
                      value={editingSettingValue}
                      onChange={(e) => setEditingSettingValue(e.target.value)}
                      required
                    />
                    <TextInput
                      label="Kapasitas maksimum"
                      type="number"
                      min={1}
                      value={editingSettingCapacity}
                      onChange={(e) => setEditingSettingCapacity(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <TextInput
                    label={
                      editingSetting.kind === 'INSTRUCTOR_FEE'
                        ? 'Honor per sesi (Rp)'
                        : 'Nilai proyeksi (Rp)'
                    }
                    type="number"
                    min={0}
                    value={editingSettingValue}
                    onChange={(e) => setEditingSettingValue(e.target.value)}
                    required
                  />
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <DateInput
                    label="Efektif mulai"
                    value={editingSettingEffectiveDate}
                    onChange={(e) => setEditingSettingEffectiveDate(e.target.value)}
                    required
                  />
                  <TextInput
                    label="Alasan perubahan"
                    value={editingSettingReason}
                    onChange={(e) => setEditingSettingReason(e.target.value)}
                    placeholder="Contoh: Pembaruan tarif langsung"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-dd-line">
                  <Button type="button" variant="ghost" onClick={() => setEditingSetting(null)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={settingSubmitting}>
                    {settingSubmitting ? 'Menyimpan…' : 'Simpan Perubahan'}
                  </Button>
                </div>
              </form>
            )}
          </Modal>
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
                              {item.code} · {timezoneLabel(item.timezone)}
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
                          Lihat detail
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

      {/* Class Type Edit Modal */}
      <Modal
        open={Boolean(editingClassType)}
        title="Ubah tipe kelas"
        description="Nama tipe kelas dapat diperbarui. Kode kelas bersifat tetap untuk menjaga konsistensi histori jadwal."
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
                classTypeName.trim().length < 2
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
                      reason: classTypeReason.trim() || 'Pembaruan nama tipe kelas oleh admin',
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
              label="Alasan perubahan (opsional)"
              placeholder="Contoh: Penyesuaian nama kelas studio"
              value={classTypeReason}
              onChange={(event) => setClassTypeReason(event.target.value)}
            />
          </div>
        )}
      </Modal>

      {/* Class Type Scope Drawer */}
      <Drawer
        open={Boolean(scopingClassType)}
        title="Atur Studio/Cabang"
        description="Pilihan disimpan sebagai cakupan eksplisit. Cabang baru tidak otomatis ikut."
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
              disabled={loading || !scopingClassType}
              onClick={() =>
                void run(async () => {
                  if (!scopingClassType) return;
                  await client.replaceClassTypeScopes(scopingClassType.id, {
                    branchIds: classTypeScopeBranchIds,
                    expectedVersion: scopingClassType.version,
                    reason: classTypeScopeReason.trim() || 'Pembaruan cakupan studio oleh admin',
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
              label="Alasan perubahan (opsional)"
              placeholder="Contoh: Penyesuaian cakupan cabang"
              value={classTypeScopeReason}
              onChange={(event) => setClassTypeScopeReason(event.target.value)}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
