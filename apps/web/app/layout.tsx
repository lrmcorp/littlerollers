import './tailwind.css';
import './globals.css';
import './unified-overrides.css';
import './admin-overrides.css';
import { ApplicationShell } from './application-shell';
import { SessionProvider } from './session-context';
import type { Metadata } from 'next';
import localFont from 'next/font/local';

const dmSans = localFont({
  src: './fonts/dm-sans-variable.ttf',
  variable: '--font-ui',
  display: 'swap',
  weight: '100 1000',
});

const cormorant = localFont({
  src: './fonts/cormorant-garamond-variable.ttf',
  variable: '--font-editorial',
  display: 'swap',
  weight: '300 700',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://dailydosepilates.com'),
  title: {
    default: 'Daily Dose Pilates — Move with intention',
    template: '%s · Daily Dose Pilates',
  },
  description:
    'Daily Dose Pilates menghadirkan sesi private dan group untuk gerak yang lebih kuat, terarah, dan seimbang.',
  openGraph: {
    title: 'Daily Dose Pilates — Stronger Body. Calmer Mind.',
    description: 'Studio Pilates modern untuk bergerak lebih kuat, terarah, dan seimbang.',
    images: [
      {
        url: '/images/public/daily-dose-social-preview.png',
        width: 1200,
        height: 630,
        alt: 'Daily Dose Pilates — Stronger Body. Calmer Mind.',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/public/daily-dose-social-preview.png'],
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${dmSans.variable} ${cormorant.variable}`}
      data-scroll-behavior="smooth"
    >
      <body suppressHydrationWarning>
        <SessionProvider>
          <ApplicationShell>{children}</ApplicationShell>
        </SessionProvider>
      </body>
    </html>
  );
}
