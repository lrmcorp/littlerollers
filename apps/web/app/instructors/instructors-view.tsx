'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Building2, Plus, UserCheck } from 'lucide-react';
import { DataTable, type DataTableColumn, Pagination, Badge } from '../components/admin/admin-ui';
import { SearchInput, SearchSelect, TextInput } from '../components/forms';
import { Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { formatRupiah } from '../lib/formatters';
import { useSessionContext } from '../session-context';
import { instructorClient, type InstructorSummary } from './instructor-client';
import { Button, ButtonLink } from '../components/actions';
import { Drawer, useAppFeedback } from '../components/app-feedback';

export function InstructorsView() {
  const sessionContext = useSessionContext();
  const session = sessionContext?.session;
  const feedback = useAppFeedback();
  const canManage =
    session?.capabilities?.includes('user:admin') ||
    session?.capabilities?.includes('assignment:manage') ||
    session?.capabilities?.includes('master:manage');

  const [items, setItems] = useState<InstructorSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [branchId, setBranchId] = useState('');
  const [cursor, setCursor] = useState<string>();
  const [history, setHistory] = useState<Array<string | undefined>>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create Instructor State
  const [createOpen, setCreateOpen] = useState(false);
  const [createDirty, setCreateDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    phoneE164: '',
    branchIds: [] as string[],
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await instructorClient.list({
        q: q || undefined,
        branchId: branchId || undefined,
        cursor,
      });
      setItems(result.items);
      setTotal(result.summary.total);
      setNext(result.page.nextCursor);
    } catch {
      setError('Data instructor belum dapat dimuat.');
    } finally {
      setLoading(false);
    }
  }, [branchId, cursor, q]);

  useEffect(() => void load(), [load]);

  const reset = () => {
    setCursor(undefined);
    setHistory([]);
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.displayName.trim() || !form.email.trim()) {
      feedback.showToast({
        tone: 'danger',
        title: 'Formulir belum lengkap',
        message: 'Nama lengkap dan alamat email wajib diisi.',
      });
      return;
    }

    const accepted = await feedback.confirm({
      tone: 'warning',
      title: 'Daftarkan instruktur baru?',
      message: `Akun coach baru untuk "${form.displayName}" (${form.email}) akan dibuat dan siap ditugaskan ke kelas.`,
      confirmLabel: 'Daftarkan Instruktur',
    });
    if (!accepted) return;

    setBusy(true);
    try {
      await instructorClient.create(form);
      feedback.showToast({
        tone: 'success',
        title: 'Instruktur berhasil didaftarkan',
        message: `Akun instruktur ${form.displayName} siap digunakan.`,
      });
      setCreateDirty(false);
      setCreateOpen(false);
      setForm({ displayName: '', email: '', phoneE164: '', branchIds: [] });
      reset();
      await load();
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      feedback.showToast({
        tone: 'danger',
        title: 'Gagal mendaftarkan instruktur',
        message:
          errorObj.code === 'IDENTITY_CONFLICT'
            ? 'Email sudah terdaftar pada sistem Daily Dose.'
            : errorObj.message || 'Periksa kembali kelengkapan data formulir.',
      });
    } finally {
      setBusy(false);
    }
  };

  const columns: DataTableColumn<InstructorSummary>[] = [
    {
      id: 'instructor',
      header: 'Instruktur / Coach',
      cell: (item) => (
        <div>
          <div className="flex items-center gap-2">
            <strong className="font-semibold text-dd-ink">{item.displayName}</strong>
            <Badge tone={item.status === 'ACTIVE' ? 'success' : 'warning'}>
              {item.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>
          <div className="text-xs text-dd-muted">
            {item.email || '—'} · {item.phoneE164 || '—'}
          </div>
        </div>
      ),
    },
    {
      id: 'branches',
      header: 'Studio / Cabang',
      cell: (item) => (
        <span className="text-dd-ink text-sm">
          {item.assignments.map((a) => a.branch.name).join(', ') || (
            <span className="text-dd-muted italic">Belum ada penugasan</span>
          )}
        </span>
      ),
    },
    {
      id: 'classes',
      header: 'Kelas & Check-in',
      cell: (item) => (
        <span className="text-dd-muted text-sm">
          {item._count.instructedClassSlots} sesi · {item._count.instructorAttendances} check-in
        </span>
      ),
    },
    {
      id: 'compensation',
      header: 'Kompensasi',
      cell: (item) => (
        <span className="font-semibold text-dd-ink">
          {formatRupiah(item.compensationRp)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Tindakan',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <ButtonLink
            variant="secondary"
            size="sm"
            href={`/instructors/${item.id}`}
          >
            Detail & Kelola
          </ButtonLink>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Operasional tim"
        title="Manajemen Instruktur"
        description="Pendaftaran instruktur baru, penugasan cabang, ketersediaan, jadwal sesi kelas, check-in, dan kompensasi."
        context={
          canManage && (
            <Button
              onClick={() => setCreateOpen(true)}
              leadingIcon={<Plus className="size-4" />}
            >
              Tambah Instruktur
            </Button>
          )
        }
      />
      {error && <Feedback kind="error">{error}</Feedback>}
      <div className="grid gap-3 rounded-dd-lg border border-dd-line bg-white p-4 sm:grid-cols-2">
        <SearchInput
          label="Cari instruktur"
          compact
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            reset();
          }}
          placeholder="Nama, email, telepon"
        />
        <SearchSelect
          label="Studio / Cabang"
          compact
          clearable
          placeholder="Semua Studio / Cabang"
          options={(session?.branches ?? []).map((branch) => ({
            id: branch.id,
            label: branch.name,
          }))}
          value={branchId}
          onChange={(value) => {
            setBranchId(value);
            reset();
          }}
        />
      </div>
      <DataTable
        items={items}
        columns={columns}
        rowKey={(item) => item.id}
        loading={loading && !items.length}
        emptyTitle="Belum ada instruktur"
        emptyDescription="Tidak ada data instruktur yang cocok dengan filter pencarian."
        mobileCard={(item) => (
          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <strong className="font-semibold text-dd-ink">{item.displayName}</strong>
                <p className="text-xs text-dd-muted">{item.email || item.phoneE164 || '—'}</p>
              </div>
              <Badge tone={item.status === 'ACTIVE' ? 'success' : 'warning'}>
                {item.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-dd-muted">
              <span>
                {item.assignments.map((a) => a.branch.name).join(', ') || 'Belum ada assignment'}
              </span>
              <span>·</span>
              <span>{item._count.instructedClassSlots} kelas</span>
              <span>·</span>
              <span className="font-semibold text-dd-ink">
                {formatRupiah(item.compensationRp)}
              </span>
            </div>
            <div className="pt-2 border-t border-dd-line/50">
              <ButtonLink
                variant="secondary"
                size="sm"
                href={`/instructors/${item.id}`}
              >
                Detail & Kelola
              </ButtonLink>
            </div>
          </div>
        )}
      />
      <Pagination
        hasPrevious={Boolean(history.length) && !loading}
        hasNext={Boolean(next) && !loading}
        totalLabel={`Halaman ${history.length + 1} · ${total} instruktur`}
        onPrevious={() => {
          const h = [...history];
          setCursor(h.pop());
          setHistory(h);
        }}
        onNext={() => {
          if (next) {
            setHistory((h) => [...h, cursor]);
            setCursor(next);
          }
        }}
      />

      {/* Drawer: Tambah Instruktur Baru */}
      <Drawer
        open={createOpen}
        title="Tambah Instruktur Baru"
        description="Daftarkan akun coach baru ke dalam sistem Daily Dose beserta penugasan cabang awalnya."
        busy={busy}
        dirty={createDirty}
        onDirtyClose={() =>
          feedback.confirm({
            tone: 'warning',
            title: 'Batalkan pendaftaran instruktur?',
            message: 'Data yang sudah diketik akan hilang.',
            confirmLabel: 'Buang input',
          })
        }
        onClose={() => {
          setCreateDirty(false);
          setCreateOpen(false);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setCreateDirty(false);
                setCreateOpen(false);
              }}
              disabled={busy}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="create-instructor-form"
              leadingIcon={<UserCheck className="size-4" />}
              loading={busy}
            >
              Simpan Instruktur
            </Button>
          </div>
        }
      >
        <form
          id="create-instructor-form"
          className="grid gap-4 py-2"
          onChange={() => setCreateDirty(true)}
          onSubmit={(e) => void handleCreate(e)}
        >
          <TextInput
            label="Nama Lengkap Instruktur"
            placeholder="Contoh: Sarah Jenkins"
            value={form.displayName}
            onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
            required
          />
          <TextInput
            label="Alamat Email"
            type="email"
            placeholder="sarah@example.com"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <TextInput
            label="Nomor WhatsApp / HP"
            placeholder="08123456789 atau +628123456789"
            value={form.phoneE164}
            onChange={(e) => setForm((prev) => ({ ...prev, phoneE164: e.target.value }))}
          />
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-dd-muted">
              Penugasan Studio / Cabang Awal
            </label>
            <p className="text-xs text-dd-muted">
              Pilih cabang mana saja tempat instruktur ini diizinkan mengajar:
            </p>
            <div className="grid gap-2 sm:grid-cols-2 pt-1">
              {(session?.branches ?? []).map((b) => {
                const checked = form.branchIds.includes(b.id);
                return (
                  <label
                    key={b.id}
                    className={`flex items-center gap-2.5 rounded-dd-md border p-3 cursor-pointer transition text-sm ${
                      checked
                        ? 'border-dd-forest bg-emerald-50/50 font-semibold text-dd-forest'
                        : 'border-dd-line hover:bg-dd-surface'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="rounded border-dd-line text-dd-forest focus:ring-dd-forest"
                      checked={checked}
                      onChange={(e) => {
                        setForm((prev) => ({
                          ...prev,
                          branchIds: e.target.checked
                            ? [...prev.branchIds, b.id]
                            : prev.branchIds.filter((id) => id !== b.id),
                        }));
                      }}
                    />
                    <Building2 className="size-4 text-dd-muted" />
                    <span>{b.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </form>
      </Drawer>
    </section>
  );
}
