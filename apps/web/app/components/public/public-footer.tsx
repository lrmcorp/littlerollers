import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="mx-auto mt-12 grid min-h-[120px] w-[calc(100%_-_32px)] max-w-[1180px] grid-cols-1 items-center gap-6 rounded-t-dd-lg bg-dd-forest px-6 py-8 text-[13px] text-white sm:w-[calc(100%_-_48px)] lg:grid-cols-[1fr_minmax(300px,1.1fr)_0.8fr] lg:gap-9 lg:px-10">
      <div className="flex items-center gap-[18px]">
        <span
          className="grid size-[46px] shrink-0 place-items-center rounded-full border border-white/60 text-xl"
          aria-hidden="true"
        >
          ✉
        </span>
        <p className="m-0 leading-6">
          Dapatkan kabar terbaru tentang kelas,
          <br />
          promo, dan wellness tips.
        </p>
      </div>
      <Link
        className="flex min-h-[49px] items-center justify-between rounded-full bg-white py-[5px] pr-1.5 pl-5 text-[13px] text-dd-muted no-underline"
        href="/contact"
      >
        Hubungi kami untuk update
        <span className="rounded-full bg-dd-forest px-[17px] py-3 font-bold text-white">
          Hubungi ›
        </span>
      </Link>
      <div className="grid justify-start gap-2 lg:justify-end">
        <span>Ikuti kami</span>
        <div className="flex gap-2.5" aria-label="Tautan sosial Daily Dose Pilates">
          <a
            className="grid size-11 place-items-center rounded-full border border-white/50 text-white no-underline"
            href="https://www.instagram.com/dailydosepilates/"
            aria-label="Instagram"
            rel="noreferrer"
            target="_blank"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
