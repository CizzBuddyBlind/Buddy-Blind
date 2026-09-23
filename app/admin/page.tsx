
'use client';
import { useState, useEffect } from 'react';
export default function AdminPage(){
  const [isAdmin,setIsAdmin]=useState(false);
  useEffect(()=>{ setIsAdmin(localStorage.getItem('buddy_admin')==='1'); },[]);
  const toggle = ()=>{
    if(isAdmin){ localStorage.removeItem('buddy_admin'); setIsAdmin(false); }
    else { localStorage.setItem('buddy_admin','1'); setIsAdmin(true); }
  };
  return (
    <div className="min-h-screen bg-[#080808] text-white p-8">
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-[28px] font-black">ADMIN • Edit Mode</h1>
        <p className="mt-2 text-sm text-zinc-500">Edit mode only affects main pages (Home text). Join / Invite flow modals are protected and will NOT show edit pencils, so V9 flow stays simple & stylish.</p>
        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex justify-between items-center">
          <div><div className="text-xs tracking-[0.2em]">EDIT MODE</div><div className="mt-1 text-xs text-zinc-500">{isAdmin ? 'ON - Home page shows ✎ pencils, you can change text, color, move sections, upload photo' : 'OFF - Site shows clean V9 design'}</div></div>
          <button onClick={toggle} className={`px-6 py-2 rounded-full font-bold text-xs ${isAdmin?'bg-amber-400 text-black':'bg-white text-black'}`}>{isAdmin?'DISABLE':'ENABLE'}</button>
        </div>
        <div className="mt-6 text-xs text-zinc-600 space-y-2">
          <div>• Invite — Blind Box 7 steps: LOCATION / DATE / TIME / TYPE / PARTICIPANTS / PREFERENCE / SUMMARY (from your screenshots) is now preserved in components/InviteBlindBoxModal.tsx</div>
          <div>• Join this Blind Box? white card: SCENE / TIME / HOST + CONFIRM JOIN · HK$5 is in components/JoinBlindBoxModal.tsx</div>
          <div>• Both then go to AuthGateModal (Step 1-3 with test card 4242 4242 4242 4242, Exp 12/34, CVC 123, OTP 123456)</div>
          <div>• After PAY → /join?paid=true or /invite?paid=true (404 fixed)</div>
        </div>
      </div>
    </div>
  );
}
