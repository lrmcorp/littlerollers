import Link from 'next/link';

import { BrandMark } from './brand-mark';
import { publicNavigation, routes } from '../../routes';

/**
 * One forest band with the badge, the same links as the header and the two account
 * actions. The curved top edge repeats the road from the badge.
 */
export function PublicFooter() {
  return (
    <footer className="relative mt-20 bg-dd-forest text-dd-cream">
      <svg
        className="absolute inset-x-0 top-0 block h-10 w-full -translate-y-[calc(100%-1px)] text-dd-forest sm:h-14"
        viewBox="0 0 1440 56"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 56 C 360 0 720 0 1080 28 S 1440 56 1440 56 Z" fill="currentColor" />
      </svg>
      <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-4 pt-10 pb-8 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        <div className="grid content-start gap-4">
          <BrandMark tone="light" />
          <p className="max-w-sm leading-7 text-dd-cream/85">
            Kids Movement Club. Sessions run in 2-hour timetable blocks, and you choose 1 hour or
            2 hours when you buy a package.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <nav aria-label="Footer">
            <ul className="m-0 grid list-none gap-1 p-0">
              {publicNavigation.map((item) => (
                <li key={`${item.href}-footer`}>
                  <Link
                    className="inline-flex min-h-11 items-center text-dd-cream no-underline hover:text-lr-sun"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="grid content-start gap-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-lr-sun px-6 font-medium text-dd-forest no-underline transition hover:-translate-y-0.5 motion-reduce:transform-none"
              href={routes.register}
            >
              Join us
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-dd-cream/40 px-6 font-medium text-dd-cream no-underline hover:border-dd-cream"
              href={routes.signIn}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
      <p className="mx-auto w-full max-w-[1180px] border-t border-dd-cream/15 px-4 py-5 text-sm text-dd-cream/75 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Little Rollers Kids Movement Club
      </p>
    </footer>
  );
}
