'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  PaymentAccountEditDialog,
  type EditablePaymentAccount,
} from '../components/admin/payment-account-edit-dialog';
import { CreditCard, Plus, Eye, PowerOff, CheckCircle2, History, RefreshCw, X } from 'lucide-react';
import { Badge, Panel } from '../components/admin/admin-ui';
import { Button } from '../components/actions';
import { Drawer, Modal, useAppFeedback } from '../components/app-feedback';
import { TextInput } from '../components/forms';

export interface PaymentAccountItem {
  id: string;
  branchId: string;
  bankCode: string;
  bankName: string;
  maskedAccountNumber: string;
  accountHolderName: string;
  paymentWindowHours: number;
  active: boolean;
  version: number;
}

export interface PaymentAccountDetail extends PaymentAccountItem {
  branch?: { code: string; name: string; active: boolean };
  purchaseCount?: number;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, { credentials: 'include', ...init });
  if (!response.ok) throw new Error(String(response.status));
  return response.json() as Promise<T>;
}

export function BranchPaymentAccountsPanel({
  branchId,
  canManage,
  onAccountsChange,
}: {
  branchId: string;
  canManage: boolean;
  onAccountsChange?: (activeCount: number) => void;
}) {
  const feedback = useAppFeedback();
  const [items, setItems] = useState<PaymentAccountItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Modals & Drawers state
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createDirty, setCreateDirty] = useState(false);

  const [switchDrawerOpen, setSwitchDrawerOpen] = useState(false);
  const [switchSubmitting, setSwitchSubmitting] = useState(false);
  const [switchDirty, setSwitchDirty] = useState(false);

  const [detailItem, setDetailItem] = useState<PaymentAccountDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [confirmingDeactivate, setConfirmingDeactivate] = useState<PaymentAccountItem | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [deactivateSubmitting, setDeactivateSubmitting] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [editing, setEditing] = useState<EditablePaymentAccount | null>(null);

  const loadAccounts = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      setError('');
      const data = await api<{ items: PaymentAccountItem[] }>(
        `/payment-accounts?branchId=${encodeURIComponent(branchId)}`,
      );
      setItems(data.items);
      const activeCount = data.items.filter((item) => item.active).length;
      onAccountsChange?.(activeCount);
    } catch {
      setError('Rekening pembayaran belum dapat dimuat.');
    } finally {
      setLoading(false);
    }
  }, [branchId, onAccountsChange]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const activeAccount = items.find((item) => item.active);
  const inactiveAccounts = items.filter((item) => !item.active);

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setCreateSubmitting(true);
    setError('');
    try {
      await api('/payment-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          branchId,
          bankCode: String(data.get('bankCode')).trim(),
          bankName: String(data.get('bankName')).trim(),
          accountNumber: String(data.get('accountNumber')).trim(),
          accountHolderName: String(data.get('accountHolderName')).trim(),
          paymentWindowHours: Number(data.get('paymentWindowHours')) || 24,
          reason: String(data.get('reason')).trim(),
        }),
      });
      setMessage('Rekening pembayaran berhasil ditambahkan dan diaktifkan.');
      setCreateDrawerOpen(false);
      setCreateDirty(false);
      await loadAccounts();
    } catch {
      setError('Gagal membuat rekening baru. Periksa kelengkapan data dan rekening aktif cabang.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleSwitchSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeAccount) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const reason = String(data.get('reason')).trim() || 'Penggantian rekening pembayaran operasional cabang';
    const bankName = String(data.get('bankName')).trim();

    setSwitchSubmitting(true);
    setError('');
    try {
      // 1. Deactivate existing active account
      await api(`/payment-accounts/${activeAccount.id}/deactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          expectedVersion: activeAccount.version,
          reason,
        }),
      });

      // 2. Create and activate the new account
      await api('/payment-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          branchId,
          bankCode: String(data.get('bankCode')).trim().toUpperCase(),
          bankName,
          accountNumber: String(data.get('accountNumber')).trim(),
          accountHolderName: String(data.get('accountHolderName')).trim(),
          paymentWindowHours: Number(data.get('paymentWindowHours')) || 24,
          reason,
        }),
      });

      setMessage(`Rekening cabang berhasil diganti ke ${bankName}. Rekening lama diarsipkan.`);
      feedback.showToast({
        tone: 'success',
        title: 'Rekening cabang diperbarui',
        message: `Rekening aktif kini menggunakan ${bankName}.`,
      });
      setSwitchDrawerOpen(false);
      setSwitchDirty(false);
      await loadAccounts();
    } catch {
      setError('Gagal mengganti rekening. Pastikan data rekening baru valid dan coba kembali.');
    } finally {
      setSwitchSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirmingDeactivate || deactivateReason.trim().length < 3) return;
    setDeactivateSubmitting(true);
    setError('');
    try {
      await api(`/payment-accounts/${confirmingDeactivate.id}/deactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          expectedVersion: confirmingDeactivate.version,
          reason: deactivateReason.trim(),
        }),
      });
      setMessage('Rekening berhasil dinonaktifkan.');
      setConfirmingDeactivate(null);
      setDeactivateReason('');
      await loadAccounts();
    } catch {
      setError('Rekening tidak dapat dinonaktifkan. Pastikan tidak ada pesanan terbuka.');
    } finally {
      setDeactivateSubmitting(false);
    }
  };

  const handleViewDetail = async (account: PaymentAccountItem) => {
    setDetailLoading(true);
    try {
      const result = await api<PaymentAccountDetail>(`/payment-accounts/${account.id}`);
      setDetailItem(result);
    } catch {
      setError('Detail rekening belum dapat dimuat.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="size-5 text-dd-forest" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Rekening Pembayaran Studio</h2>
          </div>
          <p className="mt-1 text-sm text-dd-muted">
            Tujuan transfer resmi untuk pembelian paket pelanggan pada studio/cabang ini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={activeAccount ? 'success' : 'warning'}>
            {activeAccount ? 'Rekening Aktif Siap' : 'Belum Ada Rekening'}
          </Badge>
          {canManage && activeAccount && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leadingIcon={<RefreshCw className="size-4" aria-hidden="true" />}
              onClick={() => {
                setSwitchDirty(false);
                setSwitchDrawerOpen(true);
              }}
            >
              Ganti rekening
            </Button>
          )}
          {canManage && !activeAccount && (
            <Button
              type="button"
              size="sm"
              leadingIcon={<Plus className="size-4" aria-hidden="true" />}
              onClick={() => {
                setCreateDirty(false);
                setCreateDrawerOpen(true);
              }}
            >
              Tambah rekening
            </Button>
          )}
        </div>
      </div>

      {message && (
        <div className="mt-3 rounded-dd-md bg-dd-success-soft p-3 text-sm text-dd-success border border-emerald-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
            {message}
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={() => setMessage('')} aria-label="Tutup notifikasi">
            <X className="size-4" />
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-dd-md bg-dd-danger-soft p-3 text-sm text-dd-danger border border-red-200 flex items-center justify-between">
          <span>{error}</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => setError('')} aria-label="Tutup error">
            <X className="size-4" />
          </Button>
        </div>
      )}

      {/* ACTIVE ACCOUNT DISPLAY */}
      {activeAccount ? (
        <div className="mt-4 rounded-dd-lg border border-dd-forest/20 bg-dd-success-soft/50 p-4 transition-all">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-dd-ink">{activeAccount.bankName}</span>
                <span className="rounded-dd-sm bg-dd-forest/10 px-2 py-0.5 text-xs font-semibold text-dd-forest">
                  {activeAccount.bankCode}
                </span>
                <Badge tone="success">Aktif</Badge>
              </div>
              <p className="font-mono text-lg font-semibold tracking-wider text-dd-forest">
                {activeAccount.maskedAccountNumber}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-dd-muted">
                <span>
                  a.n. <strong className="text-dd-ink">{activeAccount.accountHolderName}</strong>
                </span>
                <span>•</span>
                <span>
                  Batas pembayaran: <strong>{activeAccount.paymentWindowHours} jam</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leadingIcon={<Eye className="size-4" aria-hidden="true" />}
                loading={detailLoading}
                onClick={() => void handleViewDetail(activeAccount)}
              >
                Detail
              </Button>
              {canManage && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={loading || switchSubmitting}
                  onClick={() => setEditing(activeAccount)}
                >
                  Ubah
                </Button>
              )}
              {canManage && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leadingIcon={<RefreshCw className="size-4" aria-hidden="true" />}
                  disabled={loading || switchSubmitting}
                  onClick={() => {
                    setSwitchDirty(false);
                    setSwitchDrawerOpen(true);
                  }}
                >
                  Ganti rekening
                </Button>
              )}
              {canManage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leadingIcon={<PowerOff className="size-4" aria-hidden="true" />}
                  disabled={loading || switchSubmitting}
                  onClick={() => {
                    setDeactivateReason('');
                    setConfirmingDeactivate(activeAccount);
                  }}
                >
                  Nonaktifkan
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-dd-lg border border-dashed border-amber-300 bg-dd-warning-soft/50 p-5 text-center sm:p-6">
          <p className="font-semibold text-amber-900">Belum ada rekening pembayaran aktif</p>
          <p className="mt-1 text-xs text-amber-700 max-w-lg mx-auto">
            Pelanggan tidak dapat melakukan transfer pembayaran paket untuk cabang ini sampai ada
            rekening bank aktif yang dikonfigurasi.
          </p>
          {canManage && (
            <Button
              type="button"
              className="mt-3"
              leadingIcon={<Plus className="size-4" aria-hidden="true" />}
              onClick={() => {
                setCreateDirty(false);
                setCreateDrawerOpen(true);
              }}
            >
              Tambah rekening aktif sekarang
            </Button>
          )}
        </div>
      )}

      {/* HISTORICAL INACTIVE ACCOUNTS ACCORDION */}
      {inactiveAccounts.length > 0 && (
        <div className="mt-4 border-t border-dd-line/60 pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs text-dd-muted hover:text-dd-ink"
            leadingIcon={<History className="size-3.5" aria-hidden="true" />}
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Sembunyikan' : 'Lihat'} riwayat rekening lama ({inactiveAccounts.length}
            )
          </Button>

          {showHistory && (
            <div className="mt-3 grid gap-2">
              {inactiveAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex flex-col gap-2 rounded-dd-md border border-dd-line bg-dd-surface-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between text-xs"
                >
                  <div className="grid gap-0.5">
                    <div className="flex items-center gap-2">
                      <strong>{account.bankName}</strong>
                      <span className="font-mono text-dd-muted">
                        {account.maskedAccountNumber}
                      </span>
                      <Badge tone="neutral">Nonaktif</Badge>
                    </div>
                    <span className="text-dd-muted">a.n. {account.accountHolderName}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleViewDetail(account)}
                  >
                    Lihat detail
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE ACCOUNT DRAWER */}
      <Drawer
        open={createDrawerOpen}
        title="Tambah Rekening Pembayaran Baru"
        busy={createSubmitting}
        dirty={createDirty}
        onDirtyClose={() =>
          feedback.confirm({
            tone: 'warning',
            title: 'Batalkan penambahan rekening?',
            message: 'Data rekening yang belum disimpan akan hilang.',
            confirmLabel: 'Buang data',
          })
        }
        onClose={() => {
          setCreateDirty(false);
          setCreateDrawerOpen(false);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={createSubmitting}
              onClick={() => {
                setCreateDirty(false);
                setCreateDrawerOpen(false);
              }}
            >
              Batal
            </Button>
            <Button type="submit" form="create-payment-account-form" loading={createSubmitting}>
              Simpan &amp; Aktifkan Rekening
            </Button>
          </div>
        }
      >
        <form
          id="create-payment-account-form"
          className="grid gap-4"
          onChange={() => setCreateDirty(true)}
          onSubmit={handleCreateSubmit}
        >
          <p className="text-sm text-dd-muted">
            Rekening baru ini akan langsung menjadi tujuan transfer pelanggan untuk cabang aktif.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Kode bank"
              name="bankCode"
              placeholder="Contoh: BCA"
              maxLength={12}
              required
            />
            <TextInput
              label="Nama bank"
              name="bankName"
              placeholder="Contoh: Bank Central Asia"
              required
            />
          </div>

          <TextInput
            label="Nomor rekening"
            name="accountNumber"
            inputMode="numeric"
            placeholder="Contoh: 6600482911"
            minLength={6}
            maxLength={30}
            required
          />

          <TextInput
            label="Nama pemilik rekening (a.n.)"
            name="accountHolderName"
            placeholder="Contoh: PT Daily Dose Indonesia"
            required
          />

          <TextInput
            label="Batas waktu pembayaran transfer (jam)"
            name="paymentWindowHours"
            type="number"
            defaultValue={24}
            min={1}
            max={72}
            required
          />

          <TextInput
            label="Alasan pembuatan rekening"
            name="reason"
            placeholder="Contoh: Rekening operasional cabang Jakarta"
            minLength={3}
            required
          />
        </form>
      </Drawer>

      {/* SWITCH ACCOUNT DRAWER */}
      <Drawer
        open={switchDrawerOpen}
        title="Ganti Rekening Pembayaran Cabang"
        description="Rekening aktif lama akan otomatis dinonaktifkan dan digantikan dengan rekening baru berikut."
        busy={switchSubmitting}
        dirty={switchDirty}
        onDirtyClose={() =>
          feedback.confirm({
            tone: 'warning',
            title: 'Batalkan penggantian rekening?',
            message: 'Data rekening baru yang belum disimpan akan hilang.',
            confirmLabel: 'Buang data',
          })
        }
        onClose={() => {
          setSwitchDirty(false);
          setSwitchDrawerOpen(false);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={switchSubmitting}
              onClick={() => {
                setSwitchDirty(false);
                setSwitchDrawerOpen(false);
              }}
            >
              Batal
            </Button>
            <Button type="submit" form="switch-payment-account-form" loading={switchSubmitting}>
              Simpan &amp; Ganti Rekening
            </Button>
          </div>
        }
      >
        <form
          id="switch-payment-account-form"
          className="grid gap-4"
          onChange={() => setSwitchDirty(true)}
          onSubmit={handleSwitchSubmit}
        >
          {activeAccount && (
            <div className="rounded-dd-md border border-amber-200 bg-dd-warning-soft p-3.5 text-xs text-amber-900">
              <strong className="block text-sm font-bold text-amber-950 mb-1">
                Rekening Aktif Saat Ini (Akan Digantikan):
              </strong>
              <p className="font-semibold">
                {activeAccount.bankName} ({activeAccount.bankCode}) • {activeAccount.maskedAccountNumber}
              </p>
              <p className="text-amber-800">a.n. {activeAccount.accountHolderName}</p>
              <p className="mt-1 text-amber-700/80 italic">
                Rekening di atas akan otomatis dinonaktifkan dan dipindahkan ke riwayat histori cabang.
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Kode bank baru"
              name="bankCode"
              placeholder="Contoh: BCA / MANDIRI"
              maxLength={12}
              required
            />
            <TextInput
              label="Nama bank baru"
              name="bankName"
              placeholder="Contoh: Bank Central Asia"
              required
            />
          </div>

          <TextInput
            label="Nomor rekening baru"
            name="accountNumber"
            inputMode="numeric"
            placeholder="Contoh: 6600482911"
            minLength={6}
            maxLength={30}
            required
          />

          <TextInput
            label="Nama pemilik rekening baru (a.n.)"
            name="accountHolderName"
            placeholder="Contoh: Daily Dose Pilates BSD"
            required
          />

          <TextInput
            label="Batas waktu pembayaran transfer (jam)"
            name="paymentWindowHours"
            type="number"
            defaultValue={activeAccount?.paymentWindowHours ?? 24}
            min={1}
            max={72}
            required
          />

          <TextInput
            label="Alasan penggantian rekening"
            name="reason"
            defaultValue="Penggantian rekening operasional resmi cabang"
            minLength={3}
            required
          />
        </form>
      </Drawer>

      {/* DETAIL MODAL */}
      <Modal
        open={Boolean(detailItem)}
        title="Detail Rekening Pembayaran"
        onClose={() => setDetailItem(null)}
        footer={
          <Button type="button" variant="secondary" onClick={() => setDetailItem(null)}>
            Tutup
          </Button>
        }
      >
        {detailItem && (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase text-dd-muted">Bank</dt>
              <dd className="mt-0.5 font-semibold text-dd-ink">
                {detailItem.bankName} ({detailItem.bankCode})
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-dd-muted">Nomor Rekening</dt>
              <dd className="mt-0.5 font-mono font-semibold text-dd-forest">
                {detailItem.maskedAccountNumber}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-dd-muted">Nama Pemilik</dt>
              <dd className="mt-0.5 text-dd-ink">{detailItem.accountHolderName}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-dd-muted">Status</dt>
              <dd className="mt-0.5">
                <Badge tone={detailItem.active ? 'success' : 'neutral'}>
                  {detailItem.active ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-dd-muted">Batas Pembayaran</dt>
              <dd className="mt-0.5 text-dd-ink">{detailItem.paymentWindowHours} jam</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-dd-muted">
                Total Transaksi Terkait
              </dt>
              <dd className="mt-0.5 font-semibold text-dd-ink">
                {detailItem.purchaseCount ?? 0} pembelian
              </dd>
            </div>
          </dl>
        )}
      </Modal>

      {/* CONFIRM DEACTIVATE MODAL */}
      <Modal
        open={Boolean(confirmingDeactivate)}
        title="Konfirmasi Nonaktifkan Rekening"
        onClose={() => setConfirmingDeactivate(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={deactivateSubmitting}
              onClick={() => setConfirmingDeactivate(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deactivateSubmitting}
              disabled={deactivateReason.trim().length < 3}
              onClick={() => void handleDeactivate()}
            >
              Nonaktifkan Rekening
            </Button>
          </div>
        }
      >
        <div className="grid gap-3">
          <p className="text-sm text-dd-muted">
            Apakah Anda yakin ingin menonaktifkan rekening{' '}
            <strong>
              {confirmingDeactivate?.bankName} ({confirmingDeactivate?.maskedAccountNumber})
            </strong>
            ? Rekening ini tidak akan lagi ditampilkan pada instruksi pembayaran transfer pelanggan.
          </p>
          <TextInput
            label="Alasan penonaktifan"
            value={deactivateReason}
            onChange={(event) => setDeactivateReason(event.target.value)}
            placeholder="Jelaskan alasan penonaktifan (min. 3 karakter)"
            minLength={3}
            required
          />
        </div>
      </Modal>
      <PaymentAccountEditDialog
        account={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setMessage('Rekening berhasil diperbarui.');
          void loadAccounts();
        }}
      />
    </Panel>
  );
}
