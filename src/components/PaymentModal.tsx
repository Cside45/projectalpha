import React from 'react';
import { Button } from '@/components/ui/button';

interface PaymentModalProps {
  onClose: () => void;
  onSelectPayment: (type: 'pay_per_use' | 'subscription') => void;
}

export function PaymentModal({ onClose, onSelectPayment }: PaymentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 p-8 rounded-2xl border border-white/20 shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-white">Continue Generating Titles</h2>
        <p className="text-gray-300 mb-6">
          You've used all your free generations. Choose a plan to continue:
        </p>
        
        <div className="space-y-4">
          <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
               onClick={() => onSelectPayment('pay_per_use')}>
            <h3 className="text-xl font-semibold text-white mb-2">Pay Per Use</h3>
            <p className="text-gray-300 mb-4">Get 3 generations for $3</p>
            <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500">
              Buy Now
            </Button>
          </div>

          <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
               onClick={() => onSelectPayment('subscription')}>
            <h3 className="text-xl font-semibold text-white mb-2">Monthly Subscription</h3>
            <p className="text-gray-300 mb-4">30 generations per month for $5</p>
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
              Subscribe
            </Button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 text-gray-400 hover:text-white transition-colors text-sm w-full"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
} 