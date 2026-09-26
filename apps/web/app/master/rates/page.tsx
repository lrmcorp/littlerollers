import { redirect } from 'next/navigation';

/**
 * Halaman "Tarif" lama memanggil endpoint yang tidak ada. Honor instruktur dan proyeksi kini dikelola
 * di Data Master (tab Honor dan Proyeksi); URL lama tetap berlaku dengan pengalihan.
 */
export default function RatesPage() {
  redirect('/master?tab=fees');
}
