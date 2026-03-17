'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatVND } from '@/lib/format';
import { useCartStore } from '@/lib/stores/cart-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import api from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Template, WishlistItem } from '@/lib/types';
import { cn } from '@/lib/utils';

const categoryLabels: Record<string, string> = {
  LANDING_PAGE: 'Landing Page',
  SAAS: 'SaaS',
  ECOMMERCE: 'E-Commerce',
  PORTFOLIO: 'Portfolio',
  BLOG: 'Blog',
  DASHBOARD: 'Dashboard',
  OTHER: 'Other',
};

const techLabels: Record<string, string> = {
  NEXTJS: 'Next.js',
  REACT: 'React',
  VUE: 'Vue',
  HTML_CSS: 'HTML/CSS',
  ASTRO: 'Astro',
  WORDPRESS: 'WordPress',
};

interface TemplateCardProps {
  template: Template;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const isInCart = useCartStore((s) => s.isInCart(template.id));
  const queryClient = useQueryClient();

  const { data: wishlistItems } = useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get('/wishlist');
      return res.data.data;
    },
    enabled: !!user,
  });

  const isWishlisted = wishlistItems?.some(
    (item) => item.templateId === template.id
  );

  const toggleWishlist = useMutation({
    mutationFn: async () => {
      if (isWishlisted) {
        await api.delete(`/wishlist/${template.id}`);
      } else {
        await api.post(`/wishlist/${template.id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      templateId: template.id,
      name: template.name,
      slug: template.slug,
      price: template.price,
      thumbnail: template.thumbnail,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    toggleWishlist.mutate();
  };

  const hasDiscount =
    template.originalPrice && template.originalPrice > template.price;

  return (
    <Link href={`/templates/${template.slug}`} className="group block">
      <div className="rounded-lg border border-zinc-200 p-3 transition-colors hover:border-zinc-300">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-100">
          <Image
            src={template.thumbnail}
            alt={template.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Wishlist button */}
          {user && (
            <button
              onClick={handleToggleWishlist}
              className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white"
            >
              <Heart
                className={cn(
                  'size-4 transition-colors',
                  isWishlisted
                    ? 'fill-red-500 text-red-500'
                    : 'text-zinc-500'
                )}
              />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium leading-tight text-black line-clamp-1">
              {template.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px]">
              {categoryLabels[template.category] ?? template.category}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {techLabels[template.tech] ?? template.tech}
            </Badge>
          </div>

          {/* Rating & purchases */}
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {template.avgRating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <ShoppingCart className="size-3" />
              {template.purchaseCount}
            </span>
          </div>

          {/* Price & cart */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-black">
                {formatVND(template.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-zinc-400 line-through">
                  {formatVND(template.originalPrice!)}
                </span>
              )}
            </div>

            <Button
              variant={isInCart ? 'ghost' : 'outline'}
              size="xs"
              className={cn(
                'text-[11px]',
                isInCart
                  ? 'text-zinc-400'
                  : 'border-blue-600 text-blue-600 hover:bg-blue-50'
              )}
              onClick={handleAddToCart}
              disabled={isInCart}
            >
              {isInCart ? 'In Cart' : 'Add'}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
