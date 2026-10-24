import { HelpCircle } from 'lucide-react';
import type { PublicFaqItem } from '@/api-clients/account-client';

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
      'Seluruh mesin reformer dan perlengkapan latihan disediakan lengkap oleh studio. Anda cukup mengenakan pakaian olahraga yang nyaman dan wajib memakai grip socks (kaus kaki antiselip), serta datang 15 menit lebih awal untuk persiapan check-in.',
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
    <section className="border-t border-ed-line bg-ed-cream py-12" aria-labelledby="class-faq-title">
      <div className="ed-wrap max-w-4xl">
        <div className="text-center">
          <p className="ed-eyebrow text-ed-green">Panduan Kelas</p>
          <h2 id="class-faq-title" className="mt-2 text-2xl font-bold tracking-tight text-ed-ink sm:text-3xl">
            Pertanyaan Seputar Kelas Ini
          </h2>
        </div>
        <div className="mt-8 space-y-4">
          {list.map((entry) => (
            <div
              key={entry.id}
              className="rounded-none border border-ed-line bg-white p-6 shadow-none"
            >
              <h3 className="flex items-start gap-2.5 text-base font-bold text-ed-ink">
                <HelpCircle className="mt-0.5 size-4 shrink-0 text-ed-green" aria-hidden="true" />
                {entry.question}
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ed-muted">
                {entry.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
