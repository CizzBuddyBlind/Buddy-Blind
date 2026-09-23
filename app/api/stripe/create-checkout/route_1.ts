import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY' }, { status: 500 });
    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' as any });
    const body = await req.json().catch(() => ({}));
    // Example checkout - adapt price
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: body.line_items || [{ price_data: { currency: 'nzd', product_data: { name: 'Buddy Blind Ticket' }, unit_amount: 4500 }, quantity: 1 }],
      mode: 'payment',
      success_url: body.success_url || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/success`,
      cancel_url: body.cancel_url || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/cancel`,
    });
    return NextResponse.json({ url: session.url, id: session.id });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
