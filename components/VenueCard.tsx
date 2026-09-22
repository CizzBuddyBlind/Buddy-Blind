'use client';
import { useState } from 'react';
import { triggerCheckout } from './CheckoutButtons';
import AuthGateModal from './AuthGateModal';
type Venue = { id: string; name: string; location: string; places_left: number; photo_url?: string; vibe?: string; };
export default function VenueCard({ venue }: { venue: Venue }) {
  const [showAuth, setShowAuth] = useState(false);
  const isVerified = () => typeof window !== 'undefined' && !!localStorage.getItem('buddy_verified_phone');
  const handleJoin = async () => { if (!isVerified()) { setShowAuth(true); return; } await triggerCheckout('admin', venue.id); };
  return (<><div className="bg-[#111] border border-zinc-800 rounded-[28px] p-7 hover:border-zinc-600 transition-all"><div className="flex justify-between"><div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-bold">{venue.name?.[0]}</div><div className="px-3 py-1.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[10px]">{venue.places_left} LEFT</div></div><div className="mt-8 text-[22px] font-bold">{venue.name}</div><div className="mt-2 text-sm text-zinc-500">📍 {venue.location}</div><div className="mt-6 flex justify-between items-center"><div className="text-[11px] text-zinc-600">BLIND DROP</div><button onClick={handleJoin} className="px-5 py-2 rounded-full bg-white text-black font-black text-[11px]">JOIN — $5</button></div></div><AuthGateModal isOpen={showAuth} onClose={()=>setShowAuth(false)} onVerified={()=>triggerCheckout('admin', venue.id)} trigger="join" /></>);
}
