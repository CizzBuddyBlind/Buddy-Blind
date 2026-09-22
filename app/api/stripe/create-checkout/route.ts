import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { type, venue_id, ref } = await req.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://buddy-blind.vercel.app';

    let priceId = '';
    let mode: 'subscription' | 'payment' = 'subscription';
    let trial_days: number | undefined = undefined;

    if (type === 'lite') {
      priceId = process.env.STRIPE_LITE_PRICE_ID!;
      mode = 'subscription';
    } else if (type === 'premium') {
      priceId = process.env.STRIPE_PREMIUM_PRICE_ID!;
      mode = 'subscription';
      trial_days = 90;
    } else if (type === 'admin') {
      priceId = process.env.STRIPE_ADMIN_FEE_PRICE_ID!;
      mode = 'payment';
    } else {
      return NextResponse.json({ error: 'Invalid type: ' + type }, { status: 400 });
    }

    const sessionParams: any = {
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/premium?paid=true&type=${type}`,
      cancel_url: `${baseUrl}/cancel`,
      allow_promotion_codes: true,
      metadata: { type, venue_id: venue_id || '', ref: ref || 'cizz-HEART' },
    };

    if (type === 'admin') {
      if (venue_id) {
        sessionParams.success_url = `${baseUrl}/join?paid=true&venue_id=${venue_id}&ref=${ref || 'cizz-HEART'}`;
      } else {
        sessionParams.success_url = `${baseUrl}/invite?paid=true&ref=${ref || 'cizz-HEART'}`;
      }
    }

    if (mode === 'subscription') {
      sessionParams.subscription_data = { metadata: { type } };
      if (trial_days) sessionParams.subscription_data.trial_period_days = trial_days;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error('Stripe error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
