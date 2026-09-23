
'use client';
import { useState } from 'react';
import JoinBlindBoxModal from '@/components/JoinBlindBoxModal';
import AuthGateModal from '@/components/AuthGateModal';
import InviteBlindBoxModal from '@/components/InviteBlindBoxModal';
import { EditableText } from '@/components/EditableText';
import { EditableImage } from '@/components/EditableImage';

const VENUE_DATA = [
  { id:'kissa-tanaka', name:'Kissa Tanaka', area:'SOHO', locations:['SOHO'], time:'TONIGHT 7:30PM', spots:'3 SPOTS LEFT', host:'COMEDIAN GOLD', badge:'BLIND BOX', img:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' },
  { id:'yardbird', name:'Yardbird', area:'SHEUNG WAN', locations:['SHEUNG WAN','CENTRAL'], time:'TOMORROW 8PM', spots:'2 SPOTS LEFT', host:'CHEF TABLE', badge:'WINE NIGHT', img:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800' },
  { id:'mcdonalds', name:'McDonalds', area:'EVERYWHERE', locations:['SOHO','CENTRAL','CWB','TST','SAI KUNG','MONG KOK'], time:'THIS WEEKEND 7PM', spots:'5 SPOTS LEFT', host:'MEET FRIENDS', badge:'BLIND DATE', img:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800' },
  { id:'la-cabane', name:'La Cabane', area:'CWB', locations:['CWB','SOHO'], time:'TONIGHT 9PM', spots:'1 SPOT LEFT', host:'WINE LOVER', badge:'TEA AND MAHJONG', img:'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800' },
  { id:'mott32', name:'Mott 32', area:'CENTRAL', locations:['CENTRAL'], time:'TOMORROW 7:30PM', spots:'4 SPOTS LEFT', host:'ARTIST TABLE', badge:'CHEF TABLE', img:'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800' },
  { id:'yardbird2', name:'Yardbird Upstairs', area:'SHEUNG WAN', locations:['SHEUNG WAN'], time:'THIS WEEKEND 8PM', spots:'2 SPOTS LEFT', host:'MUSICIAN GOLD', badge:'COMEDY NIGHT', img:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' },
];

export default function VenuesPage(){
  const [selected,setSelected]=useState<any>(null);
  const [showJoin,setShowJoin]=useState(false);
  const [showAuth,setShowAuth]=useState(false);
  const [showInvite,setShowInvite]=useState(false);
  const openJoin = (v:any)=>{
    if(typeof window!=='undefined'){
      const isRegistered = localStorage.getItem('buddy_registered')==='1';
      if(!isRegistered){ window.location.href='/auth?redirect=/venues&action=join&venue=' + v.id; return; }
    }
    setSelected(v); setShowJoin(true);
  };
  const confirmFirst = ()=>{ setShowJoin(false); setShowAuth(true); };
  const confirmSaved = ()=>{ setShowJoin(false); window.location.href='/join?paid=true&ref=cizz-HEART&saved=1&venue=' + (selected?.id||''); };
  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4">
          <button onClick={()=>window.history.back()} className="w-10 h-10 rounded-full border border-zinc-600 flex items-center justify-center text-white text-sm">{"<"}</button>
          <EditableText textKey="venues_title" defaultValue="Where it happens" as="h1" className="text-5xl font-serif" />
        </div>
        <EditableText textKey="venues_sub" defaultValue="Restaurants provide the scene Private events create the reason You bring curiosity Six cards six photos different per event coloured more heart no repeats Share only after completed invite or join" as="p" className="mt-4 text-sm text-zinc-400 max-w-xl" />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {VENUE_DATA.map(v=>(
            <div key={v.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-3 group hover:border-zinc-600 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-900/20 transition-all duration-300 cursor-pointer" data-bb-editable="true" data-bb-type="section">
              <div className="relative overflow-hidden rounded-2xl h-80">
                <EditableImage imageKey={`venue_${v.id}_img`} defaultSrc={v.img} alt={v.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black bg-opacity-70 text-xs text-white"><EditableText textKey={`venue_${v.id}_badge`} defaultValue={v.badge} as="span" /></div>
                <div className="absolute bottom-3 left-3 right-3 flex justify-between text-xs">
                  <span className="px-2 py-1 rounded-full bg-black bg-opacity-70 text-white"><EditableText textKey={`venue_${v.id}_area`} defaultValue={v.area} as="span" /></span>
                  <span className="px-2 py-1 rounded-full bg-black bg-opacity-70 text-white"><EditableText textKey={`venue_${v.id}_spots`} defaultValue={v.spots} as="span" /></span>
                </div>
              </div>
              <div className="p-3">
                <EditableText textKey={`venue_${v.id}_name`} defaultValue={v.name} as="h3" className="text-xl font-serif text-white" />
                <div className="mt-1 text-xs text-zinc-400"><EditableText textKey={`venue_${v.id}_time`} defaultValue={`${v.time} ${v.host}`} as="span" /></div>
                <div className="mt-1 text-xs text-zinc-500">Locations <EditableText textKey={`venue_${v.id}_loc`} defaultValue={v.locations.join(', ')} as="span" /> {v.locations.length===1 ? 'auto skip' : 'choose location'}</div>
                <div className="mt-4 flex gap-2">
                  <button onClick={()=>openJoin(v)} className="flex-1 h-10 rounded-full bg-white text-black text-xs font-medium hover:bg-zinc-200 transition" data-bb-editable="true" data-bb-type="button">JOIN</button>
                  <button onClick={()=>{
                    if(typeof window!=='undefined'){
                      const isRegistered = localStorage.getItem('buddy_registered')==='1';
                      if(!isRegistered){ window.location.href='/auth?redirect=/venues&action=invite&venue=' + v.id; return; }
                    }
                    setSelected(v); setShowInvite(true);
                  }} className="px-6 h-10 rounded-full border border-zinc-700 text-xs text-white hover:border-zinc-500 transition" data-bb-editable="true" data-bb-type="button">INVITE</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <InviteBlindBoxModal isOpen={showInvite} onClose={()=>setShowInvite(false)} onConfirm={(data)=>{ if(typeof window!=='undefined'){ localStorage.setItem('buddy_last_invite', JSON.stringify(data)); } setShowInvite(false); if(typeof window!=='undefined' && localStorage.getItem('buddy_card_saved')==='1'){ window.location.href='/invite?paid=true&ref=cizz-HEART&saved=1&venue=' + (selected?.id||''); } else { setShowAuth(true); } }} venue={selected} />
      <JoinBlindBoxModal isOpen={showJoin} onClose={()=>setShowJoin(false)} onConfirm={confirmFirst} onConfirmWithSaved={confirmSaved} venue={selected ? { scene: selected.name, time: selected.time, host: selected.host, area: selected.area, locations: selected.locations, spots: selected.spots } : undefined} />
      <AuthGateModal isOpen={showAuth} onClose={()=>setShowAuth(false)} onSuccess={()=>{ setShowAuth(false); window.location.href='/join?paid=true&ref=cizz-HEART&saved=1'; }} venueName={selected?.name || 'Kissa Tanaka'} trigger="venue-join" />
    </div>
  );
}
