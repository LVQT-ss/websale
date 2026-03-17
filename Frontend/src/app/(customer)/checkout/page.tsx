'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle, CreditCard, Building2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useCartStore } from '@/lib/stores/cart-store';
import { formatVND } from '@/lib/format';
import api from '@/lib/api';
import type { PaymentMethod, Setting } from '@/lib/types';

export default function CheckoutPage() {
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [receiptImage, setReceiptImage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const { data: settings } = useQuery<Setting[]>({
    queryKey: ['settings', 'bank'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  const bankInfo = settings?.find((s) => s.key === 'bank_info')?.value as
    | { bankName?: string; accountNumber?: string; accountHolder?: string }
    | undefined;

  const createOrder = useMutation({
    mutationFn: async () => {
      // Create order
      const orderRes = await api.post('/orders', {
        items: items.map((item) => ({
          templateId: item.templateId,
        })),
      });
      const order = orderRes.data.data;

      // Create payment
      await api.post('/payments', {
        orderId: order.id,
        method: paymentMethod,
        amount: getTotal(),
        ...(paymentMethod === 'BANK_TRANSFER' && receiptImage
          ? { receiptImage }
          : {}),
      });

      return order;
    },
    onSuccess: (order) => {
      setOrderNumber(order.orderNumber);
      setIsSuccess(true);
      clearCart();
    },
  });

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-sm text-zinc-500">Please login to continue.</p>
        <Link href="/login" className="mt-3">
          <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
            Login
          </Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-sm text-zinc-500">Your cart is empty.</p>
        <Link href="/templates" className="mt-3 text-sm text-blue-600 hover:underline">
          Browse templates
        </Link>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <CheckCircle className="size-12 text-green-500" />
        <h2 className="mt-4 text-xl font-semibold">Order Placed</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Your order <span className="font-medium text-black">#{orderNumber}</span> has
          been placed successfully.
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          {paymentMethod === 'BANK_TRANSFER'
            ? 'Please complete the bank transfer. We will verify your payment shortly.'
            : 'Please complete payment via MoMo. We will verify your payment shortly.'}
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/account/orders">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              View Orders
            </Button>
          </Link>
          <Link href="/templates">
            <Button variant="ghost">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Left — payment method */}
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-medium">Payment Method</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <Building2 className="size-5 text-zinc-500" />
                  <div>
                    <p className="text-sm font-medium">Bank Transfer</p>
                    <p className="text-xs text-zinc-500">Direct bank transfer</p>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('MOMO')}
                  className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                    paymentMethod === 'MOMO'
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <CreditCard className="size-5 text-zinc-500" />
                  <div>
                    <p className="text-sm font-medium">MoMo</p>
                    <p className="text-xs text-zinc-500">E-wallet payment</p>
                  </div>
                </button>
              </div>
            </div>

            {paymentMethod === 'BANK_TRANSFER' && bankInfo && (
              <div className="rounded-lg border border-zinc-200 p-5">
                <h3 className="text-sm font-medium">Bank Details</h3>
                <div className="mt-3 space-y-2 text-sm text-zinc-600">
                  {bankInfo.bankName && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Bank</span>
                      <span className="font-medium text-black">{bankInfo.bankName}</span>
                    </div>
                  )}
                  {bankInfo.accountNumber && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Account</span>
                      <span className="font-mono font-medium text-black">
                        {bankInfo.accountNumber}
                      </span>
                    </div>
                  )}
                  {bankInfo.accountHolder && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Holder</span>
                      <span className="font-medium text-black">{bankInfo.accountHolder}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label htmlFor="receipt" className="text-xs text-zinc-500">
                    <Upload className="size-3" />
                    Receipt Image URL (optional)
                  </Label>
                  <Input
                    id="receipt"
                    placeholder="Paste receipt image URL"
                    value={receiptImage}
                    onChange={(e) => setReceiptImage(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right — order summary */}
          <div className="rounded-lg border border-zinc-200 p-5">
            <h2 className="text-sm font-medium">Order Summary</h2>

            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item.templateId} className="flex items-center gap-3">
                  <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded bg-zinc-50">
                    <Image
                      src={item.thumbnail}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm">{item.name}</p>
                  </div>
                  <span className="shrink-0 text-sm">{formatVND(item.price)}</span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Total</span>
              <span className="text-lg font-semibold">{formatVND(getTotal())}</span>
            </div>

            <Button
              variant="outline"
              size="lg"
              className="mt-6 w-full border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={() => createOrder.mutate()}
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? 'Processing...' : 'Place Order'}
            </Button>

            {createOrder.isError && (
              <p className="mt-3 text-center text-xs text-red-500">
                Failed to place order. Please try again.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
