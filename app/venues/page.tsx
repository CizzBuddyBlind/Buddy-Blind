
'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import JoinBlindBoxModal from '@/components/JoinBlindBoxModal';
import AuthGateModal from '@/components/AuthGateModal';

const VENUES = [
  { id:'kissa-tanaka', letter:'M', name:'Kissa Tanaka', area:'SOHO', time:'TONIGHT 7:30PM', left:6, type:'BLIND DROP · NO MENU', host:'COMEDIAN · GOLD', price:'$$ · CREATIVE MINDS' },
  { id:'yardbird', letter:'Y', name:'Yardbird', area:'SHEUNG WAN', time:'TONIGHT 8:00PM', left:3, type:'CHEF TABLE', host:'CHEF · SILVER', price:'$$$ · FOODIES' },
  { id:'mott32', letter:'M', name:'Mott 32', area:'CENTRAL', time:'TOMORROW 7PM', left:2, type:'WINE NIGHT', host:'SOMMELIER · GOLD', price:'$$$ · WINE LOVERS' },
];

export default function VenuesPage(){
  const [selected,setSelected]=useState<any>(null);
  const [showJoin,setShowJoin]=useState(false);
  const [showAuth,setShowAuth]=useState(false);

  const openJoin = (v:any)=>{ setSelected(v); setShowJoin(true); };
  const confirmJoin = ()=>{ setShowJoin(false); setShowAuth(true); };
  const confirmSaved = ()=>{ setShowJoin(false); window.location.href=`/join?paid=true&venue_id=${selected?.id||'kissa-tanaka'}&ref=cizz-HEART&saved=1`; };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar/>
      <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-20">
        <h1 className="text-[64px] font-black tracking-tight leading-[0.9]">BUDDY BLIND</h1>
        <p className="mt-4 text-[12px] tracking-[0.2em] text-zinc-500">BROWSE VENUES FREE. PAY $5 ONLY WHEN YOU JOIN. NO MENU. ADDRESS 2H BEFORE.</p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {VENUES.map(v=>(
            <div key={v.id} className="bg-[#111] border border-zinc-800 rounded-[24px] p-5">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-full bg-[#F5F3EF] text-black flex items-center justify-center font-black">{v.letter}</div>
                <div className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-[10px] tracking-widest text-amber-300">{v.left} LEFT</div>
              </div>
              <h3 className="mt-4 text-[18px] font-bold">{v.name}</h3>
              <div className="mt-1 text-[10px] tracking-[0.2em] text-zinc-500">{v.area} · {v.time} · {v.type}</div>
              <div className="mt-3 text-[10px] text-zinc-600">{v.host} · {v.price}</div>
              <button onClick={()=>openJoin(v)} className="mt-6 w-full h-[44px] rounded-full bg-white text-black font-black text-[11px] tracking-widest">JOIN — $5</button>
            </div>
          ))}
        </div>
      </div>

      <JoinBlindBoxModal isOpen={showJoin} onClose={()=>setShowJoin(false)} onConfirm={confirmJoin} onConfirmWithSaved={confirmSaved} venue={selected ? { scene: `${selected.name} · ${selected.area}`, time: `${selected.time} · ${selected.left} SPOTS LEFT`, host: selected.host } : undefined} />
      <AuthGateModal isOpen={showAuth} onClose={()=>setShowAuth(false)} onSuccess={()=>{ setShowAuth(false); window.location.href=`/join?paid=true&venue_id=${selected?.id || 'kissa-tanaka'}&ref=cizz-HEART`; }} venueName={selected?.name} trigger="venue-join" />
    </div>
  );
}
