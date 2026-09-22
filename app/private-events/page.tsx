
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthContext'

type PrivateEvent = {
  id:string,
  title:string,
  subtitle:string,
  host:string,
  tag:string,
  image:string,
  attraction:string,
}

const DEFAULT_EVENTS:PrivateEvent[] = [
  {id:'speakeasy-laughs', title:'Speakeasy Laughs', subtitle:'Comedian hosts a no-phone, real-talk dinner', host:'HOST: COMEDIAN · STAND-UP CROWD', tag:'12 DINNERS', image:'https://images.unsplash.com/photo-1515169067868-ad38a3a05cbe?w=800', attraction:'If you laugh at the same dark joke, you will stay for dessert.'},
  {id:'flash-night', title:'Flash Night', subtitle:'Tattoo artists + blank walls + shared stories', host:'HOST: INK STUDIO · ARTISTS', tag:'8 NIGHTS', image:'https://images.unsplash.com/photo-1545562083-c583d060a12b?w=800', attraction:'You bring a memory, they bring the ink idea.'},
  {id:'plating-together', title:'Plating Together', subtitle:'Private kitchen where strangers plate each other dish', host:'HOST: CHEF LIN · 6 SEATS', tag:'15 TABLES', image:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', attraction:'You cook for someone you have not met. They do the same.'},
  {id:'candlelight-pour', title:'Candlelight Pour', subtitle:'Natural wine, low lights, honest questions', host:'HOST: SOMMELIER · CURATED', tag:'9 BOTTLES', image:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', attraction:'The wine is the excuse. The conversation is the reason.'},
  {id:'tea-tiles', title:'Tea & Tiles', subtitle:'Mahjong for people who never learned properly', host:'HOST: AUNTIE MAY · 50+ FRIENDLY', tag:'20 GAMES', image:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', attraction:'Slow tea, loud laughs, no one keeps score really.'},
  {id:'golden-hour-hike', title:'Golden Hour Hike', subtitle:'Sunset buddies, no small talk uphill', host:'HOST: KAI · OUTDOOR CIRCLE', tag:'6 HIKES', image:'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', attraction:'Walk side by side, talk without staring. It is easier.'},
]

export default function PrivateEventsPage(){
  const { isAdmin } = useAuth()
  const [events,setEvents]=useState<PrivateEvent[]>(DEFAULT_EVENTS)
  const [hovered,setHovered]=useState<string|null>(null)
  const [dragId,setDragId]=useState<string|null>(null)

  const move = (id:string, dir:'up'|'down'|'left'|'right') => {
    const idx = events.findIndex(v=>v.id===id)
    if(idx===-1) return
    const newList = [...events]
    if((dir==='up' || dir==='left') && idx>0){
      const tmp = newList[idx-1]; newList[idx-1]=newList[idx]; newList[idx]=tmp
    } else if((dir==='down' || dir==='right') && idx<newList.length-1){
      const tmp = newList[idx+1]; newList[idx+1]=newList[idx]; newList[idx]=tmp
    }
    setEvents(newList)
  }

  const handleAdd = () => {
    const newE:PrivateEvent = {id:`event-${Date.now()}`, title:'New Private Event', subtitle:'New subtitle - host creates attraction', host:'HOST: NEW HOST', tag:'NEW', image:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', attraction:'New attraction reason.'}
    setEvents([...events, newE])
  }

  const handleDelete = (id:string) => {
    if(!confirm('Delete this event box?')) return
    setEvents(events.filter(e=>e.id!==id))
  }

  const handleEdit = (id:string) => {
    const ev = events.find(e=>e.id===id)
    if(!ev) return
    const title = prompt('Title', ev.title) || ev.title
    const subtitle = prompt('Subtitle', ev.subtitle) || ev.subtitle
    const image = prompt('Image URL', ev.image) || ev.image
    const attraction = prompt('Attraction text', ev.attraction) || ev.attraction
    setEvents(events.map(x=> x.id===id ? {...x, title, subtitle, image, attraction} : x))
  }

  const handleDragStart = (id:string) => setDragId(id)
  const handleDrop = (targetId:string) => {
    if(!dragId || dragId===targetId) return
    const fromIdx = events.findIndex(v=>v.id===dragId)
    const toIdx = events.findIndex(v=>v.id===targetId)
    if(fromIdx===-1 || toIdx===-1) return
    const newList = [...events]
    const [moved] = newList.splice(fromIdx,1)
    newList.splice(toIdx,0,moved)
    setEvents(newList)
    setDragId(null)
  }

  return(
    <main className="bg-[#080808] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 pt-14 pb-20">
        <h1 className="serif text-[64px] md:text-[80px] leading-[0.9] text-white">Private Events</h1>
        <p className="mt-6 max-w-[700px] text-[16px] text-zinc-500">Host creates attraction and download reasons. Six cards, six different photos — comedian, tattoo, chef, wine, mahjong tea, hiking golden hour. Photos always coloured, hover turns text orange #C45A3C.</p>

        {isAdmin && (
          <div className="mt-6 bg-[#C45A3C] rounded-xl p-3 mono text-[11px] text-white flex justify-between items-center">
            <span>ADMIN EDIT MODE: Drag boxes left/right/up/down, edit text/colour/size/font, add/delete event boxes. All freely moveable.</span>
            <button onClick={handleAdd} className="bg-black text-white px-4 py-1.5 rounded-full">+ ADD EVENT BOX</button>
          </div>
        )}

        <div className="mt-12 border-t border-zinc-900"></div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map(ev=>{
            const isHovered = hovered===ev.id
            return(
              <div 
                key={ev.id} 
                draggable={isAdmin}
                onDragStart={()=>handleDragStart(ev.id)}
                onDragOver={e=>e.preventDefault()}
                onDrop={()=>handleDrop(ev.id)}
                className={`group relative bg-[#0f0f0f] border rounded-[18px] p-2 transition-all duration-300 ${isHovered ? 'border-[#C45A3C] -translate-y-1' : 'border-zinc-900 hover:border-zinc-800 hover:-translate-y-1'} ${dragId===ev.id?'opacity-50':''} ${isAdmin?'cursor-move':''}`}
                onMouseEnter={()=>setHovered(ev.id)}
                onMouseLeave={()=>setHovered(null)}
              >
                {isAdmin && (
                  <div className="absolute -top-2 left-2 z-30 flex gap-1">
                    <button onClick={()=>move(ev.id,'left')} className="w-6 h-6 bg-black border border-zinc-700 rounded-full text-[10px]">←</button>
                    <button onClick={()=>move(ev.id,'right')} className="w-6 h-6 bg-black border border-zinc-700 rounded-full text-[10px]">→</button>
                    <button onClick={()=>move(ev.id,'up')} className="w-6 h-6 bg-black border border-zinc-700 rounded-full text-[10px]">↑</button>
                    <button onClick={()=>move(ev.id,'down')} className="w-6 h-6 bg-black border border-zinc-700 rounded-full text-[10px]">↓</button>
                    <button onClick={()=>handleEdit(ev.id)} className="w-6 h-6 bg-[#C45A3C] rounded-full text-[10px]">✎</button>
                    <button onClick={()=>handleDelete(ev.id)} className="w-6 h-6 bg-red-600 rounded-full text-[10px]">×</button>
                  </div>
                )}
                <Link href={`/private-events/${ev.id}`} className="block relative h-[280px] rounded-[14px] overflow-hidden bg-zinc-900">
                  <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2.5 left-2.5 mono text-[11px] bg-black/70 backdrop-blur px-3 py-1 rounded-full text-white">{ev.tag}</div>
                </Link>
                <div className="px-2.5 pt-4 pb-2">
                  <Link href={`/private-events/${ev.id}`} className="block">
                    <h3 className={`serif text-[24px] leading-tight transition-colors ${isHovered ? 'text-[#C45A3C]' : 'text-white'}`}>{ev.title}</h3>
                    <p className={`mt-2 text-[14px] transition-colors ${isHovered ? 'text-[#C45A3C]/80' : 'text-zinc-400'}`}>{ev.subtitle}</p>
                    <div className={`mt-3 mono text-[11px] transition-colors ${isHovered ? 'text-[#C45A3C]/60' : 'text-zinc-600'}`}>{ev.host}</div>
                    <p className={`mt-4 text-[13px] italic transition-colors ${isHovered ? 'text-[#C45A3C]/70' : 'text-zinc-500'}`}>"Attraction: {ev.attraction}"</p>
                  </Link>
                  <div className="mt-6 flex gap-2">
                    <Link href={`/join?private=${ev.id}`} className={`flex-1 mono h-11 rounded-full text-[11px] flex items-center justify-center transition ${isHovered ? 'bg-[#C45A3C] text-white' : 'bg-[#f5f2eb] text-black'}`}>JOIN</Link>
                    <Link href="/invite" className={`mono h-11 px-5 rounded-full border text-[11px] flex items-center justify-center transition ${isHovered ? 'border-[#C45A3C] text-[#C45A3C]' : 'border-zinc-800 text-zinc-500'}`}>INVITE</Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
