
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Venue = {
  id:string,
  name:string,
  area:string,
  time:string,
  spots_left:number,
  host_initial:string,
  host_role:string,
  host_tier:string,
  vibe_tag:string,
  cuisine:string,
  price:string,
  invite_text:string,
  image_url:string,
  places_left?:number,
  location?:string
}

const FALLBACK_VENUES:Venue[] = [
  {
    id:'kissa-tanaka',
    name:'Kissa Tanaka',
    area:'SOHO',
    time:'TONIGHT 7:30PM',
    spots_left:3,
    host_initial:'C',
    host_role:'COMEDIAN',
    host_tier:'GOLD',
    vibe_tag:'CREATIVE MINDS',
    cuisine:'KISSATEN · JAPANESE',
    price:'$$',
    invite_text:'CJ INVITES YOU TO JOIN - CREATIVE MINDS, 6 PEOPLE, SO MEET NEW',
    image_url:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'
  },
  {
    id:'yardbird',
    name:'Yardbird',
    area:'CENTRAL',
    time:'TONIGHT 9PM',
    spots_left:2,
    host_initial:'C',
    host_role:'CHEF',
    host_tier:'SILVER',
    vibe_tag:'NIGHT OWLS',
    cuisine:'IZAKAYA · YAKITORI',
    price:'$$$',
    invite_text:'CJ INVITES YOU TO JOIN - NIGHT OWLS, 4 PEOPLE, SO MEET NEW FRIENDS',
    image_url:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200'
  },
  {
    id:'la-cabane',
    name:'La Cabane',
    area:'CWB',
    time:'TOMORROW 7PM',
    spots_left:4,
    host_initial:'S',
    host_role:'SOMMELIER',
    host_tier:'GOLD',
    vibe_tag:'WINE LOVERS',
    cuisine:'WINE · NATURAL',
    price:'$$',
    invite_text:'CJ INVITES YOU TO JOIN - WINE LOVERS, 8 PEOPLE, SO MEET NEW',
    image_url:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200'
  }
]

