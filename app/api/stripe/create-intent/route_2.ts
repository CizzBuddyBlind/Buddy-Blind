import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY' }, { status: 500 });
    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' as any });
    const body = await req.json().catch(() => ({}));
    const intent = await stripe.paymentIntents.create({
      amount: body.amount || 4500,
      currency: body.currency || 'nzd',
      automatic_payment_methods: { enabled: true },
    });
    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
