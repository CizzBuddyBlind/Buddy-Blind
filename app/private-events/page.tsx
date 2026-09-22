
'use client'
import { useState } from 'react'
import Link from 'next/link'

type PrivateEvent = {
  id:string,
  title:string,
  subtitle:string,
  host:string,
  tag:string,
  image:string,
  attraction:string,
  count:string
}

const EVENTS:PrivateEvent[] = [
  {
    id:'speakeasy-laughs',
    title:'Speakeasy Laughs',
    subtitle:'Comedian hosts a no-phone, real-talk dinner',
    host:'HOST: COMEDIAN · STAND-UP CROWD',
    tag:'12 DINNERS',
    image:'https://images.unsplash.com/photo-1515169067868-ad38a3a05cbe?w=800',
    attraction:'If you laugh at the same dark joke, you\'ll stay for dessert.',
    count:'12'
  },
  {
    id:'flash-night',
    title:'Flash Night',
    subtitle:'Tattoo artists + blank walls + shared stories',
    host:'HOST: INK STUDIO · ARTISTS',
    tag:'8 NIGHTS',
    image:'https://images.unsplash.com/photo-1545562083-c583d060a12b?w=800',
    attraction:'You bring a memory, they bring the ink idea.',
    count:'8'
  },
  {
    id:'plating-together',
    title:'Plating Together',
    subtitle:'Private kitchen where strangers plate each other\'s dish',
    host:'HOST: CHEF LIN · 6 SEATS',
    tag:'15 TABLES',
    image:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    attraction:'You cook for someone you haven\'t met. They do the same.',
    count:'15'
  },
  {
    id:'candlelight-pour',
    title:'Candlelight Pour',
    subtitle:'Natural wine, low lights, honest questions',
    host:'HOST: SOMMELIER · CURATED',
    tag:'9 BOTTLES',
    image:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    attraction:'The wine is the excuse. The conversation is the reason.',
    count:'9'
  },
  {
    id:'tea-tiles',
    title:'Tea & Tiles',
    subtitle:'Mahjong for people who never learned properly',
    host:'HOST: AUNTIE MAY · 50+ FRIENDLY',
    tag:'20 GAMES',
    image:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    attraction:'Slow tea, loud laughs, no one keeps score really.',
    count:'20'
  },
  {
    id:'golden-hour-hike',
    title:'Golden Hour Hike',
    subtitle:'Sunset buddies, no small talk uphill',
    host:'HOST: KAI · OUTDOOR CIRCLE',
    tag:'6 HIKES',
    image:'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    attraction:'Walk side by side, talk without staring. It\'s easier.',
    count:'6'
  }
]

export default function PrivateEventsPage(){
  const [hovered,setHovered]=useState<string|null>(null)

  const handleJoin = (id:string) => {
    // Bible: JOIN goes to /join?private=id and decrements
    window.location.href = `/join?private=${id}`
  }

  return(
    <main className="bg-[#080808] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 pt-14 pb-20">
        <h1 className="serif text-[64px] md:text-[80px] leading-[0.9] text-white">Private Events</h1>
        <p className="mt-6 max-w-[700px] text-[16px] leading-relaxed text-zinc-500">
          Host creates attraction and download reasons. Six cards, six different photos — comedian, tattoo, chef, wine, mahjong tea, hiking golden hour. Photos always coloured, hover turns text orange #C45A3C.
        </p>

        <div className="mt-12 border-t border-zinc-900"></div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {EVENTS.map(ev=>{
            const isHovered = hovered===ev.id
            return(
              <div 
                key={ev.id} 
                className={`group relative bg-[#0f0f0f] border rounded-[18px] p-2 transition-all duration-300 cursor-pointer ${isHovered ? 'border-[#C45A3C] -translate-y-1' : 'border-zinc-900 hover:border-zinc-800 hover:-translate-y-1'}`}
                onMouseEnter={()=>setHovered(ev.id)}
                onMouseLeave={()=>setHovered(null)}
              >
                <Link href={`/private-events/${ev.id}`} className="block relative h-[280px] rounded-[14px] overflow-hidden bg-zinc-900">
                  <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2.5 left-2.5 mono text-[11px] tracking-[0.1em] bg-black/70 backdrop-blur border border-white/10 px-3 py-1 rounded-full text-white">{ev.tag}</div>
                </Link>
                <div className="px-2.5 pt-4 pb-2">
                  <Link href={`/private-events/${ev.id}`} className="block">
                    <h3 className={`serif text-[24px] leading-tight transition-colors duration-300 ${isHovered ? 'text-[#C45A3C]' : 'text-white'}`}>{ev.title}</h3>
                    <p className={`mt-2 text-[14px] leading-relaxed transition-colors duration-300 ${isHovered ? 'text-[#C45A3C]/80' : 'text-zinc-400'}`}>{ev.subtitle}</p>
                    <div className={`mt-3 mono text-[11px] tracking-[0.1em] transition-colors duration-300 ${isHovered ? 'text-[#C45A3C]/60' : 'text-zinc-600'}`}>{ev.host}</div>
                    <p className={`mt-4 text-[13px] leading-relaxed italic transition-colors duration-300 ${isHovered ? 'text-[#C45A3C]/70' : 'text-zinc-500'}`}>"Attraction: {ev.attraction}"</p>
                  </Link>
                  <div className="mt-6 flex gap-2">
                    <button onClick={()=>handleJoin(ev.id)} className={`flex-1 mono h-11 rounded-full text-[11px] tracking-[0.1em] transition-all duration-300 ${isHovered ? 'bg-[#C45A3C] text-white' : 'bg-[#f5f2eb] text-black hover:bg-white'}`}>JOIN</button>
                    <Link href="/invite" className={`mono h-11 px-5 rounded-full border text-[11px] tracking-[0.1em] flex items-center justify-center transition-all duration-300 ${isHovered ? 'border-[#C45A3C] text-[#C45A3C]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'}`}>INVITE</Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-16 bg-[#0f0f0f] border border-zinc-900 rounded-[18px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="mono text-[11px] tracking-[0.15em] text-[#C45A3C]">WHY PRIVATE · HEART VERSION</div>
            <h3 className="serif mt-3 text-[22px] md:text-[28px] text-white leading-tight">Wine tasting candlelight, mahjong tea warm, hiking golden hour buddies.</h3>
            <p className="mono mt-2 text-[11px] tracking-[0.1em] text-zinc-600">NOT JUST DARK INTERIORS — REAL HUMAN WARMTH.</p>
          </div>
          <Link href="/premium" className="mono h-11 px-8 rounded-full bg-[#f5f2eb] text-black text-[11px] tracking-[0.15em] flex items-center hover:bg-white transition shrink-0">SEE PREMIUM</Link>
        </div>

        <div className="mt-12 border-t border-zinc-900 pt-6 flex justify-between mono text-[10px] tracking-[0.1em] text-zinc-700">
          <span>BUDDY BLIND · HONG KONG · 1,247 BLIND BOXES · NO BOTTOM FLYWHEEL PER V9 FEEDBACK</span>
          <div className="flex gap-4"><Link href="/how-it-works" className="hover:text-zinc-500">How it works</Link><Link href="/premium" className="hover:text-zinc-500">Premium</Link></div>
        </div>
      </div>
    </main>
  )
}
