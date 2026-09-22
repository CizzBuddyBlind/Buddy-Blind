
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Content = Record<string,string>
const DEFAULT_CONTENT:Content = {
  top_stats: 'HONG KONG · TONIGHT · 1,247 BLIND BOXES / 89 HOSTS / 156 SCENES',
  headline_1: "You don't know",
  headline_2: "who you'll meet.",
  headline_3: "That's the point.",
  subtext_1: 'Restaurants provide the scene. Private events create the reason.',
  subtext_2: 'You bring curiosity.',
  cta_join: 'JOIN A BLIND DINNER →',
  cta_private: 'PRIVATE EVENTS',
  stat1_num: '89',
  stat1_label: 'HOSTS WHO SHOW UP',
  stat2_num: '156',
  stat2_label: 'SCENES TONIGHT',
  stat3_num: '4.8',
  stat3_label: 'AVG AFTER-TALK RATING',
  featured_label: 'FEATURED TONIGHT · ONE BLIND BOX OPEN',
  footer_left: 'BUDDY BLIND · HONG KONG · 1,247 BLIND BOXES · NO BOTTOM FLYWHEEL PER V9 FEEDBACK',
}

type Featured = {
  id:string, title:string, area:string, time:string, spots_left:number, host_label:string, price_label:string, vibe_label:string, invite_text:string, description_long:string, image_url:string
}

const DEFAULT_FEATURED:Featured = {
  id:'kissa-tanaka', title:'Kissa Tanaka', area:'SOHO', time:'TONIGHT 7:30PM', spots_left:3, host_label:'HOST: COMEDIAN · GOLD', price_label:'$$ · CREATIVE MINDS', vibe_label:'SOHO · KISSATEN · HOST CREATES ATTRACTION AND DOWNLOAD REASONS', invite_text:'CJ INVITES YOU TO JOIN A DINNER AND MEET NEW FRIENDS - NO PITCHES, JUST PRESENCE.', description_long:'A 6-seat counter, vinyl crackle, no menus. You order by mood. Tonight is for people who collect stories, not contacts. No pitches, just presence.', image_url:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'
}

