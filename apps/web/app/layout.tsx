import './tailwind.css';
import './globals.css';
import './legacy-ui.css';
import './legacy-compatibility.css';
import './landing.css';
import { ApplicationShell } from './application-shell';
import { SessionProvider } from './session-context';
import { AppFeedbackProvider } from './components/app-feedback';
import { AppLoadingProvider } from './components/app-loading';
import { PublicExperience } from './components/public/public-experience';
import type { Metadata } from 'next';
import localFont from 'next/font/local';

const inter = localFont({
  src: [
    { path: './fonts/inter-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/inter-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/inter-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/inter-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-ui',
  display: 'swap',
});

const grandstander = localFont({
  src: [{ path: './fonts/grandstander-900.woff2', weight: '900', style: 'normal' }],
  variable: '--font-display-face',
  display: 'swap',
});

const description =
  'Little Rollers Kids Movement Club runs 1-hour and 2-hour movement sessions for children. Book a place, buy a package and check in from your account.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_WEB_BASE_URL ?? 'http://127.0.0.1:32120'),
  title: {
    default: 'Little Rollers Kids Movement Club',
    template: '%s · Little Rollers',
  },
  description,
  openGraph: {
    title: 'Little Rollers Kids Movement Club',
    description,
    images: [
      {
        url: '/images/public/little-rollers-social-preview.png',
        width: 1200,
        height: 630,
        alt: 'Little Rollers Kids Movement Club badge',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/public/little-rollers-social-preview.png'],
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${grandstander.variable}`}
      data-scroll-behavior="smooth"
    >
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
