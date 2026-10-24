import { Reveal } from './reveal';

const testimonials = [
  {
    quote:
      'Suasana kelas reformer di Daily Dose sangat nyaman dan privat. Instruktur sangat teliti mengoreksi postur tubuh saya dari sesi pertama.',
    name: 'Maya S.',
    role: 'Member Daily Dose Green Garden',
    studio: 'Jakarta Barat',
  },
  {
    quote:
      'Peralatan reformer sangat mulus dan presisi. Jadwal kelas fleksibel dan terbukti sangat membantu meredakan keluhan sakit punggung saya.',
    name: 'Ronald K.',
    role: 'Member Daily Dose Muara Karang',
    studio: 'Jakarta Utara',
  },
  {
    quote:
      'Sebagai pemula pilates, bimbingan Coach sangat sabar dan suportif. Suasana kelas kecil maksimal 4 orang membuat latihan terasa sangat personal.',
    name: 'Clarissa W.',
    role: 'Member Daily Dose Graha Family',
    studio: 'Surabaya',
  },
] as const;

type Testimonial = (typeof testimonials)[number];

function Attribution({ name, role, studio }: Pick<Testimonial, 'name' | 'role' | 'studio'>) {
  return (
    <figcaption className="mt-6">
      <strong className="block text-sm font-bold">{name}</strong>
      <span className="mt-1 block text-[13px] text-ed-muted">
        {role} · {studio}
      </span>
    </figcaption>
  );
}

/**
 * Testimoni member: satu kutipan besar, dua kutipan bergaris tanpa kartu, lalu pita filosofi
 * studio. Isi kutipan tidak diubah dari versi sebelumnya.
 */
export function LandingTestimonials() {
  const [featured, ...others] = testimonials;
  return (
    <section
      className="ed-scope bg-ed-cream text-ed-ink"
      id="testimonials"
      aria-labelledby="testimonials-title"
    >
      <div className="ed-wrap ed-section border-t border-ed-line">
        <Reveal>
          <span className="ed-eyebrow text-ed-green">Cerita &amp; pengalaman member</span>
          <h2
            className="ed-display mt-6 text-[clamp(40px,5vw,72px)] text-balance"
            id="testimonials-title"
          >
            Refined Movement. <span className="ed-serif">Real Transformation.</span>
          </h2>
        </Reveal>

        <Reveal className="mt-12 sm:mt-[75px]">
          <figure className="m-0 max-w-[1080px]">
            <blockquote className="m-0">
              <p className="m-0 text-[clamp(22px,2.8vw,40px)] leading-[1.38] font-normal tracking-[-0.015em] text-balance">
                “{featured.quote}”
              </p>
            </blockquote>
            <Attribution name={featured.name} role={featured.role} studio={featured.studio} />
          </figure>
        </Reveal>

        <Reveal className="mt-14 grid border-t border-ed-line md:grid-cols-2">
          {others.map((item, index) => (
            <figure
              className={`m-0 py-8 ${
                index === 0 ? 'md:pr-10' : 'border-t border-ed-line md:border-t-0 md:border-l md:pl-10'
              }`}
              key={item.name}
            >
              <blockquote className="m-0">
                <p className="m-0 text-[17px] leading-[1.7]">“{item.quote}”</p>
              </blockquote>
              <Attribution name={item.name} role={item.role} studio={item.studio} />
            </figure>
          ))}
        </Reveal>

        <Reveal className="bg-ed-mist px-6 py-8 text-center sm:px-10">
          <p className="ed-serif m-0 text-[clamp(22px,2.4vw,32px)] leading-[1.38] tracking-normal">
            “Consistency is not perfection. It is choosing to return to yourself.”
          </p>
          <span className="ed-eyebrow mt-4 text-ed-green">Daily Dose Movement Philosophy</span>
        </Reveal>
      </div>
    </section>
  );
}
