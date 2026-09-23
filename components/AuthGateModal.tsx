
'use client';
import { useState, useEffect } from 'react';
import RegisterFlow from './RegisterFlow';

type Props = { isOpen: boolean; onClose: () => void; onSuccess?: () => void; onComplete?: () => void; onVerified?: (data:any) => void; venueName?: string; trigger?: string; };

export default function AuthGateModal({isOpen,onClose,onSuccess,onComplete,onVerified,venueName,trigger}:Props){
  const [hasSaved,setHasSaved]=useState(false);
  const [showRegister,setShowRegister]=useState(false);
  const [paying,setPaying]=useState(false);

  useEffect(()=>{
    if(typeof window!=='undefined'){
      setHasSaved(localStorage.getItem('buddy_card_saved')==='1');
      if(isOpen){
        // If already registered, skip to 1-click
        if(localStorage.getItem('buddy_registered')==='1' && hasSaved){
          // Direct 1-click handled by parent, but fallback
        } else {
          setShowRegister(true);
        }
      }
    }
  },[isOpen,hasSaved]);

  if(!isOpen) return null;

  if(hasSaved && localStorage.getItem('buddy_registered')==='1'){
    // 1-click flow
    return (
      <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-[20px] flex items-center justify-center p-4">
        <div className="w-full max-w-[440px] bg-[#111] border border-zinc-800 rounded-[32px] p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto">✓</div>
          <h2 className="mt-4 text-[18px] font-black">Welcome back</h2>
          <p className="mt-2 text-[12px] text-zinc-500">Saved payment: Visa •••• 4242 • Test card 4242 4242 4242 4242</p>
          <p className="mt-1 text-[11px] text-zinc-600">Single button and done - no retyping</p>
          <button disabled={paying} onClick={async()=>{
            setPaying(true);
            try{
              const r=await fetch('/api/stripe/create-intent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:500,venue_id:venueName||'kissa'})});
              await r.json();
              setPaying(false);
              if(onVerified) onVerified({});
              if(onSuccess) onSuccess();
              if(onComplete) onComplete();
              onClose();
            }catch(e){ setPaying(false); setShowRegister(true); }
          }} className="mt-6 w-full h-[52px] rounded-full bg-white text-black font-black text-[12px] disabled:opacity-50">
            {paying ? 'PAYING...' : `CONFIRM JOIN · HK$5 · •••• 4242`}
          </button>
          <button onClick={()=>{ setHasSaved(false); setShowRegister(true); }} className="mt-3 text-[10px] tracking-widest text-zinc-500 underline">Use different payment method</button>
        </div>
      </div>
    );
  }

  if(showRegister){
    return <RegisterFlow isOpen={isOpen} onClose={onClose} onComplete={(data)=>{ if(onVerified) onVerified(data); if(onSuccess) onSuccess(); if(onComplete) onComplete(); onClose(); }} venueName={venueName} />;
  }

  return null;
}
