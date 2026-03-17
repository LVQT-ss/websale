'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Package, Download, Palette, Heart, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatVND, formatShortDate } from '@/lib/format';
import api from '@/lib/api';
import type { Order, PaginatedResponse } from '@/lib/types';

const statusColor: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  PAID: 'bg-green-50 text-green-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
  CANCELLED: 'bg-zinc-100 text-zinc-500',
  REFUNDED: 'bg-red-50 text-red-600',
};

const quickLinks = [
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/downloads', label: 'Downloads', icon: Download },
  { href: '/account/customize', label: 'Customize', icon: Palette },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
];

export default function AccountDashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: ordersData, isLoading } = useQuery<PaginatedResponse<Order>>({
    queryKey: ['my-orders', { page: 1, limit: 5 }],
    queryFn: async () => {
      const res = await api.get('/orders?page=1&limit=5');
      return res.data;
    },
  });

  const recentOrders = ordersData?.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Welcome back, {user?.fullName}.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-300"
            >
              <Icon className="size-4 text-blue-600" />
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            View all <ArrowRight className="size-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg border border-zinc-200 bg-zinc-50"
              />
            ))}
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="mt-4 space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-300"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium">#{order.orderNumber}</p>
                    <p className="text-xs text-zinc-400">
                      {formatShortDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">{formatVND(order.totalAmount)}</span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${statusColor[order.status] ?? ''}`}
                  >
                    {order.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-400">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
