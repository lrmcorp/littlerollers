'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Feedback, PageHeader, Skeleton, StatusBadge } from '../../ui';
import { formatRupiah } from '../../lib/formatters';
import { instructorClient } from '../instructor-client';
export function InstructorDetailView({ id }: { id: string }) {
  const [data, setData] = useState<Record<string, any>>();
  const [error, setError] = useState(false);
  useEffect(() => {
    void instructorClient
      .detail(id)
      .then(setData)
      .catch(() => setError(true));
  }, [id]);
  if (error) return <Feedback kind="error">Profil instruktur tidak tersedia.</Feedback>;
  if (!data) return <Skeleton label="Memuat profil instruktur" />;
  const blockers = data.blockers as {
    completedWithoutCheckIn: number;
    completedWithoutFee: number;
  };
  return (
    <section className="space-y-6">
      <Link href="/instructors" className="inline-flex items-center gap-1.5 font-semibold text-dd-forest hover:underline">
        <ArrowLeft className="size-4" />
        <span>Kembali ke Manajemen Instruktur</span>
      </Link>
      <div className="rounded-dd-lg border border-dd-line bg-white p-6">
        <PageHeader
          eyebrow="Instruktur / Profil terpadu"
          title={String(data.displayName)}
          description={`${data.email ?? 'Email belum tersedia'} · ${data.phoneE164 ?? 'Telepon belum tersedia'}`}
          context={
            <StatusBadge tone={data.status === 'ACTIVE' ? 'success' : 'warning'}>
              {data.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
            </StatusBadge>
          }
        />
      </div>
      {blockers.completedWithoutCheckIn || blockers.completedWithoutFee ? (
        <Feedback kind="warning">
          Ada {blockers.completedWithoutCheckIn} kelas selesai tanpa check-in cocok dan{' '}
          {blockers.completedWithoutFee} kelas tanpa konfigurasi fee yang dapat dibuktikan. Nilainya
          tidak dianggap nol.
        </Feedback>
      ) : (
        <Feedback kind="status">Check-in dan kompensasi kelas selesai lengkap.</Feedback>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Penugasan cabang" value={(data.assignments as unknown[]).length} />
        <Metric label="Ketersediaan (jadwal)" value={(data.instructorAvailabilities as unknown[]).length} />
        <Metric
          label="Kompensasi matched class"
          value={formatRupiah(Number(data.compensationRp))}
        />
      </div>
      <div className="rounded-dd-lg border border-dd-line bg-white p-6">
        <h2 className="font-semibold">Kelas terbaru</h2>
        <ul className="mt-4 divide-y divide-dd-line">
          {(data.instructedClassSlots as Array<any>).map((slot) => (
            <li key={slot.id} className="py-3 text-sm">
              <strong>{slot.classType.name}</strong> · {slot.branch.name}
              <div className="text-dd-muted">
                {new Date(slot.startAt).toLocaleString('id-ID')} · {slot.status} ·{' '}
                {slot.instructorHourLog
                  ? `Rp${Number(slot.instructorHourLog.amountRp).toLocaleString('id-ID')}`
                  : 'Belum ada kompensasi'}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-dd-lg border border-dd-line bg-white p-5">
      <div className="text-xs font-bold uppercase text-dd-muted">{label}</div>
      <strong className="mt-2 block text-xl">{value}</strong>
    </div>
  );
}
