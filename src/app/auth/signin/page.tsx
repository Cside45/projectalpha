'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
      <div className="relative">
        <div className="absolute inset-0 bg-grid bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="relative backdrop-blur-xl bg-white/10 p-8 rounded-2xl border border-white/20 shadow-2xl">
          <h1 className="text-3xl font-bold mb-6 text-white">Sign in to TitleSmith AI</h1>
          <p className="text-gray-300 mb-8">Generate engaging titles for your content</p>
          <Button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
          >
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  );
} 