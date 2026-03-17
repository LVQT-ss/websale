'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = Number(searchParams.get('page') ?? '1');

  const { data, isLoading } = useQuery<PaginatedResponse<Order>>({
    queryKey: ['my-orders', { page }],
    queryFn: async () => {
      const res = await api.get(`/orders/my?page=${page}&limit=10`);
      return res.data;
    },
  });

  const orders = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Orders</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {meta ? `${meta.total} order${meta.total !== 1 ? 's' : ''}` : 'View your order history'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg border border-zinc-200 bg-zinc-50"
            />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-300"
              >
                <div>
                  <p className="text-sm font-medium">#{order.orderNumber}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {formatShortDate(order.createdAt)}
                    {order.items && (
                      <span>
                        {' '}
                        &middot; {order.items.length} item
                        {order.items.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {formatVND(order.totalAmount)}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${statusColor[order.status] ?? ''}`}
                  >
                    {order.status}
                  </Badge>
                  <ArrowRight className="size-4 text-zinc-300" />
                </div>
              </Link>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', String(page - 1));
                  router.push(`${pathname}?${params.toString()}`);
                }}
              >
                Previous
              </Button>
              <span className="px-4 text-sm text-zinc-500">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', String(page + 1));
                  router.push(`${pathname}?${params.toString()}`);
                }}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-zinc-500">No orders yet.</p>
          <Link
            href="/templates"
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            Browse templates
          </Link>
        </div>
      )}
    </div>
  );
}
