
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSiteContent } from '@/lib/useSiteContent'
import { EditableText } from '@/components/EditableText'
import Link from 'next/link'

const DEFAULT:Record<string,string> = {
  premium_label: 'PREMIUM · MORE HEART, MORE REASONS',
  premium_headline_1: 'Why Premium',
  premium_headline_2: 'unlocks Private up to 20.',
  premium_sub: 'Create your own vibe: Industry dinners, wine circles, 50+ social afternoons, hiking buddies. Host creates attraction and download reasons — people join for the reason, stay for the people.',
  free_title: 'Free',
  free_tag: 'TRY ONCE',
  free_price: 'HK$0',
  free_f1: '1 BLIND BOX / MONTH',
  free_f2: 'VENUES ONLY',
  free_f3: 'NO PRIVATE CREATION',
  free_btn: 'CURRENT',
  lite_title: 'Lite',
  lite_tag: 'PER MONTH',
  lite_price: 'HK$10',
  lite_f1: '5 BLIND BOXES / MONTH',
  lite_f2: 'JOIN PRIVATE EVENTS',
  lite_f3: 'CREATE QUICK MEET',
  lite_btn: 'UPGRADE TO LITE',
  pro_title: 'Premium',
  pro_tag: 'PER MONTH · 90 DAYS TRIAL',
  pro_price: 'HK$50',
  pro_f1: 'UNLIMITED BLIND BOXES',
  pro_f2: 'CREATE PRIVATE UP TO 20',
  pro_f3: 'INDUSTRY / WINE / 50+ SOCIAL / HIKE',
  pro_f4: 'HOST BADGE GOLD',
  pro_f5: 'HK$5 ADMIN FEE PER EVENT',
  pro_btn: 'GO PREMIUM',
  pro_foot: '90 DAYS TRIAL · CANCEL ANYTIME · HK$5 ADMIN FEE PER CONFIRMED JOIN',
  bottom_text: 'NO META WORDING · JUST HUMAN REASONS TO MEET.'
}

