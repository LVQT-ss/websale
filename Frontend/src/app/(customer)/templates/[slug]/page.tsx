'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Star,
  Heart,
  ShoppingCart,
  ExternalLink,
  Check,
  FileText,
  Layers,
  HardDrive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatVND, formatDate } from '@/lib/format';
import { useCartStore } from '@/lib/stores/cart-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import api from '@/lib/api';
import type { Template, TemplateReview, WishlistItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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

export default function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const isInCart = useCartStore((s) => s.isInCart);
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: template, isLoading } = useQuery<Template>({
    queryKey: ['template', slug],
    queryFn: async () => {
      const res = await api.get(`/templates/${slug}`);
      return res.data.data;
    },
  });

  const { data: reviews } = useQuery<TemplateReview[]>({
    queryKey: ['template-reviews', template?.id],
    queryFn: async () => {
      const res = await api.get(`/templates/${template!.id}/reviews`);
      return res.data.data;
    },
    enabled: !!template?.id,
  });

  const { data: wishlistItems } = useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get('/wishlist');
      return res.data.data;
    },
    enabled: !!user,
  });

  const isWishlisted = wishlistItems?.some(
    (item) => item.templateId === template?.id
  );

  const toggleWishlist = useMutation({
    mutationFn: async () => {
      if (!template) return;
      if (isWishlisted) {
        await api.delete(`/wishlist/${template.id}`);
      } else {
        await api.post('/wishlist', { templateId: template.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="aspect-video animate-pulse rounded-lg bg-zinc-100" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-100" />
            <div className="h-24 animate-pulse rounded bg-zinc-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-sm text-zinc-500">Template not found.</p>
        <Link href="/templates" className="mt-3 text-sm text-blue-600 hover:underline">
          Back to templates
        </Link>
      </div>
    );
  }

  const allImages = [template.thumbnail, ...template.images];
  const currentImage = allImages[selectedImage] ?? template.thumbnail;
  const inCart = isInCart(template.id);
  const hasDiscount =
    template.originalPrice && template.originalPrice > template.price;

  const handleAddToCart = () => {
    addItem({
      templateId: template.id,
      name: template.name,
      slug: template.slug,
      price: template.price,
      thumbnail: template.thumbnail,
    });
  };

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          {/* Left — images */}
          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
              <Image
                src={currentImage}
                alt={template.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'relative h-16 w-24 shrink-0 overflow-hidden rounded-md border transition-colors',
                      selectedImage === i
                        ? 'border-blue-600'
                        : 'border-zinc-200 hover:border-zinc-300'
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${template.name} ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {categoryLabels[template.category] ?? template.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {techLabels[template.tech] ?? template.tech}
                </Badge>
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight">
                {template.name}
              </h1>
              <div className="mt-2 flex items-center gap-3 text-sm text-zinc-500">
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {template.avgRating.toFixed(1)}
                </span>
                <span>{template.purchaseCount} purchases</span>
                <span>{template.viewCount} views</span>
              </div>
            </div>

            <Separator />

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-semibold">
                  {formatVND(template.price)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-zinc-400 line-through">
                    {formatVND(template.originalPrice!)}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  'flex-1 gap-2',
                  inCart
                    ? 'border-zinc-300 text-zinc-400'
                    : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                )}
                onClick={handleAddToCart}
                disabled={inCart}
              >
                {inCart ? (
                  <>
                    <Check className="size-4" />
                    In Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="size-4" />
                    Add to Cart
                  </>
                )}
              </Button>

              {user && (
                <Button
                  variant="outline"
                  size="lg"
                  className="shrink-0"
                  onClick={() => toggleWishlist.mutate()}
                >
                  <Heart
                    className={cn(
                      'size-4',
                      isWishlisted
                        ? 'fill-red-500 text-red-500'
                        : 'text-zinc-500'
                    )}
                  />
                </Button>
              )}
            </div>

            {/* Demo */}
            {template.demoUrl && (
              <Link
                href={`/templates/${template.slug}/demo`}
                className="flex items-center gap-2 text-sm text-blue-600 transition-colors hover:text-blue-700"
              >
                <ExternalLink className="size-3.5" />
                View Live Demo
              </Link>
            )}

            <Separator />

            {/* Details */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Layers className="size-3.5" />
                  <span>{template.pages} pages</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <HardDrive className="size-3.5" />
                  <span>{template.fileSize}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <FileText className="size-3.5" />
                  <span>v{template.version}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Description</h3>
              <p className="text-sm leading-relaxed text-zinc-600">
                {template.description}
              </p>
            </div>

            {/* Features */}
            {template.features.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Features</h3>
                  <ul className="space-y-1.5">
                    {template.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-zinc-600"
                      >
                        <Check className="mt-0.5 size-3.5 shrink-0 text-blue-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-20">
          <h2 className="text-xl font-semibold tracking-tight">Reviews</h2>
          {reviews && reviews.length > 0 ? (
            <div className="mt-6 space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-zinc-200 p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium">
                        {review.user?.fullName?.charAt(0) ?? 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {review.user?.fullName ?? 'Anonymous'}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'size-3.5',
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-200'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                    {review.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-zinc-400">No reviews yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
