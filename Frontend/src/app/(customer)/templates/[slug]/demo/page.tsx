'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cart-store';
import api from '@/lib/api';
import type { Template } from '@/lib/types';

export default function TemplateDemoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const addItem = useCartStore((s) => s.addItem);
  const isInCart = useCartStore((s) => s.isInCart);

  const { data: template, isLoading } = useQuery<Template>({
    queryKey: ['template', slug],
    queryFn: async () => {
      const res = await api.get(`/templates/${slug}`);
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-white">
        <p className="text-sm text-zinc-500">Template not found.</p>
        <Link href="/templates" className="text-sm text-blue-600 hover:underline">
          Back to templates
        </Link>
      </div>
    );
  }

  const inCart = isInCart(template.id);

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
    <div className="flex h-screen flex-col bg-white">
      {/* Top bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 px-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/templates/${slug}`}
            className="flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-black"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Link>
          <span className="text-sm font-medium">{template.name}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className={
            inCart
              ? 'border-zinc-300 text-zinc-400'
              : 'gap-1.5 border-blue-600 text-blue-600 hover:bg-blue-50'
          }
          onClick={handleAddToCart}
          disabled={inCart}
        >
          {inCart ? (
            <>
              <Check className="size-3.5" />
              In Cart
            </>
          ) : (
            <>
              <ShoppingCart className="size-3.5" />
              Add to Cart
            </>
          )}
        </Button>
      </div>

      {/* Iframe */}
      <iframe
        src={template.demoUrl}
        className="flex-1 border-0"
        title={`${template.name} demo`}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
