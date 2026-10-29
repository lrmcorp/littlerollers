'use client';

import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { accountClient, type PublicSiteConfig } from './account-client';
import { BrandMark } from './components/public/brand-mark';
import { PublicFooter } from './components/public/public-footer';
import {
  publicContainer as container,
  publicEyebrow,
  publicSecondaryButton,
  publicSunButton,
} from './components/public/public-styles';
import { routes } from './routes';
import { isCustomerOnlySession } from './session-audience';
import { useSessionContext } from './session-context';

const SCENE_PLATE =
  'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/3ca5d10d-ea2f-4907-876f-33bde169469e.jpg';
const SCENE_LOOP =
  'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/d2cb5bef-f92b-4e91-ae93-8dc6555e56ac.mp4';

const heroNavigation = [
  { href: routes.classes, label: 'Classes' },
  { href: '/classes#schedule', label: 'Timetable' },
  { href: routes.packages, label: 'Packages' },
  { href: routes.locations, label: 'Clubs' },
] as const;

export function sessionLengthLabel(minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) return 'Length varies';
  if (minutes % 60 === 0) return minutes === 60 ? '1 hour' : `${minutes / 60} hours`;
  return `${minutes} min`;
}

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

/**
 * Entrance, run once: the bar drops in, the kicker un-blurs, each headline line springs
 * up out of a blur 0.16s apart, then the rest rises in reading order. Elements stay
 * visible if scripts or the Web Animations API are unavailable.
 */
function playEntrance(root: HTMLElement) {
  if (typeof root.animate !== 'function') return;
  const steps: Array<[string, Keyframe[], number, number, string]> = [];
  const drop: Keyframe[] = [
    { opacity: 0, transform: 'translateY(-18px)' },
    { opacity: 1, transform: 'none' },
  ];
  const rise: Keyframe[] = [
    { opacity: 0, transform: 'translateY(22px)' },
    { opacity: 1, transform: 'none' },
  ];
  const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const spring = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  steps.push(['[data-enter="bar"]', drop, 0, 520, ease]);
  steps.push([
    '[data-enter="kicker"]',
    [
      { opacity: 0, filter: 'blur(12px)' },
      { opacity: 1, filter: 'blur(0)' },
    ],
    180,
    600,
    ease,
  ]);
  root.querySelectorAll<HTMLElement>('[data-enter="line"]').forEach((_, index) => {
    steps.push([
      `[data-enter="line"]:nth-child(${index + 1})`,
      [
        { opacity: 0, transform: 'translateY(40px) scale(0.96)', filter: 'blur(14px)' },
        { opacity: 1, transform: 'none', filter: 'blur(0)' },
      ],
      320 + index * 160,
      760,
      spring,
    ]);
  });
  const lines = root.querySelectorAll('[data-enter="line"]').length;
  let delay = 320 + lines * 160 + 160;
  root.querySelectorAll<HTMLElement>('[data-enter="rise"]').forEach((element) => {
    element.animate(rise, { duration: 560, delay, easing: ease, fill: 'backwards' });
    delay += 90;
  });
  for (const [selector, keyframes, start, duration, easing] of steps) {
    root
      .querySelectorAll<HTMLElement>(selector)
      .forEach((element) =>
        element.animate(keyframes, { duration, delay: start, easing, fill: 'backwards' }),
      );
  }
}

type LoadState = 'loading' | 'ready' | 'error';

