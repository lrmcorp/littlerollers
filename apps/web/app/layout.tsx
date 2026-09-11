import './tailwind.css';
import './globals.css';
import { ApplicationShell } from './application-shell';
import { SessionProvider } from './session-context';
import { AppFeedbackProvider } from './components/app-feedback';
import { AppLoadingProvider } from './components/app-loading';
import { PublicExperience } from './components/public/public-experience';
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
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
        <AppLoadingProvider>
          <AppFeedbackProvider>
            <SessionProvider>
              <PublicExperience>
                <ApplicationShell>{children}</ApplicationShell>
              </PublicExperience>
            </SessionProvider>
          </AppFeedbackProvider>
        </AppLoadingProvider>
      </body>
    </html>
  );
}
