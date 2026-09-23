
'use client';
import { useState, useEffect } from 'react';
import JoinBlindBoxModal from '@/components/JoinBlindBoxModal';
import AuthGateModal from '@/components/AuthGateModal';
import ShareModal from '@/components/ShareModal';
import InviteBlindBoxModal from '@/components/InviteBlindBoxModal';

const VENUES_DATA = [
  { id:'kissa-tanaka', name:'Kissa Tanaka', sub:'KISSATEN · JAPANESE · $$', tag:'CREATIVE MINDS', area:'SOHO', time:'TONIGHT 7:30PM', spots:'3 SPOTS LEFT', host:'COMEDIAN · GOLD', letter:'C', invite:'CJ INVITES YOU TO JOIN - CREATIVE MINDS. 4 PEOPLE, 30-40, MEET NEW FRIENDS.', meta:'TODAY 7PM · 4 PEOPLE · FEMALE 30-40 · + MORE THAN ONE EVENT', img:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', bg:'bg-[#F5F3EF]' },
  { id:'yardbird', name:'Yardbird', sub:'IZAKAYA · YAKITORI · $$$', tag:'NIGHT OWLS', area:'CENTRAL', time:'TONIGHT 9PM', spots:'2 SPOTS LEFT', host:'CHEF · SILVER', letter:'C', invite:'CJ INVITES YOU TO JOIN - NIGHT OWLS. 4 PEOPLE, 30-40, MEET NEW FRIENDS.', meta:'TODAY 7PM · 4 PEOPLE · FEMALE 30-40 · + MORE THAN ONE EVENT', img:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800' },
  { id:'la-cabane', name:'La Cabane', sub:'WINE · NATURAL · $$', tag:'WINE LOVERS', area:'CWB', time:'TOMORROW 7PM', spots:'4 SPOTS LEFT', host:'SOMMELIER · GOLD', letter:'S', invite:'CJ INVITES YOU TO JOIN - WINE LOVERS. 4 PEOPLE, 30-40, MEET NEW FRIENDS.', meta:'TODAY 7PM · 4 PEOPLE · FEMALE 30-40 · + MORE THAN ONE EVENT', img:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800' },
  { id:'mott32', name:'Mott 32', sub:'CANTONESE · COCKTAILS · $$$', tag:'FOODIES', area:'CENTRAL', time:'TONIGHT 8PM', spots:'1 SPOT LEFT', host:'DESIGNER · GOLD', letter:'D', invite:'CJ INVITES YOU TO JOIN - FOODIES. 6 PEOPLE, 25-35, MEET NEW FRIENDS.', meta:'TONIGHT 8PM · 6 PEOPLE · ANY 25-35', img:'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800' },
  { id:'little-bao', name:'Little Bao', sub:'BAO · FUSION · $$', tag:'CREATIVE MINDS', area:'SOHO', time:'TOMORROW 7:30PM', spots:'5 SPOTS LEFT', host:'ARTIST · SILVER', letter:'A', invite:'CJ INVITES YOU TO JOIN - CREATIVE MINDS. 4 PEOPLE, 30-40', meta:'TOMORROW 7:30PM · 4 PEOPLE', img:'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800' },
  { id:'ronin', name:'Ronin', sub:'IZAKAYA · JAPANESE · $$$', tag:'NIGHT OWLS', area:'SHEUNG WAN', time:'TONIGHT 10PM', spots:'2 SPOTS LEFT', host:'BARTENDER · GOLD', letter:'B', invite:'CJ INVITES YOU TO JOIN - NIGHT OWLS. LATE NIGHT TALK.', meta:'TONIGHT 10PM · 4 PEOPLE', img:'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800' },
];

export default function VenuesPage(){
  const [selected,setSelected]=useState<any>(null);
  const [showJoin,setShowJoin]=useState(false);
  const [showAuth,setShowAuth]=useState(false);
  const [showShare,setShowShare]=useState(false);
  const [showInvite,setShowInvite]=useState(false);
  const [shareData,setShareData]=useState<any>(null);
  const [hasSaved,setHasSaved]=useState(false);
  useEffect(()=>{ if(typeof window!=='undefined') setHasSaved(localStorage.getItem('buddy_card_saved')==='1'); },[]);

  const openJoin = (v:any)=>{
      if(typeof window!=='undefined'){
        const isRegistered = localStorage.getItem('buddy_registered')==='1';
        if(!isRegistered){
          window.location.href=`/auth?redirect=/venues&action=join&venue=${v.id}`;
          return;
        }
      }
      setSelected(v); setShowJoin(true);
    };
  const confirmFirst = ()=>{ setShowJoin(false); setShowAuth(true); };
  const confirmSaved = ()=>{ setShowJoin(false); window.location.href=`/join?paid=true&venue_id=${selected?.id||'kissa-tanaka'}&ref=cizz-HEART&saved=1`; };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pt-[72px]">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-[72px] font-serif leading-[0.85] tracking-tight">Venues —<br/>Where it happens</h1>
            <p className="mt-4 text-[15px] text-zinc-500 max-w-[420px]">Six scenes tonight. Each with a different photo. No repeats. Click a box for full details.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-5 h-[36px] rounded-full bg-white text-black text-[11px] tracking-widest font-medium">ALL VENUES</button>
            <button className="px-5 h-[36px] rounded-full border border-zinc-800 text-[11px] tracking-widest text-zinc-500">QUICK MEET</button>
            <button className="px-5 h-[36px] rounded-full border border-zinc-800 text-[11px] tracking-widest text-zinc-500">PRIVATE EVENTS</button>
          </div>
        </div>

        <div className="mt-10 flex justify-between items-center border-y border-zinc-900 py-4">
          <div className="flex gap-2">
            {['NEARBY','CUISINE','UPCOMING','TODAY'].map(f=><button key={f} className="px-4 h-[32px] rounded-full border border-zinc-800 text-[10px] tracking-widest text-zinc-500">{f}</button>)}
          </div>
          <input placeholder="SEARCH SOHO, CENTRAL..." className="w-[280px] h-[36px] rounded-full bg-[#151515] border border-zinc-800 px-5 text-[11px] tracking-widest placeholder:text-zinc-600 outline-none"/>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {VENUES_DATA.map(v=>(
            <div key={v.id} className="bg-[#161616] border border-zinc-800 rounded-[20px] p-3 group hover:border-zinc-700 transition-colors">
              <div className="relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-3 h-[24px] rounded-full bg-[#F5F3EF] text-black text-[10px] tracking-widest flex items-center gap-1 font-medium"><span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[8px]">{v.letter}</span>{v.host}</div>
                <div className="relative overflow-hidden rounded-[16px] h-[320px]">
                  <img src={v.img} alt={v.name} className="w-full h-full object-cover"/>
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur text-[10px] tracking-widest">{v.area} · {v.time}</div>
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[#C45A3C] text-white text-[10px] tracking-widest">{v.spots}</div>
                </div>
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start"><h3 className="text-[22px] font-serif">{v.name}</h3><span className="text-[9px] tracking-widest text-zinc-600">{v.tag}</span></div>
                <div className="mt-1 text-[10px] tracking-widest text-zinc-500">{v.sub}</div>
                <div className="mt-3 text-[11px] text-zinc-500 leading-relaxed group-hover:text-[#C45A3C] transition-colors">{v.invite}</div>
                <div className="mt-3 text-[10px] tracking-widest text-zinc-600">{v.meta}</div>
                <div className="mt-4 flex gap-2">
                  <button onClick={()=>openJoin(v)} className="flex-1 h-[40px] rounded-full bg-[#F5F3EF] text-black text-[11px] tracking-widest font-medium">JOIN</button>
                  <button onClick={()=>{
                    if(typeof window!=='undefined'){
                      const isRegistered = localStorage.getItem('buddy_registered')==='1';
                      if(!isRegistered){ window.location.href=`/auth?redirect=/venues&action=invite&venue=${v.id}`; return; }
                    }
                    setSelected(v); setShowInvite(true);
                  }} className="px-4 h-[40px] rounded-full border border-zinc-800 text-[10px] tracking-widest">INVITE</button>
                  <button onClick={()=>{ setShareData(v); setShowShare(true); }} className="w-[40px] h-[40px] rounded-full border border-zinc-800 flex items-center justify-center text-[12px]">↗</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <InviteBlindBoxModal isOpen={showInvite} onClose={()=>setShowInvite(false)} onConfirm={(data)=>{ setShowInvite(false); if(typeof window!=='undefined' && localStorage.getItem('buddy_card_saved')==='1'){ window.location.href=`/invite?paid=true&ref=cizz-HEART&saved=1&venue=${selected?.id||''}`; } else { setShowAuth(true); } }} />
      <ShareModal isOpen={showShare} onClose={()=>setShowShare(false)} title={shareData ? `${shareData.name} - Buddy Blind` : 'Buddy Blind'} url={shareData ? `https://buddy-blind.vercel.app/venues/${shareData.id}` : undefined} />
      <JoinBlindBoxModal isOpen={showJoin} onClose={()=>setShowJoin(false)} onConfirm={confirmFirst} onConfirmWithSaved={confirmSaved} venue={selected ? { scene: `${selected.name} · ${selected.area}`, time: `${selected.time} · ${selected.spots}`, host: selected.host, id: selected.id } : undefined} />
      <AuthGateModal isOpen={showAuth} onClose={()=>setShowAuth(false)} onSuccess={()=>{ setShowAuth(false); window.location.href=`/join?paid=true&venue_id=${selected?.id||'kissa-tanaka'}&ref=cizz-HEART`; }} venueName={selected?.name} trigger="venue-join" />
    </div>
  );
}
