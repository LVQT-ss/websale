import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Templates',
  description:
    'Explore our collection of premium website templates. Filter by category, technology, and price. Next.js, React, Vue, and more.',
  openGraph: {
    title: 'Browse Templates — Flavor Template',
    description:
      'Explore our collection of premium website templates. Filter by category, technology, and price.',
  },
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
