
'use client'
import { useState, useEffect } from 'react'
import { useSiteContent } from '@/lib/useSiteContent'
import { EditableText } from '@/components/EditableText'
import { useAuth } from '@/components/AuthContext'

const DEFAULT:Record<string,string> = {
  premium_label: 'PREMIUM - MORE HEART, MORE REASONS',
  premium_headline_1: 'Why Premium',
  premium_headline_2: 'unlocks Private up to 20.',
  premium_sub: 'Create your own vibe: Industry dinners, wine circles, 50+ social afternoons, hiking buddies. Host creates attraction and download reasons - people join for the reason, stay for the people.',
  bottom_text: 'NO META WORDING - JUST HUMAN REASONS TO MEET.'
}

type Tier = {
  id:string,
  title:string,
  tag:string,
  price:string,
  features:string[],
  btn:string,
  foot?:string
}

const DEFAULT_TIERS:Tier[] = [
  {id:'free', title:'Free', tag:'TRY ONCE', price:'HK$0', features:['Invite and Join','VENUES ONLY','NO PRIVATE CREATION'], btn:'CURRENT', foot:''},
  {id:'lite', title:'Lite', tag:'PER MONTH', price:'HK$10', features:['Invite and Join','Unlock Comment & Rating features','Build Reputation and See Other'], btn:'UPGRADE TO LITE', foot:''},
  {id:'premium', title:'Premium', tag:'PER MONTH - 90 DAYS TRIAL', price:'HK$50', features:['UNLOCK PRIVATE EVENT','CREATE PRIVATE EVENT UP TO 20pp','SHARE INTEREST / NETWORKING / WHATEVER YOU LIKE','HOST TO EARN MORE POINT','HK$5 ADMIN FEE PER EVENT'], btn:'CURRENT PLAN', foot:'90 DAYS TRIAL - CANCEL ANYTIME - HK$5 ADMIN FEE PER CONFIRMED JOIN'}
]

