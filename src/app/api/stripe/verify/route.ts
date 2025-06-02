import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Stripe from 'stripe';
import { kv } from '@vercel/kv';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to continue' },
        { status: 401 }
      );
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    if (!checkoutSession) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 400 }
      );
    }

    const userKey = `user:${session.user.email}`;
    
    if (checkoutSession.payment_status === 'paid') {
      if (checkoutSession.metadata?.priceType === 'pay_per_use') {
        // Add 3 more generations to the user's quota
        const currentUsage = await kv.get(`${userKey}:usage`) || 0;
        await kv.set(`${userKey}:usage`, Math.max(0, (currentUsage as number) - 3));
      } else if (checkoutSession.metadata?.priceType === 'subscription') {
        // Set user as a subscriber
        await kv.set(`${userKey}:subscription`, 'subscriber');
        await kv.set(`${userKey}:usage`, 0);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Payment not completed' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
} 