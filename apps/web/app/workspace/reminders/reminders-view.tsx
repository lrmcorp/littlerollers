'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Clock,
  MessageSquare,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useSessionContext } from '../../session-context';
import { Feedback } from '../../ui';
import { AdminPageHeader } from '../../components/admin/admin-page-header';
import {
  AdminEmptyState,
  AdminPageState,
  Badge,
  DataTable,
  FilterBar,
  Pagination,
  Panel,
  StatCard,
} from '../../components/admin/admin-ui';
import { Button } from '../../components/actions';
import { useAppFeedback } from '../../components/app-feedback';
import { ADMIN_PAGE_SIZE, pageOffset } from '../../lib/pagination';
import {
  reminderClient,
  type ReminderLogItem,
  type RemindersSummary,
} from '../../api-clients/reminder-client';

export function RemindersView() {
  const session = useSessionContext();
  const feedback = useAppFeedback();
  const canRead = session?.hasCapability('automation:read') ?? false;
  const canRun = session?.hasCapability('automation:run') ?? false;

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ReminderLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState<RemindersSummary>({
    totalRecentSent: 0,
    totalRecentFailed: 0,
    lastSentAt: null,
  });
  const mockProvider = summary.provider === 'MOCK';

  const [searchPhone, setSearchPhone] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [executingAutoCancel, setExecutingAutoCancel] = useState(false);
  const [executingReminders, setExecutingReminders] = useState(false);

  const loadData = useCallback(async () => {
    if (!canRead) return;
    try {
      setLoading(true);
      const [logData, summaryData] = await Promise.all([
        reminderClient.listLogs({
          phone: searchPhone.trim() || undefined,
          reminderType: selectedType !== 'ALL' ? selectedType : undefined,
          status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
          page,
          limit: ADMIN_PAGE_SIZE,
        }),
        reminderClient.getSummary(),
      ]);

      const items = Array.isArray(logData) ? logData : logData?.items ?? [];
      const totalCount = Array.isArray(logData) ? logData.length : logData?.total ?? 0;

      setLogs(items);
      setTotal(totalCount);
      setSummary(summaryData);
    } catch (err: any) {
      feedback.showToast({
        tone: 'danger',
        title: 'Gagal Memuat Data',
        message: err.message || 'Gagal memuat data log pengingat',
      });
    } finally {
      setLoading(false);
    }
  }, [canRead, searchPhone, selectedType, selectedStatus, page, feedback]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Handler: Jalankan Auto-Cancel H-24 Secara Manual
  const handleTriggerAutoCancel = async () => {
    const confirmed = await feedback.confirm({
      title: 'Jalankan Evaluasi Auto-Cancel H-24?',
      message:
        'Sistem akan memeriksa seluruh jadwal kelas dalam batas H-24. Kelas yang pesertanya kurang dari kuota minimum akan dibatalkan otomatis dan notifikasi WhatsApp akan dikirimkan ke pelanggan, instruktur, dan staf.',
      confirmLabel: 'Evaluasi Sekarang',
      cancelLabel: 'Batal',
      tone: 'warning',
    });

    if (!confirmed) return;

    try {
      setExecutingAutoCancel(true);
      const result = await reminderClient.triggerAutoCancel();
      if (result.skipped) {
        feedback.showToast({
          tone: 'warning',
          title: 'Evaluasi Auto-Cancel Dinonaktifkan',
          message:
            'Evaluasi otomatis dinonaktifkan di lingkungan ini, jadi tidak ada kelas yang diperiksa.',
        });
        return;
      }
      feedback.showToast({
        tone: result.cancelledSlotsCount > 0 ? 'warning' : 'success',
        title: 'Evaluasi Auto-Cancel Selesai',
        message: `${result.cancelledSlotsCount} kelas dibatalkan, ${result.confirmedSlotsCount} kelas terkonfirmasi aman.`,
      });
      await loadData();
    } catch (err: any) {
      feedback.showToast({
        tone: 'danger',
        title: 'Evaluasi Gagal',
        message: err.message || 'Gagal mengeksekusi evaluasi auto-cancel',
      });
    } finally {
      setExecutingAutoCancel(false);
    }
  };

  // Handler: Jalankan Siklus Batch Reminder WhatsApp
  const handleTriggerBatchReminders = async () => {
    const confirmed = await feedback.confirm({
      title: 'Jalankan Siklus Reminder WhatsApp?',
      message:
        'Sistem akan mengevaluasi pelanggan H-7, H-3, H-1, follow-up paket expired (max 5x), digest admin 3 jam, dan rekap owner 3 hari. Pelanggan yang ditandai berhenti (stopped) akan dilindungi dan dilewati otomatis.',
      confirmLabel: 'Kirim Pengingat',
      cancelLabel: 'Batal',
      tone: 'warning',
    });

    if (!confirmed) return;

    try {
      setExecutingReminders(true);
      const res = await reminderClient.triggerBatchReminders();
      const totalSent =
        res.customerH7Sent +
        res.customerH3Sent +
        res.customerH1Sent +
        res.customerExpiredRenewSent +
        res.adminDigestsSent +
        res.ownerRecapsSent;

      feedback.showToast({
        tone: 'success',
        title: 'Siklus Reminder Berhasil',
        message: mockProvider
          ? `${totalSent} pesan dicatat dalam mode uji — tidak dikirim ke WhatsApp (${res.stoppedCustomersProtected} pelanggan berhenti terlindungi).`
          : `${totalSent} pesan WhatsApp terkirim (${res.stoppedCustomersProtected} pelanggan berhenti terlindungi).`,
      });
      await loadData();
    } catch (err: any) {
      feedback.showToast({
        tone: 'danger',
        title: 'Gagal Kirim Reminder',
        message: err.message || 'Gagal mengeksekusi siklus reminder',
      });
    } finally {
      setExecutingReminders(false);
    }
  };

  const reminderTypeOptions = [
    { value: 'ALL', label: 'Semua Tipe Pengingat' },
    { value: 'CLASS_AUTO_CANCELLED', label: 'Auto-Cancel Pelanggan' },
    { value: 'CLASS_AUTO_CANCELLED_INSTRUCTOR', label: 'Auto-Cancel Instruktur' },
    { value: 'CLASS_AUTO_CANCELLED_STAFF', label: 'Auto-Cancel Staf Cabang' },
    { value: 'EXPIRY_H7', label: 'Pelanggan H-7 Expired' },
    { value: 'EXPIRY_H3', label: 'Pelanggan H-3 Expired' },
    { value: 'EXPIRY_H1', label: 'Pelanggan H-1 Expired' },
    { value: 'EXPIRED_RENEWAL', label: 'Follow-up Expired (Max 5x)' },
    { value: 'ADMIN_DIGEST', label: 'Digest Admin (3 Jam)' },
    { value: 'OWNER_RECAP', label: 'Rekap Owner (3 Hari)' },
  ];

  if (!canRead) return <AdminPageState kind="forbidden" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Otomasi & Log Pengingat WhatsApp"
        description="Monitoring sistem pembatalan kelas otomatis pada H-24 dan antrean pengingat WhatsApp berjenjang."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={loadData}
              disabled={loading}
              leadingIcon={<RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Segarkan
            </Button>
          </div>
        }
      />

      {canRun && (
        <Panel className="border-l-4 border-l-dd-warning p-4 bg-amber-50/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-dd-ink">Pusat Tindakan &amp; Otomasi Operasional</h3>
              <p className="text-xs text-dd-muted mt-0.5">
                Tindakan berisiko tinggi yang mengevaluasi kuota kelas H-24 dan antrean notifikasi WhatsApp pelanggan.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTriggerAutoCancel}
                disabled={executingAutoCancel}
                leadingIcon={<Play className="size-4 text-dd-warning" />}
              >
                {executingAutoCancel ? 'Mengevaluasi...' : 'Jalankan Auto-Cancel H-24'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleTriggerBatchReminders}
                disabled={executingReminders}
                leadingIcon={<Send className="size-4" />}
              >
                {executingReminders ? 'Mengirim...' : 'Jalankan Reminder Batch'}
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {mockProvider && (
        <Feedback kind="warning">
          Mode uji — penyedia WhatsApp belum dikonfigurasi, jadi pesan hanya dicatat di log dan
          tidak dikirim ke nomor mana pun.
        </Feedback>
      )}

      {/* 4 StatCards Ringkasan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pesan Terkirim (Log Terakhir)"
          value={String(summary.totalRecentSent)}
          tone="success"
        />
        <StatCard
          label="Pesan Gagal Terkirim"
          value={String(summary.totalRecentFailed)}
          tone={summary.totalRecentFailed > 0 ? 'danger' : 'neutral'}
        />
        <StatCard
          label="Pengiriman Terakhir"
          value={
            summary.lastSentAt
              ? new Intl.DateTimeFormat('id-ID', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                }).format(new Date(summary.lastSentAt))
              : '-'
          }
          tone="info"
        />
        <StatCard
          label="Pencegahan Pesan Duplikat"
          value="Aktif (Zero Duplikasi)"
          tone="success"
        />
      </div>

      {/* Filter & Kontrol Pencarian */}
      <Panel className="p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-dd-ink">Riwayat Pengiriman Notifikasi WhatsApp</h2>
          <p className="text-xs text-dd-muted">Seluruh pengiriman pesan dicatat dengan status pengiriman dan timestamp untuk menjamin nol pesan ganda.</p>
        </div>

        <FilterBar>
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari nomor HP penerima..."
                value={searchPhone}
                onChange={(e) => {
                  setSearchPhone(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-md border border-dd-line bg-white px-3 py-1.5 text-sm outline-none focus:border-dd-forest"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="rounded-md border border-dd-line bg-white px-3 py-1.5 text-sm outline-none focus:border-dd-forest"
            >
              {reminderTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-md border border-dd-line bg-white px-3 py-1.5 text-sm outline-none focus:border-dd-forest"
            >
              <option value="ALL">Semua Status</option>
              <option value="SENT">Terkirim</option>
              <option value="FAILED">Gagal</option>
            </select>
          </div>
        </FilterBar>

        {!loading && logs.length === 0 ? (
          <div className="mt-4">
            <AdminEmptyState
              title="Belum Ada Log Pengingat"
              description="Belum ada pesan WhatsApp yang tercatat atau cocok dengan filter pencarian saat ini."
            />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <DataTable<ReminderLogItem>
              items={logs}
              loading={loading}
              showRowNumbers
              rowNumberOffset={pageOffset(page - 1)}
              rowKey={(item) => item.id}
              columns={[
                {
                  id: 'sentAt',
                  header: 'Waktu Kirim',
                  cell: (item) => (
                    <span className="whitespace-nowrap font-mono text-xs text-dd-muted">
                      {new Intl.DateTimeFormat('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(item.sentAt))}
                    </span>
                  ),
                },
                {
                  id: 'recipient',
                  header: 'Penerima',
                  cell: (item) => {
                    const typeLabelMap: Record<string, string> = {
                      CUSTOMER: 'Pelanggan',
                      INSTRUCTOR: 'Instruktur',
                      ADMIN: 'Admin Cabang',
                      OWNER: 'Owner Cabang',
                      MANAGER: 'Manager Cabang',
                      SUPER_OWNER: 'Super Owner',
                    };
                    const typeLabel = typeLabelMap[item.recipientType] || item.recipientType;
                    return (
                      <div>
                        <div className="font-medium text-dd-ink">{item.recipientPhone}</div>
                        <div className="text-xs text-dd-muted">{typeLabel}</div>
                      </div>
                    );
                  },
                },
                {
                  id: 'reminderType',
                  header: 'Tipe Pengingat',
                  cell: (item) => {
                    const type = item.reminderType;
                    const typeLabel =
                      reminderTypeOptions.find((opt) => opt.value === type)?.label || type;
                    let tone: 'neutral' | 'warning' | 'danger' | 'info' | 'success' = 'neutral';
                    if (type.includes('AUTO_CANCEL')) tone = 'warning';
                    else if (type.includes('EXPIRY')) tone = 'info';
                    else if (type.includes('DIGEST') || type.includes('RECAP')) tone = 'success';

                    return (
                      <Badge tone={tone}>
                        {typeLabel}
                      </Badge>
                    );
                  },
                },
                {
                  id: 'status',
                  header: 'Status',
                  cell: (item) => {
                    const status = item.status;
                    const label =
                      status === 'SENT'
                        ? 'Terkirim'
                        : status === 'FAILED'
                        ? 'Gagal'
                        : status === 'SKIPPED_DUPLICATE'
                        ? 'Dilewati (Duplikat)'
                        : status;
                    const tone =
                      status === 'SENT' ? 'success' : status === 'FAILED' ? 'danger' : 'neutral';
                    return <Badge tone={tone}>{label}</Badge>;
                  },
                },
                {
                  id: 'detail',
                  header: 'Ringkasan Pesan',
                  cell: (item) => {
                    const preview = item.payload?.textPreview || '-';
                    return (
                      <span
                        className="line-clamp-2 max-w-md text-xs text-dd-muted"
                        title={preview}
                      >
                        {preview}
                      </span>
                    );
                  },
                },
              ]}
            />
            {total > 0 && (
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(total / ADMIN_PAGE_SIZE) || 1}
                totalItems={total}
                pageSize={ADMIN_PAGE_SIZE}
                hasPrevious={page > 1 && !loading}
                hasNext={page < (Math.ceil(total / ADMIN_PAGE_SIZE) || 1) && !loading}
                onPrevious={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(Math.ceil(total / ADMIN_PAGE_SIZE) || 1, p + 1))}
                onPageChange={(targetPage) => setPage(targetPage)}
              />
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}
