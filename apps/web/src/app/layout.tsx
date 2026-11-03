import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import '@kopaka/ui/styles.css';
import './globals.css';
import { ThemeProvider } from '../features/preferences/theme-provider';
import { LocaleProvider } from '../features/preferences/locale-provider';
import { INITIAL_PREFERENCES_SCRIPT } from '../features/preferences/initial-preferences';
import fr from '../messages/fr.json';
export const metadata = { title: fr.metadataTitle };
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <html lang="fr" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: INITIAL_PREFERENCES_SCRIPT }}
        />
      </head>
      <body>
        <ThemeProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
