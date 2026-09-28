'use client';

import { useEffect, useState } from 'react';
import { ApiError, apiFetch } from '../../lib/api-client';
import { Feedback } from '../../ui';
import { Button } from '../actions';
import { Modal } from '../app-feedback';
import { TextInput } from '../forms';

export interface EditablePaymentAccount {
  id: string;
  bankName: string;
  accountHolderName: string;
  maskedAccountNumber: string;
}

/** Ubah data rekening pembayaran. Nomor rekening dikosongkan bila tidak diganti. */
export function PaymentAccountEditDialog({
  account,
  onClose,
  onSaved,
}: {
  account: EditablePaymentAccount | null;
  onClose(): void;
  onSaved(): void;
}) {
  const [bankName, setBankName] = useState('');
  const [holder, setHolder] = useState('');
  const [number, setNumber] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!account) return;
    setBankName(account.bankName);
    setHolder(account.accountHolderName);
    setNumber('');
    setError('');
  }, [account]);

  const valid =
    bankName.trim().length > 0 &&
    bankName.trim().length <= 64 &&
    holder.trim().length > 0 &&
    holder.trim().length <= 128 &&
    (number.trim() === '' || /^[\d\s-]{6,30}$/.test(number.trim()));
  const changed =
    account !== null &&
    (bankName.trim() !== account.bankName ||
      holder.trim() !== account.accountHolderName ||
      number.trim() !== '');

  const save = async () => {
    if (!account) return;
    setBusy(true);
    setError('');
    try {
      await apiFetch(`/payment-accounts/${encodeURIComponent(account.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          bankName: bankName.trim(),
          accountHolderName: holder.trim(),
          ...(number.trim() ? { accountNumber: number.trim() } : {}),
        }),
        label: 'Menyimpan rekening…',
      });
      onSaved();
      onClose();
    } catch (cause) {
      const status = cause instanceof ApiError ? cause.status : 0;
      setError(
        status === 400 || status === 422
          ? 'Data rekening belum valid. Nomor rekening harus 6–24 digit.'
          : status === 403 || status === 404
            ? 'Anda tidak memiliki izin mengubah rekening ini.'
            : 'Rekening belum dapat disimpan. Coba lagi.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={account !== null}
      title="Ubah rekening pembayaran"
      description={account ? `Rekening saat ini: ${account.maskedAccountNumber}` : undefined}
      busy={busy}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" disabled={busy} onClick={onClose}>
            Batal
          </Button>
          <Button
            type="button"
            loading={busy}
            disabled={!valid || !changed}
            onClick={() => void save()}
          >
            Simpan perubahan
          </Button>
        </div>
      }
    >
      <div className="grid gap-4">
        <TextInput
          label="Nama bank"
          value={bankName}
          maxLength={64}
          onChange={(event) => setBankName(event.target.value)}
        />
        <TextInput
          label="Nama pemilik rekening"
          value={holder}
          maxLength={128}
          onChange={(event) => setHolder(event.target.value)}
        />
        <TextInput
          label="Nomor rekening baru (opsional)"
          value={number}
          inputMode="numeric"
          maxLength={30}
          placeholder="Kosongkan bila nomor tidak berubah"
          onChange={(event) => setNumber(event.target.value)}
        />
        <Feedback kind="info">
          Pesanan yang sudah dibuat tetap memakai data rekening yang berlaku saat ini; pelanggan
          berikutnya melihat data terbaru.
        </Feedback>
        {error && <Feedback kind="error">{error}</Feedback>}
      </div>
    </Modal>
  );
}
