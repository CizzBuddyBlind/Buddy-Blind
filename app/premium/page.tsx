
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSiteContent } from '@/lib/useSiteContent'
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
  const [msg,setMsg]=useState('')

  useEffect(()=>{
    const saved = localStorage.getItem('bb_plan') || 'free'
    setCurrentPlan(saved)
  },[])

  const handleUpgrade = async (plan:'free'|'lite'|'premium') => {
    if(plan===currentPlan){
      setMsg('Already on this plan')
      setTimeout(()=>setMsg(''),2000)
      return
    }
    // Bible: upgrade/change subscription - save to Supabase profiles if exists, else localStorage
    try{
      const {data:{user}} = await supabase.auth.getUser()
      if(user){
        await supabase.from('profiles').upsert({id:user.id, subscription:plan},{onConflict:'id'})
      }
    }catch{}
    localStorage.setItem('bb_plan', plan)
    setCurrentPlan(plan)
    setMsg(`Upgraded to ${plan.toUpperCase()}!`)
    setTimeout(()=>setMsg(''),3000)
    if(plan==='premium'){
      // Per Bible: 90 days trial
      alert('Welcome to Premium! 90 days trial started. You can now create Private Events up to 20 people.')
    }
  }

  return(
    <main className="bg-[#080808] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-20">
        <div className="mono text-[11px] tracking-[0.15em] text-[#c96a4a]" style={getStyle('premium_label')}>{getText('premium_label')}</div>
        <h1 className="serif mt-6 text-[56px] md:text-[72px] leading-[0.9] tracking-[-0.02em] text-white max-w-[700px]">
          <span style={getStyle('premium_headline_1')}>{getText('premium_headline_1')}</span><br/>
          <span style={getStyle('premium_headline_2')}>{getText('premium_headline_2')}</span>
        </h1>
        <p className="mt-6 text-[16px] leading-relaxed text-zinc-400 max-w-[600px]" style={getStyle('premium_sub')}>{getText('premium_sub')}</p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 border border-zinc-900 rounded-[20px] overflow-hidden bg-[#0f0f0f]">
          {/* Free */}
          <div className="p-8 border-b md:border-b-0 md:border-r border-zinc-900">
            <div className="flex justify-between items-start">
              <h3 className="serif text-[28px] text-white" style={getStyle('free_title')}>{getText('free_title')}</h3>
              <span className="mono text-[11px] tracking-[0.1em] text-zinc-600" style={getStyle('free_tag')}>{getText('free_tag')}</span>
            </div>
            <div className="mt-6 serif text-[48px] text-white" style={getStyle('free_price')}>{getText('free_price')}</div>
            <div className="mt-8 space-y-3 mono text-[12px] tracking-[0.05em] text-zinc-400">
              <div className="flex gap-2"><span className="text-zinc-600">—</span><span style={getStyle('free_f1')}>{getText('free_f1')}</span></div>
              <div className="flex gap-2"><span className="text-zinc-600">—</span><span style={getStyle('free_f2')}>{getText('free_f2')}</span></div>
              <div className="flex gap-2"><span className="text-zinc-600">—</span><span style={getStyle('free_f3')}>{getText('free_f3')}</span></div>
            </div>
            <button onClick={()=>handleUpgrade('free')} className={`mt-10 w-full h-12 rounded-full mono text-[11px] tracking-[0.15em] transition ${currentPlan==='free'?'bg-[#f5f2eb] text-black':'border border-zinc-800 text-zinc-400 hover:border-zinc-600'}`} style={getStyle('free_btn')}>{currentPlan==='free'?'CURRENT':getText('free_btn')}</button>
          </div>

          {/* Lite */}
          <div className="p-8 border-b md:border-b-0 md:border-r border-zinc-900 bg-[#111]">
            <div className="flex justify-between items-start">
              <h3 className="serif text-[28px] text-white" style={getStyle('lite_title')}>{getText('lite_title')}</h3>
              <span className="mono text-[11px] tracking-[0.1em] text-zinc-600" style={getStyle('lite_tag')}>{getText('lite_tag')}</span>
            </div>
            <div className="mt-6 serif text-[48px] text-white" style={getStyle('lite_price')}>{getText('lite_price')}</div>
            <div className="mt-8 space-y-3 mono text-[12px] tracking-[0.05em] text-zinc-400">
              <div className="flex gap-2"><span className="text-zinc-600">—</span><span style={getStyle('lite_f1')}>{getText('lite_f1')}</span></div>
              <div className="flex gap-2"><span className="text-zinc-600">—</span><span style={getStyle('lite_f2')}>{getText('lite_f2')}</span></div>
              <div className="flex gap-2"><span className="text-zinc-600">—</span><span style={getStyle('lite_f3')}>{getText('lite_f3')}</span></div>
            </div>
            <button onClick={()=>handleUpgrade('lite')} className={`mt-10 w-full h-12 rounded-full mono text-[11px] tracking-[0.15em] transition ${currentPlan==='lite'?'bg-[#f5f2eb] text-black':'bg-[#f5f2eb] text-black hover:bg-white'}`} style={getStyle('lite_btn')}>{currentPlan==='lite'?'CURRENT PLAN':getText('lite_btn')}</button>
          </div>

          {/* Premium - white card */}
          <div className="p-8 bg-[#f5f2eb] text-black rounded-b-[20px] md:rounded-bl-none md:rounded-r-[20px]">
            <div className="flex justify-between items-start">
              <h3 className="serif text-[28px] text-black" style={getStyle('pro_title')}>{getText('pro_title')}</h3>
              <span className="mono text-[11px] tracking-[0.1em] text-zinc-600 max-w-[140px] text-right" style={getStyle('pro_tag')}>{getText('pro_tag')}</span>
            </div>
            <div className="mt-6 serif text-[48px] text-black" style={getStyle('pro_price')}>{getText('pro_price')}</div>
            <div className="mt-8 space-y-3 mono text-[12px] tracking-[0.05em] text-zinc-700">
              <div className="flex gap-2"><span className="text-zinc-400">—</span><span style={getStyle('pro_f1')}>{getText('pro_f1')}</span></div>
              <div className="flex gap-2"><span className="text-zinc-400">—</span><span style={getStyle('pro_f2')}>{getText('pro_f2')}</span></div>
              <div className="flex gap-2"><span className="text-zinc-400">—</span><span style={getStyle('pro_f3')}>{getText('pro_f3')}</span></div>
              <div className="flex gap-2"><span className="text-zinc-400">—</span><span style={getStyle('pro_f4')}>{getText('pro_f4')}</span></div>
              <div className="flex gap-2"><span className="text-zinc-400">—</span><span style={getStyle('pro_f5')}>{getText('pro_f5')}</span></div>
            </div>
            <button onClick={()=>handleUpgrade('premium')} className="mt-10 w-full h-12 rounded-full bg-black text-white mono text-[11px] tracking-[0.15em] hover:bg-zinc-900 transition" style={getStyle('pro_btn')}>{currentPlan==='premium'?'CURRENT PLAN':getText('pro_btn')}</button>
            <div className="mt-4 mono text-[10px] tracking-[0.05em] text-zinc-500 leading-relaxed text-center" style={getStyle('pro_foot')}>{getText('pro_foot')}</div>
          </div>
        </div>

        {msg && <div className="mt-6 mx-auto max-w-[400px] mono text-[11px] tracking-[0.1em] bg-[#c96a4a] text-white px-4 py-2 rounded-full text-center">{msg}</div>}

        <div className="mt-12 text-center mono text-[11px] tracking-[0.15em] text-zinc-600" style={getStyle('bottom_text')}>{getText('bottom_text')}</div>

        <div className="mt-12 border-t border-zinc-900 pt-6 flex justify-between mono text-[10px] tracking-[0.1em] text-zinc-700">
          <span>BUDDY BLIND · HONG KONG · 1,247 BLIND BOXES</span>
          <div className="flex gap-4"><Link href="/how-it-works" className="hover:text-zinc-500">How it works</Link><Link href="/premium" className="hover:text-zinc-500">Premium</Link></div>
        </div>
      </div>
    </main>
  )
}
