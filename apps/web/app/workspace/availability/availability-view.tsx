'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  browserAvailabilityClient,
  availabilityFailure,
  type AvailabilityClient,
  type AvailabilityWindow,
} from '@/api-clients/availability-client';
import { formatBranchDay, formatBranchTime, localDateKey, zonedLocalDateTime } from '@/lib/class-time';
import { useSessionContext } from '../../session-context';
import { AdminPageHeader } from '../../components/admin/admin-page-header';
import { DataTable } from '../../components/admin/admin-ui';
import { DateInput, TextInput } from '../../components/forms';
import { Button } from '../../components/actions';
import { Feedback, StatusBadge } from '../../ui';
import { useAppFeedback } from '../../components/app-feedback';

const statusLabels: Record<string, string> = {
  ACTIVE: 'Aktif',
  ENDED: 'Selesai',
};

export function AvailabilityView({
  client = browserAvailabilityClient,
}: {
  client?: AvailabilityClient;
}) {
  const sessionContext = useSessionContext();
  const feedback = useAppFeedback();
  const branch = sessionContext?.activeBranch ?? null;
  const capabilities = sessionContext?.session?.capabilities ?? [];
  const canRead = capabilities.includes('availability:self:read');
  const canCreate = capabilities.includes('availability:self:create');

  const [items, setItems] = useState<AvailabilityWindow[]>([]);
  const [loading, setLoading] = useState(false);
  const [listFailure, setListFailure] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [formFailure, setFormFailure] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!canRead || !branch) return;
    setLoading(true);
    setListFailure(undefined);
    try {
      const now = new Date();
      const page = await client.list({
        branchId: branch.id,
        from: now.toISOString(),
        until: new Date(now.getTime() + 90 * 86_400_000).toISOString(),
      });
      setItems(page.items);
    } catch (error) {
      setListFailure(availabilityFailure(error));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [branch, canRead, client]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!canRead) {
    return (
      <section
        className="rounded-dd-lg border border-dd-danger/30 bg-dd-danger-soft p-6"
        aria-labelledby="availability-title"
      >
        <AdminPageHeader
          title="Ketersediaan mengajar"
          titleId="availability-title"
          description="Anda tidak memiliki izin untuk membaca ketersediaan mengajar."
        />
        <Feedback kind="error">Akses ketersediaan memerlukan izin availability:self:read.</Feedback>
      </section>
    );
  }

  if (!branch) {
    return (
      <section
        className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
        aria-labelledby="availability-title"
      >
        <AdminPageHeader
          title="Ketersediaan mengajar"
          titleId="availability-title"
          description="Pilih cabang aktif pada bagian atas workspace untuk membuka ketersediaan."
        />
        <Feedback kind="warning">
          Pilih cabang aktif untuk mengajukan atau melihat ketersediaan mengajar Anda.
        </Feedback>
      </section>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="availability-title">
      <AdminPageHeader
        title="Ketersediaan mengajar"
        titleId="availability-title"
        description={`Ajukan dan lihat jam Anda tersedia mengajar di ${branch.name}. Admin menggunakan ini untuk menjadwalkan kelas.`}
      />

      {canCreate && (
        <div className="rounded-2xl border border-dd-line/80 bg-white p-5 shadow-dd-card">
          <h2 className="text-lg font-semibold text-dd-ink">Ajukan ketersediaan baru</h2>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-3"
            aria-label="Form ketersediaan mengajar"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const data = new FormData(form);
              setFormFailure(undefined);
              let startAt: Date;
              let endAt: Date;
              try {
                startAt = zonedLocalDateTime(
                  String(data.get('date')),
                  String(data.get('startTime')),
                  branch.timezone,
                );
                endAt = zonedLocalDateTime(
                  String(data.get('date')),
                  String(data.get('endTime')),
                  branch.timezone,
                );
                if (endAt <= startAt) throw new Error('INVALID_RANGE');
              } catch {
                setFormFailure('Waktu selesai harus setelah waktu mulai.');
                return;
              }
              void (async () => {
                const accepted = await feedback.confirm({
                  tone: 'warning',
                  title: 'Ajukan ketersediaan?',
                  message: `Anda akan tersedia mengajar di ${branch.name} pada waktu yang dipilih.`,
                  confirmLabel: 'Ajukan',
                });
                if (!accepted) return;
                setSubmitting(true);
                try {
                  await client.create({ branchId: branch.id, startAt, endAt });
                  setMessage('Ketersediaan berhasil diajukan.');
                  form.reset();
                  await load();
                } catch (error) {
                  setFormFailure(availabilityFailure(error));
                } finally {
                  setSubmitting(false);
                }
              })();
            }}
          >
            <DateInput
              label="Tanggal"
              name="date"
              min={localDateKey(new Date(), branch.timezone)}
              required
            />
            <TextInput label="Mulai" name="startTime" type="time" required />
            <TextInput label="Selesai" name="endTime" type="time" required />
            <div className="sm:col-span-3">
              <Button type="submit" loading={submitting}>
                Ajukan ketersediaan
              </Button>
            </div>
          </form>
          {formFailure && <Feedback kind="error">{formFailure}</Feedback>}
        </div>
      )}

      {message && !loading && <Feedback kind="status">{message}</Feedback>}
      {listFailure && <Feedback kind="error">{listFailure}</Feedback>}

      <DataTable
        items={items}
        loading={loading}
        rowKey={(item) => item.id}
        emptyTitle="Belum ada ketersediaan"
        emptyDescription="Ajukan jam Anda tersedia mengajar menggunakan form di atas."
        columns={[
          {
            id: 'day',
            header: 'Tanggal',
            cell: (item) => formatBranchDay(localDateKey(item.startAt, item.timezone), item.timezone),
          },
          {
            id: 'time',
            header: 'Waktu',
            cell: (item) =>
              `${formatBranchTime(item.startAt, item.timezone)}–${formatBranchTime(item.endAt, item.timezone)}`,
          },
          {
            id: 'status',
            header: 'Status',
            cell: (item) => (
              <StatusBadge tone={item.status === 'ACTIVE' ? 'success' : 'neutral'}>
                {statusLabels[item.status] ?? item.status}
              </StatusBadge>
            ),
          },
        ]}
        mobileCard={(item) => (
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <strong className="text-dd-ink">
                {formatBranchDay(localDateKey(item.startAt, item.timezone), item.timezone)}
              </strong>
              <StatusBadge tone={item.status === 'ACTIVE' ? 'success' : 'neutral'}>
                {statusLabels[item.status] ?? item.status}
              </StatusBadge>
            </div>
            <span className="text-sm text-dd-muted">
              {formatBranchTime(item.startAt, item.timezone)}–{formatBranchTime(item.endAt, item.timezone)}
            </span>
          </div>
        )}
      />
    </section>
  );
}
