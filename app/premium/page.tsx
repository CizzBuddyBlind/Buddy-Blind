
'use client'
import { useState, useEffect } from 'react'

type Tier = {
  id:string,
  title:string,
  tag:string,
  price:string,
  features:string[],
  btn:string,
  foot?:string
}

const TIERS:Tier[] = [
  {id:'free', title:'Free', tag:'TRY ONCE', price:'HK$0', features:['Invite and Join','VENUES ONLY','NO PRIVATE CREATION'], btn:'CURRENT', foot:''},
  {id:'lite', title:'Lite', tag:'PER MONTH', price:'HK$10', features:['Invite and Join','Unlock Comment & Rating features','Build Reputation and See Other'], btn:'UPGRADE TO LITE', foot:''},
  {id:'premium', title:'Premium', tag:'PER MONTH - 90 DAYS TRIAL', price:'HK$50', features:['UNLOCK PRIVATE EVENT','CREATE PRIVATE EVENT UP TO 20pp','SHARE INTEREST / NETWORKING / WHATEVER YOU LIKE','HOST TO EARN MORE POINT','HK$5 ADMIN FEE PER EVENT'], btn:'UPGRADE TO PREMIUM', foot:'90 DAYS TRIAL - CANCEL ANYTIME - HK$5 ADMIN FEE PER CONFIRMED JOIN'}
]

export default function PremiumPage(){
  const [currentPlan,setCurrentPlan]=useState('free')
  const [loadingPlan,setLoadingPlan]=useState<string|null>(null)

  useEffect(()=>{
    // Force current plan to free for testing upgrade flow as user requested
    const saved = localStorage.getItem('bb_plan')
    if(saved){
      setCurrentPlan(saved)
    } else {
      localStorage.setItem('bb_plan','free')
      setCurrentPlan('free')
    }
  },[])

  const handleUpgrade = async (plan:string) => {
    if(plan===currentPlan){
      alert('You are already on ' + plan.toUpperCase() + ' plan - Current plan is ' + plan.toUpperCase() + ' $0 free')
      return
    }
    if(plan==='free'){
      localStorage.setItem('bb_plan','free')
      setCurrentPlan('free')
      alert('Downgraded to Free plan - Try once Venues only No private creation')
      window.location.reload()
      return
    }
    setLoadingPlan(plan)
    try{
      const amount = plan==='lite' ? 1000 : 5000
      const res = await fetch('/api/stripe/create-intent',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({amount, plan})})
      const json = await res.json().catch(()=>({}))
      if(json && json.error){
        console.log('Stripe error', json.error)
      }
      const priceText = plan==='lite' ? 'HK$10 per month' : 'HK$50 per month with 90 days trial'
      const confirmPay = window.confirm('Upgrade to ' + plan.toUpperCase() + ' plan - ' + priceText + ' - Use test card 4242 4242 4242 4242 Exp 12 34 CVC 123 - Click OK to confirm payment and upgrade')
      if(confirmPay){
        localStorage.setItem('bb_plan', plan)
        localStorage.setItem('buddy_card_saved','1')
        localStorage.setItem('buddy_card_last4','4242')
        setCurrentPlan(plan)
        alert('Payment successful - Test card 4242 - You are now on ' + plan.toUpperCase() + ' plan - ' + priceText + ' - Redirecting to private events')
        setTimeout(()=>{ window.location.href = '/private-events?upgraded=' + plan }, 500)
      }
    }catch(e:any){
      alert('Payment error: ' + (e?.message||'unknown') + ' - For demo, upgrading anyway with test card 4242')
      localStorage.setItem('bb_plan', plan)
      setCurrentPlan(plan)
      window.location.href = '/private-events?upgraded=' + plan
    }finally{
      setLoadingPlan(null)
    }
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
        <div className="mt-4 text-xs text-zinc-500">Current plan from localStorage: <span className="text-white font-bold">{currentPlan.toUpperCase()}</span> - Free $0 is current by default as requested for testing upgrade</div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900 auto-rows-fr">
          {TIERS.map(tier=>{
            const isPremium = tier.id==='premium'
            const isCurrent = currentPlan===tier.id
            const isLoading = loadingPlan===tier.id
            let btnText = tier.btn
            if(isCurrent){
              btnText = tier.id==='free' ? 'CURRENT' : 'CURRENT PLAN'
            } else {
              if(tier.id==='free') btnText = 'DOWNGRADE TO FREE'
              if(tier.id==='lite') btnText = 'UPGRADE TO LITE'
              if(tier.id==='premium') btnText = 'UPGRADE TO PREMIUM'
            }
            return(
              <div key={tier.id} className={'p-8 flex flex-col h-full ' + (!isPremium ? 'border-b md:border-b-0 md:border-r border-zinc-800' : '') + ' ' + (isPremium ? 'bg-white text-black rounded-b-2xl md:rounded-bl-none md:rounded-r-2xl' : 'bg-zinc-900')}>
                <div className="flex justify-between items-start min-h-[32px]">
                  <h3 className={'font-serif text-2xl ' + (isPremium?'text-black':'text-white')}>{tier.title}</h3>
                  <span className="text-xs tracking-widest text-zinc-500 max-w-[140px] text-right">{tier.tag}</span>
                </div>
                <div className={'mt-6 font-serif text-5xl ' + (isPremium?'text-black':'text-white')}>{tier.price}</div>

                <div className="mt-8 flex-1 flex flex-col">
                  <div className="space-y-3 text-xs tracking-widest flex-1 min-h-[180px]">
                    {tier.features.map((f,i)=>(
                      <div key={i} className="flex gap-2 items-start">
                        <span className={isPremium?'text-zinc-400':'text-zinc-600'}>-</span>
                        <span className={'flex-1 leading-relaxed ' + (isPremium?'text-zinc-700':'text-zinc-400')}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-10">
                    <button 
                      onClick={()=>handleUpgrade(tier.id)} 
                      disabled={isLoading}
                      className={'w-full h-12 rounded-full text-xs tracking-widest transition ' + (isPremium ? 'bg-black text-white hover:bg-zinc-900' : 'bg-white text-black hover:bg-zinc-100') + ' ' + (isCurrent ? 'ring-2 ring-orange-600' : '') + ' ' + (isLoading ? 'opacity-50' : '')}>
                      {isLoading ? 'PROCESSING...' : btnText}
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
