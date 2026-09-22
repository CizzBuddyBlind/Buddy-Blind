
'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'

function JoinContent(){
  const searchParams=useSearchParams()
  const venueId=searchParams.get('venue')
  const [venue,setVenue]=useState<any>(null)
  const [email,setEmail]=useState('')
  useEffect(()=>{if(venueId){supabase.from('venues').select('*').eq('id',venueId).single().then(({data})=> setVenue(data))}},[venueId])
  const book=async()=>{
    if(!venueId) return
    const {data:current}=await supabase.from('venues').select('places_left').eq('id',venueId).single()
    if(current && current.places_left>0){await supabase.from('venues').update({places_left: current.places_left-1}).eq('id',venueId); alert(`Booked ${venue?.name}! Check email ${email}`); window.location.href='/profile'}
    else alert('Sold out')
  }
  return(<main className="max-w-xl mx-auto px-6 py-20">
    <h1 className="text-4xl font-black">JOIN BLIND DROP</h1>
    {venue && <div className="mt-8 bg-[#111] border border-zinc-800 rounded-[24px] p-6"><div className="text-xs tracking-widest text-amber-300">{venue.places_left} LEFT</div><div className="mt-2 font-bold text-xl">{venue.name} - {venue.location}</div><div className="mt-2 text-sm text-zinc-500">You will see full details after booking. $88 deposit.</div></div>}
    <div className="mt-8 space-y-4"><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your email" className="w-full h-14 rounded-full bg-[#111] border border-zinc-800 px-6 text-sm"/><button onClick={book} className="w-full h-14 rounded-full bg-white text-black font-black text-xs tracking-widest">BOOK BLIND - $88</button><div className="text-center text-[11px] text-zinc-600">No name, no photo, just good taste • Refund 24h before</div></div>
  </main>)
}
export default function Join(){
  return(<Suspense fallback={<div className='p-20 text-center text-zinc-600'>Loading...</div>}><JoinContent/></Suspense>)
}
