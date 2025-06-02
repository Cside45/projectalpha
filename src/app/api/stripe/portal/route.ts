import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Stripe from 'stripe';
import { checkRateLimit } from '@/lib/rate-limiter';

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

    // Check rate limit
    const rateLimitResult = await checkRateLimit(session.user.email, 'payment');
    if (rateLimitResult instanceof NextResponse) {
      return rateLimitResult;
    }

    // Get or create Stripe customer
    const customers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });
    
    let customer = customers.data[0];
    if (!customer) {
      customer = await stripe.customers.create({
        email: session.user.email,
      });
    }

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.NEXTAUTH_URL}/account`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
} 