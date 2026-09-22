'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { triggerCheckout } from '@/components/CheckoutButtons';

function JoinInner() {
  const searchParams = useSearchParams();
  const venueId = searchParams.get('venue_id') || searchParams.get('venue');
  const ref = searchParams.get('ref');
  const paid = searchParams.get('paid');
  const [venue, setVenue] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    if (venueId) {
      supabase.from('venues').select('*').eq('id', venueId).single().then(({ data }) => { if (data) setVenue(data); });
    }
  }, [venueId]);

  useEffect(() => {
    if (paid === 'true' && venueId && !booked) {
      const doBook = async () => {
        const { data } = await supabase.from('venues').select('places_left').eq('id', venueId).single();
        if (data && data.places_left > 0) {
          await supabase.from('venues').update({ places_left: data.places_left - 1 }).eq('id', venueId);
          setBooked(true);
        }
      };
      doBook();
    }
  }, [paid, venueId]);

  const handleBook = async () => {
    if (!email) return alert('Enter email');
    setLoading(true);
    await triggerCheckout('admin', venueId || undefined);
    setLoading(false);
  };

  if (booked) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300 text-2xl">✓</div>
        <h1 className="mt-6 text-4xl font-black">BOOKED ✓</h1>
        <p className="mt-4 text-zinc-500 text-sm max-w-md">You paid $5 admin fee. {venue?.name || 'Blind dinner'} secured. Address revealed 2h before. Ref: {ref}</p>
        <p className="mt-2 text-zinc-600 text-xs">{email}</p>
        <button onClick={() => window.location.href='/'} className="mt-8 px-8 h-12 rounded-full bg-white text-black font-black text-xs tracking-widest">BACK TO DROP</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-20 max-w-xl mx-auto">
      <h1 className="text-4xl font-black">JOIN BLIND DROP</h1>
      {ref && <div className="mt-2 text-[11px] tracking-widest text-amber-300">INVITED BY {ref}</div>}
      {venue && (
        <div className="mt-8 bg-[#111] border border-zinc-800 rounded-[24px] p-6">
          <div className="text-[11px] tracking-widest text-amber-300">{venue.places_left} LEFT</div>
          <div className="mt-2 font-bold text-xl">{venue.name} - {venue.location}</div>
          <div className="mt-2 text-sm text-zinc-500">You will see full details after booking. $5 admin fee per book + $88 deposit at venue.</div>
        </div>
      )}
      <div className="mt-8 space-y-4">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your email" className="w-full h-14 rounded-full bg-[#111] border border-zinc-800 px-6 text-sm text-white" />
        <button onClick={handleBook} disabled={loading} className="w-full h-14 rounded-full bg-white text-black font-black text-xs tracking-widest">
          {loading ? 'REDIRECTING TO STRIPE...' : 'BOOK BLIND - PAY $5 ADMIN FEE'}
        </button>
        <div className="text-center text-[11px] text-zinc-600">No name, no photo, just good taste • Refund 24h before • Test card 4242 4242 4242 4242</div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <JoinInner />
    </Suspense>
  );
}
