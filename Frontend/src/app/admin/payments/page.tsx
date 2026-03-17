'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { formatVND, formatDate } from '@/lib/format';
import type { Payment, PaginatedResponse, PaymentStatus, PaymentMethod } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const paymentStatuses: PaymentStatus[] = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'];
const paymentMethods: PaymentMethod[] = ['MOMO', 'BANK_TRANSFER'];

const paymentStatusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  SUCCESS: 'default',
  FAILED: 'destructive',
  REFUNDED: 'destructive',
};

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('all');
  const [method, setMethod] = useState<string>('all');
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'payments', page, status, method],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit };
      if (status !== 'all') params.status = status;
      if (method !== 'all') params.method = method;
      const res = await api.get<{ data: PaginatedResponse<Payment> }>('/admin/payments', { params });
      return res.data.data;
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/payments/${id}/confirm`);
    },
    onSuccess: () => {
      toast.success('Payment confirmed');
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
    },
    onError: () => {
      toast.error('Failed to confirm payment');
    },
  });

  const payments = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select
              value={status}
              onValueChange={(val) => { setStatus(val ?? 'all'); setPage(1); }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {paymentStatuses.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={method}
              onValueChange={(val) => { setMethod(val ?? 'all'); setPage(1); }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {paymentMethods.map((m) => (
                  <SelectItem key={m} value={m}>{m.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ref</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length ? (
                  payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id.slice(0, 8)}...</TableCell>
                      <TableCell>{p.method.replace('_', ' ')}</TableCell>
                      <TableCell>{formatVND(p.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={paymentStatusVariant[p.status] ?? 'outline'}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {p.bankTransRef || p.momoTransId || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(p.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {p.status === 'PENDING' && p.method === 'BANK_TRANSFER' && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={confirmMutation.isPending}
                            onClick={() => confirmMutation.mutate(p.id)}
                          >
                            <CheckCircle className="size-3.5" />
                            Confirm
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
