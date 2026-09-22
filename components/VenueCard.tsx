
'use client'
export default function VenueCard({venue,onClick}:{venue:any,onClick:()=>void}){
 return(<div onClick={onClick} className="group relative bg-[#111] border border-zinc-800 rounded-[28px] p-7 hover:border-zinc-600 hover:bg-[#161616] transition-all cursor-pointer">
  <div className="flex justify-between items-start">
    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold">{venue.name?.[0]}</div>
    <div className="text-[10px] tracking-widest px-3 py-1.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">{venue.places_left ?? 4} LEFT</div>
  </div>
  <div className="mt-8 text-[22px] font-bold leading-tight">{venue.name}</div>
  <div className="mt-2 text-sm text-zinc-500 flex items-center gap-2">📍 {venue.location}</div>
  <div className="mt-6 flex justify-between text-[11px] tracking-widest text-zinc-600"><span>BLIND DROP • {venue.vibe || 'NO MENU'}</span><span className="group-hover:text-white transition">→ VIEW</span></div>
 </div>)
}
