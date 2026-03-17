'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Layout,
  ShoppingBag,
  CreditCard,
  Palette,
  Star,
  Users,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Templates', href: '/admin/templates', icon: Layout },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Customize', href: '/admin/customize', icon: Palette },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Staff', href: '/admin/staff', icon: UserCog },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserSection() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) return null;

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted" />
        }
      >
        <Avatar size="sm">
          {user.avatar && <AvatarImage src={user.avatar} alt={user.fullName} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-medium">{user.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{user.role}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.fullName}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger */}
      <div className="fixed top-0 left-0 z-40 flex h-14 w-full items-center gap-2 border-b bg-background px-4 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" />}>
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex h-full flex-col">
              <div className="flex h-14 items-center border-b px-4">
                <Link
                  href="/admin"
                  className="text-lg font-bold"
                  onClick={() => setOpen(false)}
                >
                  Flavor Template
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
              <div className="border-t p-3">
                <UserSection />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/admin" className="text-lg font-bold">
          Flavor Template
        </Link>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-background">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/admin" className="text-lg font-bold">
            Flavor Template
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
        <div className="border-t p-3">
          <UserSection />
        </div>
      </aside>
    </>
  );
}
