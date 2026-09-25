'use client';

import { Building2, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTrackedRouter } from '../components/app-loading';
import { Button, ButtonLink } from '../components/actions';
import { AlertBanner, Drawer, useAppFeedback } from '../components/app-feedback';
import { Badge, DataTable, Pagination, Panel, StatCard } from '../components/admin/admin-ui';
import { SearchInput, SelectInput, TextInput } from '../components/forms';
import { useSessionContext } from '../session-context';
import {
  browserBranchClient,
  type BranchManagementItem,
  type BranchManagementPage,
} from '@/api-clients/branch-client';
import { Skeleton } from '../ui';
import { AdminPageHeader } from '../components/admin/admin-page-header';
import { ADMIN_PAGE_SIZE, pageOffset } from '../lib/pagination';

const emptyPage: BranchManagementPage = {
  items: [],
  summary: { total: 0, active: 0, inactive: 0 },
  page: { hasMore: false, nextCursor: null },
};

export function BranchesView() {
  const session = useSessionContext();
  const params = useSearchParams();
  const router = useTrackedRouter();
  const feedback = useAppFeedback();
  const [page, setPage] = useState(emptyPage);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createDirty, setCreateDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const q = params.get('q') ?? '';
  const status = params.get('status') ?? '';
  const cursor = params.get('cursor') ?? '';
  const canRead =
    session?.status === 'authenticated' && session.hasCapability('master:read', 'master:manage');
  const canManage = session?.status === 'authenticated' && session.hasCapability('master:manage');
  const confirmDiscardCreate = () =>
    feedback.confirm({
      tone: 'warning',
      title: 'Batalkan pembuatan cabang?',
      message: 'Input cabang yang belum disimpan akan hilang.',
      confirmLabel: 'Buang input',
    });
  const closeCreate = async () => {
    if (!createDirty || (await confirmDiscardCreate())) {
      setCreateDirty(false);
      setCreateOpen(false);
    }
  };

  const replaceFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'cursor') {
      next.delete('cursor');
      setCursorHistory([]);
    }
    router.replace(`/workspace/branches${next.size ? `?${next}` : ''}`);
  };
  const movePage = (direction: 'previous' | 'next') => {
    const next = new URLSearchParams(params.toString());
    if (direction === 'next') {
      if (!page.page.nextCursor) return;
      setCursorHistory((prev) => [...prev, cursor]);
      next.set('cursor', page.page.nextCursor);
    } else {
      const previous = cursorHistory.at(-1) ?? '';
      setCursorHistory((prev) => prev.slice(0, -1));
      if (!previous) next.delete('cursor');
      else next.set('cursor', previous);
    }
    router.replace(`/workspace/branches${next.size ? `?${next}` : ''}`);
  };

  const load = () => {
    setLoading(true);
    setFailure('');
    return browserBranchClient
      .list({ q, status, cursor, limit: 20 })
      .then((result) => {
        if (result.items.length === 0 && cursorHistory.length > 0) {
          movePage('previous');
          return;
        }
        setPage(result);
      })
      .catch(() => setFailure('Daftar cabang belum dapat dimuat.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (canRead) void load();
    // URL is the authoritative filter state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRead, q, status, cursor]);

  if (!session || session.status === 'loading') return <Skeleton label="Memuat cabang" />;
  if (!canRead)
    return (
      <AlertBanner
        tone="danger"
        title="Akses cabang tidak tersedia"
        message="Akun Anda tidak memiliki izin untuk melihat Manajemen Cabang."
      />
    );

  return (
    <section className="grid gap-5" aria-labelledby="branches-title">
      <AdminPageHeader
        title="Manajemen Cabang"
        titleId="branches-title"
        description="Kelola identitas studio, status operasional, dan dependency setiap cabang."
        actions={
          canManage ? (
            <Button
              leadingIcon={<Plus className="size-4" aria-hidden="true" />}
              onClick={() => setCreateOpen(true)}
            >
              Buat cabang
            </Button>
          ) : undefined
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total cabang" value={String(page.summary.total)} />
        <StatCard label="Aktif" value={String(page.summary.active)} tone="success" />
        <StatCard label="Tidak aktif" value={String(page.summary.inactive)} tone="neutral" />
      </div>
      <Panel className="flex flex-wrap items-end gap-3 p-4">
        <SearchInput
          label="Cari cabang"
          value={q}
          onChange={(event) => replaceFilter('q', event.target.value)}
          leadingIcon={<Search className="size-4" aria-hidden="true" />}
          wrapperClassName="min-w-[240px] flex-1"
          placeholder="Nama, kode, kota, atau area"
        />
        <SelectInput
          label="Status"
          value={status}
          onChange={(event) => replaceFilter('status', event.target.value)}
          wrapperClassName="min-w-[180px]"
        >
          <option value="">Semua status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Tidak aktif</option>
        </SelectInput>
      </Panel>
      {failure && <AlertBanner tone="danger" title="Cabang belum tersedia" message={failure} />}
      <DataTable
        items={page.items}
        loading={loading}
        rowNumberOffset={pageOffset(cursorHistory.length)}
        rowKey={(item) => item.id}
        rowDescription={(item) => `Buka detail ${item.name}`}
        onRowClick={(item) => router.push(`/workspace/branches/${item.code.toLowerCase()}`)}
        mobileCard={(item) => <BranchCard item={item} />}
        columns={[
          {
            id: 'branch',
            header: 'Cabang',
            cell: (item) => (
              <div>
                <strong>{item.name}</strong>
                <p className="mt-1 text-xs text-dd-muted">{item.code}</p>
              </div>
            ),
          },
          {
            id: 'location',
            header: 'Lokasi',
            cell: (item) => {
              if (item.publicProfile?.area && item.publicProfile?.city) {
                return `${item.publicProfile.area}, ${item.publicProfile.city}`;
              }
              return item.publicProfile?.address || (item as { address?: string | null }).address || 'Lokasi belum diatur';
            },
          },
          { id: 'timezone', header: 'Zona waktu', cell: (item) => item.timezone },
          {
            id: 'status',
            header: 'Status',
            cell: (item) => (
              <Badge tone={item.active ? 'success' : 'neutral'}>
                {item.active ? 'Aktif' : 'Tidak aktif'}
              </Badge>
            ),
          },
          {
            id: 'action',
            header: 'Tindakan',
            cell: (item) => (
              <ButtonLink
                href={`/workspace/branches/${item.code.toLowerCase()}`}
                size="sm"
                variant="secondary"
                leadingIcon={<Building2 className="size-4" aria-hidden="true" />}
                onClick={(event) => event.stopPropagation()}
              >
                Lihat detail
              </ButtonLink>
            ),
          },
        ]}
      />
      <Pagination
        currentPage={cursorHistory.length + 1}
        totalPages={Math.ceil(page.summary.total / ADMIN_PAGE_SIZE) || 1}
        totalItems={page.summary.total}
        pageSize={ADMIN_PAGE_SIZE}
        hasPrevious={cursorHistory.length > 0}
        hasNext={Boolean(page.page.nextCursor)}
        totalLabel={`Halaman cabang ${cursorHistory.length + 1} · ${page.items.length} dari ${page.summary.total} cabang`}
        onPrevious={() => movePage('previous')}
        onNext={() => movePage('next')}
      />
      <Drawer
        open={createOpen}
        title="Buat cabang"
        description="Kode cabang menjadi business identity dan tidak dapat diubah setelah dibuat."
        busy={busy}
        dirty={createDirty}
        onDirtyClose={confirmDiscardCreate}
        onClose={() => {
          setCreateDirty(false);
          setCreateOpen(false);
        }}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" disabled={busy} onClick={() => void closeCreate()}>
              Batal
            </Button>
            <Button type="submit" form="branch-create-form" loading={busy}>
              Simpan cabang
            </Button>
          </div>
        }
      >
        <BranchCreateForm
          onDirty={() => setCreateDirty(true)}
          onSubmit={async (input) => {
            setBusy(true);
            try {
              const created = await browserBranchClient.create(input);
              setCreateDirty(false);
              setCreateOpen(false);
              feedback.showToast({
                tone: 'success',
                title: 'Cabang dibuat',
                message: `${created.name} siap dikonfigurasi.`,
              });
              router.push(`/workspace/branches/${created.id}`);
            } catch {
              feedback.showAlert({
                tone: 'danger',
                title: 'Cabang belum dibuat',
                message: 'Periksa kode, timezone, nomor WhatsApp, dan coba kembali.',
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

function BranchCard({ item }: { item: BranchManagementItem }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <strong>{item.name}</strong>
          <p className="text-xs text-dd-muted">{item.code}</p>
        </div>
        <Badge tone={item.active ? 'success' : 'neutral'}>
          {item.active ? 'Aktif' : 'Tidak aktif'}
        </Badge>
      </div>
      <p className="text-sm text-dd-muted">
        {item.publicProfile?.area && item.publicProfile?.city
          ? `${item.publicProfile.area}, ${item.publicProfile.city}`
          : item.publicProfile?.address || (item as { address?: string | null }).address || 'Lokasi belum diatur'}
      </p>
    </div>
  );
}

function BranchCreateForm({
  onDirty,
  onSubmit,
}: {
  onDirty(): void;
  onSubmit(input: {
    code: string;
    name: string;
    timezone: string;
    supportWhatsappE164?: string;
    reason?: string;
  }): Promise<void>;
}) {
  return (
    <form
      id="branch-create-form"
      className="grid gap-4"
      onChange={onDirty}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        void onSubmit({
          code: String(data.get('code')).trim().toUpperCase(),
          name: String(data.get('name')).trim(),
          timezone: String(data.get('timezone')).trim(),
          supportWhatsappE164: String(data.get('supportWhatsappE164')).trim() || undefined,
        });
      }}
    >
      <TextInput name="code" label="Kode cabang" placeholder="DD-BDG" required />
      <TextInput name="name" label="Nama cabang" placeholder="Daily Dose Bandung" required />
      <TextInput name="timezone" label="Zona waktu" defaultValue="Asia/Jakarta" required />
      <TextInput
        name="supportWhatsappE164"
        label="WhatsApp support"
        description="Gunakan format E.164, misalnya +628123456789."
        placeholder="+628123456789"
      />
    </form>
  );
}
