
'use client';
import { useState } from 'react';
import JoinBlindBoxModal from '@/components/JoinBlindBoxModal';
import AuthGateModal from '@/components/AuthGateModal';
import InviteBlindBoxModal from '@/components/InviteBlindBoxModal';

const PRIVATE_DATA = [
  { id:'speakeasy', title:'Speakeasy Laughs', desc:'Comedian hosts a no-phone real-talk dinner', host:'HOST COMEDIAN STAND-UP CROWD', attraction:'If you laugh at same dark joke you will stay for dessert', badge:'12 DINNERS', img:'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800' },
  { id:'flash', title:'Flash Night', desc:'Tattoo artists plus blank walls plus shared stories', host:'HOST INK STUDIO ARTISTS', attraction:'You bring a memory they bring the ink idea', badge:'8 NIGHTS', img:'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800' },
  { id:'plating', title:'Plating Together', desc:'Private kitchen where strangers plate each others dish', host:'HOST CHEF LIN 6 SEATS', attraction:'You cook for someone you have not met They do same', badge:'15 TABLES', img:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800' },
  { id:'mahjong', title:'Mahjong and Tea', desc:'Slow afternoon fast tiles real talk', host:'HOST TEA HOUSE 4 SEATS', attraction:'You lose a game you gain a story', badge:'6 TABLES', img:'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800' },
  { id:'hike', title:'Golden Hour Hike', desc:'Sunset hike plus blind dinner in Sai Kung', host:'HOST HIKER 8 SEATS', attraction:'You sweat together before you eat together', badge:'10 HIKES', img:'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800' },
  { id:'vinyl', title:'Vinyl Night', desc:'Bring one record leave with one story', host:'HOST DJ 6 SEATS', attraction:'You play your memory they play theirs', badge:'9 NIGHTS', img:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800' },
];

export default function PrivateEventsPage(){
  const [selected,setSelected]=useState<any>(null);
  const [showJoin,setShowJoin]=useState(false);
  const [showAuth,setShowAuth]=useState(false);
  const [showInvite,setShowInvite]=useState(false);
  const openJoin = (v:any)=>{
    if(typeof window!=='undefined'){
      const isRegistered = localStorage.getItem('buddy_registered')==='1';
      if(!isRegistered){ window.location.href='/auth?redirect=/private-events&action=join&venue=' + v.id; return; }
    }
    setSelected(v); setShowJoin(true);
  };
  const confirmFirst = ()=>{ setShowJoin(false); setShowAuth(true); };
  const confirmSaved = ()=>{ setShowJoin(false); window.location.href='/invite?paid=true&ref=cizz-HEART&saved=1&event=' + (selected?.id||''); };
  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4">
          <button onClick={()=>window.history.back()} className="w-10 h-10 rounded-full border border-zinc-600 flex items-center justify-center text-white text-sm">{"<"}</button>
          <h1 className="text-5xl font-serif leading-tight">Private Events</h1>
        </div>
        <p className="mt-4 text-sm text-zinc-500 max-w-xl">Host creates attraction Six cards six different photos Share only after completed No share on cards</p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRIVATE_DATA.map(v=>(
            <div key={v.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-3 group hover:border-orange-600 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-900/30 transition-all duration-300 cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl h-80">
                <img src={v.img} alt={v.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black bg-opacity-70 text-xs text-white">{v.badge}</div>
              </div>
              <div className="p-3">
                <h3 className="text-xl font-serif text-white group-hover:text-orange-500 transition-colors duration-300">{v.title}</h3>
                <div className="mt-1 text-sm text-zinc-400 group-hover:text-orange-400 transition-colors duration-300">{v.desc}</div>
                <div className="mt-3 text-xs tracking-widest text-zinc-500 group-hover:text-orange-500 transition-colors duration-300">{v.host}</div>
                <div className="mt-3 text-xs text-zinc-400 italic leading-relaxed group-hover:text-orange-400 group-hover:font-bold transition-all duration-300">{v.attraction}</div>
                <div className="mt-4 flex gap-2">
                  <button onClick={()=>openJoin(v)} className="flex-1 h-10 rounded-full bg-white text-black text-xs font-medium">JOIN</button>
                  <button onClick={()=>{
                    if(typeof window!=='undefined'){
                      const isRegistered = localStorage.getItem('buddy_registered')==='1';
                      if(!isRegistered){ window.location.href='/auth?redirect=/private-events&action=invite&venue=' + v.id; return; }
                    }
                    setSelected(v); setShowInvite(true);
                  }} className="px-4 h-10 rounded-full border border-zinc-800 text-xs text-white">INVITE</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <InviteBlindBoxModal isOpen={showInvite} onClose={()=>setShowInvite(false)} onConfirm={(data)=>{ if(typeof window!=='undefined'){ localStorage.setItem('buddy_last_invite', JSON.stringify(data)); } setShowInvite(false); setSelected(data); if(typeof window!=='undefined' && localStorage.getItem('buddy_card_saved')==='1'){ window.location.href='/invite?paid=true&ref=cizz-HEART&saved=1&venue=' + (selected?.id||''); } else { setShowAuth(true); } }} />
      <JoinBlindBoxModal isOpen={showJoin} onClose={()=>setShowJoin(false)} onConfirm={confirmFirst} onConfirmWithSaved={confirmSaved} venue={selected ? { scene: selected.title, time: selected.badge, host: selected.host } : undefined} />
      <AuthGateModal isOpen={showAuth} onClose={()=>setShowAuth(false)} onSuccess={()=>{ setShowAuth(false); window.location.href='/invite?paid=true&ref=cizz-HEART&saved=1'; }} venueName={selected?.title || 'Private Event'} trigger="private-invite" />
    </div>
  );
}
