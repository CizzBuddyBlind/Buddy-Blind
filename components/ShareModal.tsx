
'use client';
import { useState } from 'react';
type Props = { isOpen: boolean; onClose: () => void; link: string; summary?: any; };
export default function ShareModal({isOpen,onClose,link,summary}:Props){
  const [copied,setCopied]=useState(false);
  if(!isOpen) return null;
  const handleCopy=async()=>{ await navigator.clipboard.writeText(link); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-7 md:p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-[22px] text-white">Share Invite</h2>
            <div className="mt-1 mono text-[10px] tracking-[0.14em] text-zinc-500">COPY LINK · NO SOCIAL SYNC</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition">✕</button>
        </div>
        {summary && (
          <div className="mt-6 bg-black border border-zinc-800 rounded-2xl p-5 space-y-2.5">
            <div className="mono text-[11px] tracking-[0.14em] text-white">BOOKING SUMMARY</div>
            {Object.entries(summary).slice(0,6).map(([k,v])=>(
              <div key={k} className="flex justify-between gap-4">
                <span className="mono text-[10px] text-zinc-500">{String(k).toUpperCase()}</span>
                <span className="text-[13px] text-white truncate">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 rounded-2xl p-5 border border-orange-500/30" style={{backgroundColor:'#C45A3C'}}>
          <div className="text-center mono text-[11px] tracking-[0.12em] text-white">SEND YOUR CAMPAIGN LINK TO COLLECT INVITES</div>
          <div className="mt-3 flex gap-2">
            <div className="flex-1 h-11 rounded-full bg-white px-4 flex items-center overflow-hidden">
              <span className="text-[11px] text-black truncate">{link}</span>
            </div>
            <button onClick={handleCopy} className="px-5 h-11 rounded-full bg-black text-white font-black text-[11px] tracking-[0.12em] hover:scale-[1.02] active:scale-[0.98] transition">{copied?'Copied':'Copy link'}</button>
          </div>
        </div>
        <button onClick={onClose} className="mt-4 w-full h-11 rounded-full border border-zinc-700 text-white font-bold text-[11px] tracking-[0.14em]">CLOSE</button>
      </div>
    </div>
  );
}
