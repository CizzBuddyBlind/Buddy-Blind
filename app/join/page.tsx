'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
function JoinContent(){
  const params=useSearchParams()
  const venueId=params.get('venue')
  const [venue,setVenue]=useState<any>(null)
  const [email,setEmail]=useState('')
  useEffect(()=>{if(venueId){supabase.from('venues').select('*').eq('id',venueId).single().then(({data})=> setVenue(data)); supabase.from('featured_events').select('*').eq('id',venueId).single().then(({data})=> {if(data) setVenue(data)})}},[venueId])
  const book=async()=>{
    if(!venueId) return alert('No venue')
    const {data:cur}=await supabase.from('venues').select('places_left').eq('id',venueId).single()
    if(cur && cur.places_left>0){await supabase.from('venues').update({places_left:cur.places_left-1}).eq('id',venueId)}
    const {data:cur2}=await supabase.from('featured_events').select('spots_left').eq('id',venueId).single()
    if(cur2 && cur2.spots_left>0){await supabase.from('featured_events').update({spots_left:cur2.spots_left-1}).eq('id',venueId)}
    alert(`Booked ${venue?.title||venue?.name}! Confirmation to ${email}`)
    window.location.href='/profile'
  }
  return(<main className="max-w-xl mx-auto px-6 py-20"><h1 className="serif text-[32px]">JOIN BLIND BOX</h1>{venue && <div className="mt-6 bg-[#111] border border-zinc-800 rounded-[20px] p-5"><div className="mono text-[10px] text-[#c96a4a]">{venue.spots_left||venue.places_left} LEFT</div><div className="mt-2 font-bold">{venue.title||venue.name} - {venue.area||venue.location}</div><div className="mt-1 text-sm text-zinc-500">$88 deposit, address 2h before</div></div>}<div className="mt-6 space-y-3"><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your email" className="w-full h-12 rounded-full bg-[#111] border border-zinc-800 px-5 text-sm"/><button onClick={book} className="w-full h-12 rounded-full bg-white text-black mono text-[11px]">BOOK BLIND - $88</button></div></main>)
}
export default function Join(){return(<Suspense fallback={<div className='p-20 text-center'>Loading</div>}><JoinContent/></Suspense>)}
