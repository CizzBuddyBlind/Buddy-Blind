'use client';
import { useState } from 'react';

export function CheckoutButtons() {
  const [loading, setLoading] = useState<string | null>(null);

  const checkout = async (type: 'lite' | 'premium' | 'admin', venue_id?: string) => {
    setLoading(type + (venue_id || ''));
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, venue_id, ref: 'cizz-HEART' }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert('Checkout error: ' + data.error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <button onClick={() => checkout('lite')} disabled={!!loading} className="w-full h-14 rounded-full bg-[#111] border border-zinc-700 text-white font-black text-xs tracking-widest">
        {loading === 'lite' ? 'LOADING...' : 'UPGRADE TO LITE — HK$10/mo'}
      </button>
      <button onClick={() => checkout('premium')} disabled={!!loading} className="w-full h-14 rounded-full bg-white text-black font-black text-xs tracking-widest">
        {loading === 'premium' ? 'LOADING...' : 'GET PREMIUM — HK$50/mo • 90-DAY TRIAL'}
      </button>
      <button onClick={() => checkout('admin')} disabled={!!loading} className="w-full h-14 rounded-full bg-[#C45A3C] text-white font-black text-xs tracking-widest">
        {loading === 'admin' ? 'LOADING...' : 'PAY $5 ADMIN FEE PER BOOK'}
      </button>
    </div>
  );
}

// Helper for VenueCard and other pages
export async function triggerCheckout(type: 'lite' | 'premium' | 'admin', venue_id?: string) {
  const res = await fetch('/api/stripe/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, venue_id, ref: 'cizz-HEART' }),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
  else alert(data.error);
}
