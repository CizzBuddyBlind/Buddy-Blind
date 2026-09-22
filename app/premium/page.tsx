
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSiteContent } from '@/lib/useSiteContent'
import { EditableText } from '@/components/EditableText'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'

type Tier = {
  id:string,
  title:string,
  tag:string,
  price:string,
  features:string[],
  btn:string,
  foot?:string
}

const DEFAULT:Record<string,string> = {
  premium_label: 'PREMIUM · MORE HEART, MORE REASONS',
  premium_headline_1: 'Why Premium',
  premium_headline_2: 'unlocks Private up to 20.',
  premium_sub: 'Create your own vibe: Industry dinners, wine circles, 50+ social afternoons, hiking buddies. Host creates attraction and download reasons — people join for the reason, stay for the people.',
  bottom_text: 'NO META WORDING · JUST HUMAN REASONS TO MEET.'
}

const DEFAULT_TIERS:Tier[] = [
  {
    id:'free',
    title:'Free',
    tag:'TRY ONCE',
    price:'HK$0',
    features:['Invite and Join','VENUES ONLY','NO PRIVATE CREATION'],
    btn:'CURRENT',
    foot:''
  },
  {
    id:'lite',
    title:'Lite',
    tag:'PER MONTH',
    price:'HK$10',
    features:['Invite and Join','Unlock Comment & Rating features','Build Reputation and See Other'],
    btn:'UPGRADE TO LITE',
    foot:''
  },
  {
    id:'premium',
    title:'Premium',
    tag:'PER MONTH · 90 DAYS TRIAL',
    price:'HK$50',
    features:['UNLOCK PRIVATE EVENT','CREATE PRIVATE EVENT UP TO 20pp','SHARE INTEREST / NETWORKING / WHATEVER YOU LIKE','HOST TO EARN MORE POINT','HK$5 ADMIN FEE PER EVENT'],
    btn:'GO PREMIUM',
    foot:'90 DAYS TRIAL · CANCEL ANYTIME · HK$5 ADMIN FEE PER CONFIRMED JOIN'
  }
]

