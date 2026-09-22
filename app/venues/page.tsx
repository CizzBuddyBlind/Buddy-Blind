
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthContext'
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
}

const DEFAULT_VENUES:Venue[] = [
  {id:'kissa-tanaka', name:'Kissa Tanaka', area:'SOHO', time:'TONIGHT 7:30PM', spots_left:3, host_initial:'C', host_role:'COMEDIAN', host_tier:'GOLD', vibe_tag:'CREATIVE MINDS', cuisine:'KISSATEN · JAPANESE', price:'$$', invite_text:'CJ INVITES YOU TO JOIN - CREATIVE MINDS. 4 PEOPLE, 30-40, MEET NEW FRIENDS.', image_url:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'},
  {id:'yardbird', name:'Yardbird', area:'CENTRAL', time:'TONIGHT 9PM', spots_left:2, host_initial:'C', host_role:'CHEF', host_tier:'SILVER', vibe_tag:'NIGHT OWLS', cuisine:'IZAKAYA · YAKITORI', price:'$$$', invite_text:'CJ INVITES YOU TO JOIN - NIGHT OWLS. 4 PEOPLE, 30-40, MEET NEW FRIENDS.', image_url:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'},
  {id:'la-cabane', name:'La Cabane', area:'CWB', time:'TOMORROW 7PM', spots_left:4, host_initial:'S', host_role:'SOMMELIER', host_tier:'GOLD', vibe_tag:'WINE LOVERS', cuisine:'WINE · NATURAL', price:'$$', invite_text:'CJ INVITES YOU TO JOIN - WINE LOVERS. 4 PEOPLE, 30-40, MEET NEW FRIENDS.', image_url:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'},
]

export default function VenuesPage(){
  const { isAdmin } = useAuth()
  const [venues,setVenues]=useState<Venue[]>(DEFAULT_VENUES)
  const [dragId,setDragId]=useState<string|null>(null)

  const move = (id:string, dir:'up'|'down'|'left'|'right') => {
    const idx = venues.findIndex(v=>v.id===id)
    if(idx===-1) return
    const newList = [...venues]
    if(dir==='up' && idx>0){
      const tmp = newList[idx-1]; newList[idx-1]=newList[idx]; newList[idx]=tmp
    } else if(dir==='down' && idx<newList.length-1){
      const tmp = newList[idx+1]; newList[idx+1]=newList[idx]; newList[idx]=tmp
    } else if(dir==='left' && idx>0){
      // left = up in grid (previous)
      const tmp = newList[idx-1]; newList[idx-1]=newList[idx]; newList[idx]=tmp
    } else if(dir==='right' && idx<newList.length-1){
      const tmp = newList[idx+1]; newList[idx+1]=newList[idx]; newList[idx]=tmp
    }
    setVenues(newList)
  }

  const handleAdd = () => {
    const newV:Venue = {
      id:`venue-${Date.now()}`,
      name:'New Venue',
      area:'SOHO',
      time:'TONIGHT 8PM',
      spots_left:5,
      host_initial:'N',
      host_role:'HOST',
      host_tier:'GOLD',
      vibe_tag:'NEW VIBE',
      cuisine:'NEW · CUISINE',
      price:'$$',
      invite_text:'NEW VENUE - EDIT ME',
      image_url:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
    }
    setVenues([...venues, newV])
  }

  const handleDelete = (id:string) => {
    if(!confirm('Delete this venue box?')) return
    setVenues(venues.filter(v=>v.id!==id))
  }

  const handleEdit = (id:string) => {
    const v = venues.find(v=>v.id===id)
    if(!v) return
    const name = prompt('Venue name', v.name) || v.name
    const area = prompt('Area (SOHO, CENTRAL...)', v.area) || v.area
    const img = prompt('Image URL', v.image_url) || v.image_url
    const spots = prompt('Spots left', String(v.spots_left)) || String(v.spots_left)
    setVenues(venues.map(x=> x.id===id ? {...x, name, area, image_url:img, spots_left: Number(spots)||x.spots_left} : x))
  }

  const handleDragStart = (id:string) => setDragId(id)
  const handleDrop = (targetId:string) => {
    if(!dragId || dragId===targetId) return
    const fromIdx = venues.findIndex(v=>v.id===dragId)
    const toIdx = venues.findIndex(v=>v.id===targetId)
    if(fromIdx===-1 || toIdx===-1) return
    const newList = [...venues]
    const [moved] = newList.splice(fromIdx,1)
    newList.splice(toIdx,0,moved)
    setVenues(newList)
    setDragId(null)
  }

  return(
    <main className="bg-[#080808] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 pt-14 pb-20">
        <div className="flex justify-between">
          <div>
            <h1 className="serif text-[56px] md:text-[68px] leading-[0.9] text-white">Venues —<br/>Where it happens</h1>
            <p className="mt-5 text-[14px] text-zinc-500 max-w-[440px]">Six scenes tonight. Each with a different photo. No repeats. Click a box for full details.</p>
          </div>
          <div className="flex gap-2 items-end">
            <button className="mono h-10 px-5 rounded-full bg-[#f5f2eb] text-black text-[11px]">ALL VENUES</button>
            <Link href="/private-events" className="mono h-10 px-5 rounded-full border border-zinc-800 text-zinc-500 text-[11px] flex items-center">PRIVATE EVENTS</Link>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-6 bg-[#C45A3C] rounded-xl p-3 mono text-[11px] text-white flex justify-between items-center">
            <span>ADMIN EDIT MODE: Drag boxes to move left/right/up/down. Click ✎ to edit text/colour/size/font. + Add / Delete boxes.</span>
            <button onClick={handleAdd} className="bg-black text-white px-4 py-1.5 rounded-full">+ ADD VENUE BOX</button>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {venues.map(v=>(
            <div 
              key={v.id} 
              draggable={isAdmin}
              onDragStart={()=>handleDragStart(v.id)}
              onDragOver={e=>e.preventDefault()}
              onDrop={()=>handleDrop(v.id)}
              className={`group relative bg-[#0f0f0f] border border-zinc-900 rounded-[18px] p-1.5 transition-all duration-300 hover:-translate-y-1 ${dragId===v.id?'opacity-50':''} ${isAdmin?'cursor-move':''}`}
            >
              {isAdmin && (
                <div className="absolute -top-2 left-2 z-30 flex gap-1">
                  <button onClick={()=>move(v.id,'left')} className="w-6 h-6 bg-black border border-zinc-700 rounded-full text-[10px]">←</button>
                  <button onClick={()=>move(v.id,'right')} className="w-6 h-6 bg-black border border-zinc-700 rounded-full text-[10px]">→</button>
                  <button onClick={()=>move(v.id,'up')} className="w-6 h-6 bg-black border border-zinc-700 rounded-full text-[10px]">↑</button>
                  <button onClick={()=>move(v.id,'down')} className="w-6 h-6 bg-black border border-zinc-700 rounded-full text-[10px]">↓</button>
                  <button onClick={()=>handleEdit(v.id)} className="w-6 h-6 bg-[#C45A3C] rounded-full text-[10px]">✎</button>
                  <button onClick={()=>handleDelete(v.id)} className="w-6 h-6 bg-red-600 rounded-full text-[10px]">×</button>
                </div>
              )}
              <div className="absolute -top-2.5 right-3 z-20 flex items-center gap-1.5 bg-[#f5f2eb] text-black mono text-[10px] px-2.5 py-1 rounded-full">
                <div className="w-3.5 h-3.5 rounded-full bg-black text-white flex items-center justify-center text-[7px]">{v.host_initial}</div>
                {v.host_role} · {v.host_tier}
              </div>
              <Link href={`/venues/${v.id}`} className="block relative h-[260px] rounded-[14px] overflow-hidden bg-zinc-900">
                <img src={v.image_url} alt={v.name} className="w-full h-full object-cover" />
                <div className="absolute top-2.5 left-2.5 mono text-[10px] bg-black/70 backdrop-blur px-2.5 py-1 rounded-full text-white">{v.area} · {v.time}</div>
                <div className="absolute bottom-2.5 left-2.5 mono text-[10px] bg-[#c96a4a] px-2.5 py-1 rounded-full text-white">{v.spots_left} SPOTS LEFT</div>
              </Link>
              <div className="px-2.5 pt-3 pb-2">
                <div className="flex justify-between">
                  <Link href={`/venues/${v.id}`} className="serif text-[18px] text-white">{v.name}</Link>
                  <span className="mono text-[9px] text-zinc-600">{v.vibe_tag}</span>
                </div>
                <div className="mt-1 mono text-[10px] text-zinc-500">{v.cuisine} · {v.price}</div>
                <div className="mt-2 mono text-[10px] text-zinc-400 line-clamp-2">{v.invite_text}</div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/join?venue=${v.id}`} className="flex-1 mono h-10 rounded-full bg-[#f5f2eb] text-black text-[11px] flex items-center justify-center">JOIN</Link>
                  <Link href="/invite" className="mono h-10 px-5 rounded-full border border-zinc-800 text-[11px] flex items-center justify-center text-zinc-400">INVITE</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
