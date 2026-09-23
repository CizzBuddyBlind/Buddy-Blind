"use client";
import { useState, useEffect } from "react";
type Props = { isOpen: boolean; onClose: () => void; onConfirm: ()=>void; onConfirmWithSaved?: ()=>void; venue?: any; };
export default function JoinBlindBoxModal({isOpen,onClose,onConfirm,onConfirmWithSaved,venue}:Props){
  const [hasSaved,setHasSaved]=useState(false);
  const [last4,setLast4]=useState("4242");
  const [paying,setPaying]=useState(false);
  useEffect(()=>{ if(typeof window!=="undefined"){ setHasSaved(localStorage.getItem("buddy_card_saved")==="1"); setLast4(localStorage.getItem("buddy_card_last4")||"4242"); } },[isOpen]);
  if(!isOpen) return null;
  const v = venue || { scene:"KISSA TANAKA · SOHO", time:"TONIGHT 7:30PM · 3 SPOTS LEFT", host:"COMEDIAN · GOLD" };
  const handleConfirm = async ()=>{
    if(hasSaved && onConfirmWithSaved){
      setPaying(true);
      try{ const r=await fetch("/api/stripe/create-intent",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({amount:500,venue_id:venue?.id||"kissa", saved:true})}); await r.json(); setPaying(false); onConfirmWithSaved(); }catch(e){ setPaying(false); onConfirm(); }
    } else { onConfirm(); }
  };
  return (
    <div className="fixed inset-0 z-40 bg-black backdrop-blur flex items-center justify-center p-4">
      <div className="w-full max-w-[460px] bg-white rounded-[28px] p-8 text-black">
        <h2 className="text-[32px] font-serif leading-[0.9] tracking-tight">Join this<br/>Blind Box?</h2>
        <p className="mt-4 text-[14px] text-zinc-600 leading-relaxed">You won"t see names or photos before. You"ll see neighborhood, vibe, time, places left. That"s the point.</p>
        <div className="mt-6 bg-white/70 border border-zinc-200 rounded-[16px] p-4 space-y-2 text-[11px]">
          <div className="flex justify-between"><span className="text-zinc-500 tracking-widest">SCENE</span><span className="tracking-widest font-medium">{v.scene}</span></div>
          <div className="flex justify-between"><span className="text-zinc-500 tracking-widest">TIME</span><span className="tracking-widest font-medium">{v.time}</span></div>
          <div className="flex justify-between"><span className="text-zinc-500 tracking-widest">HOST</span><span className="tracking-widest font-medium">{v.host}</span></div>
        </div>
        {hasSaved ? (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-[12px] p-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px]">✓</div>
            <div className="text-[11px]"><span className="font-bold">Saved payment:</span> Visa ---- {last4} - 4242 - Single button checkout</div>
          </div>
        ) : (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-[12px] p-3 text-[11px] text-amber-800">First time: OTP 123456 + card 4242 4242 4242 4242 Exp 12/34 CVC 123, then save for 1-click.</div>
        )}
        <div className="mt-6 flex gap-3">
          <button disabled={paying} onClick={handleConfirm} className="flex-1 h-[48px] rounded-full bg-black text-white font-bold text-[12px] tracking-widest disabled:opacity-50">{paying?"PAYING...": hasSaved ? `CONFIRM JOIN · HK$5 · ---- ${last4}` : "CONFIRM JOIN · HK$5"}</button>
          <button onClick={onClose} className="px-6 h-[48px] rounded-full border border-zinc-300 text-[12px] tracking-widest">CANCEL</button>
        </div>
        <div className="mt-4 text-[10px] tracking-[0.2em] text-zinc-400 text-center">DIFFERENT PHOTOS PER EVENT · MORE HEART · NO REPEATS {hasSaved ? "· 1-CLICK" : ""}</div>
      </div>
    </div>
  );
}
