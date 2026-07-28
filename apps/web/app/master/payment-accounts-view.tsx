'use client';

import { useEffect, useState } from 'react';
import { Feedback, StatusBadge } from '../ui';
import { Button, Dialog } from '../components/admin/admin-ui';
import { useActiveBranchState, useSessionContext } from '../session-context';
import { Textarea, TextInput } from '../components/forms';

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
            {item.active && (
              <Button
                type="button"
                variant="quiet"
                disabled={!canManage || loading}
                onClick={() => {
                  setReason('');
                  setConfirming(item);
                }}
              >
                Nonaktifkan
              </Button>
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
          <Textarea
            label="Alasan wajib"
            wrapperClassName="mt-4"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            minLength={3}
            required
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setConfirming(undefined)}>
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
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
            </Button>
          </div>
        </Dialog>
      )}
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
            placeholder="Daily Dose Pilates"
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
