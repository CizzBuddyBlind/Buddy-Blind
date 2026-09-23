
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
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
        <div className="flex items-center gap-3">
          <button onClick={()=>window.history.back()} className="w-10 h-10 rounded-full border border-zinc-600 flex items-center justify-center text-white text-sm">{"<"}</button>
          <span className="text-xs tracking-widest text-zinc-400 font-bold">BACK</span>
        </div>
        <div className="mt-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-orange-900 bg-opacity-30 border border-orange-700 flex items-center justify-center">
            <span className="text-3xl text-white">V</span>
          </div>
        </div>
        <h1 className="mt-6 text-center text-2xl font-black tracking-widest text-white">INVITE PAID</h1>
        <p className="mt-2 text-center text-sm text-white">Private event link ready Booking summary below</p>

        {data && (
          <div className="mt-6 bg-black border border-zinc-600 rounded-2xl p-5 space-y-3 text-sm">
            <div className="text-sm font-black tracking-widest text-white mb-3">BOOKING SUMMARY</div>
            <div className="flex justify-between"><span className="text-zinc-300 font-bold tracking-widest">RESTAURANT</span><span className="text-white font-bold">{data.venueName || data.name || 'Kissa Tanaka'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-300 font-bold tracking-widest">LOCATION</span><span className="text-white font-bold">{data.location || 'SOHO'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-300 font-bold tracking-widest">DATE</span><span className="text-white font-bold">{data.dateObj ? new Date(data.dateObj).toLocaleDateString('en-US',{weekday:'short', month:'long', day:'numeric'}) : 'Thu May 22'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-300 font-bold tracking-widest">TIME</span><span className="text-white font-bold">{data.time || '7:30 PM'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-300 font-bold tracking-widest">SEATS AVAILABLE</span><span className="text-white font-bold">{data.spots || '3 SPOTS LEFT'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-300 font-bold tracking-widest">TYPE</span><span className="text-white font-bold">{data.type || 'BLIND DATE'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-300 font-bold tracking-widest">PREFERENCE</span><span className="text-white font-bold">{data.gender || 'MALE'} {data.orientation || 'STRAIGHT'} {data.age || '30-40'} {data.participants ? data.participants + ' PEOPLE' : ''}</span></div>
            <div className="mt-4 pt-4 border-t border-zinc-700">
              <div className="text-xs font-mono text-zinc-400">Ref: cizz-HEART</div>
              <div className="text-xs font-mono text-zinc-400 mt-1">Test Card: 4242 4242 4242 4242 Exp 12 34 CVC 123</div>
              <div className="text-xs text-zinc-500 mt-2">Address will be sent 2h before event No menu shown before Blind dining</div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-violet-600 rounded-2xl p-6" style={{backgroundColor:'#6B5CFF'}}>
          <h3 className="text-center text-lg font-black text-white">Send your campaign link to collect invites</h3>
          <p className="mt-2 text-center text-sm text-white opacity-80">Copy and send this link by email, WhatsApp, text, or on your website Focus on link copy No social sync</p>
          <div className="mt-4 flex gap-2">
            <div className="flex-1 h-12 rounded-xl bg-white px-4 flex items-center overflow-hidden">
              <span className="text-xs text-black truncate">{inviteLink}</span>
            </div>
            <button onClick={handleCopy} className="px-5 h-12 rounded-xl bg-emerald-200 text-black font-black text-xs tracking-widest" style={{backgroundColor:'#A7F3D0'}}>{copied ? 'Copied' : 'Copy link'}</button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/venues" className="text-xs tracking-widest text-zinc-400 font-bold underline">Back to Venues</Link>
        </div>
      </div>
    </div>
  );
}

export default function InvitePaidPage(){
  return <Suspense fallback={<div className="min-h-screen bg-black text-white p-8">Loading invite...</div>}><InvitePaidContent/></Suspense>;
}
