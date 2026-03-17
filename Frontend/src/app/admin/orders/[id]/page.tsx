'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { formatVND, formatDate } from '@/lib/format';
import type { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

const orderStatusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  PAID: 'default',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
  REFUNDED: 'destructive',
};

const paymentStatusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  SUCCESS: 'default',
  FAILED: 'destructive',
  REFUNDED: 'destructive',
};

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin', 'order', params.id],
    queryFn: async () => {
      const res = await api.get<{ data: Order }>(`/orders/${params.id}`);
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return <p className="py-10 text-center text-muted-foreground">Order not found</p>;
  }

  // Build a status timeline from order dates
  const timeline: { label: string; date: string | null }[] = [
    { label: 'Created', date: order.createdAt },
    { label: 'Paid', date: order.paidAt ?? null },
    { label: 'Completed', date: order.completedAt ?? null },
    { label: 'Cancelled', date: order.cancelledAt ?? null },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" render={<Link href="/admin/orders" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
        <Badge variant={orderStatusVariant[order.status] ?? 'outline'}>
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{order.customerName}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{order.customerEmail}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{formatVND(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Status Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeline.map((step) =>
                step.date ? (
                  <div key={step.label} className="flex items-center gap-3">
                    <div className="size-2.5 rounded-full bg-primary" />
                    <div className="flex flex-1 justify-between">
                      <span className="font-medium">{step.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(step.date)}
                      </span>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.length ? (
                order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.templateName}</TableCell>
                    <TableCell className="text-right">{formatVND(item.unitPrice)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No items
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Info */}
      {order.payments && order.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>{formatVND(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={paymentStatusVariant[payment.status] ?? 'outline'}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(payment.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
