
'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
function JoinContent(){
  const sp = useSearchParams();
  const paid = sp.get('paid');
  const venue_id = sp.get('venue_id');
  const ref = sp.get('ref');
  const [copied,setCopied]=useState(false);
  const [showShare,setShowShare]=useState(false);
  const shareLink = typeof window!=='undefined' ? window.location.origin + '/invite/' + (venue_id || 'kissa-tanaka') + '?ref=' + (ref || 'cizz-HEART') : '';
  const handleShare = async ()=>{
    if(navigator.share){
      try{ await navigator.share({title:'Buddy Blind - Booked', text:'I booked blind dinner - HK$5 admin paid - Blind box confirmed', url:shareLink}); }catch{}
    } else {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(()=>setCopied(false),2000);
      setShowShare(true);
    }
  };
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-7 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300">
        {paid ? (
          <>
            {/* Back button - Impeccable same as other popups */}
            <div className="flex items-center gap-3">
              <button onClick={()=>window.history.back()} className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all">
                <span className="text-[14px]">←</span>
              </button>
              <span className="mono text-[10px] tracking-[0.14em] text-zinc-500">BACK</span>
            </div>

            <div className="mt-6 flex justify-center">
              <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/20 flex items-center justify-center">
                <span className="text-[22px] text-green-400">✓</span>
              </div>
            </div>
            <h1 className="mt-4 text-center font-serif text-[24px] leading-none tracking-tight">BOOKED ✓</h1>
            <p className="mt-2 text-center mono text-[10px] tracking-[0.14em] text-zinc-500">HK$5 ADMIN PAID · BLIND BOX CONFIRMED</p>
            
            <div className="mt-6 bg-black border border-zinc-800 rounded-2xl p-4 space-y-2.5">
              {[
                ['Venue', venue_id || 'Kissa Tanaka'],
                ['Ref', ref || 'cizz-HEART'],
                ['Status', 'Paid · $88 deposit at venue'],
                ['Test Card', '4242 4242 4242 4242 | Exp 12/34 | CVC 123'],
                ['Address', 'Sent 2h before'],
              ].map(([k,v])=>(
                <div key={k} className="flex justify-between gap-3">
                  <span className="mono text-[10px] tracking-[0.1em] text-zinc-500">{k}</span>
                  <span className="text-[12px] font-medium text-white text-right truncate">{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button onClick={handleShare} className="w-full h-12 rounded-full bg-white text-black font-black text-[11px] tracking-[0.14em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2">
                <span>↗</span> {copied ? 'Link Copied!' : 'Share'}
              </button>
              {showShare && (
                <div className="mt-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex gap-2 animate-in fade-in slide-in-from-top-1">
                  <div className="flex-1 h-10 rounded-full bg-black border border-zinc-800 px-4 flex items-center overflow-hidden">
                    <span className="text-[11px] text-zinc-400 truncate">{shareLink}</span>
                  </div>
                  <button onClick={async()=>{ await navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(()=>setCopied(false),2000); }} className="px-4 h-10 rounded-full bg-white text-black font-bold text-[11px]">{copied?'Copied':'Copy'}</button>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-center">
              <Link href="/venues" className="mono text-[10px] tracking-[0.12em] text-zinc-500 hover:text-white transition">Back to Venues</Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <button onClick={()=>window.history.back()} className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-800 transition">←</button>
              <span className="mono text-[10px] tracking-[0.14em] text-zinc-500">BACK</span>
            </div>
            <h1 className="mt-6 font-serif text-[24px]">Join Blind Dinner</h1>
            <p className="mt-2 mono text-[10px] tracking-[0.12em] text-zinc-500">BROWSE VENUES · $5 ADMIN FEE</p>
            <Link href="/venues" className="mt-6 block h-12 rounded-full bg-white text-black font-black text-[11px] tracking-[0.14em] flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition">BROWSE VENUES →</Link>
          </>
        )}
      </div>
    </div>
  );
}
export default function JoinPage(){ return <Suspense fallback={<div className="min-h-screen bg-black"/>}><JoinContent/></Suspense>; }
