import './globals.css';
import { ApplicationShell } from './application-shell';
import { SessionProvider } from './session-context';
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
