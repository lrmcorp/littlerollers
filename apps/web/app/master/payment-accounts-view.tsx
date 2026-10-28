'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Feedback, StatusBadge } from '../ui';
import { Button } from '../components/actions';
import { LifecycleDialog } from '../components/admin/lifecycle-dialog';
import { Modal, useAppFeedback } from '../components/app-feedback';
import { useActiveBranchState, useSessionContext } from '../session-context';
import { SearchInput, Textarea, TextInput } from '../components/forms';
import {
  PaymentAccountEditDialog,
  type EditablePaymentAccount,
} from '../components/admin/payment-account-edit-dialog';

interface PaymentAccount {
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

interface AccountCreateForm {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  paymentWindowHours: number;
  reason: string;
}

const initialCreateForm: AccountCreateForm = {
  bankCode: '',
  bankName: '',
  accountNumber: '',
  accountHolderName: '',
  paymentWindowHours: 24,
  reason: '',
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, { credentials: 'include', ...init });
  if (!response.ok) throw new Error(String(response.status));
  return response.json() as Promise<T>;
}

export function PaymentAccountsView({
  branchId: explicitBranchId,
  canManage: explicitCanManage,
  onAccountsChange,
}: {
  branchId?: string;
  canManage?: boolean;
  onAccountsChange?: (count: number) => void;
} = {}) {
  const feedback = useAppFeedback();
  const context = useSessionContext();
  const [contextBranchId] = useActiveBranchState();
  const branchId = explicitBranchId ?? contextBranchId;
  const allowed = context?.hasCapability('payment-account:read');
  const canManage = explicitCanManage !== undefined ? explicitCanManage : context?.hasCapability('payment-account:manage');
  const activeBranch = context?.activeBranch;

  const [items, setItems] = useState<PaymentAccount[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<AccountCreateForm>(initialCreateForm);

  const [confirming, setConfirming] = useState<{
    item: PaymentAccount;
    action: 'deactivate' | 'reactivate';
  }>();
  const [detail, setDetail] = useState<
    PaymentAccount & {
      branch?: { code: string; name: string; active: boolean };
      purchaseCount?: number;
    }
  >();
  const [reason, setReason] = useState('');
  const [removing, setRemoving] = useState<PaymentAccount | null>(null);
  const [editing, setEditing] = useState<EditablePaymentAccount | null>(null);

  const load = async () => {
    if (!allowed) return;
    setLoading(true);
    try {
      const res = await api<{ items: PaymentAccount[] }>(
        `/payment-accounts${branchId ? `?branchId=${encodeURIComponent(branchId)}` : ''}`,
      );
      setItems(res.items);
      onAccountsChange?.(res.items.filter((a) => a.active).length);
    } catch {
      setError('Rekening pembayaran belum dapat dimuat.');
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id: string) => {
    setLoading(true);
    try {
      setDetail(await api(`/payment-accounts/${id}`));
    } catch {
      setError('Detail rekening pembayaran belum dapat dimuat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [branchId, allowed]);

  if (!allowed) return null;

  const filteredItems = items.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      item.bankName.toLowerCase().includes(q) ||
      item.bankCode.toLowerCase().includes(q) ||
      item.accountHolderName.toLowerCase().includes(q) ||
      item.maskedAccountNumber.toLowerCase().includes(q)
    );
  });

  const isCreateDirty =
    Boolean(createForm.bankCode) ||
    Boolean(createForm.bankName) ||
    Boolean(createForm.accountNumber) ||
    Boolean(createForm.accountHolderName) ||
    createForm.paymentWindowHours !== 24 ||
    Boolean(createForm.reason);

  const handleCloseCreateModal = async () => {
    if (isCreateDirty) {
      const confirmed = await feedback.confirm({
        tone: 'warning',
        title: 'Batalkan penambahan rekening?',
        message: 'Informasi formulir yang sudah diisi akan dihapus.',
        confirmLabel: 'Buang data',
      });
      if (!confirmed) return;
    }
    setCreateForm(initialCreateForm);
    setIsCreateModalOpen(false);
  };

  const handleCreateAccount = async () => {
    if (!branchId || !canManage) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api('/payment-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId,
          bankCode: createForm.bankCode.trim(),
          bankName: createForm.bankName.trim(),
          accountNumber: createForm.accountNumber.trim(),
          accountHolderName: createForm.accountHolderName.trim(),
          paymentWindowHours: Number(createForm.paymentWindowHours),
          reason: createForm.reason.trim(),
        }),
      });
      setIsCreateModalOpen(false);
      setCreateForm(initialCreateForm);
      setMessage('Rekening pembayaran berhasil ditambahkan.');
      await load();
    } catch {
      setError('Rekening gagal dibuat. Periksa data, hak akses, dan rekening aktif cabang.');
      setLoading(false);
    }
  };

  return (
    <section
      className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
      aria-labelledby="payment-account-title"
    >
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[13px] font-bold text-dd-forest">
            Master pembayaran
          </p>
          <div className="mt-2 flex items-center gap-3">
            <h2 id="payment-account-title" className="text-2xl font-semibold">
              Rekening Pembayaran
            </h2>
            <span className="rounded-full bg-dd-surface-muted px-2.5 py-0.5 text-xs font-medium text-dd-muted">
              {items.length} rekening
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-dd-muted">
            Satu rekening aktif per cabang. Nomor rekening selalu dimasking pada tampilan dan audit demi keamanan.
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="primary"
              disabled={loading || !branchId}
              onClick={() => {
                setCreateForm(initialCreateForm);
                setIsCreateModalOpen(true);
              }}
            >
              <Plus className="mr-1.5 size-4" />
              Tambah rekening
            </Button>
          </div>
        )}
      </div>

      {message && (
        <div className="mt-4">
          <Feedback kind="status">{message}</Feedback>
        </div>
      )}
      {error && (
        <div className="mt-4">
          <Feedback kind="error">{error}</Feedback>
        </div>
      )}

      {/* Filter / Instant Search */}
      <div className="my-4 max-w-md">
        <SearchInput
          label="Cari rekening pembayaran"
          placeholder="Cari nama bank, pemilik, atau 4 digit rekening…"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
        />
      </div>

      {/* Full-Width CRUD Table */}
      {items.length === 0 ? (
        <div className="mt-4 rounded-dd-md border border-dashed border-dd-line p-8 text-center">
          <p className="text-sm font-semibold text-dd-ink">Belum ada rekening pembayaran</p>
          <p className="mt-1 text-xs text-dd-muted">
            Tambahkan rekening bank untuk menerima transfer pembayaran pesanan paket pada cabang ini.
          </p>
          {canManage && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="mt-4"
              disabled={loading || !branchId}
              onClick={() => {
                setCreateForm(initialCreateForm);
                setIsCreateModalOpen(true);
              }}
            >
              <Plus className="mr-1.5 size-4" />
              Tambah rekening
            </Button>
          )}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="mt-4 rounded-dd-md border border-dashed border-dd-line p-8 text-center">
          <p className="text-sm font-semibold text-dd-ink">Tidak ada rekening yang cocok</p>
          <p className="mt-1 text-xs text-dd-muted">
            Tidak ditemukan rekening dengan kata kunci &ldquo;{searchTerm}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-dd-line text-[13px] text-dd-muted">
              <tr>
                <th className="w-12 pb-3 pt-2 font-semibold pr-4">No</th>
                <th className="min-w-[14rem] pb-3 pt-2 font-semibold pr-6">Bank &amp; No. Rekening</th>
                <th className="min-w-[14rem] pb-3 pt-2 font-semibold pr-6">Nama Pemilik</th>
                <th className="min-w-[8rem] pb-3 pt-2 font-semibold pr-6">Batas Pembayaran</th>
                <th className="w-28 pb-3 pt-2 font-semibold pr-6">Status</th>
                <th className="w-64 pb-3 pt-2 text-right font-semibold">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dd-line">
              {filteredItems.map((item, idx) => (
                <tr key={item.id} className="hover:bg-dd-surface-muted/50">
                  <td className="py-3.5 pr-4 text-xs text-dd-muted">{idx + 1}</td>
                  <td className="py-3.5 pr-6">
                    <div className="font-medium text-dd-ink">{item.bankName}</div>
                    <div className="font-mono text-xs text-dd-muted">
                      {item.maskedAccountNumber}
                    </div>
                  </td>
                  <td className="py-3.5 pr-6 text-sm text-dd-ink">{item.accountHolderName}</td>
                  <td className="py-3.5 pr-6 text-xs text-dd-muted">{item.paymentWindowHours} jam</td>
                  <td className="py-3.5 pr-6">
                    <StatusBadge tone={item.active ? 'success' : 'neutral'}>
                      {item.active ? 'Aktif' : 'Nonaktif'}
                    </StatusBadge>
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={loading}
                        onClick={() => void loadDetail(item.id)}
                      >
                        Lihat detail
                      </Button>
                      {canManage && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={loading}
                          onClick={() => setEditing(item)}
                        >
                          Ubah
                        </Button>
                      )}
                      {item.active ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={!canManage || loading}
                          onClick={() => {
                            setReason('');
                            setConfirming({ item, action: 'deactivate' });
                          }}
                        >
                          Nonaktifkan
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={!canManage || loading}
                          onClick={() => {
                            setReason('');
                            setConfirming({ item, action: 'reactivate' });
                          }}
                        >
                          Aktifkan kembali
                        </Button>
                      )}
                      {canManage && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-dd-danger hover:text-dd-danger"
                          aria-label={`Hapus rekening ${item.bankName} ${item.maskedAccountNumber}`}
                          disabled={loading}
                          onClick={() => setRemoving(item)}
                        >
                          Hapus
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Dialog Tambah Rekening */}
      <Modal
        open={isCreateModalOpen}
        title="Tambah rekening pembayaran"
        description="Rekening baru akan didaftarkan sebagai tujuan transfer pada cabang aktif."
        busy={loading}
        dirty={isCreateDirty}
        onDirtyClose={() =>
          feedback.confirm({
            tone: 'warning',
            title: 'Batalkan penambahan rekening?',
            message: 'Informasi formulir yang sudah diisi akan dihapus.',
            confirmLabel: 'Buang data',
          })
        }
        onClose={() => {
          setCreateForm(initialCreateForm);
          setIsCreateModalOpen(false);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => void handleCloseCreateModal()}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={loading}
              disabled={
                !branchId ||
                !canManage ||
                !createForm.bankCode.trim() ||
                !createForm.bankName.trim() ||
                !createForm.accountHolderName.trim() ||
                createForm.accountNumber.trim().length < 6 ||
                createForm.reason.trim().length < 3
              }
              onClick={() => void handleCreateAccount()}
            >
              Simpan rekening
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          {activeBranch && (
            <div className="rounded-dd-md bg-dd-surface-muted p-3 text-xs text-dd-muted">
              Cabang aktif: <strong className="text-dd-ink">{activeBranch.name}</strong>{' '}
              ({activeBranch.code})
            </div>
          )}
          {items.some((item) => item.active) && (
            <Feedback kind="info">
              Cabang ini saat ini telah memiliki rekening aktif. Sistem memberlakukan satu rekening aktif per cabang.
            </Feedback>
          )}
          <TextInput
            label="Kode bank"
            placeholder="Contoh: BCA, MANDIRI, BNI"
            value={createForm.bankCode}
            maxLength={32}
            onChange={(e) =>
              setCreateForm((prev) => ({ ...prev, bankCode: e.target.value.toUpperCase() }))
            }
            required
          />
          <TextInput
            label="Nama bank"
            placeholder="Contoh: Bank Central Asia"
            value={createForm.bankName}
            maxLength={64}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, bankName: e.target.value }))}
            required
          />
          <TextInput
            label="Nomor rekening"
            inputMode="numeric"
            placeholder="Contoh: 1234567890"
            value={createForm.accountNumber}
            minLength={6}
            maxLength={24}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
            required
          />
          <TextInput
            label="Nama penerima / pemilik rekening"
            placeholder="Contoh: Daily Dose Pilates"
            value={createForm.accountHolderName}
            maxLength={128}
            onChange={(e) =>
              setCreateForm((prev) => ({ ...prev, accountHolderName: e.target.value }))
            }
            required
          />
          <TextInput
            label="Batas pembayaran (jam)"
            type="number"
            min="1"
            max="168"
            value={createForm.paymentWindowHours}
            onChange={(e) =>
              setCreateForm((prev) => ({
                ...prev,
                paymentWindowHours: Number(e.target.value) || 24,
              }))
            }
            required
          />
          <TextInput
            label="Alasan pembuatan"
            placeholder="Contoh: Rekening operasional transfer cabang"
            value={createForm.reason}
            minLength={3}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, reason: e.target.value }))}
            required
          />
        </div>
      </Modal>

      {/* Modal Dialog Ubah Rekening */}
      <PaymentAccountEditDialog
        account={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setMessage('Rekening berhasil diperbarui.');
          void load();
        }}
      />

      {/* Modal Dialog Konfirmasi Status Rekening */}
      <Modal
        open={Boolean(confirming)}
        title={
          confirming?.action === 'reactivate'
            ? 'Aktifkan kembali rekening'
            : 'Nonaktifkan rekening pembayaran'
        }
        busy={loading}
        dirty={Boolean(reason)}
        onDirtyClose={() =>
          feedback.confirm({
            tone: 'warning',
            title: 'Batalkan penonaktifan rekening?',
            message: 'Alasan yang belum diproses akan dihapus.',
            confirmLabel: 'Buang alasan',
          })
        }
        onClose={() => {
          setReason('');
          setConfirming(undefined);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() =>
                void (async () => {
                  if (
                    reason &&
                    !(await feedback.confirm({
                      tone: 'warning',
                      title: 'Batalkan penonaktifan rekening?',
                      message: 'Alasan yang belum diproses akan dihapus.',
                      confirmLabel: 'Buang alasan',
                    }))
                  )
                    return;
                  setReason('');
                  setConfirming(undefined);
                })()
              }
            >
              Batal
            </Button>
            <Button
              type="button"
              variant={confirming?.action === 'reactivate' ? 'primary' : 'danger'}
              loading={loading}
              disabled={!confirming || reason.trim().length < 3}
              onClick={async () => {
                if (!confirming) return;
                setLoading(true);
                try {
                  await api(`/payment-accounts/${confirming.item.id}/${confirming.action}`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Idempotency-Key': crypto.randomUUID(),
                    },
                    body: JSON.stringify({
                      expectedVersion: confirming.item.version,
                      reason: reason.trim(),
                    }),
                  });
                  setMessage(
                    confirming.action === 'reactivate'
                      ? 'Rekening berhasil diaktifkan kembali.'
                      : 'Rekening dinonaktifkan.',
                  );
                  setReason('');
                  setConfirming(undefined);
                  await load();
                } catch {
                  setError(
                    confirming.action === 'reactivate'
                      ? 'Rekening tidak dapat diaktifkan. Pastikan cabang aktif dan belum mempunyai rekening aktif lain.'
                      : 'Rekening tidak dapat dinonaktifkan. Pastikan tidak ada pesanan terbuka.',
                  );
                  setLoading(false);
                }
              }}
            >
              {confirming?.action === 'reactivate'
                ? 'Konfirmasi aktifkan'
                : 'Konfirmasi nonaktifkan'}
            </Button>
          </div>
        }
      >
        {confirming && (
          <>
            <p className="text-sm text-dd-muted">
              Rekening {confirming.item.bankName} · {confirming.item.maskedAccountNumber} akan{' '}
              {confirming.action === 'reactivate' ? 'diaktifkan kembali' : 'dinonaktifkan'}.
              {confirming.action === 'deactivate' && ' Pesanan terbuka dapat terpengaruh.'}
            </p>
            <Textarea
              label="Alasan wajib"
              wrapperClassName="mt-4"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              minLength={3}
              required
            />
          </>
        )}
      </Modal>

      {/* Modal Dialog Detail Rekening */}
      <Modal
        open={Boolean(detail)}
        title="Detail rekening pembayaran"
        onClose={() => setDetail(undefined)}
        footer={
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={() => setDetail(undefined)}>
              Tutup
            </Button>
          </div>
        }
      >
        {detail && (
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[13px] font-bold text-dd-muted">Cabang</dt>
              <dd className="mt-1 font-semibold">
                {detail.branch?.name ?? detail.branchId}
                {detail.branch?.code ? ` · ${detail.branch.code}` : ''}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] font-bold text-dd-muted">Status</dt>
              <dd className="mt-1">
                <StatusBadge tone={detail.active ? 'success' : 'neutral'}>
                  {detail.active ? 'Aktif' : 'Nonaktif'}
                </StatusBadge>
              </dd>
            </div>
            <div>
              <dt className="text-[13px] font-bold text-dd-muted">Bank</dt>
              <dd className="mt-1">{detail.bankName}</dd>
            </div>
            <div>
              <dt className="text-[13px] font-bold text-dd-muted">
                Nomor rekening
              </dt>
              <dd className="mt-1 font-mono">{detail.maskedAccountNumber}</dd>
            </div>
            <div>
              <dt className="text-[13px] font-bold text-dd-muted">
                Pemilik rekening
              </dt>
              <dd className="mt-1">{detail.accountHolderName}</dd>
            </div>
            <div>
              <dt className="text-[13px] font-bold text-dd-muted">
                Batas pembayaran
              </dt>
              <dd className="mt-1">{detail.paymentWindowHours} jam</dd>
            </div>
            <div>
              <dt className="text-[13px] font-bold text-dd-muted">
                Transaksi terkait
              </dt>
              <dd className="mt-1">{detail.purchaseCount ?? 0}</dd>
            </div>
          </dl>
        )}
      </Modal>
      <LifecycleDialog
        request={
          removing
            ? {
                kind: 'payment-account',
                id: removing.id,
                name: `${removing.bankName} · ${removing.maskedAccountNumber}`,
                action: 'delete',
              }
            : null
        }
        onClose={() => setRemoving(null)}
        onDone={async (done) => {
          setRemoving(null);
          setError('');
          setMessage(done);
          await load();
        }}
      />
    </section>
  );
}
