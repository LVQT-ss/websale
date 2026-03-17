'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/lib/stores/cart-store';
import { formatVND } from '@/lib/format';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const getTotal = useCartStore((s) => s.getTotal);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <ShoppingCart className="size-10 text-zinc-300" />
        <h2 className="mt-4 text-lg font-medium">Your cart is empty</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Browse our templates and add some to your cart.
        </p>
        <Link href="/templates" className="mt-6">
          <Button
            variant="outline"
            className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Browse Templates
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Cart</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </p>

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.templateId}
              className="flex items-center gap-4 rounded-lg border border-zinc-200 p-4"
            >
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-zinc-50">
                <Image
                  src={item.thumbnail}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/templates/${item.slug}`}
                  className="text-sm font-medium hover:text-blue-600"
                >
                  {item.name}
                </Link>
                <p className="mt-0.5 text-sm text-zinc-500">
                  {formatVND(item.price)}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-zinc-400 hover:text-red-500"
                onClick={() => removeItem(item.templateId)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500">Total</span>
          <span className="text-xl font-semibold">{formatVND(getTotal())}</span>
        </div>

        <div className="mt-8">
          <Link href="/checkout">
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Proceed to Checkout
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
