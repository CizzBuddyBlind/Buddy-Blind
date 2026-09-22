
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Page() {
  const [venues, setVenues] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)

  useEffect(()=>{
    supabase.from('venues').select('*').order('created_at', {ascending:false}).then(({data})=>{ if(data) setVenues(data) })
  },[])

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* HEADER */}
      <div className="pt-20 pb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-black tracking-[0.1em]">BUDDY BLIND</h1>
        <p className="mt-4 text-zinc-500 tracking-[0.4em] text-[11px]">NO NAMES. NO PHOTOS. JUST GOOD TASTE.</p>
      </div>

      {/* GRID - V9 STYLE */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {venues.map(v=>(
          <div key={v.id} onClick={()=>setSelected(v)} className="group relative bg-[#111] border border-zinc-800 rounded-[24px] p-7 hover:border-zinc-600 hover:bg-[#161616] transition-all cursor-pointer">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">{v.name?.[0]}</div>
              <div className="text-[10px] tracking-widest px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">{v.places_left ?? 4} LEFT</div>
            </div>
            <div className="mt-6 text-2xl font-bold leading-tight">{v.name}</div>
            <div className="mt-2 text-sm text-zinc-500 flex items-center gap-2">📍 {v.location}</div>
            {v.photo_url && v.photo_url!=='EMPTY' && v.photo_url!=='' && <div className="mt-5 h-40 rounded-2xl overflow-hidden bg-zinc-900"><img src={v.photo_url} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /></div>}
            <div className="mt-6 flex items-center justify-between text-[11px] tracking-widest text-zinc-600"><span>BLIND DROP</span><span className="group-hover:text-white transition">→ VIEW</span></div>
          </div>
        ))}
      </div>

      {venues.length===0 && <div className="text-center text-zinc-600 mt-20">Loading...</div>}

      {/* MODAL - V9 */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6" onClick={()=>setSelected(null)}>
          <div className="w-full max-w-[420px] bg-[#141414] border border-zinc-700 rounded-[32px] p-8 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-black text-lg">{selected.name?.[0]}</div>
            <h2 className="mt-6 text-3xl font-black leading-tight">{selected.name}</h2>
            <p className="mt-2 text-zinc-500 text-sm">{selected.location} • {selected.places_left} places left</p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="bg-zinc-900 rounded-2xl p-4"><div className="text-[10px] tracking-widest text-zinc-500">LOCATION</div><div className="mt-1 font-bold">{selected.location}</div></div>
              <div className="bg-zinc-900 rounded-2xl p-4"><div className="text-[10px] tracking-widest text-zinc-500">STATUS</div><div className="mt-1 font-bold text-amber-300">{selected.places_left} LEFT</div></div>
            </div>
            <button onClick={()=>setSelected(null)} className="mt-8 w-full h-14 rounded-2xl bg-white text-black font-black tracking-widest text-sm">CLOSE</button>
          </div>
        </div>
      )}

      <div className="py-20 text-center text-[11px] tracking-widest text-zinc-700">/admin • {venues.length} VENUES • V9 FINAL</div>
    </main>
  )
}
