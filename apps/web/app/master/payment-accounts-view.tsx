'use client';

import { useEffect, useState } from 'react';
import { Feedback, StatusBadge } from '../ui';
import { Button } from '../components/actions';
import { Modal, useAppFeedback } from '../components/app-feedback';
import { useActiveBranchState, useSessionContext } from '../session-context';
import { Textarea, TextInput } from '../components/forms';

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
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, { credentials: 'include', ...init });
  if (!response.ok) throw new Error(String(response.status));
  return response.json() as Promise<T>;
}
export function PaymentAccountsView() {
  const feedback = useAppFeedback();
  const context = useSessionContext();
  const [branchId] = useActiveBranchState();
  const allowed = context?.hasCapability('payment-account:read');
  const canManage = context?.hasCapability('payment-account:manage');
  const [items, setItems] = useState<PaymentAccount[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
  const load = async () => {
    if (!allowed) return;
    setLoading(true);
    try {
      setItems(
        (
          await api<{ items: PaymentAccount[] }>(
            `/payment-accounts${branchId ? `?branchId=${encodeURIComponent(branchId)}` : ''}`,
          )
        ).items,
      );
    } catch {
      setError('Rekening pembayaran belum dapat dimuat.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [branchId, allowed]);
  if (!allowed) return null;
  return (
    <section
      className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
      aria-labelledby="payment-account-title"
    >
      <div className="page-header">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-dd-forest">
          Master pembayaran
        </p>
        <h2 id="payment-account-title" className="mt-2 text-2xl font-semibold">
          Rekening Pembayaran
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-dd-muted">
          Satu rekening aktif per cabang. Nomor rekening selalu dimasking pada daftar dan audit.
        </p>
        <StatusBadge tone="success">Permission terverifikasi</StatusBadge>
      </div>
      {message && <Feedback kind="status">{message}</Feedback>}
      {error && <Feedback kind="error">{error}</Feedback>}
      {items.map((item) => (
        <article
          className="mt-3 flex flex-col gap-3 rounded-dd-md border border-dd-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          key={item.id}
        >
          <span className="grid gap-1">
            <strong>
              {item.bankName} · {item.maskedAccountNumber}
            </strong>
            <small className="text-dd-muted">
              a.n. {item.accountHolderName} · batas {item.paymentWindowHours} jam
            </small>
          </span>
          <span className="flex items-center gap-2">
            <StatusBadge tone={item.active ? 'success' : 'neutral'}>
              {item.active ? 'Aktif' : 'Nonaktif'}
            </StatusBadge>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                void (async () => {
                  setLoading(true);
                  try {
                    setDetail(await api(`/payment-accounts/${item.id}`));
                  } catch {
                    setError('Detail rekening pembayaran belum dapat dimuat.');
                  } finally {
                    setLoading(false);
                  }
                })()
              }
            >
              Lihat detail
            </Button>
            {item.active ? (
              <Button
                type="button"
                variant="ghost"
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
                disabled={!canManage || loading}
                onClick={() => {
                  setReason('');
                  setConfirming({ item, action: 'reactivate' });
                }}
              >
                Aktifkan kembali
              </Button>
            )}
          </span>
        </article>
      ))}
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
              <dt className="text-xs font-bold uppercase tracking-wider text-dd-muted">Cabang</dt>
              <dd className="mt-1 font-semibold">
                {detail.branch?.name ?? detail.branchId}
                {detail.branch?.code ? ` · ${detail.branch.code}` : ''}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-dd-muted">Status</dt>
              <dd className="mt-1">{detail.active ? 'Aktif' : 'Nonaktif'}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-dd-muted">Bank</dt>
              <dd className="mt-1">{detail.bankName}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-dd-muted">
                Nomor rekening
              </dt>
              <dd className="mt-1">{detail.maskedAccountNumber}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-dd-muted">
                Pemilik rekening
              </dt>
              <dd className="mt-1">{detail.accountHolderName}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-dd-muted">
                Transaksi terkait
              </dt>
              <dd className="mt-1">{detail.purchaseCount ?? 0}</dd>
            </div>
          </dl>
        )}
      </Modal>
      {!items.some((item) => item.active) && (
        <form
          className="mt-6 grid gap-4 rounded-dd-lg border border-dd-line bg-dd-surface-muted p-5 sm:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            setLoading(true);
            setError('');
            try {
              await api('/payment-accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  branchId,
                  bankCode: data.get('bankCode'),
                  bankName: data.get('bankName'),
                  accountNumber: data.get('accountNumber'),
                  accountHolderName: data.get('accountHolderName'),
                  paymentWindowHours: Number(data.get('paymentWindowHours')),
                  reason: data.get('reason'),
                }),
              });
              form.reset();
              setMessage('Rekening pembayaran aktif dibuat.');
              await load();
            } catch {
              setError(
                'Rekening gagal dibuat. Periksa data, permission, dan rekening aktif cabang.',
              );
              setLoading(false);
            }
          }}
        >
          <div className="sm:col-span-2">
            <h3 className="text-lg font-semibold">Tambah rekening aktif</h3>
            <p className="mt-1 text-sm text-dd-muted">
              Rekening baru akan menjadi tujuan pembayaran pada cabang aktif.
            </p>
          </div>
          <TextInput label="Kode bank" name="bankCode" placeholder="BCA" required />
          <TextInput label="Nama bank" name="bankName" placeholder="Bank Central Asia" required />
          <TextInput
            label="Nomor rekening"
            name="accountNumber"
            inputMode="numeric"
            placeholder="Contoh: 1234567890"
            minLength={6}
            maxLength={24}
            required
          />
          <TextInput
            label="Nama penerima"
            name="accountHolderName"
            placeholder="Little Rollers"
            required
          />
          <TextInput
            label="Batas pembayaran (jam)"
            name="paymentWindowHours"
            type="number"
            min="1"
            max="168"
            defaultValue="24"
            required
          />
          <TextInput
            label="Alasan"
            name="reason"
            placeholder="Rekening transfer cabang"
            minLength={3}
            required
          />
          <div className="sm:col-span-2">
            <Button type="submit" disabled={!branchId || !canManage || loading}>
              Simpan rekening
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
