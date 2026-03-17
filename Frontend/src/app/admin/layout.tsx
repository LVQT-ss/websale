import type { Metadata } from 'next';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminGuard from '@/components/admin/admin-guard';

export const metadata: Metadata = {
  title: { default: 'Admin Panel', template: '%s | Admin — Flavor Template' },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-muted/30">
        <AdminSidebar />
        {/* Main content */}
        <main className="lg:pl-64">
          {/* Spacer for mobile header */}
          <div className="h-14 lg:hidden" />
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </AdminGuard>
  );
}
