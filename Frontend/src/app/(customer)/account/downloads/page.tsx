'use client';

import { useQuery } from '@tanstack/react-query';
import { Download, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatShortDate } from '@/lib/format';
import api from '@/lib/api';
import type { Order, PaginatedResponse } from '@/lib/types';

export default function DownloadsPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<Order>>({
    queryKey: ['my-orders', 'all-paid'],
    queryFn: async () => {
      const res = await api.get('/orders?status=PAID&limit=100');
      return res.data;
    },
  });

  // Also fetch completed orders
  const { data: completedData } = useQuery<PaginatedResponse<Order>>({
    queryKey: ['my-orders', 'all-completed'],
    queryFn: async () => {
      const res = await api.get('/orders?status=COMPLETED&limit=100');
      return res.data;
    },
  });

  const paidOrders = [...(data?.data ?? []), ...(completedData?.data ?? [])];

  const downloadableItems = paidOrders.flatMap((order) =>
    (order.items ?? []).map((item) => ({
      ...item,
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
    }))
  );

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Downloads</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Your purchased templates are available for download.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg border border-zinc-200 bg-zinc-50"
            />
          ))}
        </div>
      ) : downloadableItems.length > 0 ? (
        <div className="space-y-3">
          {downloadableItems.map((item) => (
            <div
              key={`${item.orderId}-${item.templateId}`}
              className="flex items-center justify-between rounded-lg border border-zinc-200 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-md bg-zinc-100">
                  <Package className="size-4 text-zinc-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.templateName}</p>
                  <p className="text-xs text-zinc-400">
                    Order #{item.orderNumber} &middot;{' '}
                    {formatShortDate(item.orderDate)}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => handleDownload(item.orderId, item.templateId)}
              >
                <Download className="size-3.5" />
                Download
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Download className="size-10 text-zinc-300" />
          <p className="mt-4 text-sm text-zinc-500">No downloads available.</p>
          <p className="mt-1 text-xs text-zinc-400">
            Purchase a template to see it here.
          </p>
        </div>
      )}
    </div>
  );
}
