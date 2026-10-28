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

/** Selisih nominal bukti terhadap nominal paket, ditulis dengan kata supaya petugas tidak perlu menghitung sendiri. */
export function describeAmountDifference(
  expectedRp: number,
  seenRp: number | null,
): AmountDifference {
  if (seenRp === null)
    return { kind: 'EMPTY', text: 'Isi nominal yang terlihat di bukti untuk melihat selisihnya.' };
  if (seenRp === expectedRp)
    return {
      kind: 'EQUAL',
      text: 'Nominal pada bukti sama persis dengan nominal paket yang diminta.',
    };
  if (seenRp < expectedRp) {
    const differenceRp = expectedRp - seenRp;
    return {
      kind: 'LESS',
      differenceRp,
      text: `Selisih ${formatRupiah(differenceRp)} kurang dari nominal paket. Kurang ${formatRupiah(differenceRp)} dari nominal yang diminta. Kode unik mungkin tidak terbawa.`,
    };
  }
  const differenceRp = seenRp - expectedRp;
  return {
    kind: 'MORE',
    differenceRp,
    text: `Selisih ${formatRupiah(differenceRp)} lebih dari nominal paket. Lebih ${formatRupiah(differenceRp)} dari nominal yang diminta.`,
  };
}

const toneStyles: Record<AmountDifference['kind'], string> = {
  EMPTY: 'border-l-dd-border-interactive bg-[#f6f7f9] text-dd-muted',
  EQUAL: 'border-l-dd-forest bg-[#f4f8f5] text-[#1c402e]',
  LESS: 'border-l-red-600 bg-[#fff5f5] text-red-900',
  MORE: 'border-l-amber-600 bg-[#fffbf0] text-amber-900',
};

/**
 * Nominal paket (yang diminta, kode unik sudah termasuk) disandingkan berdampingan dengan nominal yang dibaca
 * petugas dari gambar bukti sebagai elemen terbesar di layar (Tiket T-21 / Mockup Papan 16).
 */
export function PaymentAmountCheck({
  expectedRp,
  initialSeenRp,
}: {
  expectedRp: number;
  initialSeenRp?: number | null;
}) {
  const [typed, setTyped] = useState(() => (initialSeenRp ? String(initialSeenRp) : ''));
  const parsed = parseRupiahInput(typed);
  const result = describeAmountDifference(expectedRp, parsed);

  return (
    <div
      role="group"
      aria-label="Perbandingan nominal"
      className={`space-y-4 rounded-dd-xl border-y border-r border-dd-border-interactive border-l-4 p-5 shadow-sm sm:p-6 ${toneStyles[result.kind]}`}
    >
      <div className="grid gap-6 md:grid-cols-[1fr_1fr_1.4fr] md:items-center">
        {/* Kolom 1: Nominal pada paket */}
        <div className="space-y-1">
          <p className="text-[13px] font-bold text-dd-muted">Nominal pada paket</p>
          <p className="text-3xl font-black tracking-tight text-dd-ink sm:text-4xl tabular-nums">
            {formatRupiah(expectedRp)}
          </p>
        </div>

        {/* Kolom 2: Nominal pada bukti */}
        <div className="space-y-1">
          <label className="block">
            <span className="text-[13px] font-bold text-dd-muted">
              Nominal pada bukti (Rp)
              <span className="sr-only"> / Nominal yang terlihat di bukti</span>
            </span>
            <input
              inputMode="numeric"
              autoComplete="off"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder="Ketik angka bukti"
              aria-label="Nominal yang terlihat di bukti"
              className="mt-1 w-full rounded-dd-md border border-dd-border-interactive bg-white px-3 py-1.5 text-3xl font-black tracking-tight text-dd-ink shadow-inner sm:text-4xl tabular-nums focus:border-dd-forest focus:outline-none focus:ring-2 focus:ring-dd-forest/20"
            />
          </label>
        </div>

        {/* Kolom 3: Penjelasan selisih dengan kata */}
        <div className="border-t border-dd-line pt-3 md:border-l md:border-t-0 md:pl-5 md:pt-0">
          <p className="text-[13px] font-bold text-dd-muted mb-1">Status selisih</p>
          <p role="status" className="text-sm font-bold leading-relaxed sm:text-base">
            {result.text}
          </p>
        </div>
      </div>
    </div>
  );
}
