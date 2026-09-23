
'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
function JoinContent(){
  const sp = useSearchParams();
  const paid = sp.get('paid');
  const venue_id = sp.get('venue_id');
  const ref = sp.get('ref');
  return (
    <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
        {paid ? (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto text-[28px]">✓</div>
            <h1 className="mt-6 text-2xl font-black tracking-tight">BOOKED ✓</h1>
            <p className="mt-2 text-sm text-zinc-400">HK$5 admin paid. Blind box confirmed.</p>
            <div className="mt-6 bg-black border border-zinc-800 rounded-2xl p-4 text-left text-xs space-y-1 font-mono">
              <div>Venue: {venue_id || 'Kissa Tanaka'}</div>
              <div>Ref: {ref || 'cizz-HEART'}</div>
              <div>Status: Paid • $88 deposit at venue</div>
              <div>Test Card: 4242 4242 4242 4242 | Exp 12/34 | CVC 123</div>
              <div>Address: Sent 2h before</div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link href="/venues" className="h-12 rounded-full bg-white text-black font-black text-xs flex items-center justify-center">VENUES</Link>
              <Link href="/profile" className="h-12 rounded-full border border-zinc-700 font-black text-xs flex items-center justify-center">MY BOOKINGS</Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-black">JOIN BLIND DINNER</h1>
            <p className="mt-2 text-sm text-zinc-500">Choose a venue. $5 admin fee.</p>
            <Link href="/venues" className="mt-6 block h-14 rounded-full bg-white text-black font-black text-xs flex items-center justify-center">BROWSE VENUES →</Link>
          </>
        )}
      </div>
    </div>
  );
}
export default function JoinPage(){ return <Suspense><JoinContent/></Suspense>; }
