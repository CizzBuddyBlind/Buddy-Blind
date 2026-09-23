
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSiteContent } from '@/lib/useSiteContent'
import { EditableText } from '@/components/EditableText'
import Link from 'next/link'

type Featured = { id:string, title:string, area:string, time:string, spots_left:number, host_label:string, price_label:string, vibe_label:string, invite_text:string, description_long:string, image_url:string }

const DEFAULT_CONTENT:Record<string,string> = {
  top_stats: 'HONG KONG · TONIGHT · 1,247 BLIND BOXES / 89 HOSTS / 156 SCENES',
  headline_1: "You don't know",
  headline_2: "who you'll meet.",
  headline_3: "That's the point.",
  subtext_1: 'Restaurants provide the scene. Private events create the reason.',
  subtext_2: 'You bring curiosity.',
  cta_join: 'JOIN A BLIND DINNER ->',
  cta_private: 'PRIVATE EVENTS',
  stat1_num: '89',
  stat1_label: 'HOSTS WHO SHOW UP',
  stat2_num: '156',
  stat2_label: 'SCENES TONIGHT',
  stat3_num: '4.8',
  stat3_label: 'AVG AFTER-TALK RATING',
  featured_label: 'FEATURED TONIGHT · ONE BLIND BOX OPEN',
  footer_left: 'BUDDY BLIND · HONG KONG · 1,247 BLIND BOXES · NO BOTTOM FLYWHEEL PER V9 FEEDBACK',
  featured_title: 'Kissa Tanaka',
  featured_vibe: 'SOHO · KISSATEN · HOST CREATES ATTRACTION AND DOWNLOAD REASONS',
  featured_invite: 'CJ INVITES YOU TO JOIN A DINNER AND MEET NEW FRIENDS - NO PITCHES, JUST PRESENCE.',
  featured_desc: 'A 6-seat counter, vinyl crackle, no menus. You order by mood. Tonight is for people who collect stories, not contacts. No pitches, just presence.',
}

const DEFAULT_FEATURED:Featured = {
  id:'kissa-tanaka', title:'Kissa Tanaka', area:'SOHO', time:'TONIGHT 7:30PM', spots_left:3, host_label:'HOST: COMEDIAN · GOLD', price_label:'$$ · CREATIVE MINDS', vibe_label:'SOHO · KISSATEN · HOST CREATES ATTRACTION AND DOWNLOAD REASONS', invite_text:'CJ INVITES YOU TO JOIN A DINNER AND MEET NEW FRIENDS - NO PITCHES, JUST PRESENCE.', description_long:'A 6-seat counter, vinyl crackle, no menus. You order by mood. Tonight is for people who collect stories, not contacts. No pitches, just presence.', image_url:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'
}

