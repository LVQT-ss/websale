'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { CustomizeRequest, PaginatedResponse, CustomizeStatus } from '@/lib/types';
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

const statuses: CustomizeStatus[] = [
  'PENDING',
  'QUOTED',
  'ACCEPTED',
  'IN_PROGRESS',
  'REVIEW',
  'REVISION',
  'COMPLETED',
  'CANCELLED',
];

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

export default function AdminCustomizePage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('all');
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'customize', page, status],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit };
      if (status !== 'all') params.status = status;
      const res = await api.get<{ data: PaginatedResponse<CustomizeRequest> }>('/admin/customize-requests', { params });
      return res.data.data;
    },
  });

  const requests = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customize Requests</h1>

      <Card>
        <CardContent className="pt-4">
          <Select
            value={status}
            onValueChange={(val) => { setStatus(val ?? 'all'); setPage(1); }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                  <TableHead>Request #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length ? (
                  requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.requestNumber}</TableCell>
                      <TableCell>{req.user?.fullName ?? '—'}</TableCell>
                      <TableCell>{req.template?.name ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant={customizeStatusVariant[req.status] ?? 'outline'}>
                          {req.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(req.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          render={<Link href={`/admin/customize/${req.id}`} />}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No requests found
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
