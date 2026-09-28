import { HelpCircle } from 'lucide-react';
import type { PublicFaqItem } from '@/api-clients/account-client';
import { publicContainer } from '../../components/public/public-detail-shared';

/** Tampil bila staf belum menerbitkan FAQ di Konten Publik. */
export const DEFAULT_CLASS_FAQ: PublicFaqItem[] = [
  {
    id: 'default-1',
    order: 1,
    question: 'Apakah kelas ini cocok untuk pemula yang belum pernah mencoba?',
    answer:
      'Ya, instruktur kami akan memberikan panduan penyesuaian gerakan (modifikasi) sesuai tingkat fleksibilitas dan kenyamanan tubuh Anda.',
  },
  {
    id: 'default-2',
    order: 2,
    question: 'Apa yang harus saya siapkan sebelum kelas dimulai?',
    answer:
      'Kenakan pakaian olahraga yang nyaman dan grip socks (kaos kaki antiselip). Datang 15 menit lebih awal untuk persiapan check-in dan pengenalan studio.',
  },
  {
    id: 'default-3',
    order: 3,
    question: 'Bagaimana jika saya perlu membatalkan atau mengubah jadwal?',
    answer:
      'Pembatalan dan permohonan reschedule dapat dilakukan secara mandiri melalui menu Dashboard akun Anda sebelum batas waktu yang ditentukan pada paket Anda.',
  },
];

export function ClassFaqSection({ items }: { items?: PublicFaqItem[] | null }) {
  const list = items && items.length > 0 ? items : DEFAULT_CLASS_FAQ;
  return (
    <section className="border-t border-dd-line bg-dd-paper py-12" aria-labelledby="class-faq-title">
      <div className={`${publicContainer} max-w-4xl`}>
        <div className="text-center">
          <p className="text-xs font-bold tracking-[0.14em] text-dd-forest uppercase">Panduan Kelas</p>
          <h2 id="class-faq-title" className="mt-1 text-2xl font-bold text-dd-ink sm:text-3xl">
            Pertanyaan Seputar Kelas Ini
          </h2>
        </div>
        <div className="mt-8 space-y-4">
          {list.map((entry) => (
            <div
              key={entry.id}
              className="rounded-dd-lg border border-dd-line bg-white p-5 shadow-xs"
            >
              <h3 className="flex items-start gap-2 text-base font-bold text-dd-ink">
                <HelpCircle className="mt-0.5 size-4 shrink-0 text-dd-forest" aria-hidden="true" />
                {entry.question}
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-dd-muted">
                {entry.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
