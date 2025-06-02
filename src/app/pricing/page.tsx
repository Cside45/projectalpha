'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<'pay_per_use' | 'subscription' | null>(null);

  const handlePayment = async (type: 'pay_per_use' | 'subscription') => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setLoading(type);
    try {
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceType: type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process payment',
      });
      setLoading(null);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="relative container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-6 text-white">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Select the plan that best fits your content creation needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Pay Per Use Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="backdrop-blur-xl bg-white/10 p-8 rounded-2xl border border-white/20 shadow-2xl"
          >
            <h2 className="text-2xl font-semibold mb-4 text-white">Pay Per Use</h2>
            <p className="text-gray-300 mb-6">Perfect for occasional use</p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-300">
                <span className="mr-2">✓</span>
                3 additional generations
              </li>
              <li className="flex items-center text-gray-300">
                <span className="mr-2">✓</span>
                No monthly commitment
              </li>
              <li className="flex items-center text-gray-300">
                <span className="mr-2">✓</span>
                Basic analytics
              </li>
            </ul>
            <div className="text-3xl font-bold text-white mb-8">$3</div>
            <Button
              onClick={() => handlePayment('pay_per_use')}
              disabled={loading === 'pay_per_use'}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            >
              {loading === 'pay_per_use' ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                'Buy Now'
              )}
            </Button>
          </motion.div>

          {/* Subscription Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="backdrop-blur-xl bg-white/10 p-8 rounded-2xl border border-white/20 shadow-2xl"
          >
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm">
              Best Value
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-white">Monthly Pro</h2>
            <p className="text-gray-300 mb-6">For regular content creators</p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-300">
                <span className="mr-2">✓</span>
                30 generations per month
              </li>
              <li className="flex items-center text-gray-300">
                <span className="mr-2">✓</span>
                Advanced analytics
              </li>
              <li className="flex items-center text-gray-300">
                <span className="mr-2">✓</span>
                Priority support
              </li>
              <li className="flex items-center text-gray-300">
                <span className="mr-2">✓</span>
                Custom preferences
              </li>
            </ul>
            <div className="text-3xl font-bold text-white mb-8">$5/month</div>
            <Button
              onClick={() => handlePayment('subscription')}
              disabled={loading === 'subscription'}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            >
              {loading === 'subscription' ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                'Subscribe Now'
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </main>
  );
} 