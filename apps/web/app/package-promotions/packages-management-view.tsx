'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Badge, DataTable, Pagination, Panel, StatCard } from '../components/admin/admin-ui';
import { AlertBanner, Drawer, useAppFeedback } from '../components/app-feedback';
import { Button } from '../components/actions';
import { SearchInput, SearchSelect, SelectInput, TextInput } from '../components/forms';
import { Skeleton } from '../ui';
import { useSessionContext } from '../session-context';
import {
  browserPackagePromotionClient,
  type InternalPackageRecord,
  type PackageManagementPage,
} from '@/api-clients/package-promotion-client';
import { useTrackedRouter } from '../components/app-loading';
import { browserMasterClient } from '@/api-clients/master-client';
import { formatRupiah } from '../lib/formatters';

const stateLabels = {
  ACTIVE: 'Aktif',
  SCHEDULED: 'Terjadwal',
  EXPIRED: 'Berakhir',
  INACTIVE: 'Tidak aktif',
} as const;

export function PackagesManagementView() {
  const session = useSessionContext();
  const router = useTrackedRouter();
  const searchParams = useSearchParams();
  const feedback = useAppFeedback();
  const [page, setPage] = useState<PackageManagementPage>({
    items: [],
    summary: {},
    page: { hasMore: false, nextCursor: null },
  });
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createDirty, setCreateDirty] = useState(false);
  const [classTypes, setClassTypes] = useState<
    Array<{
      id: string;
      name: string;
      branchScopes: Array<{ branchId: string; active: boolean }>;
    }>
  >([]);
  const canRead =
    session?.status === 'authenticated' &&
    session.hasCapability('package-promotion:read', 'package-promotion:manage');
  const canManage = session?.status === 'authenticated' && session.hasCapability('master:manage');
  const confirmDiscardCreate = () =>
    feedback.confirm({
      tone: 'warning',
      title: 'Batalkan pembuatan paket?',
      message: 'Input paket yang belum disimpan akan hilang.',
      confirmLabel: 'Buang input',
    });
  const closeCreate = async () => {
    if (!createDirty || (await confirmDiscardCreate())) {
      setCreateDirty(false);
      setCreateOpen(false);
    }
  };
  const filters = {
    q: searchParams.get('q') ?? '',
    effectiveState: searchParams.get('state') ?? '',
    branchId: searchParams.get('branch') ?? session?.activeBranchId ?? '',
    cursor: searchParams.get('cursor') ?? '',
  };
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const replaceFilter = (key: 'q' | 'state' | 'branch' | 'cursor', value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'cursor') {
      next.delete('cursor');
      setCursorHistory([]);
    }
    router.replace(`/workspace/packages${next.size ? `?${next}` : ''}`);
  };
  const movePage = (direction: 'previous' | 'next') => {
    const next = new URLSearchParams(searchParams.toString());
    if (direction === 'next') {
      if (!page.page.nextCursor) return;
      setCursorHistory((prev) => [...prev, filters.cursor]);
      next.set('cursor', page.page.nextCursor);
    } else {
      const previous = cursorHistory.at(-1) ?? '';
      setCursorHistory((prev) => prev.slice(0, -1));
      if (!previous) next.delete('cursor');
      else next.set('cursor', previous);
    }
    router.replace(`/workspace/packages${next.size ? `?${next}` : ''}`);
  };
  const totalPackages = useMemo(() => {
    if (filters.effectiveState && page.summary[filters.effectiveState as keyof typeof page.summary] != null) {
      return page.summary[filters.effectiveState as keyof typeof page.summary] ?? page.items.length;
    }
    const sum = Object.values(page.summary).reduce((acc, val) => (acc ?? 0) + (val ?? 0), 0);
    return sum > 0 ? sum : page.items.length;
  }, [filters.effectiveState, page.summary, page.items.length]);
  const load = useCallback(async () => {
    if (!canRead) return;
    setBusy(true);
    setError('');
    try {
      const result = await browserPackagePromotionClient.packages({
        q: filters.q || undefined,
        effectiveState: filters.effectiveState || undefined,
        branchId: filters.branchId || undefined,
        cursor: filters.cursor || undefined,
      });
      if (result.items.length === 0 && cursorHistory.length > 0) {
        movePage('previous');
        return;
      }
      setPage({
        items: result.items ?? [],
        summary: result.summary ?? {},
        page: result.page ?? { hasMore: false, nextCursor: null },
      });
    } catch {
      setError('Daftar paket belum dapat dimuat. Periksa scope atau coba lagi.');
    } finally {
      setBusy(false);
    }
  }, [canRead, filters.branchId, filters.cursor, filters.effectiveState, filters.q]);
  useEffect(() => void load(), [load]);
  useEffect(() => {
    if (createOpen)
      void browserMasterClient
        .listClassTypes()
        .then((items) =>
          setClassTypes(items.map(({ id, name, branchScopes }) => ({ id, name, branchScopes }))),
        );
  }, [createOpen]);
  if (!session || session.status === 'loading') return <Skeleton label="Memuat paket" />;
  if (!canRead)
    return (
      <AlertBanner
        tone="danger"
        title="Akses terbatas"
        message="Anda tidak memiliki akses membaca paket dan promo."
      />
    );
  return (
    <section className="grid gap-5" aria-labelledby="packages-management-title">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-dd-line pb-5">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-dd-forest uppercase">
            Master data
          </p>
          <h1 id="packages-management-title" className="mt-1 text-3xl font-semibold">
            Paket & promo harga
          </h1>
          <p className="mt-2 text-sm text-dd-muted">
            Kelola paket aktif, revisi harga, histori periode, dan promo tanpa mengubah order lama.
          </p>
        </div>
        {canManage && (
          <Button
            leadingIcon={<Plus className="size-4" aria-hidden="true" />}
            onClick={() => setCreateOpen(true)}
          >
            Buat paket
          </Button>
        )}
      </header>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(Object.keys(stateLabels) as Array<keyof typeof stateLabels>).map((state) => (
          <button
            key={state}
            type="button"
            className="text-left"
            onClick={() => replaceFilter('state', filters.effectiveState === state ? '' : state)}
          >
            <StatCard
              label={stateLabels[state]}
              value={String((page.summary ?? {})[state] ?? 0)}
              tone={state === 'ACTIVE' ? 'success' : 'neutral'}
            />
          </button>
        ))}
      </div>
      <Panel className="grid gap-3 p-4 md:grid-cols-[1fr_220px_220px]">
        <SearchInput
          label="Cari paket"
          value={filters.q}
          onChange={(event) => replaceFilter('q', event.target.value)}
          placeholder="Nama atau business key"
        />
        <SelectInput
          label="Status efektif"
          value={filters.effectiveState}
          onChange={(event) => replaceFilter('state', event.target.value)}
        >
          <option value="">Semua status</option>
          {Object.entries(stateLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectInput>
        <SearchSelect
          label="Cabang"
          value={filters.branchId}
          placeholder="Semua cabang"
          options={(session.session?.branches ?? []).map((branch) => ({
            id: branch.id,
            label: branch.name,
            description: branch.code,
          }))}
          onChange={(value) => replaceFilter('branch', value)}
        />
      </Panel>
      {error && <AlertBanner tone="danger" title="Paket tidak tersedia" message={error} />}
      <Panel className="p-0">
        <DataTable
          items={page.items}
          loading={busy}
          rowNumberOffset={cursorHistory.length * 20}
          rowKey={(item) => item.id}
          onRowClick={(item) => router.push(`/workspace/packages/${item.id}`)}
          rowDescription={(item) => `Buka detail ${item.name}`}
          emptyTitle="Paket tidak ditemukan"
          emptyDescription="Ubah filter atau buat paket baru pada cabang yang sesuai."
          columns={[
            {
              id: 'package',
              header: 'Paket',
              cell: (item) => (
                <div>
                  <strong>{item.name}</strong>
                  <p className="text-xs text-dd-muted">
                    {item.sessionCount} sesi · {item.durationDays} hari
                  </p>
                </div>
              ),
            },
            {
              id: 'branch',
              header: 'Scope Studio/Cabang',
              cell: (item) =>
                item.branchScopes?.length
                  ? item.branchScopes
                      .map((scope) => scope.branch?.name ?? scope.branchId.slice(0, 8))
                      .join(', ')
                  : '—',
            },
            { id: 'price', header: 'Harga normal', cell: (item) => formatRupiah(item.priceRp) },
            {
              id: 'period',
              header: 'Periode',
              cell: (item) => (
                <span className="text-xs">
                  {new Date(item.effectiveFrom).toLocaleDateString('id-ID')} –{' '}
                  {item.effectiveUntil
                    ? new Date(item.effectiveUntil).toLocaleDateString('id-ID')
                    : 'tanpa batas'}
                </span>
              ),
            },
            {
              id: 'status',
              header: 'Status',
              cell: (item) => (
                <div className="flex flex-wrap gap-1">
                  <Badge tone={item.effectiveState === 'ACTIVE' ? 'success' : 'neutral'}>
                    {stateLabels[item.effectiveState ?? 'INACTIVE']}
                  </Badge>
                  {item.livePromotion && <Badge tone="warning">Promo live</Badge>}
                </div>
              ),
            },
            {
              id: 'action',
              header: 'Tindakan',
              cell: (item) => (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    router.push(`/workspace/packages/${item.id}`);
                  }}
                >
                  Lihat detail
                </Button>
              ),
            },
          ]}
          mobileCard={(item) => (
            <div className="grid gap-2">
              <div className="flex items-start justify-between gap-2">
                <strong>{item.name}</strong>
                <Badge tone={item.effectiveState === 'ACTIVE' ? 'success' : 'neutral'}>
                  {stateLabels[item.effectiveState ?? 'INACTIVE']}
                </Badge>
              </div>
              <span className="text-sm text-dd-muted">
                {item.branchScopes
                  ?.map((scope) => scope.branch?.name)
                  .filter(Boolean)
                  .join(', ') || '—'}
              </span>
              <span className="font-semibold">{formatRupiah(item.priceRp)}</span>
            </div>
          )}
        />
      </Panel>
      <Pagination
        currentPage={cursorHistory.length + 1}
        totalPages={Math.ceil(totalPackages / 20) || 1}
        totalItems={totalPackages}
        pageSize={20}
        hasPrevious={cursorHistory.length > 0}
        hasNext={Boolean(page.page.nextCursor)}
        totalLabel={`Halaman paket ${cursorHistory.length + 1} · ${page.items.length} dari ${totalPackages} paket`}
        onPrevious={() => movePage('previous')}
        onNext={() => movePage('next')}
      />
      <Drawer
        open={createOpen}
        title="Buat paket"
        description="Paket adalah katalog global dengan scope Studio/Cabang dan tipe kelas yang eksplisit."
        busy={busy}
        dirty={createDirty}
        onDirtyClose={confirmDiscardCreate}
        onClose={() => {
          setCreateDirty(false);
          setCreateOpen(false);
        }}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => void closeCreate()} disabled={busy}>
              Batal
            </Button>
            <Button type="submit" form="package-create-form" loading={busy}>
              Simpan paket
            </Button>
          </div>
        }
      >
        <PackageCreateForm
          branches={session.session?.branches ?? []}
          classTypes={classTypes}
          onDirty={() => setCreateDirty(true)}
          onSubmit={async (command) => {
            const accepted = await feedback.confirm({
              tone: 'warning',
              title: 'Buat paket baru?',
              message: 'Paket akan tersimpan sebagai konfigurasi aktif pada periode yang dipilih.',
              confirmLabel: 'Buat paket',
            });
            if (!accepted) return;
            setBusy(true);
            try {
              const created = await browserPackagePromotionClient.createPackage(command);
              setCreateDirty(false);
              setCreateOpen(false);
              feedback.showToast({
                tone: 'success',
                title: 'Paket dibuat',
                message: `${created.name} berhasil ditambahkan.`,
              });
              router.push(`/workspace/packages/${created.id}`);
            } catch {
              feedback.showAlert({
                tone: 'danger',
                title: 'Paket belum dibuat',
                message: 'Periksa periode, class type, dan data harga lalu coba kembali.',
              });
            } finally {
              setBusy(false);
            }
          }}
        />
      </Drawer>
    </section>
  );
}

