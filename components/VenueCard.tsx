'use client';
import { triggerCheckout } from '@/components/CheckoutButtons';
type Venue = { id: string; name: string; location: string; places_left: number; photo_url?: string; vibe?: string; };
export default function VenueCard({ venue }: { venue: Venue }) {
  const join = async () => { await triggerCheckout('admin', venue.id); };
  const view = () => { window.location.href = `/join?venue=${venue.id}`; };
  return (
    <div className="bg-[#111] border border-zinc-800 rounded-[28px] p-7 hover:border-zinc-600 hover:bg-[#161616] transition-all group">
      <div className="flex justify-between"><div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold">{venue.name?.[0]||'B'}</div><div className="px-3 py-1.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[10px] tracking-widest">{venue.places_left ?? 4} LEFT</div></div>
      <div className="mt-8 text-[22px] font-bold">{venue.name}</div><div className="mt-2 text-sm text-zinc-500">📍 {venue.location}</div>
      {venue.photo_url && venue.photo_url !== '' && venue.photo_url !== 'EMPTY' && (<div className="mt-5 h-40 rounded-2xl overflow-hidden bg-zinc-900"><img src={venue.photo_url} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /></div>)}
      <div className="mt-6 flex justify-between items-center"><div className="text-[11px] tracking-widest text-zinc-600">BLIND DROP • {venue.vibe||'NO MENU'}</div><div className="flex gap-2"><button onClick={view} className="text-[11px] tracking-widest text-zinc-600 group-hover:text-white">→ VIEW</button><button onClick={join} className="ml-3 px-5 py-2 rounded-full bg-white text-black font-black text-[11px] tracking-widest">JOIN — $5</button></div></div>
    </div>
  );
}
