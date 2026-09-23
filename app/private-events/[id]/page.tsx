
'use client'
import { useState } from 'react'
import Link from 'next/link'

const EVENT_DETAILS:Record<string,any> = {
  'speakeasy-laughs': {
    title:'Speakeasy Laughs',
    subtitle:'Comedian hosts a no-phone, real-talk dinner',
    host:'HOST: COMEDIAN · STAND-UP CROWD',
    image:'https://images.unsplash.com/photo-1515169067868-ad38a3a05cbe?w=1200',
    gallery:['https://images.unsplash.com/photo-1515169067868-ad38a3a05cbe?w=400','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400'],
    about:'A comedian hosts a no-phone, real-talk dinner. If you laugh at the same dark joke, you will stay for dessert. No pitches, just presence. 6 seats, vinyl crackle, no menus. You order by mood. Tonight is for people who collect stories, not contacts.',
    attraction:'If you laugh at the same dark joke, you will stay for dessert.',
    hostName:'CJ · Comedian · Gold',
    price:'$$ · 12 dinners hosted',
    tags:['COMEDY','REAL-TALK','NO-PHONE']
  },
  'flash-night': {
    title:'Flash Night',
    subtitle:'Tattoo artists + blank walls + shared stories',
    host:'HOST: INK STUDIO · ARTISTS',
    image:'https://images.unsplash.com/photo-1545562083-c583d060a12b?w=1200',
    gallery:[],
    about:'Tattoo artists + blank walls + shared stories. You bring a memory, they bring the ink idea. Flash sheets, drinks, no pressure. You can leave with a story or a small tattoo.',
    attraction:'You bring a memory, they bring the ink idea.',
    hostName:'Ink Studio · Artists',
    price:'$$ · 8 nights',
    tags:['TATTOO','ART','STORIES']
  }
}

