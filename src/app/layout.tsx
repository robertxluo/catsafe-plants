import type { Metadata, Viewport } from 'next';
import { DM_Sans, Geist_Mono } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://catsafe.robertluo.dev'),
  title: 'CatSafe Plants - Is Your Houseplant Safe for Cats?',
  description:
    'Search any houseplant to instantly check if it is safe for your cat. Get toxicity info, symptoms, and safe alternatives.',
  icons: {
    icon: ['/favicon.ico', '/icon-192.png', '/icon-512.png'],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CatSafe Plants - Is Your Houseplant Safe for Cats?',
    description:
      'Search any houseplant to instantly check if it is safe for your cat. Get toxicity info, symptoms, and safe alternatives.',
    url: 'https://catsafe.robertluo.dev/',
    siteName: 'CatSafe Plants',
    type: 'website',
    images: [
      {
        url: '/homepage-catsafe.png',
        width: 1200,
        height: 630,
        alt: 'CatSafe Plants',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CatSafe Plants - Is Your Houseplant Safe for Cats?',
    description:
      'Search any houseplant to instantly check if it is safe for your cat. Get toxicity info, symptoms, and safe alternatives.',
    images: ['/homepage-catsafe.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
