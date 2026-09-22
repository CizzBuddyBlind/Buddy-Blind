'use client';
import { useState } from 'react';
import AuthGateModal from './AuthGateModal';
type Venue={id:string;name:string;location:string;places_left:number;vibe?:string;};
export default function VenueCard({venue}:{venue:Venue}){
  const [show,setShow]=useState(false);
  const [booked,setBooked]=useState(false);
  return (
    <>
      <div className="venue-card group">
        <div className="flex justify-between items-start">
          <div className="w-[52px] h-[52px] rounded-full bg-[#1E1E1E] flex items-center justify-center font-bold text-[14px]">{(venue.name||'B')[0]}</div>
          <div className="pill-left">{venue.places_left ?? 4} LEFT</div>
        </div>
        <div className="mt-[56px] text-[28px] font-bold leading-[1.1] tracking-tight">{venue.name}</div>
        <div className="mt-3 text-[14px] text-zinc-500 flex items-center gap-1.5">📍 {venue.location}</div>
        <div className="mt-10 flex justify-between items-center">
          <div className="text-[11px] tracking-[0.2em] text-zinc-600">BLIND DROP • {venue.vibe||'NO MENU'}</div>
          <button onClick={()=>setShow(true)} className="join-pill">{booked?'BOOKED ✓':'JOIN — $5'}</button>
        </div>
      </div>
      <AuthGateModal isOpen={show} onClose={()=>setShow(false)} onComplete={()=>setBooked(true)} venueName={venue.name} />
    </>
  );
}
