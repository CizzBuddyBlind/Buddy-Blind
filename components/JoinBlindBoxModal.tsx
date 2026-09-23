
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
    <div className="fixed inset-0 z-40 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white text-black rounded-3xl p-8">
        <div className="flex justify-between items-start">
          <h2 className="text-3xl font-serif leading-tight">Join this<br/>Blind Box?</h2>
          <button onClick={onClose} className="px-4 py-2 rounded-full border border-zinc-300 text-xs font-bold">CLOSE</button>
        </div>
        <p className="mt-4 text-sm text-zinc-600 leading-relaxed">You wont see names or photos before. You will see neighborhood, vibe, time, places left. That is the point.</p>
        
        <div className="mt-6 bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between text-sm"><span className="text-zinc-500 tracking-widest">SCENE</span><span className="font-medium tracking-widest">{scene}</span></div>
          <div className="flex justify-between text-sm"><span className="text-zinc-500 tracking-widest">TIME</span><span className="font-medium tracking-widest">{time}</span></div>
          <div className="flex justify-between text-sm"><span className="text-zinc-500 tracking-widest">HOST</span><span className="font-medium tracking-widest">{host}</span></div>
          <div className="flex justify-between text-sm"><span className="text-zinc-500 tracking-widest">LOCATION</span><span className="font-medium tracking-widest">{location}</span></div>
          <div className="flex justify-between text-sm"><span className="text-zinc-500 tracking-widest">SEATS</span><span className="font-medium tracking-widest">{spots}</span></div>
        </div>

        <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3 items-center">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">v</div>
          <div className="text-sm"><span className="font-bold">Saved payment:</span> Visa 4242 Single button checkout</div>
        </div>

        <div className="mt-6">
          <button onClick={()=>{ if(hasSaved && onConfirmWithSaved){ onConfirmWithSaved(); } else { onConfirm(); } }} className="w-full h-14 rounded-full bg-black text-white font-black text-sm tracking-widest">CONFIRM JOIN HK$5 4242</button>
          <div className="mt-3 flex justify-between">
            <button onClick={onClose} className="text-xs tracking-widest text-zinc-500 font-bold">BACK TO VENUES</button>
            <span className="text-xs tracking-widest text-zinc-400">DIFFERENT PHOTOS PER EVENT MORE HEART NO REPEATS 1-CLICK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
