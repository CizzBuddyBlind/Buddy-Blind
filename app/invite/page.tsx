
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function InvitePaidContent(){
  const sp = useSearchParams();
  const [data,setData]=useState<any>(null);
  const [copied,setCopied]=useState(false);
  useEffect(()=>{
    const saved = localStorage.getItem('buddy_last_invite');
    if(saved){ try{ setData(JSON.parse(saved)); }catch{} }
    if(!saved){
      const venue = sp.get('venue') || 'Kissa Tanaka';
      setData({venueName:venue, location:'SOHO', dateObj:new Date(), time:'7:30 PM', type:'BLIND DATE', participants:4, gender:'MALE', orientation:'STRAIGHT', age:'30-40', spots:'3 SPOTS LEFT'});
    }
  },[sp]);

  const inviteLink = typeof window!=='undefined' ? window.location.origin + '/invite/' + (data?.venueName || 'kissa-tanaka').toLowerCase().replace(/\s+/g,'-') + '?ref=cizz-HEART' : 'https://buddy-blind.vercel.app/invite/kissa-tanaka?ref=cizz-HEART';

  const handleCopy = async ()=>{
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-7 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300">
        {/* Back - same as other popups - Impeccable */}
        <div className="flex items-center gap-3">
          <button onClick={()=>window.history.back()} className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all">
            <span className="text-[14px]">←</span>
          </button>
          <span className="mono text-[10px] tracking-[0.14em] text-zinc-500">BACK</span>
        </div>

        <div className="mt-5 flex justify-center">
          <div className="w-12 h-12 rounded-full bg-[#C45A3C]/15 border border-[#C45A3C]/30 flex items-center justify-center">
            <span className="text-[18px] text-white">V</span>
          </div>
        </div>
        <h1 className="mt-4 text-center font-serif text-[22px] leading-none tracking-tight">INVITE PAID</h1>
        <p className="mt-2 text-center mono text-[10px] tracking-[0.14em] text-zinc-500">PRIVATE LINK READY · BOOKING BELOW</p>

        {data && (
          <div className="mt-5 bg-black border border-zinc-800 rounded-2xl p-4 space-y-2.5">
            <div className="mono text-[11px] tracking-[0.14em] text-white">BOOKING SUMMARY</div>
            {[
              ['RESTAURANT', data.venueName || 'Kissa Tanaka'],
              ['LOCATION', data.location || 'SOHO'],
              ['DATE', data.dateObj ? new Date(data.dateObj).toLocaleDateString('en-US',{weekday:'short', month:'short', day:'numeric'}) : 'Tue, Sep 22'],
              ['TIME', data.time || '7:30 PM'],
              ['SEATS', data.spots || '3 SPOTS LEFT'],
              ['TYPE', data.type || 'BLIND DATE'],
              ['PREFERENCE', `${data.gender || 'MALE'} ${data.orientation || 'STRAIGHT'} ${data.age || '30-40'} ${data.participants ? data.participants + 'P' : '4P'}`],
            ].map(([k,v])=>(
              <div key={k} className="flex justify-between gap-3">
                <span className="mono text-[10px] tracking-[0.1em] text-zinc-500">{k}</span>
                <span className="text-[12px] font-medium text-white text-right truncate">{v as string}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-zinc-800 space-y-1">
              <div className="mono text-[10px] text-zinc-600 font-mono">Ref: cizz-HEART · Test: 4242 4242 4242 4242 Exp 12 34 CVC 123</div>
              <div className="text-[10px] text-zinc-600 leading-relaxed">Address sent 2h before · No menu before · Blind dining</div>
            </div>
          </div>
        )}

        {/* Smaller orange box - Impeccable compact, not way too large */}
        <div className="mt-5 rounded-2xl p-4 border border-orange-500/20" style={{backgroundColor:'#C45A3C'}}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="mono text-[11px] tracking-[0.12em] text-white font-bold">SEND CAMPAIGN LINK</div>
              <div className="mt-1 text-[11px] leading-relaxed text-white/80">Copy and send by email, WhatsApp, text, or website. Focus on link copy. No social sync.</div>
            </div>
            <div className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center text-white text-[12px]">↗</div>
          </div>
          <div className="mt-3 flex gap-2">
            <div className="flex-1 h-10 rounded-full bg-white px-3.5 flex items-center overflow-hidden">
              <span className="text-[11px] text-black truncate">{inviteLink}</span>
            </div>
            <button onClick={handleCopy} className="px-4 h-10 rounded-full bg-black text-white font-black text-[10px] tracking-[0.12em] hover:scale-[1.02] active:scale-[0.98] transition">{copied ? 'Copied' : 'Copy link'}</button>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <Link href="/venues" className="mono text-[10px] tracking-[0.12em] text-zinc-500 hover:text-white transition">Back to Venues</Link>
        </div>
      </div>
    </div>
  );
}

export default function InvitePaidPage(){
  return <Suspense fallback={<div className="min-h-screen bg-black"/>}><InvitePaidContent/></Suspense>;
}