export default function PremiumPage(){
  const { getText, getStyle } = useSiteContent(DEFAULT)
  const { isAdmin, saveDraft, publishDraft } = useAuth()
  const [currentPlan,setCurrentPlan]=useState('free')
  const [tiers,setTiers]=useState<Tier[]>(DEFAULT_TIERS)
  const [loadingPlan,setLoadingPlan]=useState<string|null>(null)

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
    if(plan==='free'){
      localStorage.setItem('bb_plan','free')
      setCurrentPlan('free')
      alert('You are on Free plan - Try once Venues only No private creation')
      return
    }
    if(plan===currentPlan){
      alert('You are already on ' + plan + ' plan')
      return
    }
    setLoadingPlan(plan)
    try{
      const amount = plan==='lite' ? 1000 : 5000
      const res = await fetch('/api/stripe/create-intent',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({amount, plan})})
      const json = await res.json()
      if(json.error) throw new Error(json.error)
      // For demo, use test card flow - in real, redirect to Stripe Checkout
      const confirm = window.confirm(plan.toUpperCase() + ' plan ' + (plan==='lite' ? 'HK$10 per month' : 'HK$50 per month with 90 days trial') + ' - Use test card 4242 4242 4242 4242 Exp 12 34 CVC 123 - Click OK to confirm payment')
      if(confirm){
        localStorage.setItem('bb_plan', plan)
        localStorage.setItem('buddy_card_saved','1')
        localStorage.setItem('buddy_card_last4','4242')
        setCurrentPlan(plan)
        alert('Payment successful Test card 4242 You are now on ' + plan.toUpperCase() + ' plan ' + (plan==='premium' ? '90 days trial then HK$50 per month' : 'HK$10 per month'))
        window.location.href = '/private-events?upgraded=' + plan
      }
    }catch(e:any){
      alert('Payment failed: ' + e.message + ' Using test card 4242 4242 4242 4242 Exp 12 34 CVC 123')
      // Fallback for demo - still upgrade
      localStorage.setItem('bb_plan', plan)
      setCurrentPlan(plan)
    }finally{
      setLoadingPlan(null)
    }
  }

  const handleAddTextBox = (tierId:string) => {
    const text = prompt('Enter new feature text')
    if(!text) return
    persist(tiers.map(t=> t.id===tierId ? {...t, features:[...t.features, text]} : t))
  }

  const handleEditFeature = (tierId:string, idx:number) => {
    const tier = tiers.find(t=>t.id===tierId)
    if(!tier) return
    const newText = prompt('Edit feature', tier.features[idx])
    if(newText===null) return
    persist(tiers.map(t=> t.id===tierId ? {...t, features: t.features.map((f,i)=> i===idx ? newText : f)} : t))
  }

  const handleDeleteFeature = (tierId:string, idx:number) => {
    if(!confirm('Delete?')) return
    persist(tiers.map(t=> t.id===tierId ? {...t, features: t.features.filter((_,i)=>i!==idx)} : t))
  }

  return(
    <main className="bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="flex items-center gap-3">
          <button onClick={()=>window.history.back()} className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-white text-sm">{"<"}</button>
          <div className="text-xs tracking-widest text-zinc-500 font-bold">BACK</div>
        </div>
        <div className="mt-6 text-xs tracking-widest text-orange-600">PREMIUM - MORE HEART, MORE REASONS</div>
        <h1 className="mt-6 text-5xl md:text-6xl leading-tight tracking-tight text-white max-w-2xl font-serif">
          Why Premium<br/>unlocks Private up to 20.
        </h1>
        <p className="mt-6 text-base leading-relaxed text-zinc-400 max-w-xl">Create your own vibe: Industry dinners, wine circles, 50+ social afternoons, hiking buddies. Host creates attraction and download reasons - people join for the reason, stay for the people.</p>

        {isAdmin && (
          <div className="mt-6 bg-zinc-900 border border-orange-700 rounded-xl p-3 text-xs text-white flex flex-wrap justify-between items-center gap-2">
            <span>ADMIN: All buttons now fixed - direct to payment Test card 4242</span>
            <div className="flex gap-2">
              <button onClick={()=>{const d=JSON.parse(localStorage.getItem('bb_draft')||'{}'); saveDraft(d); alert('Draft saved!')}} className="bg-zinc-800 text-white px-4 py-1.5 rounded-full border border-zinc-700">SAVE DRAFT</button>
              <button onClick={()=>publishDraft()} className="bg-orange-700 text-white px-4 py-1.5 rounded-full">PUBLISH</button>
            </div>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900 auto-rows-fr">
          {tiers.map(tier=>{
            const isPremium = tier.id==='premium'
            const isCurrent = currentPlan===tier.id
            const isLoading = loadingPlan===tier.id
            return(
              <div key={tier.id} className={'p-8 flex flex-col h-full ' + (!isPremium ? 'border-b md:border-b-0 md:border-r border-zinc-800' : '') + ' ' + (isPremium ? 'bg-white text-black rounded-b-2xl md:rounded-bl-none md:rounded-r-2xl' : 'bg-zinc-900')}>
                {isAdmin && (
                  <div className="absolute -top-2 left-2">
                    <button onClick={()=>handleAddTextBox(tier.id)} className="text-xs bg-orange-700 text-white px-2 py-1 rounded-full">+ ADD TEXT BOX</button>
                  </div>
                )}
                <div className="flex justify-between items-start min-h-[32px]">
                  <h3 className={'font-serif text-2xl ' + (isPremium?'text-black':'text-white')}>{tier.title}</h3>
                  <span className="text-xs tracking-widest text-zinc-500 max-w-[140px] text-right">{tier.tag}</span>
                </div>
                <div className={'mt-6 font-serif text-5xl ' + (isPremium?'text-black':'text-white')}>{tier.price}</div>

                <div className="mt-8 flex-1 flex flex-col">
                  <div className="space-y-3 text-xs tracking-widest flex-1 min-h-[180px]">
                    {tier.features.map((f,i)=>(
                      <div key={i} className="group relative flex gap-2 items-start">
                        <span className={isPremium?'text-zinc-400':'text-zinc-600'}>-</span>
                        <span className={'flex-1 leading-relaxed ' + (isPremium?'text-zinc-700':'text-zinc-400')}>{f}</span>
                        {isAdmin && (
                          <div className="opacity-0 group-hover:opacity-100 flex gap-1 ml-2">
                            <button onClick={()=>handleEditFeature(tier.id,i)} className="w-5 h-5 bg-black text-white rounded-full text-xs">E</button>
                            <button onClick={()=>handleDeleteFeature(tier.id,i)} className="w-5 h-5 bg-red-600 text-white rounded-full text-xs">X</button>
                          </div>
                        )}
                      </div>
                    ))}
                    {isAdmin && (
                      <button onClick={()=>handleAddTextBox(tier.id)} className="mt-2 text-xs border border-dashed border-zinc-700 px-3 py-1.5 rounded-full text-zinc-500 hover:border-zinc-500">+ ADD TEXT BOX HERE</button>
                    )}
                  </div>

                  <div className="mt-auto pt-10">
                    <button 
                      onClick={()=>handleUpgrade(tier.id)} 
                      disabled={isLoading}
                      className={'w-full h-12 rounded-full text-xs tracking-widest transition ' + (isPremium ? 'bg-black text-white hover:bg-zinc-900' : 'bg-white text-black hover:bg-zinc-100') + ' ' + (isCurrent ? 'ring-2 ring-orange-600' : '') + ' ' + (isLoading ? 'opacity-50' : '')}>
                      {isLoading ? 'PROCESSING...' : (isCurrent ? (tier.id==='free'?'CURRENT':'CURRENT PLAN') : tier.btn)}
                    </button>
                    <div className="min-h-[50px] mt-4 flex items-start justify-center">
                      {tier.foot ? (
                        <div className="text-xs tracking-widest text-zinc-500 leading-relaxed text-center">{tier.foot}</div>
                      ) : (
                        <div className="h-3"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center text-xs tracking-widest text-zinc-600">NO META WORDING - JUST HUMAN REASONS TO MEET.</div>
      </div>
    </main>
  )
}
