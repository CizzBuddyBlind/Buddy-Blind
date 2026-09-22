
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
export default function Admin(){
  const [list,setList]=useState<any[]>([])
  const [form,setForm]=useState({name:'', location:'', places_left: 4, photo_url:''})
  const load=()=> supabase.from('venues').select('*').order('created_at',{ascending:false}).then(({data})=> setList(data||[]))
  useEffect(()=>{load()},[])
  const add=async()=>{
    if(!form.name) return
    const {error}=await supabase.from('venues').insert({name:form.name, location:form.location, places_left: Number(form.places_left), photo_url: form.photo_url || ''})
    if(error) alert(error.message); else { setForm({name:'', location:'', places_left:4, photo_url:''}); load() }
  }
  const del=async(id:string)=>{ await supabase.from('venues').delete().eq('id',id); load() }
  return(
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-black">BUDDY BLIND ADMIN</h1>
      <p className="text-zinc-500 text-sm mt-2">V9 Final - Table: venues (name, location, places_left, photo_url)</p>
      <div className="mt-8 grid grid-cols-4 gap-3 max-w-3xl">
        <input placeholder="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm"/>
        <input placeholder="location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm"/>
        <input placeholder="places_left" type="number" value={form.places_left} onChange={e=>setForm({...form,places_left: Number(e.target.value)})} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm"/>
        <input placeholder="photo_url (optional)" value={form.photo_url} onChange={e=>setForm({...form,photo_url:e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm"/>
      </div>
      <button onClick={add} className="mt-4 bg-white text-black px-8 h-12 rounded-xl font-black">ADD VENUE</button>
      <div className="mt-12 space-y-2 max-w-3xl">{list.map(v=><div key={v.id} className="flex justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm"><span>{v.name} - {v.location} - {v.places_left} left</span><button onClick={()=>del(v.id)} className="text-red-400">DELETE</button></div>)}</div>
      <div className="mt-10 text-zinc-600 text-xs">Total: {list.length}</div>
    </main>
  )
}
