'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Menu,
  User,
  Package,
  Download,
  Heart,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useCartStore } from '@/lib/stores/cart-store';

const navLinks = [
  { href: '/templates', label: 'Templates' },
  { href: '/cart', label: 'Cart' },
];

export default function CustomerHeader() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartCount = useCartStore((s) => s.items.length);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="text-lg font-semibold tracking-tight text-black">
          Flavor Template
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-500 transition-colors hover:text-black"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="size-4" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-blue-600 p-0 text-[10px] text-white">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="default" className="gap-2 text-sm">
                    <User className="size-4" />
                    <span className="max-w-[120px] truncate">{user.fullName}</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" sideOffset={8}>
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/account" />}>
                  <LayoutDashboard className="size-4" />
                  My Account
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/account/orders" />}>
                  <Package className="size-4" />
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/account/downloads" />}>
                  <Download className="size-4" />
                  My Downloads
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/account/wishlist" />}>
                  <Heart className="size-4" />
                  Wishlist
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="default" className="text-sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  size="default"
                  className="border-blue-600 text-sm text-blue-600 hover:bg-blue-50"
                >
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="size-4" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-blue-600 p-0 text-[10px] text-white">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <SheetClose key={link.href} render={<Link href={link.href} />}>
                    <span className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                      {link.label}
                    </span>
                  </SheetClose>
                ))}

                {user ? (
                  <>
                    <div className="my-2 h-px bg-zinc-200" />
                    <SheetClose render={<Link href="/account" />}>
                      <span className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                        My Account
                      </span>
                    </SheetClose>
                    <SheetClose render={<Link href="/account/orders" />}>
                      <span className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                        My Orders
                      </span>
                    </SheetClose>
                    <SheetClose render={<Link href="/account/downloads" />}>
                      <span className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                        My Downloads
                      </span>
                    </SheetClose>
                    <SheetClose render={<Link href="/account/wishlist" />}>
                      <span className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                        Wishlist
                      </span>
                    </SheetClose>
                    <div className="my-2 h-px bg-zinc-200" />
                    <button
                      onClick={handleLogout}
                      className="rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <div className="my-2 h-px bg-zinc-200" />
                    <SheetClose render={<Link href="/login" />}>
                      <span className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                        Login
                      </span>
                    </SheetClose>
                    <SheetClose render={<Link href="/register" />}>
                      <span className="block rounded-md px-3 py-2 text-sm text-blue-600 hover:bg-blue-50">
                        Register
                      </span>
                    </SheetClose>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
