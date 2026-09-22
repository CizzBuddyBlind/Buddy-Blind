
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
export default function Admin(){
  const [list, setList] = useState<any[]>([])
  const [form, setForm] = useState({name:'', location:''})
  useEffect(()=>{ load() },[])
  const load=()=> supabase.from('venues').select('*').order('created_at', {ascending:false}).then(({data})=> setList(data||[]))
  const add=async()=>{ if(!form.name) return; const {error} = await supabase.from('venues').insert({name: form.name, location: form.location}); if(error) alert(error.message); else { setForm({name:'', location:''}); load() } }
  const del=async(id:any)=>{ await supabase.from('venues').delete().eq('id', id); load() }
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-black">Venues Admin</h1>
      <p className="text-zinc-500 text-sm mt-1">Using table: venues (name, location only) - matches your current schema</p>
      <div className="flex gap-2 mt-6 max-w-xl">
        <input placeholder="name (e.g. Depot)" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded p-2 text-sm flex-1" />
        <input placeholder="location (e.g. Central)" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded p-2 text-sm flex-1" />
        <button onClick={add} className="bg-white text-black px-6 py-2 rounded font-bold">Add</button>
      </div>
      <div className="mt-10">Total: {list.length} (you should see 3 from screenshot)</div>
      {list.map(r=><div key={r.id} className="text-sm text-zinc-400 border-b border-zinc-900 py-2 flex justify-between"><span>{r.name} - {r.location} ({r.id.slice(0,8)})</span><button onClick={()=>del(r.id)} className="text-red-400 ml-4">del</button></div>)}
    </main>
  )
}
