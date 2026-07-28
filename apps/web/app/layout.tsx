import './tailwind.css';
import './globals.css';
import './legacy-ui.css';
import './legacy-compatibility.css';
import { ApplicationShell } from './application-shell';
import { SessionProvider } from './session-context';
import { AppFeedbackProvider } from './components/app-feedback';
import type { Metadata } from 'next';
import localFont from 'next/font/local';

const poppins = localFont({
  src: [
    { path: './fonts/poppins-regular.ttf', weight: '400', style: 'normal' },
    { path: './fonts/poppins-medium.ttf', weight: '500', style: 'normal' },
    { path: './fonts/poppins-semibold.ttf', weight: '600', style: 'normal' },
    { path: './fonts/poppins-bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-ui',
  display: 'swap',
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
    <html lang="id" className={poppins.variable} data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <AppFeedbackProvider>
          <SessionProvider>
            <ApplicationShell>{children}</ApplicationShell>
          </SessionProvider>
        </AppFeedbackProvider>
      </body>
    </html>
  );
}
