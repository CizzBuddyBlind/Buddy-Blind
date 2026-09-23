
'use client';
import { useState } from 'react';
import JoinBlindBoxModal from '@/components/JoinBlindBoxModal';
import AuthGateModal from '@/components/AuthGateModal';
import InviteBlindBoxModal from '@/components/InviteBlindBoxModal';
import { EditableText } from '@/components/EditableText';
import { EditableImage } from '@/components/EditableImage';

const VENUE_DATA = [
  { id:'kissa-tanaka', name:'Kissa Tanaka', area:'SOHO', locations:['SOHO'], time:'TONIGHT 7:30PM', spots:'3 SPOTS LEFT', host:'COMEDIAN GOLD', img:'/venues/kissa.jpg' },
  { id:'yardbird', name:'Yardbird', area:'SHEUNG WAN', locations:['SHEUNG WAN','CENTRAL'], time:'TOMORROW 8PM', spots:'2 SPOTS LEFT', host:'CHEF TABLE', img:'/venues/yardbird.jpg' },
  { id:'mcdonalds', name:'McDonalds', area:'EVERYWHERE', locations:['SOHO','CENTRAL','CWB','TST','SAI KUNG','MONG KOK'], time:'THIS WEEKEND', spots:'5 SPOTS LEFT', host:'FAST FOOD', img:'/venues/mcd.jpg' },
  { id:'la-cabane', name:'La Cabane', area:'CWB', locations:['CWB','SOHO'], time:'TONIGHT 9PM', spots:'1 SPOT LEFT', host:'WINE LOVER', img:'/venues/cabane.jpg' },
  { id:'mott32', name:'Mott 32', area:'CENTRAL', locations:['CENTRAL'], time:'TOMORROW 7:30PM', spots:'4 SPOTS LEFT', host:'ARTIST TABLE', img:'/venues/mott.jpg' },
  { id:'yardbird2', name:'Yardbird Upstairs', area:'SHEUNG WAN', locations:['SHEUNG WAN'], time:'THIS WEEKEND 8PM', spots:'2 SPOTS LEFT', host:'ROOFTOP', img:'/venues/yardbird2.jpg' },
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
          <button onClick={()=>window.history.back()} className="w-10 h-10 rounded-full border border-zinc-600 flex items-center justify-center">←</button>
          <EditableText textKey="venues_title" defaultValue="Where it happens" as="h1" className="text-5xl font-serif" />
        </div>
        <EditableText textKey="venues_sub" defaultValue="Restaurants provide the scene Private events create the reason You bring curiosity" className="mt-4 text-zinc-400 max-w-2xl" />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {VENUE_DATA.map(v=>(
            <div key={v.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-3 group hover:border-zinc-600 hover:-translate-y-2 transition">
              <div className="relative overflow-hidden rounded-2xl h-80 w-full">
                <EditableImage imageKey={`venue_${v.id}_img`} defaultSrc={v.img} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black bg-opacity-70 text-xs text-white"><EditableText textKey={`venue_${v.id}_tag`} defaultValue="BLIND BOX" /></div>
                <div className="absolute bottom-3 left-3 right-3 flex justify-between text-xs">
                  <span className="px-2 py-1 rounded-full bg-black bg-opacity-70 text-white"><EditableText textKey={`venue_${v.id}_area`} defaultValue={v.area} /></span>
                  <span className="px-2 py-1 rounded-full bg-black bg-opacity-70 text-white"><EditableText textKey={`venue_${v.id}_spots`} defaultValue={v.spots} /></span>
                </div>
              </div>
              <div className="p-3">
                <EditableText textKey={`venue_${v.id}_name`} defaultValue={v.name} as="h3" className="text-xl font-serif text-white" />
                <div className="mt-1 text-xs text-zinc-400"><EditableText textKey={`venue_${v.id}_time`} defaultValue={`${v.time} ${v.host}`} /></div>
                <div className="mt-1 text-xs text-zinc-500">
                  {(() => {
                    const raw = (v as any).locations || (v as any).location || (v as any).area || '';
                    const arr = Array.isArray(raw)? raw : String(raw).split(',').map((s:string)=>s.trim()).filter(Boolean);
                    if (!arr.length) return null;
                    const first = arr[0];
                    const more = arr.length > 1? ` +${arr.length - 1}` : '';
                    return <span>{first}{more}</span>;
                  })()}
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={()=>openJoin(v)} className="flex-1 h-10 rounded-full bg-white text-black text-xs font-medium hover:bg-zinc-200">JOIN</button>
                  <button onClick={()=>{
                    if(typeof window!=='undefined'){
                      const isRegistered = localStorage.getItem('buddy_registered')==='1';
                      if(!isRegistered){ window.location.href='/auth?redirect=/venues&action=invite&venue=' + v.id; return; }
                    }
                    setSelected(v); setShowInvite(true);
                  }} className="px-6 h-10 rounded-full border border-zinc-700 text-xs text-white hover:border-zinc-500 transition">INVITE</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <InviteBlindBoxModal isOpen={showInvite} onClose={()=>setShowInvite(false)} onConfirm={(data)=>{ if(typeof window!=='undefined'){ localStorage.setItem('buddy_invite_data', JSON.stringify(data)); window.location.href='/join?paid=true&ref=invite&venue='+(selected?.id||''); }}} />
      <JoinBlindBoxModal isOpen={showJoin} onClose={()=>setShowJoin(false)} onConfirm={confirmFirst} onConfirmWithSaved={confirmSaved} venue={selected} />
      <AuthGateModal isOpen={showAuth} onClose={()=>setShowAuth(false)} onSuccess={()=>{ setShowAuth(false); window.location.href='/join?paid=true&ref=cizz-HEART&saved=1&venue='+(selected?.id||''); }} />
    </div>
  );
}
