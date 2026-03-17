'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Check,
  RotateCcw,
  Send,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { formatDate, formatVND } from '@/lib/format';
import { useAuthStore } from '@/lib/stores/auth-store';
import api from '@/lib/api';
import type { CustomizeRequest, CustomizeMessage } from '@/lib/types';

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

export default function CustomizeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  const { data: request, isLoading } = useQuery<CustomizeRequest>({
    queryKey: ['customize-request', id],
    queryFn: async () => {
      const res = await api.get(`/customize-requests/${id}`);
      return res.data.data;
    },
  });

  const acceptQuote = useMutation({
    mutationFn: async () => {
      await api.patch(`/customize-requests/${id}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customize-request', id] });
    },
  });

  const requestRevision = useMutation({
    mutationFn: async () => {
      await api.patch(`/customize-requests/${id}/revision`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customize-request', id] });
    },
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      await api.post(`/customize-requests/${id}/messages`, {
        content: message,
      });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['customize-request', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
        <div className="h-60 animate-pulse rounded-lg border border-zinc-200 bg-zinc-50" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-zinc-500">Request not found.</p>
        <Link
          href="/account/customize"
          className="mt-3 text-sm text-blue-600 hover:underline"
        >
          Back to requests
        </Link>
      </div>
    );
  }

  const messages = request.messages ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/account/customize"
          className="flex items-center gap-1 text-sm text-zinc-500 hover:text-black"
        >
          <ArrowLeft className="size-3.5" />
          Requests
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            #{request.requestNumber}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Created {formatDate(request.createdAt)}
          </p>
        </div>
        <Badge
          variant="secondary"
          className={statusColor[request.status] ?? ''}
        >
          {request.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Details */}
      <div className="rounded-lg border border-zinc-200 p-5">
        <h2 className="text-sm font-medium">Details</h2>
        <div className="mt-4 space-y-3 text-sm">
          {request.template && (
            <div className="flex justify-between">
              <span className="text-zinc-400">Template</span>
              <Link
                href={`/templates/${request.template.slug}`}
                className="text-blue-600 hover:underline"
              >
                {request.template.name}
              </Link>
            </div>
          )}
          <div>
            <span className="text-zinc-400">Requirements</span>
            <p className="mt-1 whitespace-pre-wrap text-zinc-600">
              {request.requirements}
            </p>
          </div>
          {request.referenceUrls.length > 0 && (
            <div>
              <span className="text-zinc-400">Reference URLs</span>
              <div className="mt-1 space-y-1">
                {request.referenceUrls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <ExternalLink className="size-3" />
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quote info */}
      {request.quotedPrice && (
        <div className="rounded-lg border border-zinc-200 p-5">
          <h2 className="text-sm font-medium">Quote</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Price</span>
              <span className="font-medium">{formatVND(request.quotedPrice)}</span>
            </div>
            {request.quotedDays && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Estimated delivery</span>
                <span>{request.quotedDays} days</span>
              </div>
            )}
            {request.adminNote && (
              <div>
                <span className="text-zinc-400">Note from team</span>
                <p className="mt-1 text-zinc-600">{request.adminNote}</p>
              </div>
            )}
          </div>

          {request.status === 'QUOTED' && (
            <div className="mt-4 flex gap-3">
              <Button
                variant="outline"
                size="default"
                className="gap-1.5 border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => acceptQuote.mutate()}
                disabled={acceptQuote.isPending}
              >
                <Check className="size-4" />
                Accept Quote
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Delivery */}
      {request.deliveryUrl && (
        <div className="rounded-lg border border-zinc-200 p-5">
          <h2 className="text-sm font-medium">Delivery</h2>
          <div className="mt-4 space-y-2 text-sm">
            <a
              href={request.deliveryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <ExternalLink className="size-3" />
              View delivery
            </a>
            {request.deliveryNote && (
              <p className="text-zinc-600">{request.deliveryNote}</p>
            )}
          </div>

          {request.status === 'REVIEW' && (
            <div className="mt-4 flex gap-3">
              <Button
                variant="outline"
                size="default"
                className="gap-1.5 border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => acceptQuote.mutate()}
                disabled={acceptQuote.isPending}
              >
                <Check className="size-4" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="default"
                className="gap-1.5 border-orange-500 text-orange-500 hover:bg-orange-50"
                onClick={() => requestRevision.mutate()}
                disabled={requestRevision.isPending}
              >
                <RotateCcw className="size-4" />
                Request Revision
              </Button>
            </div>
          )}
        </div>
      )}

      <Separator />

      {/* Messages */}
      <div>
        <h2 className="text-sm font-medium">Messages</h2>

        {messages.length > 0 ? (
          <div className="mt-4 space-y-3">
            {messages.map((msg: CustomizeMessage) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`rounded-lg border p-4 ${
                    isMe
                      ? 'ml-8 border-blue-100 bg-blue-50/30'
                      : 'mr-8 border-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500">
                      {isMe ? 'You' : 'Team'}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">
                    {msg.content}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-400">No messages yet.</p>
        )}

        {/* Send message form */}
        {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && (
          <div className="mt-4 flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-10"
            />
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={() => sendMessage.mutate()}
              disabled={!message.trim() || sendMessage.isPending}
            >
              <Send className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
