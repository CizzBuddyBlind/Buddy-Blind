
'use client';
import { useState } from 'react';
type Props = { isOpen: boolean; onClose: () => void; onSuccess: ()=>void; venueName?: string; trigger?: string; };
export default function AuthGateModal({isOpen,onClose,onSuccess,venueName,trigger}:Props){
  const [mode,setMode]=useState<'guest'|'login'>('guest');
  if(!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-7 md:p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-[24px] leading-none text-white">Join {venueName || 'Blind Box'}?</h2>
            <div className="mt-2 mono text-[10px] tracking-[0.14em] text-zinc-500">BROWSE FREE · JOIN WHEN READY</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition">✕</button>
        </div>
        <div className="mt-6 space-y-4">
          <div className="bg-black border border-zinc-800 rounded-2xl p-4">
            <div className="mono text-[11px] tracking-[0.12em] text-white">NEW USER · NO REGISTER BEFORE</div>
            <div className="mt-2 text-[12px] leading-relaxed text-zinc-400">You can browse website free. When you press Invite, Join or Subscription, then go to register process we done before. After login, no need to retype to join.</div>
          </div>
          <button onClick={onSuccess} className="w-full h-12 rounded-full bg-white text-black font-black text-[11px] tracking-[0.14em] hover:scale-[1.02] active:scale-[0.98] transition">CONTINUE TO REGISTER · TEST CARD 4242</button>
          <button onClick={onClose} className="w-full h-11 rounded-full border border-zinc-700 text-white font-bold text-[11px] tracking-[0.14em] hover:bg-zinc-800 transition">CONTINUE BROWSING WITHOUT LOGIN</button>
          <div className="mono text-[10px] text-center text-zinc-600">Trigger: {trigger || 'venue-join'} · After login, no retype · Card saved 4242</div>
        </div>
      </div>
    </div>
  );
}