export default function PremiumPage(){
  const { getText, getStyle } = useSiteContent(DEFAULT)
  const { isAdmin, saveDraft, publishDraft } = useAuth()
  const [currentPlan,setCurrentPlan]=useState('free')
  const [tiers,setTiers]=useState<Tier[]>(DEFAULT_TIERS)

  useEffect(()=>{
    setCurrentPlan(localStorage.getItem('bb_plan')||'free')
    const draftStr = localStorage.getItem('bb_draft')
    if(draftStr){
      try{
        const draft = JSON.parse(draftStr)
        if(draft.premiumTiers) setTiers(draft.premiumTiers)
      }catch{}
    }
  },[])

  const persist = (newTiers:Tier[]) => {
    setTiers(newTiers)
    if(isAdmin){
      const existing = JSON.parse(localStorage.getItem('bb_draft')||'{}')
      localStorage.setItem('bb_draft', JSON.stringify({...existing, premiumTiers:newTiers}))
    }
  }

  const handleUpgrade = async (plan:string) => {
    localStorage.setItem('bb_plan', plan)
    setCurrentPlan(plan)
  }

  const handleAddTextBox = (tierId:string) => {
    const text = prompt('Enter new feature text (e.g. UNLOCK NEW FEATURE)')
    if(!text) return
    const newTiers = tiers.map(t=> t.id===tierId ? {...t, features:[...t.features, text]} : t)
    persist(newTiers)
  }

  const handleEditFeature = (tierId:string, idx:number) => {
    const tier = tiers.find(t=>t.id===tierId)
    if(!tier) return
    const newText = prompt('Edit feature text', tier.features[idx])
    if(newText===null) return
    const newTiers = tiers.map(t=> t.id===tierId ? {...t, features: t.features.map((f,i)=> i===idx ? newText : f)} : t)
    persist(newTiers)
  }

  const handleDeleteFeature = (tierId:string, idx:number) => {
    if(!confirm('Delete this text box?')) return
    const newTiers = tiers.map(t=> t.id===tierId ? {...t, features: t.features.filter((_,i)=>i!==idx)} : t)
    persist(newTiers)
  }

  const handleAddTier = () => {
    const name = prompt('New tier name (e.g. Pro Max)') || 'New Tier'
    const price = prompt('Price (e.g. HK$100)') || 'HK$100'
    const newTier:Tier = {id:`tier-${Date.now()}`, title:name, tag:'PER MONTH', price, features:['New feature - click to edit'], btn:'UPGRADE', foot:''}
    persist([...tiers, newTier])
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

        {isAdmin && (
          <div className="mt-6 bg-[#0f0f0f] border border-[#C45A3C] rounded-xl p-3 mono text-[11px] text-white flex flex-wrap justify-between items-center gap-2">
            <span>ADMIN: Buttons now aligned same line. Click any text to edit font/colour/size/bold. + Add text box to any tier. All boxes moveable.</span>
            <div className="flex gap-2">
              <button onClick={handleAddTier} className="bg-white text-black px-4 py-1.5 rounded-full">+ ADD TIER BOX</button>
              <button onClick={()=>{const d=JSON.parse(localStorage.getItem('bb_draft')||'{}'); saveDraft(d); alert('Draft saved!')}} className="bg-zinc-800 text-white px-4 py-1.5 rounded-full border border-zinc-700">SAVE DRAFT</button>
              <button onClick={()=>publishDraft()} className="bg-[#C45A3C] text-white px-4 py-1.5 rounded-full">PUBLISH</button>
            </div>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 border border-zinc-900 rounded-[20px] overflow-hidden bg-[#0f0f0f] items-stretch">
          {tiers.map(tier=>{
            const isPremium = tier.id==='premium'
            return(
              <div key={tier.id} className={`p-8 flex flex-col ${!isPremium ? 'border-b md:border-b-0 md:border-r border-zinc-900' : ''} ${isPremium ? 'bg-[#f5f2eb] text-black rounded-b-[20px] md:rounded-bl-none md:rounded-r-[20px]' : 'bg-[#0f0f0f] md:bg-[#111]'} relative`}>
                {isAdmin && (
                  <div className="absolute -top-2 left-2 flex gap-1">
                    <button onClick={()=>handleAddTextBox(tier.id)} className="mono text-[9px] bg-[#C45A3C] text-white px-2 py-1 rounded-full">+ ADD TEXT BOX</button>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <EditableText textKey={`premium_${tier.id}_title`} defaultValue={tier.title} as="h3" className={`serif text-[28px] ${isPremium?'text-black':'text-white'}`} />
                  <EditableText textKey={`premium_${tier.id}_tag`} defaultValue={tier.tag} as="span" className="mono text-[11px] tracking-[0.1em] text-zinc-600 max-w-[140px] text-right" />
                </div>
                <EditableText textKey={`premium_${tier.id}_price`} defaultValue={tier.price} as="div" className={`mt-6 serif text-[48px] ${isPremium?'text-black':'text-white'}`} />

                <div className="mt-8 space-y-3 mono text-[12px] tracking-[0.05em] flex-1">
                  {tier.features.map((f,i)=>(
                    <div key={i} className="group relative flex gap-2 items-start">
                      <span className={isPremium?'text-zinc-400':'text-zinc-600'}>—</span>
                      <EditableText textKey={`premium_${tier.id}_f${i}`} defaultValue={f} as="span" className={`flex-1 leading-relaxed ${isPremium?'text-zinc-700':'text-zinc-400'}`} />
                      {isAdmin && (
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1 ml-2">
                          <button onClick={()=>handleEditFeature(tier.id,i)} className="w-5 h-5 bg-black text-white rounded-full text-[8px]">✎</button>
                          <button onClick={()=>handleDeleteFeature(tier.id,i)} className="w-5 h-5 bg-red-600 text-white rounded-full text-[8px]">×</button>
                        </div>
                      )}
                    </div>
                  ))}
                  {isAdmin && (
                    <button onClick={()=>handleAddTextBox(tier.id)} className="mt-2 mono text-[10px] border border-dashed border-zinc-700 px-3 py-1.5 rounded-full text-zinc-500 hover:border-zinc-500">+ ADD TEXT BOX HERE</button>
                  )}
                </div>

                <div className="mt-10">
                  <button onClick={()=>handleUpgrade(tier.id)} className={`w-full h-12 rounded-full mono text-[11px] tracking-[0.15em] transition ${isPremium ? 'bg-black text-white hover:bg-zinc-900' : 'bg-[#f5f2eb] text-black hover:bg-white'} ${currentPlan===tier.id ? 'ring-2 ring-[#C45A3C]' : ''}`}>
                    {currentPlan===tier.id ? (tier.id==='free'?'CURRENT':'CURRENT PLAN') : tier.btn}
                  </button>
                  {tier.foot && (
                    <EditableText textKey={`premium_${tier.id}_foot`} defaultValue={tier.foot} as="div" className="mt-4 mono text-[10px] tracking-[0.05em] text-zinc-500 leading-relaxed text-center" />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <EditableText textKey="bottom_text" defaultValue={getText('bottom_text')} as="div" className="mt-12 text-center mono text-[11px] tracking-[0.15em] text-zinc-600" style={getStyle('bottom_text')} />
      </div>
    </main>
  )
}
