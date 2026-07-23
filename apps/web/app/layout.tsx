import './globals.css';
import { ApplicationShell } from './application-shell';
import { SessionProvider } from './session-context';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Daily Dose Pilates — Move with intention',
    template: '%s · Daily Dose Pilates',
  },
  description:
    'Daily Dose Pilates menghadirkan sesi private dan group untuk gerak yang lebih kuat, terarah, dan seimbang.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <SessionProvider>
          <ApplicationShell>{children}</ApplicationShell>
        </SessionProvider>
      </body>
    </html>
  );
}
