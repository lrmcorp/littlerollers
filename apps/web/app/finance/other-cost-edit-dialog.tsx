'use client';

import { useEffect, useState } from 'react';
import { Feedback } from '../ui';
import { Button } from '../components/actions';
import { Modal } from '../components/app-feedback';
import { Textarea, TextInput } from '../components/forms';
import { financeFailureMessage, type OtherCostItem, type OtherCostUpdate } from './finance-client';

const CATEGORY = /^[A-Z][A-Z0-9_]{1,63}$/u;

/** Ubah tanggal, kategori, keterangan, atau nominal biaya lain. */
export function OtherCostEditDialog({
  cost,
  onSave,
  onClose,
  onSaved,
}: {
  cost: OtherCostItem | null;
  onSave(id: string, input: OtherCostUpdate): Promise<unknown>;
  onClose(): void;
  onSaved(): void;
}) {
  const [incurredOn, setIncurredOn] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cost) return;
    setIncurredOn(cost.incurredOn);
    setCategory(cost.category);
    setDescription(cost.description);
    setAmount(String(cost.amountRp));
    setError('');
  }, [cost]);

  const amountValue = Number(amount);
  const valid =
    /^\d{4}-\d{2}-\d{2}$/.test(incurredOn) &&
    CATEGORY.test(category.trim().toUpperCase()) &&
    description.trim().length > 0 &&
    Number.isInteger(amountValue) &&
    amountValue > 0;
  const changed =
    cost !== null &&
    (incurredOn !== cost.incurredOn ||
      category.trim().toUpperCase() !== cost.category ||
      description.trim() !== cost.description ||
      amountValue !== cost.amountRp);

  const save = async () => {
    if (!cost) return;
    setBusy(true);
    setError('');
    try {
      await onSave(cost.id, {
        incurredOn,
        category: category.trim().toUpperCase(),
        description: description.trim(),
        amountRp: amountValue,
      });
      onSaved();
      onClose();
    } catch (cause) {
      setError(financeFailureMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={cost !== null}
      title="Ubah biaya operasional"
      description={cost ? cost.branchName : undefined}
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
          label="Tanggal pengeluaran"
          type="date"
          value={incurredOn}
          onChange={(event) => setIncurredOn(event.target.value)}
        />
        <TextInput
          label="Kode kategori"
          value={category}
          maxLength={64}
          onChange={(event) => setCategory(event.target.value.toUpperCase())}
          description="Huruf besar, angka, dan garis bawah; diawali huruf."
        />
        <Textarea
          label="Keterangan"
          value={description}
          maxLength={2000}
          onChange={(event) => setDescription(event.target.value)}
        />
        <TextInput
          label="Nominal (Rp)"
          type="number"
          min={1}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        {error && <Feedback kind="error">{error}</Feedback>}
      </div>
    </Modal>
  );
}