export default function HomePage(){
  const [content,setContent]=useState<Content>(DEFAULT_CONTENT)
  const [featured,setFeatured]=useState<Featured>(DEFAULT_FEATURED)
  const [shareMsg,setShareMsg]=useState('')

  useEffect(()=>{
    (async()=>{
      const {data:site} = await supabase.from('site_content').select('*')
      if(site && site.length>0){
        const map:Content={...DEFAULT_CONTENT}
        site.forEach((r:any)=>{ map[r.key]=r.value })
        setContent(map)
      }
      const {data:feats} = await supabase.from('featured_events').select('*').order('created_at',{ascending:false}).limit(1)
      if(feats && feats[0]){
        setFeatured({...DEFAULT_FEATURED, ...feats[0]})
      }
    })()
  },[])

  // BUTTON LOGIC PER BIBLE:
  // LEFT JOIN A BLIND DINNER -> /venues (list all blind drops)
  // LEFT PRIVATE EVENTS -> /private-events
  // RIGHT SHARE -> copy link + navigator.share if available
  // RIGHT JOIN BLIND BOX -> /join?venue=featured.id -> decrements spots_left in featured_events + venues, then redirects to /profile
  // RIGHT INVITE -> /invite (invite page with copy link)

  const handleShare = async () => {
    const url = `${window.location.origin}/venues?featured=${featured.id}`
    try{
      if(navigator.share){
        await navigator.share({title: featured.title, text: featured.invite_text, url})
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

  const handleJoinBox = async () => {
    // Bible: Join decrements places_left / spots_left
    if(featured.spots_left <= 0){
      alert('Sold out')
      return
    }
    // update featured_events
    const {data:existing} = await supabase.from('featured_events').select('id,spots_left').eq('id',featured.id).single()
    if(existing){
      await supabase.from('featured_events').update({spots_left: existing.spots_left - 1}).eq('id',featured.id)
    }
    // also try update venues if same id exists (fallback)
    try{
      const {data:venue} = await supabase.from('venues').select('places_left').eq('id',featured.id).single()
      if(venue){
        await supabase.from('venues').update({places_left: venue.places_left - 1}).eq('id',featured.id)
      }
    }catch{}
    // per bible: after join, go to /join?venue=id so they enter email and confirm
    window.location.href = `/join?venue=${featured.id}&source=home`
  }

  return(
    <main className="bg-[#080808] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10">
        {/* LEFT */}
        <div className="pt-8">
          <div className="mono text-[10px] tracking-[0.15em] text-zinc-500">{content.top_stats}</div>
          <h1 className="mt-16 text-[64px] md:text-[84px] leading-[0.85] tracking-[-0.03em]">
            <span className="font-normal block text-white">{content.headline_1}</span>
            <span className="serif italic font-light block text-[#f5f2eb] ml-1">{content.headline_2}</span>
            <span className="serif italic font-light block text-[#c96a4a]">{content.headline_3}</span>
          </h1>
          <div className="mt-12 text-[14px] leading-relaxed text-zinc-400 max-w-[420px]">
            <p>{content.subtext_1}</p>
            <p className="mt-1 text-zinc-300">{content.subtext_2}</p>
          </div>
          <div className="mt-10 flex gap-3">
            {/* BIBLE: JOIN A BLIND DINNER -> VENUES */}
            <Link href="/venues" className="mono h-[48px] px-7 rounded-full bg-[#f5f2eb] text-black text-[11px] tracking-[0.15em] flex items-center hover:bg-white transition">{content.cta_join}</Link>
            {/* BIBLE: PRIVATE EVENTS -> /private-events */}
            <Link href="/private-events" className="mono h-[48px] px-7 rounded-full border border-zinc-800 text-[11px] tracking-[0.15em] flex items-center text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition">{content.cta_private}</Link>
          </div>
          <div className="mt-24 border-t border-zinc-900 pt-8 grid grid-cols-3 gap-8 max-w-[420px]">
            <div><div className="serif text-[36px] text-white">{content.stat1_num}</div><div className="mono mt-2 text-[10px] tracking-[0.1em] text-zinc-500 leading-relaxed">{content.stat1_label}</div></div>
            <div><div className="serif text-[36px] text-white">{content.stat2_num}</div><div className="mono mt-2 text-[10px] tracking-[0.1em] text-zinc-500">{content.stat2_label}</div></div>
            <div><div className="serif text-[36px] text-white">{content.stat3_num}</div><div className="mono mt-2 text-[10px] tracking-[0.1em] text-zinc-500">{content.stat3_label}</div></div>
          </div>
        </div>
        {/* RIGHT FEATURED */}
        <div className="lg:pt-4">
          <div className="flex items-center gap-2 mono text-[10px] tracking-[0.15em] text-zinc-500"><span className="w-1.5 h-1.5 rounded-full bg-[#c96a4a]"></span>{content.featured_label}</div>
          <div className="mt-4 bg-[#121212] border border-zinc-900 rounded-[24px] relative">
            <div className="relative h-[520px] bg-zinc-900 rounded-t-[24px] overflow-hidden">
              <img src={featured.image_url} alt={featured.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="mono text-[10px] tracking-[0.1em] bg-black/70 backdrop-blur border border-white/10 px-3 py-1.5 rounded-full text-white">{featured.area} · {featured.time}</div>
                <div className="mono text-[10px] tracking-[0.1em] bg-[#c96a4a] px-3 py-1.5 rounded-full text-white">{featured.spots_left} SPOTS LEFT</div>
              </div>
              <div className="absolute -top-3 right-5 z-20 flex items-center gap-2 bg-[#f5f2eb] text-black mono text-[10px] tracking-[0.1em] px-4 py-2 rounded-full border border-black/10 shadow-xl"><div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[9px]">C</div>{featured.host_label}</div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="flex -space-x-2"><div className="w-8 h-8 rounded-full bg-zinc-700 border border-black"></div><div className="w-8 h-8 rounded-full bg-zinc-600 border border-black"></div><div className="w-8 h-8 rounded-full bg-zinc-500 border border-black"></div><div className="w-8 h-8 rounded-full bg-white text-black border border-black flex items-center justify-center text-[11px] mono">?</div></div>
                <div className="mono text-[10px] tracking-[0.1em] bg-black/70 backdrop-blur border border-white/10 px-3 py-1.5 rounded-full text-zinc-300">{featured.price_label}</div>
              </div>
            </div>
            <div className="p-7">
              <h2 className="serif text-[28px] text-white">{featured.title}</h2>
              <div className="mt-2 mono text-[10px] tracking-[0.1em] text-zinc-500 leading-relaxed">{featured.vibe_label}</div>
              <div className="mt-4 mono text-[11px] tracking-[0.05em] text-zinc-400 leading-relaxed">{featured.invite_text}</div>
              {/* SHARE -> copy/share link per bible */}
              <button onClick={handleShare} className="mt-4 mono text-[10px] tracking-[0.15em] border border-zinc-800 px-4 py-2 rounded-full text-white hover:border-zinc-600 transition">{shareMsg || 'SHARE'}</button>
              <p className="mt-6 text-[13px] leading-relaxed text-zinc-400">{featured.description_long}</p>
              <div className="mt-8 flex gap-3">
                {/* JOIN BLIND BOX -> /join?venue=id + decrement */}
                <button onClick={handleJoinBox} className="flex-1 mono h-[48px] rounded-full bg-[#f5f2eb] text-black text-[11px] tracking-[0.15em] flex items-center justify-center hover:bg-white transition">JOIN BLIND BOX</button>
                {/* INVITE -> /invite per bible */}
                <Link href="/invite" className="mono h-[48px] px-6 rounded-full border border-zinc-800 text-[11px] tracking-[0.15em] flex items-center justify-center text-zinc-300 hover:border-zinc-600 transition">INVITE</Link>
              </div>
              <div className="mt-6 mono text-[10px] tracking-[0.1em] text-zinc-600 leading-relaxed">DIFFERENT PHOTOS ON EVENT PAGE AND PRIVATE EVENT PAGE · NO REPEATS · MORE HEART</div>
            </div>
          </div>
          <div className="mt-8 mono text-[10px] tracking-[0.1em] text-zinc-700">SCROLL — NONE. BOTTOM PART — REMOVED PER FEEDBACK.</div>
        </div>
      </div>
      <footer className="border-t border-zinc-900 mt-10 py-6">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
          <div className="mono text-[10px] tracking-[0.1em] text-zinc-600">{content.footer_left}</div>
          <div className="flex gap-6 mono text-[10px] tracking-[0.1em] text-zinc-600"><Link href="/how-it-works" className="hover:text-zinc-300">How it works</Link><Link href="/premium" className="hover:text-zinc-300">Premium</Link></div>
        </div>
      </footer>
    </main>
  )
}
