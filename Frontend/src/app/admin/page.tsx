'use client';

import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Clock,
  Layout,
  Users,
} from 'lucide-react';
import api from '@/lib/api';
import { formatVND, formatDate } from '@/lib/format';
import type { DashboardStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const orderStatusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  PAID: 'default',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
  REFUNDED: 'destructive',
};

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const res = await api.get<{ data: DashboardStats }>('/admin/reports/dashboard');
      return res.data.data;
    },
  });

  const stats = [
    {
      label: 'Total Revenue',
      value: data ? formatVND(data.totalRevenue) : '—',
      icon: DollarSign,
    },
    {
      label: 'Monthly Revenue',
      value: data ? formatVND(data.monthlyRevenue) : '—',
      icon: TrendingUp,
    },
    {
      label: 'Total Orders',
      value: data?.totalOrders ?? '—',
      icon: ShoppingBag,
    },
    {
      label: 'Pending Orders',
      value: data?.pendingOrders ?? '—',
      icon: Clock,
    },
    {
      label: 'Total Templates',
      value: data?.totalTemplates ?? '—',
      icon: Layout,
    },
    {
      label: 'Total Customers',
      value: data?.totalCustomers ?? '—',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-7 w-32 animate-pulse rounded bg-muted" />
                ) : (
                  <p className="text-2xl font-bold">{stat.value}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.recentOrders?.length ? (
                  data.recentOrders.slice(0, 5).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{formatVND(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant={orderStatusVariant[order.status] ?? 'outline'}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No recent orders
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
