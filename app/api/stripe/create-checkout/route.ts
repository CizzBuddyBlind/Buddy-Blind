import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  try {
    const { type, venue_id, ref } = await req.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://buddy-blind.vercel.app';

    let priceId = '';
    let mode: 'subscription' | 'payment' = 'subscription';
    let trial_days: number | undefined;

    if (type === 'lite') {
      priceId = process.env.STRIPE_LITE_PRICE_ID!; // price_1UISXEPmyR3fIMKF3EMKbkND
      mode = 'subscription';
    } else if (type === 'premium') {
      priceId = process.env.STRIPE_PREMIUM_PRICE_ID!; // price_1UISXdPmyR3fIMKFkyKCHbsB
      mode = 'subscription';
      trial_days = 90; // 90-day trial per Features Bible
    } else if (type === 'admin') {
      priceId = process.env.STRIPE_ADMIN_FEE_PRICE_ID!; // price_1UISZsPmyR3fIMKFcpj7cNdy
      mode = 'payment';
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const sessionConfig: any = {
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/join?paid=true&venue_id=${venue_id || ''}&ref=${ref || 'cizz-HEART'}`,
      cancel_url: `${baseUrl}/cancel`,
      allow_promotion_codes: true,
      metadata: { type, venue_id: venue_id || '', ref: ref || '' },
    };

    // Special success URLs per type
    if (type === 'admin' && !venue_id) {
      // Invite flow - back to invite page with paid=true
      sessionConfig.success_url = `${baseUrl}/invite?paid=true&ref=${ref || 'cizz-HEART'}`;
    }
    if (type === 'lite' || type === 'premium') {
      sessionConfig.success_url = `${baseUrl}/premium?paid=true&type=${type}`;
    }

    if (mode === 'subscription') {
      sessionConfig.subscription_data = {};
      if (trial_days) {
        sessionConfig.subscription_data.trial_period_days = trial_days;
      }
      sessionConfig.subscription_data.metadata = { type, venue_id: venue_id || '' };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
