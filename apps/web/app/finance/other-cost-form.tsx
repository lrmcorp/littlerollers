'use client';

import { useState } from 'react';
import { Button } from '../components/actions';
import { Panel } from '../components/admin/admin-ui';
import { TextInput } from '../components/forms';
import { Feedback } from '../ui';
import { financeFailureMessage, type FinanceClient } from './finance-client';

const today = () => new Date().toISOString().slice(0, 10);
const CATEGORY = /^[A-Z][A-Z0-9_]{1,63}$/u;

/** Catat satu biaya operasional lain pada tanggal pengeluarannya. */
export function OtherCostForm({
  client,
  branchId,
  onCreated,
}: {
  client: FinanceClient;
  branchId: string;
  onCreated(): void;
}) {
  const [incurredOn, setIncurredOn] = useState(today);
  const [categoryCode, setCategoryCode] = useState('OPERATING_EXPENSE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [failure, setFailure] = useState<string>();

  const valid =
    Boolean(client.createOtherCost) &&
    /^\d{4}-\d{2}-\d{2}$/.test(incurredOn) &&
    CATEGORY.test(categoryCode) &&
    description.trim().length > 0 &&
    Number.isInteger(Number(amount)) &&
    Number(amount) >= 1;

  const save = async () => {
    setBusy(true);
    setMessage(undefined);
    setFailure(undefined);
    try {
      await client.createOtherCost?.({
        branchId,
        incurredOn,
        categoryCode,
        description: description.trim(),
        amountRp: Number(amount),
      });
      setDescription('');
      setAmount('');
      setMessage('Biaya lain tercatat.');
      onCreated();
    } catch (error) {
      setFailure(financeFailureMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel className="space-y-4 p-5">
      <div>
        <h3 className="text-base font-semibold">Catat biaya lain</h3>
        <p className="mt-1 text-sm text-dd-muted">
          Biaya masuk ke laporan sesuai tanggal pengeluarannya. Salah catat? Ubah atau hapus dari daftar.
        </p>
      </div>
      {message && <Feedback kind="status">{message}</Feedback>}
      {failure && <Feedback kind="error">{failure}</Feedback>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TextInput
          label="Tanggal pengeluaran"
          type="date"
          value={incurredOn}
          onChange={(event) => setIncurredOn(event.target.value)}
        />
        <TextInput
          label="Kode kategori"
          value={categoryCode}
          maxLength={64}
          onChange={(event) => setCategoryCode(event.target.value.toUpperCase())}
        />
        <TextInput
          label="Keterangan"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <TextInput
          label="Nominal (Rp)"
          type="number"
          min="1"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </div>
      <Button disabled={busy || !valid} loading={busy} onClick={() => void save()}>
        Simpan biaya
      </Button>
    </Panel>
  );
}
