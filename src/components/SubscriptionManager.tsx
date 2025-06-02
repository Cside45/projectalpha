import React from 'react';
import { Button } from '@/components/ui/button';

interface SubscriptionManagerProps {
  remainingGenerations: number;
  isSubscriber: boolean;
  onManageSubscription: () => void;
}

export function SubscriptionManager({ 
  remainingGenerations, 
  isSubscriber,
  onManageSubscription 
}: SubscriptionManagerProps) {
  return (
    <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Generation Credits</h3>
        {isSubscriber ? (
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm">
            Premium
          </span>
        ) : (
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
            Free Trial
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        {isSubscriber ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-gray-300">Monthly Generations</p>
              <p className="text-gray-300 font-semibold">{remainingGenerations} / 30</p>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 mb-6">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(remainingGenerations / 30) * 100}%` }}
              />
            </div>
            <Button
              onClick={onManageSubscription}
              variant="outline"
              className="w-full border-white/10 hover:bg-white/5"
            >
              Manage Subscription
            </Button>
            <p className="text-sm text-gray-400 text-center">
              You can cancel anytime through the Stripe customer portal.
              Your subscription will remain active until the end of the billing period.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-gray-300">Free Generations</p>
              <p className="text-gray-300 font-semibold">{remainingGenerations} / 2</p>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 mb-6">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(remainingGenerations / 2) * 100}%` }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
} 