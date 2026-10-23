'use client';

import { Building2, Pencil, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTrackedRouter } from '../components/app-loading';
import { Button, ButtonLink } from '../components/actions';
import { AlertBanner, Drawer, useAppFeedback } from '../components/app-feedback';
import {
  Badge,
  DataTable,
  Pagination,
  Panel,
  StatCard,
  TableActionMenu,
  type ActionMenuItem,
} from '../components/admin/admin-ui';
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
import { useBranchLifecycle } from './use-branch-lifecycle';

const emptyPage: BranchManagementPage = {
  items: [],
  summary: { total: 0, active: 0, inactive: 0, archived: 0 },
  page: { hasMore: false, nextCursor: null },
};

const branchStatusLabel = (item: BranchManagementItem) =>
  item.archivedAt ? 'Diarsipkan' : item.active ? 'Aktif' : 'Tidak aktif';

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
  const [editingBranch, setEditingBranch] = useState<BranchManagementItem | null>(null);
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
      .list({ q, status, cursor, limit: ADMIN_PAGE_SIZE })
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

  const lifecycle = useBranchLifecycle(load);

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
          <option value="ARCHIVED">Diarsipkan</option>
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
        mobileCard={(item) => (
          <BranchCard
            item={item}
            canManage={canManage}
            busy={busy}
            onEdit={(b) => setEditingBranch(b)}
            lifecycleItems={lifecycle.items}
          />
        )}
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
              <Badge tone={item.active ? 'success' : 'neutral'}>{branchStatusLabel(item)}</Badge>
            ),
          },
          {
            id: 'action',
            header: 'Tindakan',
            className: 'whitespace-nowrap',
            cell: (item) => (
              <div
                className="flex items-center gap-1.5"
                onClick={(event) => event.stopPropagation()}
              >
                <ButtonLink
                  href={`/workspace/branches/${item.code.toLowerCase()}`}
                  size="sm"
                  variant="secondary"
                  leadingIcon={<Building2 className="size-4" aria-hidden="true" />}
                >
                  Detail
                </ButtonLink>
                {canManage && (
                  <TableActionMenu
                    ariaLabel={`Aksi cabang ${item.name}`}
                    disabled={busy}
                    items={[
                      {
                        key: 'edit',
                        label: 'Edit',
                        icon: <Pencil className="size-4" aria-hidden="true" />,
                        onClick: () => setEditingBranch(item),
                      },
                      ...lifecycle.items(item),
                    ]}
                  />
                )}
              </div>
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
        totalLabel={`${page.items.length.toLocaleString('id-ID')} dari ${page.summary.total.toLocaleString('id-ID')} cabang`}
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

      <Drawer
        open={Boolean(editingBranch)}
        className="max-w-xl"
        title={editingBranch ? `Edit cabang: ${editingBranch.name}` : 'Edit cabang'}
        description="Perbarui informasi nama cabang, zona waktu, dan WhatsApp support."
        busy={busy}
        onClose={() => setEditingBranch(null)}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" disabled={busy} onClick={() => setEditingBranch(null)}>
              Batal
            </Button>
            <Button type="submit" form="branch-edit-form" loading={busy}>
              Simpan perubahan
            </Button>
          </div>
        }
      >
        {editingBranch && (
          <form
            id="branch-edit-form"
            className="grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const name = String(data.get('name')).trim();
              const timezone = String(data.get('timezone')).trim();
              const supportWhatsappE164 = String(data.get('supportWhatsappE164')).trim() || null;
              setBusy(true);
              try {
                await browserBranchClient.update(editingBranch.id, {
                  name,
                  timezone,
                  supportWhatsappE164,
                });
                setEditingBranch(null);
                feedback.showToast({
                  tone: 'success',
                  title: 'Cabang diperbarui',
                  message: `Perubahan data cabang "${name}" berhasil disimpan.`,
                });
                await load();
              } catch {
                feedback.showAlert({
                  tone: 'danger',
                  title: 'Gagal memperbarui cabang',
                  message: 'Periksa kembali nama, zona waktu, dan format nomor WhatsApp.',
                });
              } finally {
                setBusy(false);
              }
            }}
          >
            <TextInput
              name="code"
              label="Kode cabang"
              defaultValue={editingBranch.code}
              disabled
              description="Kode cabang adalah identitas permanen dan tidak dapat diubah."
            />
            <TextInput
              name="name"
              label="Nama cabang"
              defaultValue={editingBranch.name}
              required
            />
            <TextInput
              name="timezone"
              label="Zona waktu"
              defaultValue={editingBranch.timezone || 'Asia/Jakarta'}
              required
            />
            <TextInput
              name="supportWhatsappE164"
              label="WhatsApp support"
              defaultValue={editingBranch.supportWhatsappE164 || ''}
              placeholder="+628123456789"
              description="Gunakan format internasional E.164, misalnya +628123456789."
            />
          </form>
        )}
      </Drawer>
      {lifecycle.dialog}
    </section>
  );
}

function BranchCard({
  item,
  canManage,
  busy,
  onEdit,
  lifecycleItems,
}: {
  item: BranchManagementItem;
  canManage?: boolean;
  busy?: boolean;
  onEdit?(item: BranchManagementItem): void;
  lifecycleItems?(item: BranchManagementItem): ActionMenuItem[];
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <strong>{item.name}</strong>
          <p className="text-xs text-dd-muted">{item.code}</p>
        </div>
        <Badge tone={item.active ? 'success' : 'neutral'}>{branchStatusLabel(item)}</Badge>
      </div>
      <p className="text-sm text-dd-muted">
        {item.publicProfile?.area && item.publicProfile?.city
          ? `${item.publicProfile.area}, ${item.publicProfile.city}`
          : item.publicProfile?.address || (item as { address?: string | null }).address || 'Lokasi belum diatur'}
      </p>
      <div
        className="mt-2 flex flex-wrap gap-2 border-t border-dd-line/50 pt-2"
        onClick={(event) => event.stopPropagation()}
      >
        <ButtonLink
          href={`/workspace/branches/${item.code.toLowerCase()}`}
          size="sm"
          variant="secondary"
        >
          Detail
        </ButtonLink>
        {canManage && (
          <TableActionMenu
            ariaLabel={`Aksi cabang ${item.name}`}
            disabled={busy}
            items={[
              ...(onEdit
                ? [
                    {
                      key: 'edit',
                      label: 'Edit',
                      icon: <Pencil className="size-4" aria-hidden="true" />,
                      onClick: () => onEdit(item),
                    },
                  ]
                : []),
              ...(lifecycleItems ? lifecycleItems(item) : []),
            ]}
          />
        )}
      </div>
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
