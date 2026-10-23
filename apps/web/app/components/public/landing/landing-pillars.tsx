import { Reveal } from './reveal';

const pillars = [
  {
    number: '01',
    title: 'Kapasitas Kelas Eksklusif',
    subtitle: 'Maksimal 4 peserta per sesi',
    description:
      'Kapasitas kelas kecil maksimal 4 peserta untuk perhatian personal dalam suasana yang nyaman, aman, dan terarah.',
  },
  {
    number: '02',
    title: 'Instruktur Tersertifikasi',
    subtitle: 'Berpengalaman & terarah',
    description:
      'Pendampingan yang terarah di setiap sesi oleh instruktur berdedikasi dan bersertifikasi.',
  },
  {
    number: '03',
    title: 'Peralatan Pilates Modern',
    subtitle: 'Presisi, halus & aman',
    description: 'Peralatan Pilates berkualitas untuk latihan yang aman, halus, dan presisi.',
  },
  {
    number: '04',
    title: 'Suasana Studio Tenang',
    subtitle: '5 pilihan studio',
    description:
      'Berlatih di 5 studio kami di Jakarta, Tangerang, dan Surabaya dengan jadwal fleksibel yang sesuai ritme Anda.',
  },
] as const;

// Garis pemisah antarkolom bergantung pada jumlah kolom (1 → 2 → 4), jadi diatur per indeks.
const cellLayout = [
  'sm:pr-6 lg:pr-5',
  'sm:border-l sm:border-ed-line sm:pl-6 lg:pr-5',
  'sm:pr-6 lg:border-l lg:border-ed-line lg:pl-6 lg:pr-5',
  'sm:border-l sm:border-ed-line sm:pl-6 lg:pr-0',
] as const;

/** Empat keunggulan studio sebagai grid bergaris tipis tanpa kartu. */
export function LandingPillars() {
  return (
    <Reveal className="mt-12 border-t border-ed-line sm:mt-[75px]">
      <ul className="m-0 grid list-none grid-cols-1 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map(({ number, title, subtitle, description }, index) => (
          <li
            key={number}
            className={`flex min-h-[220px] flex-col gap-10 border-b border-ed-line py-6 transition-colors duration-200 hover:bg-ed-tint ${cellLayout[index]}`}
          >
            <span className="text-xs font-bold text-ed-green">{number}</span>
            <div>
              <h3 className="m-0 text-[clamp(22px,2.2vw,30px)] leading-[1.1] font-medium tracking-[-0.05em]">
                {title}
              </h3>
              <p className="ed-eyebrow mt-3 mb-0 text-ed-green">{subtitle}</p>
              <p className="mt-4 mb-0 text-[15px] leading-[1.65] text-ed-muted">{description}</p>
            </div>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
