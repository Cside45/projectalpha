'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function PaymentCancel() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6 text-white">Payment Cancelled</h1>
        <p className="text-xl text-gray-300 mb-8">
          Your payment was cancelled. No charges were made.
        </p>
        <Button
          onClick={() => router.push('/pricing')}
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
        >
          Back to Pricing
        </Button>
      </div>
    </div>
  );
} 