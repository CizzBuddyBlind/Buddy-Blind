import Stripe from 'stripe';
import { NextResponse } from 'next/server';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export async function POST(req:Request){
 try{
  const { amount, venue_id } = await req.json();
  // Create payment intent for embedded checkout - stays inside site
  const intent = await stripe.paymentIntents.create({
    amount: amount || 500, // HK$5.00 = 500 cents
    currency: 'hkd',
    metadata: { venue_id: venue_id||'', source: 'buddy_blind_embedded' },
    automatic_payment_methods: { enabled: true }
  });
  return NextResponse.json({ clientSecret: intent.client_secret });
 }catch(e:any){ return NextResponse.json({error:e.message},{status:500}); }
}
