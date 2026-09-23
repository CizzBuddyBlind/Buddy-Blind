
'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import InviteBlindBoxModal from '@/components/InviteBlindBoxModal';
import AuthGateModal from '@/components/AuthGateModal';

export default function PrivateEventsPage(){
  const [showInvite,setShowInvite]=useState(false);
  const [showAuth,setShowAuth]=useState(false);
  const [inviteData,setInviteData]=useState<any>(null);

  const confirmBlindBox = (data:any)=>{ setInviteData(data); if(typeof window!=='undefined' && localStorage.getItem('buddy_card_saved')==='1'){ setShowInvite(false); window.location.href=`/invite?paid=true&ref=cizz-HEART&saved=1`; } else { setShowInvite(false); setShowAuth(true); } };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar/>
      <div className="max-w-[1000px] mx-auto px-6 pt-24 pb-20">
        <h1 className="text-[56px] font-black tracking-tight">PRIVATE EVENTS</h1>
        <p className="mt-3 text-[13px] text-zinc-500">Host your own blind box. Pick location, time, type, preferences. $5 admin after confirmation.</p>
        <button onClick={()=>setShowInvite(true)} className="mt-8 h-[56px] px-8 rounded-full bg-[#C46A4A] text-white font-black text-[12px] tracking-widest">CREATE BLIND BOX — $5</button>

        <div className="mt-12 grid gap-4">
          <div className="bg-[#111] border border-zinc-800 rounded-[20px] p-6">
            <div className="text-[11px] tracking-[0.2em] text-zinc-500">HOW IT WORKS</div>
            <div className="mt-3 text-[14px] text-zinc-300 leading-relaxed">1. Choose SOHO / CENTRAL / CWB / TST / SAI KUNG → 2. Pick time → 3. Pick type (Blind Dinner, Wine Night, Tea & Mahjong, Hike, Chef Table, Comedy Night) → 4. Max 6 participants → 5. Set gender / orientation / age preference → 6. Summary & Pay $5 → Host creates attraction.</div>
          </div>
        </div>
      </div>

      <InviteBlindBoxModal isOpen={showInvite} onClose={()=>setShowInvite(false)} onConfirm={confirmBlindBox} />
      <AuthGateModal isOpen={showAuth} onClose={()=>setShowAuth(false)} onSuccess={()=>{ setShowAuth(false); window.location.href=`/invite?paid=true&ref=cizz-HEART`; }} venueName={inviteData ? `${inviteData.location} · ${inviteData.venue}` : 'Private Blind Box'} trigger="private-invite" />
    </div>
  );
}
