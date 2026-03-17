'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import TemplateCard from '@/components/customer/template-card';
import api from '@/lib/api';
import type { WishlistItem } from '@/lib/types';

export default function WishlistPage() {
  const { data: wishlistItems, isLoading } = useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get('/wishlist');
      return res.data.data;
    },
  });

  const items = wishlistItems ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Wishlist</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {items.length > 0
            ? `${items.length} template${items.length !== 1 ? 's' : ''} saved`
            : 'Templates you save will appear here.'}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] animate-pulse rounded-lg border border-zinc-200 bg-zinc-50"
            />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(
            (item) =>
              item.template && (
                <TemplateCard key={item.id} template={item.template} />
              )
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="size-10 text-zinc-300" />
          <p className="mt-4 text-sm text-zinc-500">
            Your wishlist is empty.
          </p>
          <Link
            href="/templates"
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            Browse templates
          </Link>
        </div>
      )}
    </div>
  );
}
