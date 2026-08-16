'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Pagination } from '../components/admin/admin-ui';
import { SearchSelect } from '../components/forms';
import { Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
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
    try {
      const result = await instructorClient.list({
        q: q || undefined,
        branchId: branchId || undefined,
        cursor,
      });
      setItems(result.items);
      setTotal(result.summary.total);
      setNext(result.page.nextCursor);
      setError('');
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
  const field = 'min-h-11 rounded-dd-md border border-dd-line bg-white px-3 text-sm';
  return (
    <section className="space-y-6">
      <div className="rounded-dd-lg border border-dd-line bg-white p-6">
        <PageHeader
          eyebrow="Operasional tim"
          title="Instructor Management"
          description="Assignment, availability, jadwal, check-in, fee, dan kompensasi dalam satu profil."
        />
      </div>
      {error && <Feedback kind="error">{error}</Feedback>}
      <div className="grid gap-3 rounded-dd-lg border border-dd-line bg-white p-4 sm:grid-cols-2">
        <input
          aria-label="Cari instructor"
          className={field}
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
      {loading && !items.length ? (
        <Skeleton label="Memuat instructor" />
      ) : (
        <div className="overflow-x-auto rounded-dd-lg border border-dd-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-dd-surface-muted">
              <tr>
                <th className="p-4">Instructor</th>
                <th className="p-4">Studio/Cabang</th>
                <th className="p-4">Kelas & check-in</th>
                <th className="p-4">Kompensasi</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-dd-line">
                  <td className="p-4">
                    <strong>{item.displayName}</strong>
                    <div className="text-dd-muted">{item.email || item.phoneE164 || '—'}</div>
                  </td>
                  <td className="p-4">
                    {item.assignments.map((a) => a.branch.name).join(', ') ||
                      'Belum ada assignment'}
                  </td>
                  <td className="p-4">
                    {item._count.instructedClassSlots} kelas · {item._count.instructorAttendances}{' '}
                    check-in
                  </td>
                  <td className="p-4">Rp{item.compensationRp.toLocaleString('id-ID')}</td>
                  <td className="p-4">
                    <Link
                      className="font-semibold text-dd-forest hover:underline"
                      href={`/instructors/${item.id}`}
                    >
                      Buka profil
                    </Link>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-dd-muted">
                    Belum ada instructor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
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
