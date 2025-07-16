
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mediathek - Deutsche Öffentlich-Rechtliche Inhalte',
  description: 'Entdecke Filme, Serien und Dokumentationen von ARD, ZDF, ARTE und weiteren deutschen Sendern mit IMDB-Bewertungen und persönlicher Merkliste.',
  keywords: 'Mediathek, ARD, ZDF, ARTE, deutsche Filme, Serien, Dokumentationen, IMDB, Bewertungen',
  authors: [{ name: 'Mediathek App' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    apple: '/apple-touch-icon.png'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
