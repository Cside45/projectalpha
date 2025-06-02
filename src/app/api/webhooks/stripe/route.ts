import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { kv } from '@vercel/kv';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid webhook request' },
        { status: 400 }
      );
    }

    const handleSubscriptionChange = async (subscription: Stripe.Subscription) => {
      try {
        const customer = subscription.customer as string;
        const customerData = await stripe.customers.retrieve(customer);
        
        // Skip if customer is deleted or has no email
        if (customerData.deleted || !('email' in customerData)) return;
        
        const userKey = `user:${customerData.email}`;
        const status = subscription.status;

        if (status === 'active') {
          await Promise.all([
            kv.set(`${userKey}:subscription`, 'subscriber'),
            kv.set(`${userKey}:subscription_id`, subscription.id),
            kv.set(`${userKey}:usage`, 0),
          ]);
        } else if (status === 'canceled' || status === 'unpaid') {
          await Promise.all([
            kv.set(`${userKey}:subscription`, 'free'),
            kv.del(`${userKey}:subscription_id`),
          ]);
        }
      } catch (error) {
        console.error('Subscription update failed');
        throw error;
      }
    };

    const handlePaymentSuccess = async (session: Stripe.Checkout.Session) => {
      try {
        const customerEmail = session.customer_details?.email;
        if (!customerEmail) return;

        const userKey = `user:${customerEmail}`;
        const metadata = session.metadata || {};

        if (metadata.priceType === 'pay_per_use') {
          await Promise.all([
            kv.set(`${userKey}:usage`, 0),
            kv.set(`${userKey}:subscription`, 'pay_per_use'),
          ]);
        }
      } catch (error) {
        console.error('Payment success handling failed');
        throw error;
      }
    };

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handlePaymentSuccess(event.data.object as Stripe.Checkout.Session);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await handleSubscriptionChange(event.data.object as Stripe.Subscription);
          break;
        default:
          return NextResponse.json(
            { error: 'Unhandled event type' },
            { status: 400 }
          );
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      return NextResponse.json(
        { error: 'Webhook processing failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid webhook request' },
      { status: 400 }
    );
  }
} 