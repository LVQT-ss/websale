'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatShortDate, formatVND } from '@/lib/format';
import api from '@/lib/api';
import type { CustomizeRequest, PaginatedResponse } from '@/lib/types';

const statusColor: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  QUOTED: 'bg-blue-50 text-blue-700',
  ACCEPTED: 'bg-green-50 text-green-700',
  IN_PROGRESS: 'bg-purple-50 text-purple-700',
  REVIEW: 'bg-indigo-50 text-indigo-700',
  REVISION: 'bg-orange-50 text-orange-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-zinc-100 text-zinc-500',
};

export default function CustomizeListPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<CustomizeRequest>>({
    queryKey: ['my-customize-requests'],
    queryFn: async () => {
      const res = await api.get('/customize-requests/my');
      return res.data;
    },
  });

  const requests = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Customization Requests
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Track your custom design requests.
          </p>
        </div>
        <Link href="/account/customize/new">
          <Button
            variant="outline"
            size="default"
            className="gap-1.5 border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Plus className="size-4" />
            New Request
          </Button>
        </Link>
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
      ) : requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((req) => (
            <Link
              key={req.id}
              href={`/account/customize/${req.id}`}
              className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-300"
            >
              <div>
                <p className="text-sm font-medium">#{req.requestNumber}</p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  {formatShortDate(req.createdAt)}
                  {req.template && (
                    <span> &middot; {req.template.name}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {req.quotedPrice && (
                  <span className="text-sm">{formatVND(req.quotedPrice)}</span>
                )}
                <Badge
                  variant="secondary"
                  className={`text-[10px] ${statusColor[req.status] ?? ''}`}
                >
                  {req.status.replace('_', ' ')}
                </Badge>
                <ArrowRight className="size-4 text-zinc-300" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-zinc-500">No customization requests yet.</p>
          <Link href="/account/customize/new" className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600"
            >
              Create your first request
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