export default function PremiumPage(){
  const { getText, getStyle } = useSiteContent(DEFAULT)
  const [currentPlan,setCurrentPlan]=useState('free')
  useEffect(()=>{setCurrentPlan(localStorage.getItem('bb_plan')||'free')},[])
  const handleUpgrade = async (plan:'free'|'lite'|'premium') => {
    localStorage.setItem('bb_plan', plan)
    setCurrentPlan(plan)
  }

  return(
    <main className="bg-[#080808] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-20">
        <EditableText textKey="premium_label" defaultValue={getText('premium_label')} as="div" className="mono text-[11px] tracking-[0.15em] text-[#c96a4a]" style={getStyle('premium_label')} />
        <h1 className="serif mt-6 text-[56px] md:text-[72px] leading-[0.9] tracking-[-0.02em] text-white max-w-[700px]">
          <EditableText textKey="premium_headline_1" defaultValue={getText('premium_headline_1')} as="span" style={getStyle('premium_headline_1')} />
          <br/>
          <EditableText textKey="premium_headline_2" defaultValue={getText('premium_headline_2')} as="span" style={getStyle('premium_headline_2')} />
        </h1>
        <EditableText textKey="premium_sub" defaultValue={getText('premium_sub')} as="p" className="mt-6 text-[16px] leading-relaxed text-zinc-400 max-w-[600px]" style={getStyle('premium_sub')} />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 border border-zinc-900 rounded-[20px] overflow-hidden bg-[#0f0f0f]">
          <div className="p-8 border-b md:border-b-0 md:border-r border-zinc-900">
            <div className="flex justify-between">
              <EditableText textKey="free_title" defaultValue={getText('free_title')} as="h3" className="serif text-[28px] text-white" style={getStyle('free_title')} />
              <EditableText textKey="free_tag" defaultValue={getText('free_tag')} as="span" className="mono text-[11px] tracking-[0.1em] text-zinc-600" style={getStyle('free_tag')} />
            </div>
            <EditableText textKey="free_price" defaultValue={getText('free_price')} as="div" className="mt-6 serif text-[48px] text-white" style={getStyle('free_price')} />
            <div className="mt-8 space-y-3 mono text-[12px] tracking-[0.05em] text-zinc-400">
              <EditableText textKey="free_f1" defaultValue={getText('free_f1')} as="div" style={getStyle('free_f1')} />
              <EditableText textKey="free_f2" defaultValue={getText('free_f2')} as="div" style={getStyle('free_f2')} />
              <EditableText textKey="free_f3" defaultValue={getText('free_f3')} as="div" style={getStyle('free_f3')} />
            </div>
            <button onClick={()=>handleUpgrade('free')} className="mt-10 w-full h-12 rounded-full mono text-[11px] tracking-[0.15em] bg-[#f5f2eb] text-black">{currentPlan==='free'?'CURRENT':getText('free_btn')}</button>
          </div>

          <div className="p-8 border-b md:border-b-0 md:border-r border-zinc-900 bg-[#111]">
            <div className="flex justify-between">
              <EditableText textKey="lite_title" defaultValue={getText('lite_title')} as="h3" className="serif text-[28px] text-white" style={getStyle('lite_title')} />
              <EditableText textKey="lite_tag" defaultValue={getText('lite_tag')} as="span" className="mono text-[11px] tracking-[0.1em] text-zinc-600" style={getStyle('lite_tag')} />
            </div>
            <EditableText textKey="lite_price" defaultValue={getText('lite_price')} as="div" className="mt-6 serif text-[48px] text-white" style={getStyle('lite_price')} />
            <div className="mt-8 space-y-3 mono text-[12px] tracking-[0.05em] text-zinc-400">
              <EditableText textKey="lite_f1" defaultValue={getText('lite_f1')} as="div" style={getStyle('lite_f1')} />
              <EditableText textKey="lite_f2" defaultValue={getText('lite_f2')} as="div" style={getStyle('lite_f2')} />
              <EditableText textKey="lite_f3" defaultValue={getText('lite_f3')} as="div" style={getStyle('lite_f3')} />
            </div>
            <button onClick={()=>handleUpgrade('lite')} className="mt-10 w-full h-12 rounded-full mono text-[11px] tracking-[0.15em] bg-[#f5f2eb] text-black">{currentPlan==='lite'?'CURRENT PLAN':getText('lite_btn')}</button>
          </div>

          <div className="p-8 bg-[#f5f2eb] text-black rounded-b-[20px] md:rounded-bl-none md:rounded-r-[20px]">
            <div className="flex justify-between">
              <EditableText textKey="pro_title" defaultValue={getText('pro_title')} as="h3" className="serif text-[28px] text-black" style={getStyle('pro_title')} />
              <EditableText textKey="pro_tag" defaultValue={getText('pro_tag')} as="span" className="mono text-[11px] tracking-[0.1em] text-zinc-600 max-w-[140px] text-right" style={getStyle('pro_tag')} />
            </div>
            <EditableText textKey="pro_price" defaultValue={getText('pro_price')} as="div" className="mt-6 serif text-[48px] text-black" style={getStyle('pro_price')} />
            <div className="mt-8 space-y-3 mono text-[12px] tracking-[0.05em] text-zinc-700">
              <EditableText textKey="pro_f1" defaultValue={getText('pro_f1')} as="div" style={getStyle('pro_f1')} />
              <EditableText textKey="pro_f2" defaultValue={getText('pro_f2')} as="div" style={getStyle('pro_f2')} />
              <EditableText textKey="pro_f3" defaultValue={getText('pro_f3')} as="div" style={getStyle('pro_f3')} />
              <EditableText textKey="pro_f4" defaultValue={getText('pro_f4')} as="div" style={getStyle('pro_f4')} />
              <EditableText textKey="pro_f5" defaultValue={getText('pro_f5')} as="div" style={getStyle('pro_f5')} />
            </div>
            <button onClick={()=>handleUpgrade('premium')} className="mt-10 w-full h-12 rounded-full bg-black text-white mono text-[11px] tracking-[0.15em]">{currentPlan==='premium'?'CURRENT PLAN':getText('pro_btn')}</button>
            <EditableText textKey="pro_foot" defaultValue={getText('pro_foot')} as="div" className="mt-4 mono text-[10px] tracking-[0.05em] text-zinc-500 leading-relaxed text-center" style={getStyle('pro_foot')} />
          </div>
        </div>

        <EditableText textKey="bottom_text" defaultValue={getText('bottom_text')} as="div" className="mt-12 text-center mono text-[11px] tracking-[0.15em] text-zinc-600" style={getStyle('bottom_text')} />
      </div>
    </main>
  )
}
