'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatVND, formatDate } from '@/lib/format';
import api from '@/lib/api';
import type { Order } from '@/lib/types';

const statusColor: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  PAID: 'bg-green-50 text-green-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
  CANCELLED: 'bg-zinc-100 text-zinc-500',
  REFUNDED: 'bg-red-50 text-red-600',
};

const paymentStatusColor: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  SUCCESS: 'bg-green-50 text-green-700',
  FAILED: 'bg-red-50 text-red-600',
  REFUNDED: 'bg-zinc-100 text-zinc-500',
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res.data.data;
    },
  });

  const handleDownload = async (orderId: string, templateId: string) => {
    try {
      const res = await api.get(`/orders/${orderId}/download/${templateId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `template-${templateId}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // handle error silently
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
        <div className="h-40 animate-pulse rounded-lg border border-zinc-200 bg-zinc-50" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-zinc-500">Order not found.</p>
        <Link
          href="/account/orders"
          className="mt-3 text-sm text-blue-600 hover:underline"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  const isPaid = order.status === 'PAID' || order.status === 'COMPLETED';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/account/orders"
          className="flex items-center gap-1 text-sm text-zinc-500 hover:text-black"
        >
          <ArrowLeft className="size-3.5" />
          Orders
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            #{order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge
          variant="secondary"
          className={statusColor[order.status] ?? ''}
        >
          {order.status}
        </Badge>
      </div>

      {/* Items */}
      <div className="rounded-lg border border-zinc-200 p-5">
        <h2 className="text-sm font-medium">Items</h2>
        <div className="mt-4 space-y-3">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between"
            >
              <div>
                <p className="text-sm">{item.templateName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">{formatVND(item.unitPrice)}</span>
                {isPaid && (
                  <Button
                    variant="outline"
                    size="xs"
                    className="gap-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                    onClick={() => handleDownload(order.id, item.templateId)}
                  >
                    <Download className="size-3" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500">Total</span>
          <span className="text-lg font-semibold">
            {formatVND(order.totalAmount)}
          </span>
        </div>
      </div>

      {/* Payment info */}
      {order.payments && order.payments.length > 0 && (
        <div className="rounded-lg border border-zinc-200 p-5">
          <h2 className="text-sm font-medium">Payment</h2>
          <div className="mt-4 space-y-3">
            {order.payments.map((payment) => (
              <div key={payment.id} className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Method</span>
                  <span>{payment.method === 'MOMO' ? 'MoMo' : 'Bank Transfer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Amount</span>
                  <span>{formatVND(payment.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Status</span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${paymentStatusColor[payment.status] ?? ''}`}
                  >
                    {payment.status}
                  </Badge>
                </div>
                {payment.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Paid at</span>
                    <span>{formatDate(payment.paidAt)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