export function PublicLanding() {
  const [siteConfig, setSiteConfig] = useState<PublicSiteConfig | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const heroRef = useRef<HTMLDivElement>(null);
  // If the scene host is unreachable the sky-to-meadow gradient behind the frame shows instead.
  const [plateFailed, setPlateFailed] = useState(false);
  const plateRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const plate = plateRef.current;
    if (plate?.complete && plate.naturalWidth === 0) setPlateFailed(true);
  }, []);
  const reducedMotion = useReducedMotion();
  const session = useSessionContext()?.session;
  const accountHref = isCustomerOnlySession(session) ? routes.account : routes.workspace;

  const load = useCallback(() => {
    let active = true;
    setState('loading');
    accountClient
      .siteConfig()
      .then((result) => {
        if (!active) return;
        setSiteConfig(result);
        setState('ready');
      })
      .catch(() => {
        if (active) setState('error');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => load(), [load]);

  useEffect(() => {
    const root = heroRef.current;
    if (!root || prefersReducedMotion()) return;
    playEntrance(root);
  }, []);

  const classes = siteConfig?.classes.slice(0, 3) ?? [];
  const clubs = siteConfig?.branches ?? [];

  return (
    <div className="lr-home min-w-0 bg-dd-cream text-dd-ink" id="top" ref={heroRef}>
      <a className="skip-link" href="#public-main">
        Skip to main content
      </a>
      <header className="lr-hero__bar" data-enter="bar">
        <BrandMark className="lr-hero__logo" tone="light" priority />
        <nav className="lr-hero__nav" aria-label="Main">
          {heroNavigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="lr-hero__account">
          {session ? (
            <Link className="lr-pill lr-pill--white lr-hero__join" href={accountHref}>
              My account
            </Link>
          ) : (
            <>
              <Link className="lr-hero__signin" href={routes.signIn}>
                Sign in
              </Link>
              <Link className="lr-pill lr-pill--white lr-hero__join" href={routes.register}>
                Join us
              </Link>
            </>
          )}
        </div>
      </header>

      <main id="public-main" tabIndex={-1} className="outline-none">
        <div className="lr-hero">
          <div className="lr-hero__frame">
            <div className="lr-hero__scene" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote plate, sized by the frame */}
              <img
                ref={plateRef}
                className="lr-hero__plate"
                src={SCENE_PLATE}
                alt=""
                fetchPriority="high"
                hidden={plateFailed}
                onError={() => setPlateFailed(true)}
              />
              {!reducedMotion && !plateFailed && (
                <video
                  className="lr-hero__video"
                  src={SCENE_LOOP}
                  poster={SCENE_PLATE}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  tabIndex={-1}
                />
              )}
            </div>
            <div className="lr-hero__scrim" aria-hidden="true" />

            <div className="lr-hero__layer">
              <div className="lr-hero__copy">
                <p className="lr-hero__kicker" data-enter="kicker">
                  LITTLE ROLLERS
                </p>
                <h1 className="lr-hero__headline" aria-label="Kids Movement Club">
                  <span data-enter="line" aria-hidden="true">
                    KIDS MOVEMENT
                  </span>
                  <span data-enter="line" aria-hidden="true">
                    CLUB
                  </span>
                </h1>
                <p className="lr-hero__sub" data-enter="rise">
                  Running, rolling, climbing and balancing for little ones. Book a 1-hour or 2-hour
                  session at your club, then check in with your QR pass.
                </p>
                <div className="lr-hero__actions">
                  <Link
                    className="lr-pill lr-pill--white lr-hero__primary"
                    href={session ? accountHref : routes.register}
                    data-enter="rise"
                  >
                    {session ? 'My account' : 'Join us'}
                  </Link>
                  <Link
                    className="lr-pill lr-pill--mint lr-hero__secondary"
                    href="/classes#schedule"
                    data-enter="rise"
                  >
                    <CalendarDays aria-hidden="true" />
                    See the timetable
                  </Link>
                </div>
              </div>

              <section className="lr-hero__classes" aria-labelledby="hero-classes-title">
                <h2 className="lr-hero__classes-title" id="hero-classes-title" data-enter="rise">
                  CLASSES
                </h2>
                <Link className="lr-hero__classes-link" href={routes.classes} data-enter="rise">
                  browse all classes{' '}
                  <span className="lr-chevron" aria-hidden="true">
                    ›
                  </span>
                </Link>
                <ul className="lr-hero__cards" aria-busy={state === 'loading' || undefined}>
                  {state === 'loading' &&
                    [0, 1, 2].map((index) => (
                      <li key={index} data-enter="rise">
                        <div className="lr-class-card lr-class-card--state lr-class-card--loading">
                          {index === 0 && <span className="sr-only">Loading classes</span>}
                        </div>
                      </li>
                    ))}
                  {state === 'error' && (
                    <li data-enter="rise">
                      <div className="lr-class-card lr-class-card--state" role="alert">
                        <p className="m-0 text-base">We could not load the classes.</p>
                        <button
                          type="button"
                          className="lr-pill lr-pill--mint mt-3 min-h-11 px-5 text-[15px]"
                          onClick={() => load()}
                        >
                          Try again
                        </button>
                      </div>
                    </li>
                  )}
                  {state === 'ready' && classes.length === 0 && (
                    <li data-enter="rise">
                      <div className="lr-class-card lr-class-card--state">
                        <p className="m-0 text-base">
                          Classes appear here once the club publishes them.{' '}
                          <Link href={routes.contact}>Ask us what is coming up</Link>.
                        </p>
                      </div>
                    </li>
                  )}
                  {classes.map((item) => (
                    <li key={item.code} data-enter="rise">
                      <Link className="lr-class-card" href={`/classes/${item.slug}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- local SVG artwork */}
                        <img src={`/images/public/${item.heroImageKey}`} alt="" loading="lazy" />
                        <span className="lr-class-card__label">
                          <span className="lr-class-card__name">{item.name}</span>
                          <span className="lr-class-card__meta">
                            {item.level} · {sessionLengthLabel(item.durationMinutes)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>

        <section
          className="relative bg-dd-cream py-16 sm:py-24"
          id="sessions"
          aria-labelledby="sessions-title"
        >
          <div className={`${container} grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]`}>
            <div>
              <p className={publicEyebrow}>How sessions work</p>
              <h2
                className="mt-3 font-display text-[clamp(2.4rem,5vw,3.9rem)] leading-[0.95] text-dd-forest"
                id="sessions-title"
              >
                One hour or two
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-dd-muted">
                Every slot on the timetable is a 2-hour block. With a 1-hour package your child
                joins the first hour. With a 2-hour package they stay for the whole block.
              </p>
              <p className="mt-4 max-w-xl leading-7 text-dd-muted">
                Either way, each booking uses one session from the package. When you book, the
                timetable only offers sessions that fit the length you bought.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className={publicSunButton} href={routes.packages}>
                  Compare packages
                </Link>
                <Link className={publicSecondaryButton} href="/classes#schedule">
                  See the timetable
                </Link>
              </div>
            </div>
            <SessionBlockDiagram />
          </div>
        </section>

        <section className="bg-dd-paper py-16 sm:py-20" aria-labelledby="clubs-title">
          <div className={container}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className={publicEyebrow}>Where we play</p>
                <h2
                  className="mt-3 font-display text-[clamp(2.2rem,4.5vw,3.4rem)] leading-none text-dd-forest"
                  id="clubs-title"
                >
                  Our clubs
                </h2>
              </div>
              <Link
                className="inline-flex min-h-11 items-center gap-1 font-medium text-dd-forest"
                href={routes.locations}
              >
                All club details <span aria-hidden="true">›</span>
              </Link>
            </div>
            <ClubList state={state} clubs={clubs} onRetry={() => load()} />
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

/** The timetable block drawn as the badge's road: hour one, hour two, and who stays for each. */
function SessionBlockDiagram() {
  return (
    <figure className="m-0 rounded-[22px] bg-dd-forest p-6 text-dd-cream sm:p-8">
      <figcaption className="font-display text-xl">A timetable block</figcaption>
      <div className="mt-6 grid grid-cols-2 text-sm text-dd-cream/80">
        <span>Hour 1</span>
        <span className="border-l border-dashed border-dd-cream/40 pl-3">Hour 2</span>
      </div>
      <div className="mt-2 h-3 rounded-full bg-dd-cream/20" aria-hidden="true" />
      <dl className="mt-6 grid gap-4">
        <div>
          <dt className="text-sm text-dd-cream/80">1-hour package</dt>
          <dd className="m-0 mt-2 grid sm:grid-cols-2">
            <span className="flex min-h-12 items-center rounded-full bg-lr-sun px-5 font-medium text-dd-forest">
              Joins the first hour
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-dd-cream/80">2-hour package</dt>
          <dd className="m-0 mt-2">
            <span className="flex min-h-12 items-center rounded-full bg-dd-cream px-5 font-medium text-dd-forest">
              Stays for the whole block
            </span>
          </dd>
        </div>
      </dl>
    </figure>
  );
}

function ClubList({
  state,
  clubs,
  onRetry,
}: {
  state: LoadState;
  clubs: PublicSiteConfig['branches'];
  onRetry: () => void;
}) {
  if (state === 'loading')
    return (
      <p className="mt-8 rounded-[15px] bg-white p-6 text-dd-muted" role="status">
        Loading clubs…
      </p>
    );
  if (state === 'error')
    return (
      <div className="mt-8 rounded-[15px] bg-dd-danger-soft p-6 text-dd-danger" role="alert">
        <p className="m-0">We could not load the clubs.</p>
        <button type="button" className={`${publicSecondaryButton} mt-3`} onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  if (clubs.length === 0)
    return (
      <p className="mt-8 rounded-[15px] bg-white p-6 text-dd-muted">
        No clubs are open for booking yet. <Link href={routes.contact}>Contact us</Link> to hear
        when one opens near you.
      </p>
    );
  return (
    <ul className="m-0 mt-8 grid list-none gap-0 divide-y divide-dd-line border-y border-dd-line p-0">
      {clubs.map((club) => {
        const profile = club.publicProfile;
        return (
          <li key={club.id}>
            <Link
              className="group grid min-h-20 items-center gap-2 py-5 text-dd-ink no-underline sm:grid-cols-[1fr_1.4fr_auto] sm:gap-6"
              href={profile ? `/locations/${profile.slug}` : routes.locations}
            >
              <span className="font-display text-2xl text-dd-forest">{club.name}</span>
              <span className="text-dd-muted">
                {profile ? `${profile.address}` : 'Address coming soon'}
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-dd-forest">
                Club page{' '}
                <span
                  className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  ›
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
