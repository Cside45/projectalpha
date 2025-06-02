'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');

  useEffect(() => {
    // Here you could verify the session and update the user's subscription status
    // This would typically be handled by a webhook, but we can do a client-side check too
    if (sessionId) {
      fetch('/api/stripe/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
    }
  }, [sessionId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6 text-white">Payment Successful!</h1>
        <p className="text-xl text-gray-300 mb-8">
          Thank you for your purchase. You can now continue generating titles.
        </p>
        <Button
          onClick={() => router.push('/')}
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
        >
          Back to Generator
        </Button>
      </div>
    </div>
  );
} 