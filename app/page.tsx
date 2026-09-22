
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Page() {
  const [venues, setVenues] = useState<any[]>([])
  const [err, setErr] = useState<string>('')
  const [selected, setSelected] = useState<any>(null)

  useEffect(()=>{
    supabase.from('venues').select('*').limit(50).then(({data, error})=>{
      if(error){ setErr(error.message); console.error(error) }
      else setVenues(data||[])
    })
  },[])

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-black text-center mb-2 tracking-wider">BUDDY BLIND</h1>
      <p className="text-center text-zinc-500 mb-10 tracking-[0.3em] text-xs">NO NAMES. NO PHOTOS. JUST GOOD TASTE.</p>
      
      {err && <div className="max-w-3xl mx-auto bg-red-900/30 border border-red-800 p-4 rounded-xl text-sm mb-6">Supabase Error: {err} <br/>去 Vercel → Settings → Environment Variables 加返你個 Project 嘅 URL 同 Anon Key</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {venues.map(v=>(
          <div key={v.id} onClick={()=>setSelected(v)} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-800 cursor-pointer transition">
            <div className="text-xl font-bold">{v.name}</div>
            <div className="text-sm text-zinc-400 mt-2">{v.location}</div>
            {v.photo_url && v.photo_url!=='EMPTY' && <img src={v.photo_url} className="mt-4 rounded-xl w-full h-32 object-cover" />}
            <div className="mt-4 text-[10px] text-zinc-600 font-mono truncate">{v.id.slice(0,8)}...</div>
          </div>
        ))}
      </div>

      {venues.length===0 && !err && <div className="text-center text-zinc-600 mt-10">Loading venues... if still 0, check Supabase Table Editor has rows (you have 3 rows already!)</div>}

      {selected && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={()=>setSelected(null)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md w-full" onClick={e=>e.stopPropagation()}>
            <h2 className="text-2xl font-bold">{selected.name}</h2>
            <p className="text-zinc-400 mt-2">{selected.location}</p>
            <pre className="text-[11px] text-zinc-500 mt-4 bg-black p-3 rounded-lg overflow-auto">{JSON.stringify(selected, null, 2)}</pre>
            <button onClick={()=>setSelected(null)} className="mt-6 w-full bg-white text-black py-3 rounded-xl font-bold">Close</button>
          </div>
        </div>
      )}

      <div className="text-center mt-20 text-zinc-600 text-xs">/admin • {venues.length} venues live from Supabase • Table: venues</div>
    </main>
  )
}