function PackageCreateForm({
  branches,
  classTypes,
  onDirty,
  onSubmit,
}: {
  branches: Array<{ id: string; name: string }>;
  classTypes: Array<{
    id: string;
    name: string;
    branchScopes: Array<{ branchId: string; active: boolean }>;
  }>;
  onDirty(): void;
  onSubmit(command: Record<string, unknown>): Promise<void>;
}) {
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedClassTypes, setSelectedClassTypes] = useState<string[]>([]);
  const toggleBranch = (branchId: string, checked: boolean) =>
    setSelectedBranches((current) => {
      const next = checked
        ? [...new Set([...current, branchId])]
        : current.filter((id) => id !== branchId);
      setSelectedClassTypes((selected) =>
        selected.filter((classTypeId) =>
          classTypes
            .find((item) => item.id === classTypeId)
            ?.branchScopes?.some(
              (scope) => scope.branchId === branchId && scope.active && next.includes(branchId),
            ),
        ),
      );
      return next;
    });
  const availableClassTypes = classTypes.filter((classType) =>
    selectedBranches.every((branchId) =>
      classType.branchScopes?.some((scope) => scope.branchId === branchId && scope.active),
    ),
  );
  return (
    <form
      id="package-create-form"
      className="grid gap-4"
      onChange={onDirty}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        void onSubmit({
          branchIds: data.getAll('branchIds').map(String),
          classTypeIds: data.getAll('classTypeIds').map(String),
          businessKey: String(data.get('businessKey')),
          name: String(data.get('name')),
          sessionCount: Number(data.get('sessionCount')),
          durationDays: Number(data.get('durationDays')),
          priceRp: Number(data.get('priceRp')),
          effectiveFrom: String(data.get('effectiveFrom')),
          effectiveUntil: data.get('effectiveUntil') || null,
          reason: String(data.get('reason')),
        });
      }}
    >
      <fieldset className="grid gap-2 rounded-dd-md border border-dd-line p-3">
        <legend className="px-1 text-sm font-semibold">Scope Studio/Cabang</legend>
        {branches.map((branch) => (
          <label className="flex items-center gap-2 text-sm" key={branch.id}>
            <input
              type="checkbox"
              name="branchIds"
              value={branch.id}
              required={selectedBranches.length === 0}
              onChange={(event) => toggleBranch(branch.id, event.currentTarget.checked)}
            />
            {branch.name}
          </label>
        ))}
      </fieldset>
      <fieldset className="grid gap-2 rounded-dd-md border border-dd-line p-3">
        <legend className="px-1 text-sm font-semibold">Scope tipe kelas</legend>
        {selectedBranches.length === 0 ? (
          <p className="text-sm text-dd-muted">Pilih Studio/Cabang terlebih dahulu.</p>
        ) : availableClassTypes.length === 0 ? (
          <p className="text-sm text-dd-danger">
            Tidak ada tipe kelas yang tersedia di seluruh Studio/Cabang terpilih.
          </p>
        ) : (
          availableClassTypes.map((item) => (
            <label className="flex items-center gap-2 text-sm" key={item.id}>
              <input
                type="checkbox"
                name="classTypeIds"
                value={item.id}
                checked={selectedClassTypes.includes(item.id)}
                required={selectedClassTypes.length === 0}
                onChange={(event) => {
                  const checked = event.currentTarget.checked;
                  setSelectedClassTypes((current) =>
                    checked
                      ? [...new Set([...current, item.id])]
                      : current.filter((id) => id !== item.id),
                  );
                }}
              />
              {item.name}
            </label>
          ))
        )}
      </fieldset>
      <TextInput name="businessKey" label="Business key" required />
      <TextInput name="name" label="Nama paket" required />
      <TextInput name="sessionCount" label="Jumlah sesi" type="number" min={1} required />
      <TextInput name="durationDays" label="Masa berlaku (hari)" type="number" min={1} required />
      <TextInput name="priceRp" label="Harga normal" type="number" min={1} required />
      <TextInput name="effectiveFrom" label="Mulai berlaku" type="date" required />
      <TextInput name="effectiveUntil" label="Berakhir" type="date" />
      <TextInput name="reason" label="Alasan" minLength={3} required />
    </form>
  );
}