export default function HomePage(){
  const { getText, getStyle } = useSiteContent(DEFAULT_CONTENT)
  const [featured,setFeatured]=useState<Featured>(DEFAULT_FEATURED)

  useEffect(()=>{
    (async()=>{
      try{
        const {data:feats} = await supabase.from('featured_events').select('*').order('created_at',{ascending:false}).limit(1)
        if(feats && feats[0]) setFeatured({...DEFAULT_FEATURED, ...feats[0]})
      }catch{}
    })()
  },[])

  return(
    <main className="bg-[#080808] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10">
        <div className="pt-8">
          <EditableText textKey="top_stats" defaultValue={getText('top_stats')} as="div" className="mono text-[10px] tracking-[0.15em] text-zinc-500" style={getStyle('top_stats')} />
          <h1 className="mt-16 text-[64px] md:text-[84px] leading-[0.85] tracking-[-0.03em]">
            <EditableText textKey="headline_1" defaultValue={getText('headline_1')} as="span" className="font-normal block text-white" style={getStyle('headline_1')} />
            <EditableText textKey="headline_2" defaultValue={getText('headline_2')} as="span" className="serif italic font-light block text-[#f5f2eb] ml-1" style={getStyle('headline_2')} />
            <EditableText textKey="headline_3" defaultValue={getText('headline_3')} as="span" className="serif italic font-light block text-[#c96a4a]" style={getStyle('headline_3')} />
          </h1>
          <div className="mt-12 text-[14px] leading-relaxed text-zinc-400 max-w-[420px]">
            <EditableText textKey="subtext_1" defaultValue={getText('subtext_1')} as="p" style={getStyle('subtext_1')} />
            <EditableText textKey="subtext_2" defaultValue={getText('subtext_2')} as="p" className="mt-1 text-zinc-300" style={getStyle('subtext_2')} />
          </div>
          <div className="mt-10 flex gap-3">
            <EditableText textKey="cta_join" defaultValue={getText('cta_join')} as="div" className="mono h-[48px] px-7 rounded-full bg-[#f5f2eb] text-black text-[11px] tracking-[0.15em] flex items-center hover:bg-white transition" style={getStyle('cta_join')}>
              <Link href="/venues" className="w-full h-full flex items-center justify-center">{getText('cta_join')}</Link>
            </EditableText>
            <EditableText textKey="cta_private" defaultValue={getText('cta_private')} as="div" className="mono h-[48px] px-7 rounded-full border border-zinc-800 text-[11px] tracking-[0.15em] flex items-center text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition" style={getStyle('cta_private')}>
              <Link href="/private-events" className="w-full h-full flex items-center justify-center">{getText('cta_private')}</Link>
            </EditableText>
          </div>
          <div className="mt-24 border-t border-zinc-900 pt-8 grid grid-cols-3 gap-8 max-w-[420px]">
            <div><EditableText textKey="stat1_num" defaultValue={getText('stat1_num')} as="div" className="serif text-[36px] text-white" style={getStyle('stat1_num')} /><EditableText textKey="stat1_label" defaultValue={getText('stat1_label')} as="div" className="mono mt-2 text-[10px] tracking-[0.1em] text-zinc-500 leading-relaxed" style={getStyle('stat1_label')} /></div>
            <div><EditableText textKey="stat2_num" defaultValue={getText('stat2_num')} as="div" className="serif text-[36px] text-white" style={getStyle('stat2_num')} /><EditableText textKey="stat2_label" defaultValue={getText('stat2_label')} as="div" className="mono mt-2 text-[10px] tracking-[0.1em] text-zinc-500" style={getStyle('stat2_label')} /></div>
            <div><EditableText textKey="stat3_num" defaultValue={getText('stat3_num')} as="div" className="serif text-[36px] text-white" style={getStyle('stat3_num')} /><EditableText textKey="stat3_label" defaultValue={getText('stat3_label')} as="div" className="mono mt-2 text-[10px] tracking-[0.1em] text-zinc-500" style={getStyle('stat3_label')} /></div>
          </div>
        </div>
        <div className="lg:pt-4">
          <EditableText textKey="featured_label" defaultValue={getText('featured_label')} as="div" className="flex items-center gap-2 mono text-[10px] tracking-[0.15em] text-zinc-500" style={getStyle('featured_label')} />
          <div className="mt-8 bg-[#121212] border border-zinc-900 rounded-[24px] relative">
            <div className="absolute -top-3 right-5 z-20 flex items-center gap-2 bg-[#f5f2eb] text-black mono text-[10px] tracking-[0.1em] px-4 py-2 rounded-full border border-black/10 shadow-xl">
              <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[9px]">C</div>
              {featured.host_label}
            </div>
            <div className="relative h-[520px] bg-zinc-900 rounded-t-[24px] overflow-hidden">
              <img src={featured.image_url} alt={featured.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-7">
              <EditableText textKey="featured_title" defaultValue={featured.title} as="h2" className="serif text-[28px] text-white" />
              <EditableText textKey="featured_vibe" defaultValue={featured.vibe_label} as="div" className="mt-2 mono text-[10px] tracking-[0.1em] text-zinc-500 leading-relaxed" />
              <EditableText textKey="featured_invite" defaultValue={featured.invite_text} as="div" className="mt-4 mono text-[11px] tracking-[0.05em] text-zinc-400 leading-relaxed" />
              <EditableText textKey="featured_desc" defaultValue={featured.description_long} as="p" className="mt-6 text-[13px] leading-relaxed text-zinc-400" />
              <div className="mt-8 flex gap-3">
                <Link href={`/join?venue=${featured.id}`} className="flex-1 mono h-[48px] rounded-full bg-[#f5f2eb] text-black text-[11px] tracking-[0.15em] flex items-center justify-center hover:bg-white transition">JOIN BLIND BOX</Link>
                <Link href="/invite" className="mono h-[48px] px-6 rounded-full border border-zinc-800 text-[11px] tracking-[0.15em] flex items-center justify-center text-zinc-300 hover:border-zinc-600 transition">INVITE</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="border-t border-zinc-900 mt-10 py-6">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
          <EditableText textKey="footer_left" defaultValue={getText('footer_left')} as="div" className="mono text-[10px] tracking-[0.1em] text-zinc-600" style={getStyle('footer_left')} />
          <div className="flex gap-6 mono text-[10px] tracking-[0.1em] text-zinc-600"><Link href="/how-it-works" className="hover:text-zinc-300">How it works</Link><Link href="/premium" className="hover:text-zinc-300">Premium</Link></div>
        </div>
      </footer>
    </main>
  )
}