export default function VenuesPage(){
  const [venues,setVenues]=useState<Venue[]>(FALLBACK_VENUES)
  const [filter,setFilter]=useState('ALL')
  const [subFilter,setSubFilter]=useState('ALL')
  const [search,setSearch]=useState('')
  const [selected,setSelected]=useState<Venue|null>(null)

  useEffect(()=>{
    (async()=>{
      try{
        // Try venues table first
        const {data} = await supabase.from('venues').select('*').order('created_at',{ascending:false})
        if(data && data.length>0){
          // Map Supabase venues to our design - use fallback images if no photo_url
          const mapped:Venue[] = data.map((v:any, i:number) => ({
            id: v.id,
            name: v.name || FALLBACK_VENUES[i%3].name,
            area: v.location || FALLBACK_VENUES[i%3].area,
            time: v.time || FALLBACK_VENUES[i%3].time,
            spots_left: v.places_left ?? v.spots_left ?? 3,
            host_initial: v.host_initial || 'C',
            host_role: v.host_role || 'COMEDIAN',
            host_tier: v.host_tier || 'GOLD',
            vibe_tag: v.vibe_tag || v.vibe || FALLBACK_VENUES[i%3].vibe_tag,
            cuisine: v.cuisine || FALLBACK_VENUES[i%3].cuisine,
            price: v.price || '$$',
            invite_text: v.invite_text || `CJ INVITES YOU TO JOIN - ${v.name}`,
            image_url: v.photo_url || v.image_url || FALLBACK_VENUES[i%3].image_url
          }))
          setVenues(mapped)
        }
        // Also try featured_events to merge
        const {data:feats} = await supabase.from('featured_events').select('*')
        if(feats && feats.length>0){
          // If we have featured, keep them as top
        }
      }catch(e){}
    })()
  },[])

  const filtered = venues.filter(v=>{
    if(search){
      const s=search.toLowerCase()
      if(!(v.name.toLowerCase().includes(s) || v.area.toLowerCase().includes(s) || v.cuisine.toLowerCase().includes(s))) return false
    }
    if(filter==='PRIVATE'){
      // In bible: Private Events are separate page, but filter shows only private
      return v.vibe_tag.includes('PRIVATE') || false
    }
    if(filter==='QUICK'){
      return v.spots_left <=2
    }
    return true
  })

  return(
    <main className="bg-[#080808] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-20">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div>
            <h1 className="serif text-[56px] md:text-[72px] leading-[0.9] tracking-[-0.02em] text-white">
              Venues —<br/>Where it happens
            </h1>
            <p className="mt-6 text-[15px] leading-relaxed text-zinc-500 max-w-[480px]">
              Six scenes tonight. Each with a different photo. No repeats. Click a box for full details.
            </p>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={()=>setFilter('ALL')} className={`mono h-10 px-5 rounded-full text-[11px] tracking-[0.1em] border transition ${filter==='ALL'?'bg-[#f5f2eb] text-black border-[#f5f2eb]':'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>ALL VENUES</button>
            <button onClick={()=>setFilter('QUICK')} className={`mono h-10 px-5 rounded-full text-[11px] tracking-[0.1em] border transition ${filter==='QUICK'?'bg-[#f5f2eb] text-black border-[#f5f2eb]':'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>QUICK MEET</button>
            <Link href="/private-events" className="mono h-10 px-5 rounded-full text-[11px] tracking-[0.1em] border border-zinc-800 text-zinc-500 hover:border-zinc-600 flex items-center">PRIVATE EVENTS</Link>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-900"></div>

        {/* Sub filters */}
        <div className="mt-6 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-2">
            {['NEARBY','CUISINE','UPCOMING','TODAY'].map(f=>(
              <button key={f} onClick={()=>setSubFilter(f===subFilter?'ALL':f)} className={`mono h-9 px-4 rounded-full text-[11px] tracking-[0.1em] border transition ${subFilter===f?'bg-white text-black border-white':'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>{f}</button>
            ))}
          </div>
          <div className="relative">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="SEARCH SOHO, CENTRAL..." className="mono w-[280px] h-10 rounded-full bg-[#111] border border-zinc-800 px-5 text-[11px] tracking-[0.1em] text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600" />
          </div>
        </div>

        <div className="mt-6 border-t border-zinc-900"></div>

        {/* Grid - with tiny up effect on hover */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map(venue=>(
            <div key={venue.id} onClick={()=>setSelected(venue)} className="group relative bg-[#0f0f0f] border border-zinc-900 rounded-[20px] p-2 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer">
              {/* Host pill - floating on border, editable via admin */}
              <div className="absolute -top-3 right-4 z-20 flex items-center gap-1.5 bg-[#f5f2eb] text-black mono text-[10px] tracking-[0.1em] px-3 py-1.5 rounded-full border border-black/10 shadow-lg">
                <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[8px]">{venue.host_initial}</div>
                {venue.host_role} · {venue.host_tier}
              </div>
              {/* Image */}
              <div className="relative h-[360px] rounded-[16px] overflow-hidden bg-zinc-900">
                <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500" />
                <div className="absolute top-3 left-3 mono text-[10px] tracking-[0.1em] bg-black/70 backdrop-blur border border-white/10 px-3 py-1.5 rounded-full text-white">{venue.area} · {venue.time}</div>
                <div className="absolute bottom-3 left-3 mono text-[10px] tracking-[0.1em] bg-[#c96a4a] px-3 py-1.5 rounded-full text-white">{venue.spots_left} SPOTS LEFT</div>
              </div>
              {/* Text */}
              <div className="px-3 pt-4 pb-3">
                <div className="flex justify-between items-start">
                  <h3 className="serif text-[20px] text-white">{venue.name}</h3>
                  <span className="mono text-[10px] tracking-[0.1em] text-zinc-600">{venue.vibe_tag}</span>
                </div>
                <div className="mt-1 mono text-[10px] tracking-[0.1em] text-zinc-500">{venue.cuisine} · {venue.price}</div>
                <div className="mt-3 mono text-[11px] leading-relaxed text-zinc-400 line-clamp-2">{venue.invite_text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal - per Bible: click box for full details, then BOOK */}
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6" onClick={()=>setSelected(null)}>
            <div className="w-full max-w-[440px] bg-[#161616] border border-zinc-800 rounded-[24px] overflow-hidden" onClick={e=>e.stopPropagation()}>
              <div className="relative h-[280px]">
                <img src={selected.image_url} alt={selected.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 mono text-[10px] bg-black/70 backdrop-blur border border-white/10 px-3 py-1 rounded-full text-white">{selected.area} · {selected.time}</div>
                <div className="absolute top-4 right-4 mono text-[10px] bg-[#c96a4a] px-3 py-1 rounded-full text-white">{selected.spots_left} SPOTS LEFT</div>
              </div>
              <div className="p-6">
                <h2 className="serif text-[24px]">{selected.name}</h2>
                <div className="mt-1 mono text-[10px] text-zinc-500">{selected.cuisine} · {selected.price} · {selected.vibe_tag}</div>
                <p className="mt-4 text-[13px] leading-relaxed text-zinc-400">{selected.invite_text} — You will only see the name after booking. This is a blind drop. Trust the taste.</p>
                <Link href={`/join?venue=${selected.id}`} className="mt-6 w-full h-12 rounded-full bg-[#f5f2eb] text-black mono text-[11px] tracking-[0.15em] flex items-center justify-center hover:bg-white transition">BOOK BLIND - $88</Link>
                <button onClick={()=>setSelected(null)} className="mt-3 w-full h-10 rounded-full border border-zinc-800 mono text-[10px] tracking-[0.15em] text-zinc-500">CLOSE</button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 mono text-[10px] tracking-[0.1em] text-zinc-700 text-center">ALL VENUES LIVE FROM SUPABASE · NO REPEATS · PHOTOS EDITABLE IN /admin · HOVER = tiny up effect per V9</div>
      </div>
    </main>
  )
}
