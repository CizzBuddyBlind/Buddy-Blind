
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
function InvitePaidContent(){
  const sp = useSearchParams();
  const [data,setData]=useState<any>(null);
  const [copied,setCopied]=useState(false);
  useEffect(()=>{ const saved=localStorage.getItem('buddy_last_invite'); if(saved){ try{ setData(JSON.parse(saved)); }catch{} } if(!saved){ setData({venueName:'Kissa Tanaka', location:'SOHO', dateObj:new Date(), time:'7:30 PM', type:'BLIND DATE', participants:4, gender:'MALE', orientation:'STRAIGHT', age:'30-40'}); } },[]);
  const handleShare = async ()=>{
    const url = typeof window!=='undefined' ? window.location.origin + '/private-events' : 'https://buddy-blind.vercel.app/private-events';
    const text = 'Join my blind box ' + (data?.venueName||'Kissa Tanaka') + ' ' + (data?.location||'SOHO') + ' ' + (data?.time||'7:30 PM');
    if(navigator.share){ try{ await navigator.share({title:'Buddy Blind Invite', text, url}); return; }catch{} }
    await navigator.clipboard.writeText(url + ' ' + text);
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
        <div className="flex justify-center"><div className="w-20 h-20 rounded-full bg-amber-900 bg-opacity-30 border border-amber-700 flex items-center justify-center"><span className="text-4xl text-white">v</span></div></div>
        <h1 className="mt-6 text-center text-2xl font-black tracking-widest">INVITE PAID</h1>
        <p className="mt-2 text-center text-sm text-white">Private event link ready Booking summary below</p>
        {data && (
          <div className="mt-6 bg-black border border-zinc-600 rounded-2xl p-5 space-y-3 text-sm">
            <div className="text-sm font-black text-white mb-2">BOOKING SUMMARY</div>
            <div className="flex justify-between"><span className="text-zinc-200 font-bold">RESTAURANT</span><span className="text-white font-bold">{data.venueName||'Kissa Tanaka'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-200 font-bold">LOCATION</span><span className="text-white font-bold">{data.location||'SOHO'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-200 font-bold">DATE</span><span className="text-white font-bold">{data.dateObj?new Date(data.dateObj).toLocaleDateString():'Thu May 22'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-200 font-bold">TIME</span><span className="text-white font-bold">{data.time||'7:30 PM'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-200 font-bold">PREFERENCE</span><span className="text-white font-bold">{data.gender} {data.orientation} {data.age}</span></div>
            <div className="mt-4 pt-4 border-t border-zinc-700"><div className="text-xs font-mono text-zinc-300">Ref: cizz-HEART</div><div className="text-xs font-mono text-zinc-300 mt-1">Test Card: 4242 4242 4242 4242 Exp 12 34 CVC 123</div></div>
          </div>
        )}
        <div className="mt-6"><button onClick={handleShare} className="w-full h-14 rounded-full bg-white text-black font-black text-sm">{copied?'Copied Link':'Share Invite Link'}</button><div className="mt-3 text-xs text-center text-white">Share your blind box invite</div></div>
        <div className="mt-6 grid grid-cols-2 gap-3"><Link href="/private-events" className="h-12 rounded-full bg-white text-black font-black text-xs flex items-center justify-center">PRIVATE EVENTS</Link><Link href="/profile" className="h-12 rounded-full border border-zinc-500 text-white font-black text-xs flex items-center justify-center">MY EVENTS</Link></div>
      </div>
    </div>
  );
}
export default function InvitePaidPage(){ return <Suspense fallback={<div className="min-h-screen bg-black text-white p-8">Loading invite...</div>}><InvitePaidContent/></Suspense>; }
