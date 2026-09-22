'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { triggerCheckout } from '@/components/CheckoutButtons';

export default function InvitePage() {
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);
  const searchParams = useSearchParams();
  const ref = 'cizz-HEART';
  const inviteLink = `https://buddy-blind.vercel.app/join?ref=${ref}`;

  useEffect(() => {
    if (searchParams.get('paid') === 'true') setPaid(true);
  }, [searchParams]);

  const copy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInviteCheckout = async () => {
    await triggerCheckout('admin');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center px-6 py-20">
      <h1 className="text-5xl font-black tracking-tight">INVITE</h1>
      <p className="mt-4 text-zinc-500 text-sm text-center max-w-md">Good taste is scarce. Invite only 3 buddies per month. Pay $5 admin fee per book to unlock private events.</p>
      
      <div className="mt-12 w-full max-w-2xl bg-[#111] border border-zinc-800 rounded-[32px] p-8">
        {!paid ? (
          <>
            <div className="text-[11px] tracking-[0.3em] text-zinc-500">PRIVATE EVENTS • $5 ADMIN FEE PER BOOK</div>
            <p className="mt-4 text-sm text-zinc-400">Pay $5 to create a private blind dinner. You can invite 1 buddy per book. Host creates attraction and download reasons.</p>
            <button onClick={handleInviteCheckout} className="mt-6 w-full h-14 rounded-full bg-white text-black font-black text-xs tracking-widest">
              PAY $5 TO UNLOCK INVITE LINK
            </button>
            <p className="mt-4 text-center text-[11px] text-zinc-600">Test card: 4242 4242 4242 4242</p>
          </>
        ) : (
          <>
            <div className="text-[11px] tracking-[0.3em] text-amber-300">✓ PAYMENT SUCCESS • LINK UNLOCKED</div>
            <div className="text-[11px] tracking-[0.3em] text-zinc-500 mt-6">YOUR INVITE LINK</div>
            <div className="mt-4 bg-black border border-zinc-800 rounded-full px-6 py-4 font-mono text-sm truncate">{inviteLink}</div>
            <button onClick={copy} className="mt-6 w-full h-14 rounded-full bg-white text-black font-black text-xs tracking-widest">
              {copied ? 'COPIED ✓' : 'COPY LINK'}
            </button>
            <div className="mt-6 text-center text-[12px] text-zinc-600">1 invite used • 2 left • Resets in 12 days</div>
          </>
        )}
      </div>
    </div>
  );
}
