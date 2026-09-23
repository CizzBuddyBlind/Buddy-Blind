
'use client';
type Props = { isOpen: boolean; onClose: () => void; onConfirm: () => void; onConfirmWithSaved?: () => void; venue?: any; };
export default function JoinBlindBoxModal({isOpen,onClose,onConfirm,onConfirmWithSaved,venue}:Props){
  if(!isOpen) return null;
  const scene = venue?.scene || venue?.name || 'Yardbird';
  const time = venue?.time || 'TOMORROW 8PM';
  const host = venue?.host || 'CHEF TABLE';
  const location = venue?.locations ? venue.locations[0] : venue?.area || 'SOHO';
  const spots = venue?.spots || '3 SPOTS LEFT';
  const hasSaved = typeof window!=='undefined' && localStorage.getItem('buddy_card_saved')==='1';
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] bg-[#0f0f0f] border border-zinc-800 rounded-[28px] p-7 md:p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-[26px] leading-[0.9] text-white tracking-tight">Join this<br/>Blind Box?</h2>
            <div className="mt-2 mono text-[10px] tracking-[0.14em] text-zinc-500">BLIND DINING · NO NAMES · NO PHOTOS</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition">✕</button>
        </div>
        <p className="mt-5 text-[13px] leading-relaxed text-zinc-400">You wont see names or photos before. You will see neighborhood, vibe, time, places left. That is the point.</p>
        
        <div className="mt-6 bg-black border border-zinc-800 rounded-2xl p-5 space-y-3">
          {[
            ['SCENE', scene],
            ['TIME', time],
            ['HOST', host],
            ['LOCATION', location],
            ['SEATS', spots],
          ].map(([k,v])=>(
            <div key={k} className="flex justify-between gap-4">
              <span className="mono text-[10px] tracking-[0.12em] text-zinc-500">{k}</span>
              <span className="text-[13px] font-medium text-white tracking-[0.02em] text-right">{v as string}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-[#C45A3C]/10 border border-[#C45A3C]/20 rounded-2xl p-4 flex gap-3 items-center">
          <div className="w-8 h-8 rounded-full bg-[#C45A3C] flex items-center justify-center text-white text-[12px]">✓</div>
          <div className="text-[11px] leading-relaxed"><span className="font-bold text-white tracking-[0.08em]">Saved payment:</span> <span className="text-zinc-400">Visa 4242 · Single button checkout</span></div>
        </div>

        <div className="mt-7 space-y-3">
          <button onClick={()=>{ if(hasSaved && onConfirmWithSaved){ onConfirmWithSaved(); } else { onConfirm(); } }} className="w-full h-12 rounded-full bg-white text-black font-black text-[11px] tracking-[0.14em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
            CONFIRM JOIN HK$5 · 4242
          </button>
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="mono text-[10px] tracking-[0.12em] text-zinc-500 hover:text-white transition">BACK TO VENUES</button>
            <span className="mono text-[10px] tracking-[0.1em] text-zinc-600">DIFFERENT PHOTOS · MORE HEART · 1-CLICK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