export default function PrivateEventDetail({params}:{params:{id:string}}){
  const id = params.id
  const data = EVENT_DETAILS[id] || EVENT_DETAILS['speakeasy-laughs']
  const [description,setDescription]=useState(data.about)
  const [photos,setPhotos]=useState<string[]>(data.gallery)
  const [shareMsg,setShareMsg]=useState('')

  const handleUpload = (e:any) => {
    const file = e.target.files?.[0]
    if(file){
      const url = URL.createObjectURL(file)
      setPhotos([...photos, url])
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    try{
      if(navigator.share){
        await navigator.share({title: data.title, text: data.subtitle, url})
      } else {
        await navigator.clipboard.writeText(url)
        setShareMsg('LINK COPIED')
        setTimeout(()=>setShareMsg(''),2000)
      }
    }catch{
      await navigator.clipboard.writeText(url)
      setShareMsg('LINK COPIED')
      setTimeout(()=>setShareMsg(''),2000)
    }
  }

  return(
    <main className="bg-[#080808] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 pt-10 pb-20">
        <Link href="/private-events" className="mono text-xs tracking-[0.1em] text-zinc-500 hover:text-zinc-300">← BACK TO PRIVATE EVENTS</Link>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8">
          {/* Left - Media */}
          <div>
            <div className="relative h-[520px] rounded-2xl overflow-hidden bg-zinc-900">
              <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 mono text-xs bg-black backdrop-blur px-3 py-1.5 rounded-full text-white">HOST: {data.host}</div>
              <button onClick={handleShare} className="absolute top-4 right-4 mono text-xs bg-[#f5f2eb] text-black px-4 py-2 rounded-full hover:bg-white">{shareMsg || 'SHARE'}</button>
            </div>

            {/* Host upload area - per Bible: Host can upload photos, videos */}
            <div className="mt-6 bg-[#0f0f0f] border border-zinc-900 rounded-[18px] p-5">
              <div className="flex justify-between items-center">
                <div className="mono text-xs tracking-[0.1em] text-white">HOST GALLERY · PHOTOS & VIDEOS</div>
                <label className="mono text-xs tracking-[0.1em] bg-zinc-800 px-3 py-1.5 rounded-full text-zinc-300 cursor-pointer hover:bg-zinc-700">
                  + UPLOAD
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} />
                </label>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {photos.map((p:string,i:number)=>(
                  <div key={i} className="h-[120px] rounded-xl overflow-hidden bg-zinc-900"><img src={p} alt="" className="w-full h-full object-cover" /></div>
                ))}
                <label className="h-[120px] rounded-xl border border-dashed border-zinc-700 flex items-center justify-center mono text-xs text-zinc-600 cursor-pointer hover:border-zinc-500">
                  + ADD
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} />
                </label>
              </div>
            </div>

            {/* Description box - editable */}
            <div className="mt-6 bg-[#0f0f0f] border border-zinc-900 rounded-[18px] p-6">
              <div className="mono text-xs tracking-[0.15em] text-white">ABOUT THIS PRIVATE EVENT</div>
              <textarea value={description} onChange={e=>setDescription(e.target.value)} className="mt-4 w-full min-h-[120px] bg-black border border-zinc-800 rounded-xl p-4 text-sm leading-relaxed text-zinc-300 focus:outline-none focus:border-zinc-600" placeholder="Describe what the event is about..." />
              <p className="mt-3 mono text-xs text-zinc-600">Host can edit this description to help users understand more about the event. Per Bible.</p>
            </div>

            <div className="mt-6">
              <h3 className="serif text-[22px] text-white">Attraction</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-zinc-400 italic">"{data.attraction}"</p>
            </div>
          </div>

          {/* Right - Booking */}
          <div className="bg-[#0f0f0f] border border-zinc-900 rounded-2xl p-6 h-fit sticky top-20">
            <h1 className="serif text-[32px] text-white leading-tight">{data.title}</h1>
            <p className="mt-2 text-sm text-zinc-400">{data.subtitle}</p>
            <div className="mt-3 mono text-xs text-zinc-600">{data.host}</div>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {data.tags.map((t:string)=><span key={t} className="mono text-xs bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full text-zinc-500">{t}</span>)}
            </div>

            <div className="mt-6 border-t border-zinc-900 pt-5">
              <div className="flex justify-between items-center">
                <span className="mono text-xs text-zinc-600">HOST</span>
                <span className="mono text-xs text-white">{data.hostName}</span>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="mono text-xs text-zinc-600">PRICE</span>
                <span className="mono text-xs text-white">{data.price}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <div className="bg-zinc-900 border border-zinc-900 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <div className="mono text-xs text-white">TONIGHT 7:30PM · PRIVATE BOX</div>
                  <div className="mono mt-1 text-xs text-zinc-600">HOST: COMEDIAN · 6 SPOTS</div>
                </div>
                <Link href={`/join?private=${id}`} className="mono h-8 px-4 rounded-full bg-[#f5f2eb] text-black text-xs flex items-center">JOIN</Link>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Link href={`/join?private=${id}`} className="flex-1 mono h-11 rounded-full bg-[#f5f2eb] text-black text-xs tracking-[0.1em] flex items-center justify-center hover:bg-white transition">JOIN PRIVATE BOX</Link>
              <button onClick={handleShare} className="mono h-11 px-5 rounded-full border border-zinc-800 text-xs tracking-[0.1em] text-zinc-400 hover:border-zinc-600 transition">{shareMsg || 'SHARE'}</button>
            </div>

            <Link href="/invite" className="mt-3 w-full mono h-10 rounded-full border border-zinc-800 text-xs tracking-[0.1em] flex items-center justify-center text-zinc-500 hover:border-zinc-600">INVITE FRIENDS</Link>

            <div className="mt-6 mono text-xs leading-relaxed text-zinc-700">Host can upload photos/videos to promote the event. Description box helps users understand more. Share button allows host or others to share the event. Per features bible.</div>
          </div>
        </div>
      </div>
    </main>
  )
}
