
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import VenueCard from '@/components/VenueCard'
export default function Home(){
  const [venues,setVenues]=useState<any[]>([])
  const [selected,setSelected]=useState<any>(null)
  useEffect(()=>{supabase.from('venues').select('*').order('created_at',{ascending:false}).limit(9).then(({data})=> setVenues(data||[]))},[])
  return(<main>
    <div className="text-center pt-20 pb-10"><h1 className="text-6xl md:text-[88px] font-black tracking-[0.08em] leading-[0.9]">BUDDY<br/>BLIND</h1><p className="mt-6 text-zinc-500 tracking-[0.4em] text-[11px]">NO NAMES. NO PHOTOS. JUST GOOD TASTE.</p>
      <div className="mt-10 flex justify-center gap-3"><a href="/venues" className="px-8 h-12 rounded-full bg-white text-black font-black text-xs tracking-widest flex items-center">ENTER DROP</a><a href="/how-it-works" className="px-8 h-12 rounded-full border border-zinc-700 text-xs tracking-widest flex items-center">HOW IT WORKS</a></div>
    </div>
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">{venues.map(v=><VenueCard key={v.id} venue={v} onClick={()=>setSelected(v)} />)}</div>
    {selected && (<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6" onClick={()=>setSelected(null)}>
      <div className="w-full max-w-[440px] bg-[#141414] border border-zinc-700 rounded-[32px] p-8" onClick={e=>e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-black">{selected.name?.[0]}</div>
        <h2 className="mt-6 text-3xl font-black">{selected.name}</h2><p className="mt-2 text-zinc-500 text-sm">{selected.location} • {selected.places_left} places left</p>
        <div className="mt-6 bg-zinc-900 rounded-2xl p-4 text-xs text-zinc-400">You will only see the name after booking. This is a blind drop. Trust the taste.</div>
        <a href={`/join?venue=${selected.id}`} className="mt-6 w-full h-14 rounded-2xl bg-white text-black font-black tracking-widest text-sm flex items-center justify-center">BOOK BLIND - ${selected.price || 88}</a>
        <button onClick={()=>setSelected(null)} className="mt-3 w-full h-12 rounded-2xl border border-zinc-700 text-xs tracking-widest">CLOSE</button>
      </div></div>)}
    <div className="py-24 text-center text-[11px] tracking-[0.3em] text-zinc-700">/admin • {venues.length} VENUES • V9 HEART</div>
  </main>)
}
