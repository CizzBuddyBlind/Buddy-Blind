
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
export default function Admin(){
  const [list, setList] = useState<any[]>([])
  const [form, setForm] = useState({name:'', cuisine:'', description:'', location:'', price_range:'$$', opening_hours:''})
  useEffect(()=>{ load() },[])
  const load=()=> supabase.from('restaurants').select('*').order('id').then(({data})=> setList(data||[]))
  const add=async()=>{ await supabase.from('restaurants').insert(form); setForm({name:'', cuisine:'', description:'', location:'', price_range:'$$', opening_hours:''}); load() }
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-black">Bible Admin - Add Restaurant</h1>
      <div className="grid grid-cols-2 gap-3 mt-6 max-w-xl">
        {Object.keys(form).map(k=>(
          <input key={k} placeholder={k} value={(form as any)[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded p-2 text-sm" />
        ))}
      </div>
      <button onClick={add} className="mt-4 bg-white text-black px-6 py-2 rounded font-bold">Add</button>
      <div className="mt-10">Total: {list.length}</div>
      {list.map(r=><div key={r.id} className="text-sm text-zinc-400 border-b border-zinc-900 py-2">{r.id}. {r.name} - {r.location}</div>)}
    </main>
  )
}
