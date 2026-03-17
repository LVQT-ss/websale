'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { formatVND, formatDate } from '@/lib/format';
import type { CustomizeRequest } from '@/lib/types';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const customizeStatusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  QUOTED: 'secondary',
  ACCEPTED: 'default',
  IN_PROGRESS: 'default',
  REVIEW: 'secondary',
  REVISION: 'outline',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
};

export default function AdminCustomizeDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const [quotePrice, setQuotePrice] = useState('');
  const [quoteDays, setQuoteDays] = useState('');
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [message, setMessage] = useState('');

  const { data: request, isLoading } = useQuery({
    queryKey: ['admin', 'customize', params.id],
    queryFn: async () => {
      const res = await api.get<{ data: CustomizeRequest }>(`/admin/customize-requests/${params.id}`);
      return res.data.data;
    },
  });

  const quoteMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/admin/customize-requests/${params.id}/quote`, {
        quotedPrice: Number(quotePrice),
        quotedDays: Number(quoteDays),
      });
    },
    onSuccess: () => {
      toast.success('Quote sent');
      queryClient.invalidateQueries({ queryKey: ['admin', 'customize', params.id] });
    },
    onError: () => toast.error('Failed to send quote'),
  });

  const deliverMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/admin/customize-requests/${params.id}/deliver`, {
        deliveryUrl,
        deliveryNote,
      });
    },
    onSuccess: () => {
      toast.success('Delivery sent');
      queryClient.invalidateQueries({ queryKey: ['admin', 'customize', params.id] });
    },
    onError: () => toast.error('Failed to deliver'),
  });

  const messageMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/admin/customize-requests/${params.id}/messages`, {
        content: message,
      });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'customize', params.id] });
    },
    onError: () => toast.error('Failed to send message'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!request) {
    return <p className="py-10 text-center text-muted-foreground">Request not found</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" render={<Link href="/admin/customize" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-bold">Request {request.requestNumber}</h1>
        <Badge variant={customizeStatusVariant[request.status] ?? 'outline'}>
          {request.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request Info */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{request.user?.fullName ?? '—'}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Template</span>
              <span className="font-medium">{request.template?.name ?? '—'}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{formatDate(request.createdAt)}</span>
            </div>
            {request.quotedPrice && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quoted Price</span>
                  <span className="font-medium">{formatVND(request.quotedPrice)}</span>
                </div>
              </>
            )}
            {request.quotedDays && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Days</span>
                  <span>{request.quotedDays} days</span>
                </div>
              </>
            )}
            <Separator />
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Requirements</p>
              <p className="text-sm">{request.requirements}</p>
            </div>
            {request.referenceUrls?.length > 0 && (
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Reference URLs</p>
                <ul className="space-y-1">
                  {request.referenceUrls.map((url, i) => (
                    <li key={i}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary underline"
                      >
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-6">
          {/* Quote form */}
          {request.status === 'PENDING' && (
            <Card>
              <CardHeader>
                <CardTitle>Send Quote</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quotePrice">Price (VND)</Label>
                  <Input
                    id="quotePrice"
                    type="number"
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quoteDays">Estimated Days</Label>
                  <Input
                    id="quoteDays"
                    type="number"
                    value={quoteDays}
                    onChange={(e) => setQuoteDays(e.target.value)}
                    required
                  />
                </div>
                <Button
                  disabled={quoteMutation.isPending || !quotePrice || !quoteDays}
                  onClick={() => quoteMutation.mutate()}
                >
                  {quoteMutation.isPending ? 'Sending...' : 'Send Quote'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Delivery form */}
          {(request.status === 'IN_PROGRESS' || request.status === 'REVISION') && (
            <Card>
              <CardHeader>
                <CardTitle>Deliver</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryUrl">Delivery URL</Label>
                  <Input
                    id="deliveryUrl"
                    value={deliveryUrl}
                    onChange={(e) => setDeliveryUrl(e.target.value)}
                    placeholder="https://..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryNote">Note</Label>
                  <Textarea
                    id="deliveryNote"
                    rows={3}
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                  />
                </div>
                <Button
                  disabled={deliverMutation.isPending || !deliveryUrl}
                  onClick={() => deliverMutation.mutate()}
                >
                  {deliverMutation.isPending ? 'Delivering...' : 'Send Delivery'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Messages / Chat */}
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72 rounded-lg border p-4">
            <div className="space-y-4">
              {request.messages?.length ? (
                request.messages.map((msg) => {
                  const isAdmin = msg.senderId === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                          isAdmin
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-sm text-muted-foreground">No messages yet</p>
              )}
            </div>
          </ScrollArea>

          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && message.trim()) {
                  e.preventDefault();
                  messageMutation.mutate();
                }
              }}
            />
            <Button
              size="icon"
              disabled={messageMutation.isPending || !message.trim()}
              onClick={() => messageMutation.mutate()}
            >
              <Send className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
