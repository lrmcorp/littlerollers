'use client';

import { useEffect, useState } from 'react';
import { Feedback, StatusBadge } from '../ui';
import { Dialog } from '../components/admin/admin-ui';
import { useActiveBranchState, useSessionContext } from '../session-context';

interface PaymentAccount {
  id: string;
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
  const context = useSessionContext();
  const [branchId] = useActiveBranchState();
  const allowed = context?.hasCapability('payment-account:read');
  const canManage = context?.hasCapability('payment-account:manage');
  const [items, setItems] = useState<PaymentAccount[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState<PaymentAccount>();
  const [reason, setReason] = useState('');
  const load = async () => {
    if (!branchId || !allowed) return;
    setLoading(true);
    try {
      setItems(
        (
          await api<{ items: PaymentAccount[] }>(
            `/payment-accounts?branchId=${encodeURIComponent(branchId)}`,
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
        <article className="order-row" key={item.id}>
          <span>
            <strong>
              {item.bankName} · {item.maskedAccountNumber}
            </strong>
            <small>
              a.n. {item.accountHolderName} · batas {item.paymentWindowHours} jam
            </small>
          </span>
          <span>
            <StatusBadge tone={item.active ? 'success' : 'neutral'}>
              {item.active ? 'Aktif' : 'Nonaktif'}
            </StatusBadge>
            {item.active && (
              <button
                className="button-quiet"
                disabled={!canManage || loading}
                onClick={() => {
                  setReason('');
                  setConfirming(item);
                }}
              >
                Nonaktifkan
              </button>
            )}
          </span>
        </article>
      ))}
      {confirming && (
        <Dialog
          open
          title="Nonaktifkan rekening pembayaran"
          onClose={() => setConfirming(undefined)}
        >
          <p className="text-sm text-dd-muted">
            Rekening {confirming.bankName} · {confirming.maskedAccountNumber} akan dinonaktifkan
            pada cabang aktif. Pesanan terbuka dapat terpengaruh.
          </p>
          <label className="mt-4 block">
            Alasan wajib
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              minLength={3}
            />
          </label>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className="button-quiet" onClick={() => setConfirming(undefined)}>
              Batal
            </button>
            <button
              type="button"
              disabled={loading || reason.trim().length < 3}
              onClick={async () => {
                setLoading(true);
                try {
                  await api(`/payment-accounts/${confirming.id}/deactivate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      expectedVersion: confirming.version,
                      reason: reason.trim(),
                    }),
                  });
                  setMessage('Rekening dinonaktifkan.');
                  setConfirming(undefined);
                  await load();
                } catch {
                  setError(
                    'Rekening tidak dapat dinonaktifkan. Pastikan tidak ada pesanan terbuka.',
                  );
                  setLoading(false);
                }
              }}
            >
              Konfirmasi nonaktifkan
            </button>
          </div>
        </Dialog>
      )}
      {!items.some((item) => item.active) && (
        <form
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
          <h2>Tambah rekening aktif</h2>
          <label>
            Kode bank
            <input name="bankCode" placeholder="BCA" required />
          </label>
          <label>
            Nama bank
            <input name="bankName" placeholder="Bank Central Asia" required />
          </label>
          <label>
            Nomor rekening
            <input
              name="accountNumber"
              inputMode="numeric"
              placeholder="Contoh: 1234567890"
              minLength={6}
              maxLength={24}
              required
            />
          </label>
          <label>
            Nama penerima
            <input name="accountHolderName" placeholder="Daily Dose Pilates" required />
          </label>
          <label>
            Batas pembayaran (jam)
            <input
              name="paymentWindowHours"
              type="number"
              min="1"
              max="168"
              defaultValue="24"
              required
            />
          </label>
          <label>
            Alasan
            <input name="reason" placeholder="Rekening transfer cabang" minLength={3} required />
          </label>
          <button disabled={!branchId || !canManage || loading}>Simpan rekening</button>
        </form>
      )}
    </section>
  );
}
