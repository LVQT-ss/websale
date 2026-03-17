'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import api from '@/lib/api';
import { formatVND } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RevenueData {
  date: string;
  revenue: number;
}

interface TopTemplate {
  id: string;
  name: string;
  purchaseCount: number;
  revenue: number;
}

interface TopCustomer {
  id: string;
  fullName: string;
  email: string;
  totalSpent: number;
  orderCount: number;
}

interface ReportsData {
  revenueChart: RevenueData[];
  topTemplates: TopTemplate[];
  topCustomers: TopCustomer[];
}

export default function AdminReportsPage() {
  const [startDate, setStartDate] = useState(() =>
    format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(() =>
    format(new Date(), 'yyyy-MM-dd')
  );

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reports', startDate, endDate],
    queryFn: async () => {
      const [revenueRes, templatesRes, customersRes] = await Promise.all([
        api.get<{ data: RevenueData[] }>('/admin/reports/revenue', {
          params: { from: startDate, to: endDate },
        }),
        api.get<{ data: TopTemplate[] }>('/admin/reports/templates', {
          params: { limit: 10 },
        }),
        api.get<{ data: TopCustomer[] }>('/admin/reports/customers', {
          params: { limit: 10 },
        }),
      ]);
      return {
        revenueChart: revenueRes.data.data,
        topTemplates: templatesRes.data.data,
        topCustomers: customersRes.data.data,
      } as ReportsData;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      {/* Date range picker */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 animate-pulse rounded bg-muted" />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data?.revenueChart ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(val) => {
                    try {
                      return format(new Date(val), 'dd/MM');
                    } catch {
                      return val;
                    }
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(val) =>
                    new Intl.NumberFormat('vi-VN', {
                      notation: 'compact',
                    }).format(val)
                  }
                />
                <Tooltip
                  formatter={(value) => [formatVND(Number(value)), 'Revenue']}
                  labelFormatter={(label) => {
                    try {
                      return format(new Date(label), 'dd/MM/yyyy');
                    } catch {
                      return label;
                    }
                  }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Top Templates</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.topTemplates?.length ? (
                    data.topTemplates.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell className="text-right">{t.purchaseCount}</TableCell>
                        <TableCell className="text-right">{formatVND(t.revenue)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.topCustomers?.length ? (
                    data.topCustomers.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{c.fullName}</p>
                            <p className="text-xs text-muted-foreground">{c.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{c.orderCount}</TableCell>
                        <TableCell className="text-right">{formatVND(c.totalSpent)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
