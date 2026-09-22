
'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthContext'
import { supabase } from '@/lib/supabase'

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
  const { isAdmin, saveDraft, publishDraft } = useAuth()
  const [events,setEvents]=useState<PrivateEvent[]>(DEFAULT_EVENTS)
  const [hovered,setHovered]=useState<string|null>(null)
  const [dragId,setDragId]=useState<string|null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editingId,setEditingId]=useState<string|null>(null)

  useEffect(()=>{
    const draftStr = localStorage.getItem('bb_draft')
    if(draftStr){
      try{
        const draft = JSON.parse(draftStr)
        if(draft.privateEvents) setEvents(draft.privateEvents)
      }catch{}
    }
  },[])

  const persist = (list:PrivateEvent[]) => {
    setEvents(list)
    if(isAdmin){
      const existing = JSON.parse(localStorage.getItem('bb_draft')||'{}')
      localStorage.setItem('bb_draft', JSON.stringify({...existing, privateEvents:list}))
    }
  }

  const move = (id:string, dir:'up'|'down'|'left'|'right') => {
    const idx = events.findIndex(v=>v.id===id)
    if(idx===-1) return
    const newList = [...events]
    if((dir==='up' || dir==='left') && idx>0){
      const tmp = newList[idx-1]; newList[idx-1]=newList[idx]; newList[idx]=tmp
    } else if((dir==='down' || dir==='right') && idx<newList.length-1){
      const tmp = newList[idx+1]; newList[idx+1]=newList[idx]; newList[idx]=tmp
    }
    persist(newList)
  }

  const handleAdd = () => {
    const newE:PrivateEvent = {id:`event-${Date.now()}`, title:'New Private Event', subtitle:'New subtitle - host creates attraction', host:'HOST: NEW HOST', tag:'NEW', image:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', attraction:'New attraction reason.'}
    persist([...events, newE])
  }

  const handleDelete = (id:string) => {
    if(!confirm('Delete this event box?')) return
    persist(events.filter(e=>e.id!==id))
  }

  const handleEdit = (id:string) => {
    const ev = events.find(e=>e.id===id)
    if(!ev) return
    const title = prompt('Title', ev.title) || ev.title
    const subtitle = prompt('Subtitle', ev.subtitle) || ev.subtitle
    const attraction = prompt('Attraction', ev.attraction) || ev.attraction
    persist(events.map(x=> x.id===id ? {...x, title, subtitle, attraction} : x))
  }

  const handlePhotoClick = (id:string) => {
    setEditingId(id)
    fileInputRef.current?.click()
  }

  const handleFile = async (e:any) => {
    const file = e.target.files?.[0]
    if(!file || !editingId) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string
      try{
        const fileName = `${editingId}-${Date.now()}.${file.name.split('.').pop()}`
        const {data, error} = await supabase.storage.from('uploads').upload(fileName, file)
        if(!error && data){
          const {data: urlData} = supabase.storage.from('uploads').getPublicUrl(fileName)
          persist(events.map(x=> x.id===editingId ? {...x, image: urlData.publicUrl} : x))
        } else {
          persist(events.map(x=> x.id===editingId ? {...x, image: base64} : x))
        }
      }catch{
        persist(events.map(x=> x.id===editingId ? {...x, image: base64} : x))
      }
      setEditingId(null)
    }
    reader.readAsDataURL(file)
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
    persist(newList)
    setDragId(null)
  }

  return(
    <main className="bg-[#080808] min-h-screen">
      <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFile} />
      <div className="max-w-[1400px] mx-auto px-6 pt-14 pb-20">
        <h1 className="serif text-[64px] md:text-[80px] leading-[0.9] text-white">Private Events</h1>
        <p className="mt-6 max-w-[700px] text-[16px] text-zinc-500">Host creates attraction and download reasons. Six cards, six different photos — comedian, tattoo, chef, wine, mahjong tea, hiking golden hour. Photos always coloured, hover turns text orange #C45A3C.</p>

        {isAdmin && (
          <div className="mt-6 bg-[#0f0f0f] border border-[#C45A3C] rounded-xl p-3 mono text-[11px] text-white flex flex-wrap justify-between items-center gap-2">
            <span>ADMIN: Upload photo from computer, move ←→↑↓, edit, add/delete. SAVE DRAFT = save but not live, PUBLISH = live.</span>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="bg-white text-black px-4 py-1.5 rounded-full">+ ADD BOX</button>
              <button onClick={()=>{const d=JSON.parse(localStorage.getItem('bb_draft')||'{}'); saveDraft(d); alert('Draft saved! Website unchanged. Press Publish to go live.')}} className="bg-zinc-800 text-white px-4 py-1.5 rounded-full border border-zinc-700">SAVE DRAFT</button>
              <button onClick={()=>publishDraft()} className="bg-[#C45A3C] text-white px-4 py-1.5 rounded-full">PUBLISH</button>
            </div>
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
                  <div className="absolute -top-2 left-2 z-30 flex gap-1 flex-wrap max-w-[220px]">
                    <button onClick={()=>move(ev.id,'left')} className="w-6 h-6 bg-black border border-zinc-700 rounded-full text-[10px]">←</button>
                    <button onClick={()=>move(ev.id,'right')} className="w-6 h-6 bg-black border border-zinc-700 rounded-full text-[10px]">→</button>
                    <button onClick={()=>move(ev.id,'up')} className="w-6 h-6 bg-black border border-zinc-700 rounded-full text-[10px]">↑</button>
                    <button onClick={()=>move(ev.id,'down')} className="w-6 h-6 bg-black border border-zinc-700 rounded-full text-[10px]">↓</button>
                    <button onClick={()=>handleEdit(ev.id)} className="w-6 h-6 bg-[#C45A3C] rounded-full text-[10px]">✎</button>
                    <button onClick={()=>handlePhotoClick(ev.id)} className="w-6 h-6 bg-blue-600 rounded-full text-[10px]">📷</button>
                    <button onClick={()=>handleDelete(ev.id)} className="w-6 h-6 bg-red-600 rounded-full text-[10px]">×</button>
                  </div>
                )}
                <div className="block relative h-[280px] rounded-[14px] overflow-hidden bg-zinc-900">
                  <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                  {isAdmin && <button onClick={()=>handlePhotoClick(ev.id)} className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center mono text-[11px] text-white transition">UPLOAD PHOTO FROM COMPUTER</button>}
                  <div className="absolute top-2.5 left-2.5 mono text-[11px] bg-black/70 backdrop-blur px-3 py-1 rounded-full text-white">{ev.tag}</div>
                </div>
                <div className="px-2.5 pt-4 pb-2">
                  <h3 className={`serif text-[24px] leading-tight transition-colors ${isHovered ? 'text-[#C45A3C]' : 'text-white'}`}>{ev.title}</h3>
                  <p className={`mt-2 text-[14px] transition-colors ${isHovered ? 'text-[#C45A3C]/80' : 'text-zinc-400'}`}>{ev.subtitle}</p>
                  <div className={`mt-3 mono text-[11px] transition-colors ${isHovered ? 'text-[#C45A3C]/60' : 'text-zinc-600'}`}>{ev.host}</div>
                  <p className={`mt-4 text-[13px] italic transition-colors ${isHovered ? 'text-[#C45A3C]/70' : 'text-zinc-500'}`}>"Attraction: {ev.attraction}"</p>
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
