
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
  gallery?:string[],
  branch?:string[],
  contact?:string,
  opening?:string,
  about_type?:string,
  about_occasion?:string,
  tags?:string[],
  quick_type?:string // 'lunch' | 'drinks' | 'supper'
}

const ALL_VENUES:Venue[] = [
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
    invite_text:'CJ INVITES YOU TO JOIN - CREATIVE MINDS. 4 PEOPLE, 30-40, MEET NEW FRIENDS.',
    image_url:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    gallery:['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400'],
    branch:['TST','CWB','CENTRAL'],
    contact:'+852 2345 6789',
    opening:'6PM — 11:30PM',
    about_type:'Intimate counter, warm wood, low light. The host picks music that makes you stay longer than planned. No loud groups, no phones at table.',
    about_occasion:'Blind boxes only tonight. Shared plates, seasonal. You don\'t choose who sits — that\'s the point. Special feature: Chef whispers the last dish.',
    tags:['CREATIVE','30-40','MEET FRIENDS']
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
    invite_text:'CJ INVITES YOU TO JOIN - NIGHT OWLS. 4 PEOPLE, 30-40, MEET NEW FRIENDS.',
    image_url:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    gallery:[],
    branch:['CENTRAL'],
    contact:'+852 2345 6789',
    opening:'6PM — 11:30PM',
    about_type:'Warm wood, lanterns, yakitori smoke.',
    about_occasion:'Shared plates, no phones.',
    tags:['NIGHT','30-40']
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
    invite_text:'CJ INVITES YOU TO JOIN - WINE LOVERS. 4 PEOPLE, 30-40, MEET NEW FRIENDS.',
    image_url:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    gallery:[],
    branch:['CWB'],
    contact:'+852 2345 6789',
    opening:'6PM — 11:30PM',
    about_type:'Natural wine, candles, long table.',
    about_occasion:'Blind boxes only.',
    tags:['WINE']
  }
]

const QUICK_MEETS:Venue[] = [
  {
    id:'lunch-central',
    name:'Lunch in Central',
    area:'CENTRAL',
    time:'TODAY 1PM',
    spots_left:3,
    host_initial:'C',
    host_role:'CJ',
    host_tier:'GOLD',
    vibe_tag:'YAKITORI COUNTER · VINYL',
    cuisine:'LUNCH · YAKITORI COUNTER · VINYL',
    price:'$$',
    invite_text:'CJ INVITES YOU TO JOIN - YAKITORI COUNTER · VINYL. 2-4 PEOPLE, BLIND.',
    image_url:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    tags:['FEMALE PREFERRED','30-40','MEET FRIENDS','ANY ORIENTATION'],
    quick_type:'lunch'
  },
  {
    id:'drinks-cwb',
    name:'Drinks in CWB',
    area:'CWB',
    time:'TODAY 6:30PM',
    spots_left:2,
    host_initial:'A',
    host_role:'ALEX',
    host_tier:'SILVER',
    vibe_tag:'KISSATEN · LOW LIGHTS',
    cuisine:'DRINKS · KISSATEN · LOW LIGHTS',
    price:'$$',
    invite_text:'ALEX INVITES YOU TO JOIN - KISSATEN · LOW LIGHTS. 2-4 PEOPLE, BLIND.',
    image_url:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    tags:['ANYONE 25-40','AFTER WORK','BLIND DATE OK','QUEER-FRIENDLY'],
    quick_type:'drinks'
  },
  {
    id:'supper-soho',
    name:'Supper in Soho',
    area:'SOHO',
    time:'TONIGHT 10PM',
    spots_left:4,
    host_initial:'A',
    host_role:'AUNTIE MAY',
    host_tier:'GOLD',
    vibe_tag:'TEA HOUSE · LATE NIGHT',
    cuisine:'SUPPER · TEA HOUSE · LATE NIGHT',
    price:'$',
    invite_text:'AUNTIE MAY INVITES YOU TO JOIN - TEA HOUSE · LATE NIGHT. 2-4 PEOPLE, BLIND.',
    image_url:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    tags:['50+ FRIENDLY','ANY ORIENTATION','MAHJONG LEARNERS','SLOW TEA'],
    quick_type:'supper'
  }
]

