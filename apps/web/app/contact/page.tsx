import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicFooter } from '../components/public/public-footer';
import { PublicHeader } from '../components/public/public-header';
import { PublicPageHero } from '../components/public/public-page';
import { publicContainer } from '../components/public/public-styles';
import { ContactClubs } from './contact-clubs';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Message your Little Rollers club on WhatsApp about classes, packages or a visit.',
};

export default function ContactPage() {
  return (
    <div className="min-w-0 overflow-x-clip bg-dd-cream font-sans text-dd-ink">
      <a className="skip-link" href="#contact-main">
        Skip to contact options
      </a>
      <PublicHeader />
      <main id="contact-main">
        <PublicPageHero
          eyebrow="Contact"
          title="Questions before your first session?"
          description="Each club answers on WhatsApp. Pick yours below, or check the timetable and packages first."
        />
        <section className={`${publicContainer} grid gap-8 py-10 lg:grid-cols-[1.3fr_1fr]`}>
          <div>
            <h2 className="font-display text-3xl text-dd-forest" id="contact-clubs-title">
              Message a club
            </h2>
            <ContactClubs />
          </div>
          <aside className="grid content-start gap-4 rounded-[22px] bg-lr-sky p-6">
            <h2 className="font-display text-2xl text-dd-forest">Answers on the site</h2>
            <Link
              className="flex min-h-12 items-center justify-between rounded-full bg-white px-5 font-medium text-dd-forest no-underline"
              href="/classes#schedule"
            >
              Session times <span aria-hidden="true">›</span>
            </Link>
            <Link
              className="flex min-h-12 items-center justify-between rounded-full bg-white px-5 font-medium text-dd-forest no-underline"
              href="/packages"
            >
              Package prices <span aria-hidden="true">›</span>
            </Link>
            <Link
              className="flex min-h-12 items-center justify-between rounded-full bg-white px-5 font-medium text-dd-forest no-underline"
              href="/locations"
            >
              Club addresses <span aria-hidden="true">›</span>
            </Link>
            <p className="m-0 text-sm leading-6 text-dd-ink/80">
              This page does not collect any personal details. Messages go straight to the club
              through WhatsApp.
            </p>
          </aside>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
