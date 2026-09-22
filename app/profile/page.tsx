
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
export default function Profile(){
  const [venues,setVenues]=useState<any[]>([])
  useEffect(()=>{supabase.from('venues').select('*').limit(3).then(({data})=> setVenues(data||[]))},[])
  return(<main className="max-w-5xl mx-auto px-6 py-20">
    <div className="flex gap-6 items-center"><div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center text-2xl font-black">C</div><div><h1 className="text-3xl font-black">Cizz</h1><p className="text-zinc-500 text-sm">HEART member • 12 blinds • Good taste score 9.2</p></div></div>
    <div className="mt-12 grid md:grid-cols-3 gap-6"><div className="bg-[#111] border border-zinc-800 rounded-[24px] p-6"><div className="text-xs tracking-widest text-zinc-500">UPCOMING</div><div className="mt-3 font-bold">{venues[0]?.name || 'MC - Central'} - Tomorrow 8pm</div></div><div className="bg-[#111] border border-zinc-800 rounded-[24px] p-6"><div className="text-xs tracking-widest text-zinc-500">INVITES LEFT</div><div className="mt-3 font-bold text-2xl text-amber-300">2 / 3</div></div><div className="bg-[#111] border border-zinc-800 rounded-[24px] p-6"><div className="text-xs tracking-widest text-zinc-500">TASTE SCORE</div><div className="mt-3 font-bold text-2xl">9.2 / 10</div></div></div>
  </main>)
}
