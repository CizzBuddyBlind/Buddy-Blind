'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
export default function Page() {
  const [venues, setVenues] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  useEffect(()=>{ supabase.from('venues').select('*').then(({data, error})=>{ console.log('venues', data, error); if(data) setVenues(data) }) },[])
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-black text-center mb-2 tracking-wider">BUDDY BLIND</h1>
      <p className="text-center text-zinc-500 mb-10 tracking-[0.3em] text-xs">NO NAMES. NO PHOTOS. JUST GOOD TASTE.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {venues.map(r=>(
          <div key={r.id} onClick={()=>setSelected(r)} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-800 cursor-pointer">
            <div className="text-[10px] text-zinc-500 tracking-widest">{r.cuisine || r.category} • {r.price_range || '$$'}</div>
            <div className="text-xl font-bold mt-1">{r.name}</div>
            <div className="text-sm text-zinc-400 mt-2 line-clamp-2">{r.description}</div>
            <div className="mt-4 text-xs text-amber-400">{r.location || r.address}</div>
          </div>
        ))}
      </div>
      {venues.length===0 && <div className="text-center text-zinc-600 mt-10">No venues yet - add one in /admin or check Supabase Table Editor</div>}
      {selected && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={()=>setSelected(null)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md w-full" onClick={e=>e.stopPropagation()}>
            <h2 className="text-2xl font-bold">{selected.name}</h2>
            <p className="text-zinc-400 mt-2">{selected.description}</p>
            <p className="text-sm mt-4">📍 {selected.location || selected.address}</p>
            <p className="text-sm">🕒 {selected.opening_hours || ''}</p>
            <button onClick={()=>setSelected(null)} className="mt-6 w-full bg-white text-black py-3 rounded-xl font-bold">Close</button>
          </div>
        </div>
      )}
      <div className="text-center mt-20 text-zinc-600 text-xs">/admin • {venues.length} venues live from Supabase</div>
    </main>
  )
}
