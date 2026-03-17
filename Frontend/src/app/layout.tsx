import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import QueryProvider from '@/lib/providers/query-provider';
import AuthProvider from '@/lib/providers/auth-provider';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  title: {
    default: 'Flavor Template — Premium Website Template Marketplace',
    template: '%s | Flavor Template',
  },
  description:
    'Browse and purchase high-quality Next.js, React, Vue, and HTML/CSS website templates. Fully responsive, beautifully designed, and ready to launch.',
  keywords: [
    'website templates',
    'Next.js templates',
    'React templates',
    'Vue templates',
    'landing page templates',
    'SaaS templates',
    'e-commerce templates',
    'Flavor Template',
  ],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Flavor Template',
    title: 'Flavor Template — Premium Website Template Marketplace',
    description:
      'Browse and purchase high-quality website templates. Fully responsive, beautifully designed, and ready to launch.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flavor Template — Premium Website Template Marketplace',
    description:
      'Browse and purchase high-quality website templates.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
