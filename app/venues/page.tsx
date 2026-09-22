
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import VenueCard from '@/components/VenueCard'
export default function Venues(){
  const [venues,setVenues]=useState<any[]>([])
  useEffect(()=>{supabase.from('venues').select('*').order('created_at',{ascending:false}).then(({data})=> setVenues(data||[]))},[])
  return(<main className="max-w-7xl mx-auto px-6 py-12">
    <h1 className="text-4xl font-black">VENUES</h1><p className="text-zinc-500 text-sm mt-2">All blind drops live from Supabase • No photos, just taste</p>
    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">{venues.map(v=><VenueCard key={v.id} venue={v} onClick={()=>{window.location.href=`/join?venue=${v.id}`}} />)}</div>
  </main>)
}
