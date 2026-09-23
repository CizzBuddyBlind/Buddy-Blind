
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Content = Record<string,string>

const DEFAULT: Content = {
  label: 'HOW IT WORKS · NO META WORDING',
  headline_1: 'See venue,',
  headline_2: 'see vibe, join.',
  step1_num: '01',
  step1_title: 'See venue / private event',
  step1_desc: 'Photo is the filter. If you like the light, you\'ll like the people.',
  step2_num: '02',
  step2_title: 'See neighborhood / vibe / time / places left',
  step2_desc: 'Soho tonight? Central tomorrow? How many seats left — real numbers.',
  step3_num: '03',
  step3_title: 'Join',
  step3_desc: 'One tap. HK$5 admin only after confirmation. No pre-pay anxiety.',
  step4_num: '04',
  step4_title: 'Meet',
  step4_desc: 'No names before. No photos before. Just show up. Restaurants provide the scene.',
  step5_num: '05',
  step5_title: 'Rate & Comment',
  step5_desc: '4.5 stars isn\'t about looks. Easy to talk to, keeps conversation going.',
  step6_num: '06',
  step6_title: 'Add as buddy — Hey! You are my vibe, let\'s be buddies!',
  step6_desc: 'One-click after. If both say yes, you\'re buddies. 24 and counting.',
  step7_num: '07',
  step7_title: 'Create your own',
  step7_desc: 'Premium unlocks private up to 20. Wine, industry, 50+ social, hike — host creates attraction and download reasons.',
  cta_join: 'JOIN A BLIND DINNER ->',
  cta_private: 'PRIVATE EVENTS'
}

export default function HowItWorksPage(){
  const [content,setContent]=useState<Content>(DEFAULT)

  useEffect(()=>{
    (async()=>{
      try{
        const {data} = await supabase.from('site_content').select('*')
        if(data && data.length>0){
          const map = {...DEFAULT}
          data.forEach((r:any)=>{
            if(r.key.startsWith('how_')){
              const shortKey = r.key.replace('how_','')
              if(shortKey in map) map[shortKey]=r.value
            }
          })
          // Also load exact keys
          data.forEach((r:any)=>{
            if(r.key in map) map[r.key]=r.value
          })
          setContent(map)
        }
      }catch{}
    })()
  },[])

  const steps = [
    {num: content.step1_num, title: content.step1_title, desc: content.step1_desc},
    {num: content.step2_num, title: content.step2_title, desc: content.step2_desc},
    {num: content.step3_num, title: content.step3_title, desc: content.step3_desc},
    {num: content.step4_num, title: content.step4_title, desc: content.step4_desc},
    {num: content.step5_num, title: content.step5_title, desc: content.step5_desc},
    {num: content.step6_num, title: content.step6_title, desc: content.step6_desc},
    {num: content.step7_num, title: content.step7_title, desc: content.step7_desc},
  ]

  return(
    <main className="bg-[#080808] min-h-screen">
      <div className="max-w-[800px] mx-auto px-6 pt-16 pb-20">
        <div className="mono text-[11px] tracking-[0.15em] text-[#c96a4a]">{content.label}</div>
        <h1 className="serif mt-6 text-[64px] md:text-[84px] leading-[0.85] tracking-[-0.02em] text-white">
          {content.headline_1}<br/>{content.headline_2}
        </h1>

        <div className="mt-16 bg-[#0f0f0f] border border-zinc-900 rounded-[20px] overflow-hidden">
          {steps.map((s,i)=>(
            <div key={i} className="grid grid-cols-[60px_1fr] md:grid-cols-[80px_1fr] gap-4 px-6 md:px-10 py-8 border-b border-zinc-900 last:border-b-0 hover:bg-[#111] transition">
              <div className="mono text-[12px] text-zinc-700 pt-1">{s.num}</div>
              <div>
                <h3 className="serif text-[22px] md:text-[26px] leading-tight text-white">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-zinc-500 max-w-[560px]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex gap-3 justify-center">
          <Link href="/venues" className="mono h-12 px-8 rounded-full bg-[#f5f2eb] text-black text-[11px] tracking-[0.15em] flex items-center hover:bg-white transition">{content.cta_join}</Link>
          <Link href="/private-events" className="mono h-12 px-8 rounded-full border border-zinc-800 text-[11px] tracking-[0.15em] flex items-center text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition">{content.cta_private}</Link>
        </div>
      </div>
    </main>
  )
}
