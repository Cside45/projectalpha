import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Stripe from 'stripe';
import { checkRateLimit } from '@/lib/rate-limiter';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

const PRICE_IDS = {
  pay_per_use: process.env.STRIPE_PRICE_ID_PAY_PER_USE!, // $3 for 3 generations
  subscription: process.env.STRIPE_PRICE_ID_SUBSCRIPTION!, // $5/month subscription
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to continue' },
        { status: 401 }
      );
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(session.user.email, 'payment');
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult;
    }

    const { priceType } = await req.json().catch(() => ({}));
    
    if (!priceType || !PRICE_IDS[priceType as keyof typeof PRICE_IDS]) {
      return NextResponse.json(
        { error: 'Please select a valid payment option' },
        { status: 400 }
      );
    }

    const priceId = PRICE_IDS[priceType as keyof typeof PRICE_IDS];

    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: priceType === 'subscription' ? 'subscription' : 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/payment/cancel`,
        customer_email: session.user.email,
        metadata: {
          userId: session.user.email,
          priceType,
        },
      });

      return NextResponse.json({ url: checkoutSession.url });
    } catch (stripeError) {
      // Handle specific Stripe errors without exposing internal details
      if (stripeError instanceof Stripe.errors.StripeError) {
        return NextResponse.json(
          { error: 'Unable to process payment. Please try again later.' },
          { status: 500 }
        );
      }
      throw stripeError; // Re-throw unexpected errors
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
} 