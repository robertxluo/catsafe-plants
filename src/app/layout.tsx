import type { Metadata } from 'next';
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
  title: 'CatSafe Plants - Is Your Houseplant Safe for Cats?',
  description:
    'Search any houseplant to instantly check if it is safe for your cat. Get toxicity info, symptoms, and safe alternatives.',
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
