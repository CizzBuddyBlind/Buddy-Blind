
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Page() {
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)

  useEffect(()=>{
    supabase.from('restaurants').select('*').then(({data})=>{ if(data) setRestaurants(data) })
  },[])

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-black text-center mb-2">BUDDY BLIND</h1>
      <p className="text-center text-zinc-500 mb-10 tracking-widest text-sm">NO NAMES. NO PHOTOS. JUST GOOD TASTE.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {restaurants.map(r=>(
          <div key={r.id} onClick={()=>setSelected(r)} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-800 cursor-pointer transition">
            <div className="text-xs text-zinc-500">{r.cuisine} • {r.price_range}</div>
            <div className="text-xl font-bold mt-1">{r.name}</div>
            <div className="text-sm text-zinc-400 mt-2 line-clamp-2">{r.description}</div>
            <div className="mt-4 text-xs text-amber-400">{r.location} • {r.opening_hours}</div>
          </div>
        ))}
      </div>
      {selected && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={()=>setSelected(null)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md w-full" onClick={e=>e.stopPropagation()}>
            <h2 className="text-2xl font-bold">{selected.name}</h2>
            <p className="text-zinc-400 mt-2">{selected.description}</p>
            <p className="text-sm mt-4">📍 {selected.location}</p>
            <p className="text-sm">🕒 {selected.opening_hours}</p>
            <button onClick={()=>setSelected(null)} className="mt-6 w-full bg-white text-black py-3 rounded-xl font-bold">Close</button>
          </div>
        </div>
      )}
      <div className="text-center mt-20 text-zinc-600 text-xs">admin: /admin • {restaurants.length} restaurants from Supabase</div>
    </main>
  )
}
