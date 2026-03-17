import type { Metadata } from 'next';
import CustomerHeader from '@/components/customer/header';
import CustomerFooter from '@/components/customer/footer';

export const metadata: Metadata = {
  title: {
    default: 'Flavor Template — Premium Website Template Marketplace',
    template: '%s | Flavor Template',
  },
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <CustomerHeader />
      <main className="flex-1">{children}</main>
      <CustomerFooter />
    </div>
  );
}
