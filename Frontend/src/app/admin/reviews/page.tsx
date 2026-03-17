'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Star as StarIcon, Check, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { TemplateReview, PaginatedResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`size-3.5 ${
            i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
          }`}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: async () => {
      const res = await api.get<{ data: PaginatedResponse<TemplateReview> }>('/admin/reviews');
      return res.data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/admin/reviews/${id}/approve`);
    },
    onSuccess: () => {
      toast.success('Review approved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
    onError: () => toast.error('Failed to approve review'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/reviews/${id}`);
    },
    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
    onError: () => toast.error('Failed to delete review'),
  });

  const reviews = data?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reviews</h1>

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
                  <TableHead>Template</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.length ? (
                  reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">
                        {review.template?.name ?? '—'}
                      </TableCell>
                      <TableCell>{review.user?.fullName ?? '—'}</TableCell>
                      <TableCell>
                        <RatingStars rating={review.rating} />
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {review.content}
                      </TableCell>
                      <TableCell>
                        <Badge variant={review.isApproved ? 'default' : 'outline'}>
                          {review.isApproved ? 'Approved' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {!review.isApproved && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              disabled={approveMutation.isPending}
                              onClick={() => approveMutation.mutate(review.id)}
                            >
                              <Check className="size-3.5 text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              if (confirm('Delete this review?')) {
                                deleteMutation.mutate(review.id);
                              }
                            }}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No reviews found
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
