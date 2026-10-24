import { redirect } from 'next/navigation';

/**
 * Halaman "Tarif" lama memanggil endpoint yang tidak ada. Honor instruktur kini dikelola
 * di Data Master (tab Honor Instruktur); URL lama tetap berlaku dengan pengalihan.
 */
export default function RatesPage() {
  redirect('/master?tab=fees');
}
