'use client';

import { useState } from 'react';
import { formatRupiah } from '../../../lib/formatters';

/** Angka dari isian petugas (titik, koma, dan "Rp" diabaikan); kosong atau tanpa angka menjadi null. */
export function parseRupiahInput(value: string): number | null {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) : null;
}

export type AmountDifference =
  | { kind: 'EMPTY'; text: string }
  | { kind: 'EQUAL'; text: string }
  | { kind: 'LESS'; text: string; differenceRp: number }
  | { kind: 'MORE'; text: string; differenceRp: number };

/** Selisih nominal bukti terhadap nominal yang diminta, ditulis dengan kata supaya tidak perlu dihitung petugas. */
export function describeAmountDifference(expectedRp: number, seenRp: number | null): AmountDifference {
  if (seenRp === null)
    return { kind: 'EMPTY', text: 'Isi nominal yang terlihat di bukti untuk melihat selisihnya.' };
  if (seenRp === expectedRp) return { kind: 'EQUAL', text: 'Nominal di bukti sama persis dengan yang diminta.' };
  if (seenRp < expectedRp) {
    const differenceRp = expectedRp - seenRp;
    return { kind: 'LESS', differenceRp, text: `Kurang ${formatRupiah(differenceRp)} dari nominal yang diminta.` };
  }
  const differenceRp = seenRp - expectedRp;
  return { kind: 'MORE', differenceRp, text: `Lebih ${formatRupiah(differenceRp)} dari nominal yang diminta.` };
}

const tone: Record<AmountDifference['kind'], string> = {
  EMPTY: 'border-dd-line bg-dd-surface-muted text-dd-muted',
  EQUAL: 'border-dd-success/40 bg-dd-success-soft text-dd-success',
  LESS: 'border-dd-danger/40 bg-dd-danger-soft text-dd-danger',
  MORE: 'border-dd-warning/40 bg-dd-warning-soft text-dd-warning',
};

/**
 * Nominal paket (yang diminta, kode unik sudah termasuk) disandingkan dengan nominal yang dibaca petugas dari
 * gambar bukti. Sistem tidak menyimpan nominal pada bukti, jadi angkanya diisi petugas; isian ini hanya alat
 * bantu pemeriksaan dan tidak dikirim ke server.
 */
export function PaymentAmountCheck({ expectedRp }: { expectedRp: number }) {
  const [typed, setTyped] = useState('');
  const result = describeAmountDifference(expectedRp, parseRupiahInput(typed));
  return (
    <div role="group" aria-label="Perbandingan nominal" className="space-y-3 rounded-dd-lg border border-dd-line p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-dd-muted">Nominal yang diminta</p>
          <p className="mt-1 text-3xl font-bold text-dd-ink">{formatRupiah(expectedRp)}</p>
        </div>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-dd-muted">
            Nominal yang terlihat di bukti (Rp)
          </span>
          <input
            inputMode="numeric"
            autoComplete="off"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder="Ketik angka dari bukti"
            className="mt-1 w-full rounded-dd-md border border-dd-border-interactive bg-white px-3 py-2 text-2xl font-bold text-dd-ink"
          />
        </label>
      </div>
      <p role="status" className={`rounded-dd-md border p-3 text-sm font-semibold ${tone[result.kind]}`}>
        {result.text}
      </p>
    </div>
  );
}