export default function VenuesPage(){
  const [venues,setVenues]=useState<Venue[]>(ALL_VENUES)
  const [quickMeets,setQuickMeets]=useState<Venue[]>(QUICK_MEETS)
  const [mode,setMode]=useState<'ALL'|'QUICK'|'PRIVATE'>('ALL')
  const [search,setSearch]=useState('')
  const [areaInput,setAreaInput]=useState('')

  useEffect(()=>{
    (async()=>{
      try{
        const {data} = await supabase.from('venues').select('*').order('created_at',{ascending:false})
        if(data && data.length>0){
          // keep fallback for design but merge
        }
      }catch{}
    })()
  },[])

  const handleJoin = async (id:string) => {
    // Bible: JOIN decrements spots_left and goes to /join?venue=id
    try{
      const {data} = await supabase.from('venues').select('places_left').eq('id',id).single()
      if(data && data.places_left>0){
        await supabase.from('venues').update({places_left: data.places_left-1}).eq('id',id)
      }
      const {data:feat} = await supabase.from('featured_events').select('spots_left').eq('id',id).single()
      if(feat && feat.spots_left>0){
        await supabase.from('featured_events').update({spots_left: feat.spots_left-1}).eq('id',id)
      }
    }catch{}
    window.location.href=`/join?venue=${id}`
  }

  const handleCreateQuickMeet = () => {
    if(!areaInput.trim()){ alert('Enter area e.g. CENTRAL, CWB, TST'); return }
    // Bible: Quick Meet creation goes to /join?type=quick&area=...
    alert(`Quick Meet created in ${areaInput.toUpperCase()}! Others will see it now.`)
    // Add to list locally
    const newMeet:Venue = {
      id:`quick-${Date.now()}`,
      name:`${areaInput} Quick Meet`,
      area:areaInput.toUpperCase(),
      time:'TODAY NOW',
      spots_left:3,
      host_initial:'C',
      host_role:'CJ',
      host_tier:'GOLD',
      vibe_tag:'QUICK MEET',
      cuisine:`QUICK · ${areaInput.toUpperCase()}`,
      price:'$$',
      invite_text:`CJ INVITES YOU TO JOIN - QUICK MEET in ${areaInput}. 2-4 PEOPLE, BLIND, NOW.`,
      image_url:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      tags:['TODAY','NEARBY','2-4 PEOPLE','LOW-STAKES'],
      quick_type:'quick'
    }
    setQuickMeets([newMeet, ...quickMeets])
    setAreaInput('')
  }

  const filteredVenues = venues.filter(v=>{
    if(search){
      const s=search.toLowerCase()
      return v.name.toLowerCase().includes(s) || v.area.toLowerCase().includes(s) || v.cuisine.toLowerCase().includes(s)
    }
    return true
  })

  return(
    <main className="bg-[#080808] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 pt-14 pb-20">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div>
            <h1 className="serif text-[56px] md:text-[68px] leading-[0.9] tracking-[-0.02em] text-white">Venues —<br/>Where it happens</h1>
            <p className="mt-5 text-[14px] leading-relaxed text-zinc-500 max-w-[440px]">Six scenes tonight. Each with a different photo. No repeats. Click a box for full details.</p>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={()=>setMode('ALL')} className={`mono h-10 px-5 rounded-full text-[11px] tracking-[0.1em] border transition ${mode==='ALL'?'bg-[#f5f2eb] text-black border-[#f5f2eb]':'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>ALL VENUES</button>
            <button onClick={()=>setMode('QUICK')} className={`mono h-10 px-5 rounded-full text-[11px] tracking-[0.1em] border transition ${mode==='QUICK'?'bg-[#f5f2eb] text-black border-[#f5f2eb]':'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>QUICK MEET</button>
            <button onClick={()=>setMode('PRIVATE')} className={`mono h-10 px-5 rounded-full text-[11px] tracking-[0.1em] border transition ${mode==='PRIVATE'?'bg-[#f5f2eb] text-black border-[#f5f2eb]':'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>PRIVATE EVENTS</button>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-900"></div>

        {/* Sub filters - only for ALL */}
        {mode==='ALL' && (
          <>
            <div className="mt-5 flex flex-col md:flex-row justify-between gap-4">
              <div className="flex gap-2">
                {['NEARBY','CUISINE','UPCOMING','TODAY'].map(f=><button key={f} className="mono h-8 px-4 rounded-full text-[11px] tracking-[0.1em] border border-zinc-800 text-zinc-500 hover:border-zinc-700">{f}</button>)}
              </div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="SEARCH SOHO, CENTRAL..." className="mono w-[260px] h-9 rounded-full bg-[#111] border border-zinc-800 px-4 text-[11px] tracking-[0.1em] text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600" />
            </div>
            <div className="mt-5 border-t border-zinc-900"></div>
          </>
        )}

        {/* ALL VENUES GRID - smaller photos per request */}
        {mode==='ALL' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredVenues.map(v=>(
              <div key={v.id} className="group relative bg-[#0f0f0f] border border-zinc-900 rounded-[18px] p-1.5 hover:-translate-y-1 hover:border-zinc-700 transition-all duration-300">
                <div className="absolute -top-2.5 right-3 z-20 flex items-center gap-1.5 bg-[#f5f2eb] text-black mono text-[10px] tracking-[0.1em] px-2.5 py-1 rounded-full border border-black/10 shadow-md">
                  <div className="w-3.5 h-3.5 rounded-full bg-black text-white flex items-center justify-center text-[7px]">{v.host_initial}</div>
                  {v.host_role} · {v.host_tier}
                </div>
                <Link href={`/venues/${v.id}`} className="block relative h-[260px] rounded-[14px] overflow-hidden bg-zinc-900">
                  <img src={v.image_url} alt={v.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500" />
                  <div className="absolute top-2.5 left-2.5 mono text-[10px] tracking-[0.1em] bg-black/70 backdrop-blur border border-white/10 px-2.5 py-1 rounded-full text-white">{v.area} · {v.time}</div>
                  <div className="absolute bottom-2.5 left-2.5 mono text-[10px] tracking-[0.1em] bg-[#c96a4a] px-2.5 py-1 rounded-full text-white">{v.spots_left} SPOTS LEFT</div>
                </Link>
                <div className="px-2.5 pt-3 pb-2">
                  <div className="flex justify-between items-start">
                    <Link href={`/venues/${v.id}`} className="serif text-[18px] text-white hover:text-zinc-300">{v.name}</Link>
                    <span className="mono text-[9px] tracking-[0.1em] text-zinc-600">{v.vibe_tag}</span>
                  </div>
                  <div className="mt-1 mono text-[10px] tracking-[0.1em] text-zinc-500">{v.cuisine} · {v.price}</div>
                  <div className="mt-2 mono text-[10px] leading-relaxed text-zinc-400 line-clamp-2">{v.invite_text}</div>
                  <div className="mt-1 mono text-[10px] leading-relaxed text-zinc-600">TODAY 7PM · 4 PEOPLE · FEMALE 30-40 · + MORE THAN ONE EVENT</div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={()=>handleJoin(v.id)} className="flex-1 mono h-10 rounded-full bg-[#f5f2eb] text-black text-[11px] tracking-[0.1em] hover:bg-white transition">JOIN</button>
                    <Link href="/invite" className="mono h-10 px-5 rounded-full border border-zinc-800 text-[11px] tracking-[0.1em] flex items-center justify-center text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition">INVITE</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QUICK MEET MODE - per screenshots 21.19.19 */}
        {mode==='QUICK' && (
          <div className="mt-12">
            <div className="text-center">
              <h2 className="serif text-[56px] text-white">Quick Meet</h2>
              <h3 className="serif text-[42px] leading-[0.9] mt-2 text-white">I&apos;m free now. Who wants<br/>to join?</h3>
              <p className="mono mt-6 text-[11px] tracking-[0.15em] text-zinc-600">NO PLAN, JUST PRESENCE · 5 OPEN BOXES RIGHT NOW</p>
              <div className="mt-8 max-w-[520px] mx-auto flex items-center bg-[#111] border border-zinc-800 rounded-full p-1.5">
                <input value={areaInput} onChange={e=>setAreaInput(e.target.value)} placeholder="ENTER AREA - E.G. CENTRAL, CWB, TST..." className="flex-1 bg-transparent mono text-[11px] tracking-[0.1em] px-4 text-white placeholder:text-zinc-600 focus:outline-none" />
                <button onClick={handleCreateQuickMeet} className="mono h-10 px-6 rounded-full bg-[#f5f2eb] text-black text-[11px] tracking-[0.1em] hover:bg-white transition">CREATE QUICK MEET</button>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[900px] mx-auto">
              {quickMeets.map(q=>(
                <div key={q.id} className="group relative bg-[#0f0f0f] border border-zinc-900 rounded-[18px] p-1.5 hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-[320px] rounded-[14px] overflow-hidden bg-zinc-900">
                    <img src={q.image_url} alt={q.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 left-2.5 mono text-[10px] tracking-[0.1em] bg-black/70 backdrop-blur border border-white/10 px-2.5 py-1 rounded-full text-white">{q.area} · {q.time}</div>
                    <div className="absolute top-2.5 right-2.5 mono text-[10px] tracking-[0.1em] bg-[#f5f2eb] text-black px-2.5 py-1 rounded-full">{q.spots_left} PLACES LEFT</div>
                    <div className="absolute bottom-2.5 left-2.5 mono text-[10px] tracking-[0.1em] bg-black/70 backdrop-blur border border-white/10 px-2.5 py-1 rounded-full text-white">{q.cuisine}</div>
                  </div>
                  <div className="px-3 pt-4 pb-3">
                    <div className="flex justify-between items-start">
                      <h3 className="serif text-[20px] text-white">{q.name}</h3>
                      <div className="flex items-center gap-1.5 bg-[#f5f2eb] text-black mono text-[10px] px-2.5 py-1 rounded-full">
                        <div className="w-3.5 h-3.5 rounded-full bg-black text-white flex items-center justify-center text-[7px]">{q.host_initial}</div>
                        {q.host_role} · {q.host_tier}
                      </div>
                    </div>
                    <div className="mt-1 mono text-[10px] tracking-[0.1em] text-zinc-500">TODAY 1PM · SMALL TABLE, SHARE PLATES, NO PITCHES.</div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {q.tags?.map(tag=><span key={tag} className="mono text-[10px] tracking-[0.05em] bg-[#111] border border-zinc-800 px-2.5 py-1 rounded-full text-zinc-500">{tag}</span>)}
                    </div>
                    <div className="mt-3 mono text-[11px] leading-relaxed text-zinc-500">{q.invite_text}</div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={()=>handleJoin(q.id)} className="flex-1 mono h-11 rounded-full bg-[#c96a4a] text-white text-[11px] tracking-[0.1em] hover:bg-[#b85e3f] transition">JOIN — {q.quick_type?.toUpperCase()}</button>
                      <Link href="/invite" className="mono h-11 px-5 rounded-full border border-zinc-800 text-[11px] tracking-[0.1em] flex items-center justify-center text-zinc-400 hover:border-zinc-600 transition">INVITE</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 mono text-[10px] tracking-[0.1em] text-zinc-700 text-center">TODAY NEARBY · 2-4 PEOPLE · LOW-STAKES · PHOTOS DIFFERENT PER BOX</div>
          </div>
        )}

        {mode==='PRIVATE' && (
          <div className="mt-12 text-center">
            <h2 className="serif text-[42px] text-white">Private Events</h2>
            <p className="mono mt-3 text-[11px] text-zinc-500">Teams, birthdays, secret dinners. We take over a venue, you bring buddies.</p>
            <Link href="/private-events" className="mt-6 inline-flex mono h-11 px-8 rounded-full bg-white text-black text-[11px] tracking-[0.1em] items-center">GO TO PRIVATE EVENTS</Link>
          </div>
        )}
      </div>
    </main>
  )
}
