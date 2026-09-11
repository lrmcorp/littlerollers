'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { DataTable, type DataTableColumn, Pagination } from '../components/admin/admin-ui';
import { SearchInput, SearchSelect } from '../components/forms';
import { Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { formatRupiah } from '../lib/formatters';
import { useSessionContext } from '../session-context';
import { instructorClient, type InstructorSummary } from './instructor-client';

export function InstructorsView() {
  const session = useSessionContext()?.session;
  const [items, setItems] = useState<InstructorSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [branchId, setBranchId] = useState('');
  const [cursor, setCursor] = useState<string>();
  const [history, setHistory] = useState<Array<string | undefined>>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  const columns: DataTableColumn<InstructorSummary>[] = [
    {
      id: 'instructor',
      header: 'Instructor',
      cell: (item) => (
        <div>
          <strong className="font-semibold text-dd-ink">{item.displayName}</strong>
          <div className="text-xs text-dd-muted">{item.email || item.phoneE164 || '—'}</div>
        </div>
      ),
    },
    {
      id: 'branches',
      header: 'Studio/Cabang',
      cell: (item) => (
        <span className="text-dd-ink">
          {item.assignments.map((a) => a.branch.name).join(', ') || 'Belum ada penugasan'}
        </span>
      ),
    },
    {
      id: 'classes',
      header: 'Kelas & check-in',
      cell: (item) => (
        <span className="text-dd-muted">
          {item._count.instructedClassSlots} kelas · {item._count.instructorAttendances} check-in
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
      header: 'Aksi',
      cell: (item) => (
        <Link
          className="font-semibold text-dd-forest hover:underline"
          href={`/instructors/${item.id}`}
        >
          Buka profil
        </Link>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Operasional tim"
        title="Manajemen Instruktur"
        description="Penugasan cabang, ketersediaan, jadwal kelas, check-in, dan kompensasi dalam satu profil."
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
          label="Studio/Cabang"
          compact
          clearable
          placeholder="Semua Studio/Cabang diizinkan"
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
        emptyTitle="Belum ada instructor"
        emptyDescription="Tidak ada data instructor yang cocok dengan filter pencarian."
        mobileCard={(item) => (
          <div className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <strong className="font-semibold text-dd-ink">{item.displayName}</strong>
                <p className="text-xs text-dd-muted">{item.email || item.phoneE164 || '—'}</p>
              </div>
              <Link
                className="text-xs font-semibold text-dd-forest hover:underline"
                href={`/instructors/${item.id}`}
              >
                Buka profil
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-dd-muted">
              <span>
                {item.assignments.map((a) => a.branch.name).join(', ') || 'Belum ada assignment'}
              </span>
              <span>·</span>
              <span>{item._count.instructedClassSlots} kelas</span>
              <span>·</span>
              <span className="font-semibold text-dd-ink">
                Rp{item.compensationRp.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        )}
      />
      <Pagination
        hasPrevious={Boolean(history.length) && !loading}
        hasNext={Boolean(next) && !loading}
        totalLabel={`Halaman ${history.length + 1} · ${total} instructor`}
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
    </section>
  );
}
