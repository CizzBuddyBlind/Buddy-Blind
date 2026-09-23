
'use client';
import { useState } from 'react';
import JoinBlindBoxModal from '@/components/JoinBlindBoxModal';
import AuthGateModal from '@/components/AuthGateModal';

const PRIVATE_DATA = [
  { id:'speakeasy', title:'Speakeasy Laughs', desc:'Comedian hosts a no-phone, real-talk dinner', host:'HOST: COMEDIAN · STAND-UP CROWD', attraction:'Attraction: If you laugh at the same dark joke, you will stay for dessert.', badge:'12 DINNERS', img:'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800' },
  { id:'flash', title:'Flash Night', desc:'Tattoo artists + blank walls + shared stories', host:'HOST: INK STUDIO · ARTISTS', attraction:'Attraction: You bring a memory, they bring the ink idea.', badge:'8 NIGHTS', img:'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800' },
  { id:'plating', title:'Plating Together', desc:'Private kitchen where strangers plate each other’s dish', host:'HOST: CHEF LIN · 6 SEATS', attraction:'Attraction: You cook for someone you haven’t met. They do the same.', badge:'15 TABLES', img:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800' },
  { id:'mahjong', title:'Mahjong & Tea', desc:'Slow afternoon, fast tiles, real talk', host:'HOST: TEA HOUSE · 4 SEATS', attraction:'Attraction: You lose a game, you gain a story.', badge:'6 TABLES', img:'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800' },
  { id:'hike', title:'Golden Hour Hike', desc:'Sunset hike + blind dinner in Sai Kung', host:'HOST: HIKER · 8 SEATS', attraction:'Attraction: You sweat together before you eat together.', badge:'10 HIKES', img:'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800' },
  { id:'vinyl', title:'Vinyl Night', desc:'Bring one record, leave with one story', host:'HOST: DJ · 6 SEATS', attraction:'Attraction: You play your memory, they play theirs.', badge:'9 NIGHTS', img:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800' },
];

export default function PrivateEventsPage(){
  const [selected,setSelected]=useState<any>(null);
  const [showJoin,setShowJoin]=useState(false);
  const [showAuth,setShowAuth]=useState(false);

  const openJoin = (v:any)=>{
      if(typeof window!=='undefined'){
        const isRegistered = localStorage.getItem('buddy_registered')==='1';
        if(!isRegistered){
          window.location.href=`/auth?redirect=/private-events&action=invite&venue=${v.id}`;
          return;
        }
      }
      setSelected(v); setShowJoin(true);
    };
  const confirmFirst = ()=>{ setShowJoin(false); setShowAuth(true); };
  const confirmSaved = ()=>{ setShowJoin(false); window.location.href=`/invite?paid=true&ref=cizz-HEART&saved=1&event=${selected?.id||''}`; };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pt-[72px]">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <h1 className="text-[72px] font-serif leading-[0.85] tracking-tight">Private Events</h1>
        <p className="mt-4 text-[15px] text-zinc-500 max-w-[600px]">Host creates attraction and download reasons. Six cards, six different photos — comedian, tattoo, chef, wine, mahjong tea, hiking golden hour. Photos always coloured, hover turns text orange #C45A3C.</p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRIVATE_DATA.map(v=>(
            <div key={v.id} className="bg-[#161616] border border-zinc-800 rounded-[20px] p-3 group hover:border-zinc-700 transition-colors">
              <div className="relative overflow-hidden rounded-[16px] h-[320px]">
                <img src={v.img} alt={v.title} className="w-full h-full object-cover"/>
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur text-[10px] tracking-widest">{v.badge}</div>
              </div>
              <div className="p-3">
                <h3 className="text-[22px] font-serif">{v.title}</h3>
                <div className="mt-1 text-[13px] text-zinc-500">{v.desc}</div>
                <div className="mt-3 text-[10px] tracking-widest text-zinc-600">{v.host}</div>
                <div className="mt-3 text-[11px] text-zinc-500 italic leading-relaxed group-hover:text-[#C45A3C] transition-colors">“{v.attraction}”</div>
                <div className="mt-4 flex gap-2">
                  <button onClick={()=>openJoin(v)} className="flex-1 h-[40px] rounded-full bg-[#F5F3EF] text-black text-[11px] tracking-widest font-medium">JOIN</button>
                  <button onClick={()=>openJoin(v)} className="px-5 h-[40px] rounded-full border border-zinc-800 text-[11px] tracking-widest">INVITE</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <JoinBlindBoxModal isOpen={showJoin} onClose={()=>setShowJoin(false)} onConfirm={confirmFirst} onConfirmWithSaved={confirmSaved} venue={selected ? { scene: selected.title, time: selected.badge, host: selected.host } : undefined} />
      <AuthGateModal isOpen={showAuth} onClose={()=>setShowAuth(false)} onSuccess={()=>{ setShowAuth(false); window.location.href=`/invite?paid=true&ref=cizz-HEART&saved=1`; }} venueName={selected?.title || 'Private Event'} trigger="private-invite" />
    </div>
  );
}
