'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
export default function Venues(){
  const [venues,setVenues]=useState<any[]>([])
  useEffect(()=>{supabase.from('venues').select('*').order('created_at',{ascending:false}).then(({data})=> setVenues(data||[]))},[])
  return(<main className="max-w-[1400px] mx-auto px-6 py-16"><h1 className="serif text-[48px]">VENUES</h1><p className="mono text-[11px] text-zinc-500 mt-2">Blind drops live from Supabase</p><div className="mt-10 grid md:grid-cols-3 gap-6">{venues.map(v=><Link key={v.id} href={`/join?venue=${v.id}`} className="bg-[#121212] border border-zinc-800 rounded-[24px] p-6 block hover:border-zinc-600"><div className="flex justify-between"><span className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs">{v.name?.[0]}</span><span className="mono text-[10px] bg-[#c96a4a]/10 text-[#c96a4a] border border-[#c96a4a]/20 px-3 py-1 rounded-full">{v.places_left} LEFT</span></div><div className="mt-6 font-bold">{v.name}</div><div className="mt-1 text-sm text-zinc-500">{v.location}</div></Link>)}</div></main>)
}