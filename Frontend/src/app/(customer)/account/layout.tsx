'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Download,
  Palette,
  Heart,
  UserCircle,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const sidebarLinks = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/account/orders', label: 'Orders', icon: Package, exact: false },
  { href: '/account/downloads', label: 'Downloads', icon: Download, exact: false },
  { href: '/account/customize', label: 'Customize', icon: Palette, exact: false },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart, exact: false },
  { href: '/account/profile', label: 'Profile', icon: UserCircle, exact: false },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden w-52 shrink-0 md:block">
            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-zinc-100 font-medium text-black'
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'
                    )}
                  >
                    <Icon className="size-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Mobile nav */}
          <div className="w-full md:hidden">
            <div className="mb-6 flex gap-1 overflow-x-auto border-b border-zinc-200 pb-2">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors',
                      isActive
                        ? 'bg-zinc-100 font-medium text-black'
                        : 'text-zinc-500'
                    )}
                  >
                    <Icon className="size-3.5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
            {children}
          </div>

          {/* Content — desktop */}
          <div className="hidden flex-1 md:block">{children}</div>
        </div>
      </div>
    </div>
  );
}
