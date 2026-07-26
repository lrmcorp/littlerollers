import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PublicFooter } from '../../components/public/public-footer';
import { PublicHeader } from '../../components/public/public-header';

const classDetails = {
  'reformer-pilates': {
    title: 'Reformer Pilates',
    image: '/images/public/classes/reformer-pilates.png',
    shortDescription:
      'Latihan seluruh tubuh dengan reformer untuk meningkatkan kekuatan, kontrol, dan fleksibilitas.',
    description:
      'Reformer Pilates memadukan gerak terkontrol, resistance, dan presisi untuk membantu membangun kekuatan sekaligus memperbaiki postur serta keseimbangan.',
    level: 'Semua level',
    duration: '50 menit',
    equipment: 'Mesin reformer',
    benefits: [
      'Memperbaiki postur dan alignment',
      'Membangun kekuatan inti',
      'Meningkatkan fleksibilitas dan mobilitas',
      'Mengembangkan kontrol tubuh',
    ],
  },
  'mat-pilates': {
    title: 'Mat Pilates',
    image: '/images/public/classes/mat-pilates.png',
    shortDescription:
      'Latihan Pilates yang berfokus pada kekuatan inti, stabilitas, dan kontrol gerak.',
    description:
      'Mat Pilates menggunakan berat tubuh dan gerak terkontrol untuk meningkatkan kekuatan, fleksibilitas, dan kesadaran tubuh.',
    level: 'Pemula',
    duration: '50 menit',
    equipment: 'Matras Pilates',
    benefits: [
      'Menguatkan otot inti',
      'Meningkatkan keseimbangan',
      'Memperkuat kesadaran tubuh',
      'Mendukung pola gerak yang sehat',
    ],
  },
  'barre-pilates': {
    title: 'Barre',
    image: '/images/public/classes/mat-pilates.png',
    shortDescription: 'Perpaduan Pilates dan gerak fungsional untuk stabilitas serta daya tahan.',
    description:
      'Barre memadukan latihan Pilates terkontrol dengan gerak fungsional untuk menciptakan latihan yang seimbang.',
    level: 'Pemula–menengah',
    duration: '50 menit',
    equipment: 'Barre',
    benefits: [
      'Memperbaiki postur',
      'Menguatkan otot',
      'Meningkatkan daya tahan',
      'Meningkatkan kesadaran tubuh',
    ],
  },
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return Object.keys(classDetails).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const classItem = classDetails[slug as keyof typeof classDetails];

  if (!classItem) {
    return {
      title: 'Kelas Tidak Ditemukan | Daily Dose Pilates',
    };
  }

  return {
    title: `${classItem.title} | Daily Dose Pilates`,
    description: classItem.shortDescription,
  };
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const classItem = classDetails[slug as keyof typeof classDetails];

  if (!classItem) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#173329]">
      <a
        href="#main"
        className="sr-only fixed left-5 top-5 z-50 rounded-full bg-[#396552] px-5 py-3 text-white focus:not-sr-only"
      >
        Langsung ke konten
      </a>

      <PublicHeader />

      <main id="main">
        <section className="px-6 pb-20 pt-20 lg:px-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm tracking-[0.25em] text-[#396552] uppercase">Kelas Daily Dose</p>

              <h1 className="mt-5 font-serif text-5xl leading-tight lg:text-7xl">
                {classItem.title}
              </h1>

              <p className="mt-8 max-w-xl text-lg leading-relaxed text-gray-600">
                {classItem.shortDescription}
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href={`/sign-in?returnTo=${encodeURIComponent(`/classes?class=${slug}#schedule`)}`}
                  className="rounded-full bg-[#396552] px-8 py-4 text-white transition hover:bg-[#1f4435]"
                >
                  Pilih Kelas
                </Link>

                <Link
                  href="/locations"
                  className="rounded-full border border-[#396552] px-8 py-4 text-[#396552]"
                >
                  Temukan Studio
                </Link>
              </div>
            </div>

            <div className="relative h-[450px] overflow-hidden rounded-[32px]">
              <Image
                src={classItem.image}
                alt={classItem.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="px-6 py-16 lg:px-20">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {[
              {
                title: 'Level',
                value: classItem.level,
              },
              {
                title: 'Durasi',
                value: classItem.duration,
              },
              {
                title: 'Peralatan',
                value: classItem.equipment,
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] bg-white p-8 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-[#396552]">{item.title}</p>

                <p className="mt-3 font-serif text-2xl">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-16 lg:px-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm tracking-[0.25em] text-[#396552] uppercase">Tentang kelas</p>

              <h2 className="mt-4 font-serif text-4xl">Bergerak dengan tujuan.</h2>
            </div>

            <p className="text-lg leading-relaxed text-gray-600">{classItem.description}</p>
          </div>
        </section>

        <section className="bg-[#f5f0e7] px-6 py-20 lg:px-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-serif text-4xl">Manfaat</h2>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {classItem.benefits.map((benefit) => (
                <div key={benefit} className="rounded-2xl bg-white p-6">
                  <span className="text-[#396552]">✓</span>

                  <span className="ml-3">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-6 my-20 rounded-[32px] bg-[#396552] px-8 py-16 text-white lg:px-20">
          <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <p className="tracking-[0.25em] text-white/70 uppercase">Mulai perjalanan Anda</p>

              <h2 className="mt-4 font-serif text-4xl">Siap untuk sesi berikutnya?</h2>
            </div>

            <Link
              href="/classes#schedule"
              className="rounded-full bg-white px-8 py-4 text-center text-[#396552]"
            >
              Lihat Jadwal
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
