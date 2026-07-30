'use client';

import { useCallback, useEffect, useState } from 'react';
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
} from '../package-promotion-client';
import { useTrackedRouter } from '../components/app-loading';
import { browserMasterClient } from '../master-client';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});
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
  const [classTypes, setClassTypes] = useState<Array<{ id: string; name: string }>>([]);
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
  const cursorTrail = searchParams.getAll('trail');
  const replaceFilter = (key: 'q' | 'state' | 'branch' | 'cursor', value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'cursor') {
      next.delete('cursor');
      next.delete('trail');
    }
    router.replace(`/workspace/packages${next.size ? `?${next}` : ''}`);
  };
  const movePage = (direction: 'previous' | 'next') => {
    const next = new URLSearchParams(searchParams.toString());
    if (direction === 'next') {
      if (!page.page.nextCursor) return;
      next.append('trail', filters.cursor || '__FIRST__');
      next.set('cursor', page.page.nextCursor);
    } else {
      const trail = next.getAll('trail');
      const previous = trail.pop();
      next.delete('trail');
      trail.forEach((value) => next.append('trail', value));
      if (!previous || previous === '__FIRST__') next.delete('cursor');
      else next.set('cursor', previous);
    }
    router.replace(`/workspace/packages${next.size ? `?${next}` : ''}`);
  };
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
      if (result.items.length === 0 && cursorTrail.length > 0) {
        movePage('previous');
        return;
      }
      setPage(result);
    } catch {
      setError('Daftar paket belum dapat dimuat. Periksa scope atau coba lagi.');
    } finally {
      setBusy(false);
    }
  }, [canRead, filters.branchId, filters.cursor, filters.effectiveState, filters.q]);
  useEffect(() => void load(), [load]);
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
              value={String(page.summary[state] ?? 0)}
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
            { id: 'branch', header: 'Cabang', cell: (item) => item.branch?.name ?? '—' },
            { id: 'price', header: 'Harga normal', cell: (item) => rupiah.format(item.priceRp) },
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
              <span className="text-sm text-dd-muted">{item.branch?.name}</span>
              <span className="font-semibold">{rupiah.format(item.priceRp)}</span>
            </div>
          )}
        />
      </Panel>
      <Pagination
        hasPrevious={cursorTrail.length > 0}
        hasNext={Boolean(page.page.nextCursor)}
        totalLabel={`Halaman paket ${cursorTrail.length + 1}`}
        onPrevious={() => movePage('previous')}
        onNext={() => movePage('next')}
      />
      <Drawer
        open={createOpen}
        title="Buat paket"
        description="Paket terikat permanen pada cabang dan tipe kelas yang dipilih."
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
          onBranch={async (branchId) => {
            setClassTypes(branchId ? await browserMasterClient.listClassTypes(branchId) : []);
          }}
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
  onBranch,
  onDirty,
  onSubmit,
}: {
  branches: Array<{ id: string; name: string }>;
  classTypes: Array<{ id: string; name: string }>;
  onBranch(branchId: string): Promise<void>;
  onDirty(): void;
  onSubmit(command: Record<string, unknown>): Promise<void>;
}) {
  return (
    <form
      id="package-create-form"
      className="grid gap-4"
      onChange={onDirty}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        void onSubmit({
          branchId: String(data.get('branchId')),
          classTypeId: String(data.get('classTypeId')),
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
      <SearchSelect
        name="branchId"
        label="Cabang"
        required
        placeholder="Pilih cabang"
        options={branches.map((branch) => ({ id: branch.id, label: branch.name }))}
        onChange={(value) => void onBranch(value)}
      />
      <SearchSelect
        name="classTypeId"
        label="Tipe kelas"
        required
        placeholder="Pilih tipe kelas"
        options={classTypes.map((item) => ({ id: item.id, label: item.name }))}
      />
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
