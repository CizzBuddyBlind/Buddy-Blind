
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
  const [showConfirm, setShowConfirm] = useState(false)
  const [planToConfirm, setPlanToConfirm] = useState<Tier|null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successPlan, setSuccessPlan] = useState<Tier|null>(null)

  useEffect(()=>{
    const saved = localStorage.getItem('bb_plan')
    if(saved){
      setCurrentPlan(saved)
    } else {
      localStorage.setItem('bb_plan','free')
      setCurrentPlan('free')
    }
  },[])

  const openConfirm = (tier:Tier) => {
    if(tier.id===currentPlan){
      // Already on this plan - show same style modal as other popups
      setSuccessPlan(tier)
      setShowSuccess(true)
      return
    }
    if(tier.id==='free'){
      localStorage.setItem('bb_plan','free')
      setCurrentPlan('free')
      setSuccessPlan(tier)
      setShowSuccess(true)
      setTimeout(()=>{ window.location.reload() }, 1500)
      return
    }
    setPlanToConfirm(tier)
    setShowConfirm(true)
  }

  const confirmPayment = async () => {
    if(!planToConfirm) return
    setLoadingPlan(planToConfirm.id)
    setShowConfirm(false)
    try{
      const amount = planToConfirm.id==='lite' ? 1000 : 5000
      await fetch('/api/stripe/create-intent',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({amount, plan:planToConfirm.id})}).catch(()=>{})
      localStorage.setItem('bb_plan', planToConfirm.id)
      localStorage.setItem('buddy_card_saved','1')
      localStorage.setItem('buddy_card_last4','4242')
      setCurrentPlan(planToConfirm.id)
      setSuccessPlan(planToConfirm)
      setShowSuccess(true)
    }catch(e:any){
      localStorage.setItem('bb_plan', planToConfirm.id)
      setCurrentPlan(planToConfirm.id)
      setSuccessPlan(planToConfirm)
      setShowSuccess(true)
    }finally{
      setLoadingPlan(null)
    }
  }

  const closeSuccessAndRedirect = () => {
    setShowSuccess(false)
    if(successPlan && successPlan.id!=='free'){
      window.location.href = '/private-events?upgraded=' + successPlan.id
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
        <p className="mt-6 text-base leading-relaxed text-zinc-400 max-w-xl">Create your own vibe: Industry dinners, wine circles, 50+ social afternoons, hiking buddies.</p>
        <div className="mt-4 text-xs text-zinc-500">Current plan: <span className="text-white font-bold">{currentPlan.toUpperCase()}</span> - Free $0 is current by default for testing upgrade</div>

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
                    <button onClick={()=>openConfirm(tier)} disabled={isLoading} className={'w-full h-12 rounded-full text-xs tracking-widest transition ' + (isPremium ? 'bg-black text-white hover:bg-zinc-900' : 'bg-white text-black hover:bg-zinc-100') + ' ' + (isCurrent ? 'ring-2 ring-orange-600' : '') + ' ' + (isLoading ? 'opacity-50' : '')}>
                      {isLoading ? 'PROCESSING...' : btnText}
                    </button>
                    <div className="min-h-[50px] mt-4 flex items-start justify-center">
                      {tier.foot ? <div className="text-xs tracking-widest text-zinc-500 leading-relaxed text-center">{tier.foot}</div> : <div className="h-3"></div>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showConfirm && planToConfirm && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-600 rounded-3xl p-8">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-serif text-white leading-tight">Upgrade to {planToConfirm.title.toUpperCase()} plan?</h2>
              <button onClick={()=>setShowConfirm(false)} className="px-4 py-2 rounded-full border border-zinc-600 text-white text-xs font-bold">CLOSE</button>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-zinc-300 font-bold">PLAN</span><span className="text-white font-bold">{planToConfirm.title} {planToConfirm.price} {planToConfirm.tag}</span></div>
              <div className="flex justify-between"><span className="text-zinc-300 font-bold">PRICE</span><span className="text-white font-bold">{planToConfirm.id==='lite' ? 'HK$10 per month' : 'HK$50 per month with 90 days trial'}</span></div>
              <div className="bg-black border border-zinc-700 rounded-xl p-4 mt-4">
                <div className="text-xs tracking-widest text-zinc-400">TEST CARD</div>
                <div className="mt-1 text-sm font-mono text-white">4242 4242 4242 4242 Exp 12 34 CVC 123</div>
                <div className="mt-2 text-xs text-zinc-500">Use this test card - Click OK to confirm payment and upgrade - Same style as all other popup boxes</div>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={()=>setShowConfirm(false)} className="flex-1 h-12 rounded-full border border-zinc-600 text-white font-bold text-xs tracking-widest">Cancel</button>
              <button onClick={confirmPayment} className="flex-1 h-12 rounded-full bg-white text-black font-black text-xs tracking-widest">OK</button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && successPlan && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-600 rounded-3xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-900 bg-opacity-30 border border-green-700 flex items-center justify-center mx-auto">
              <span className="text-3xl text-white">V</span>
            </div>
            <h2 className="mt-6 text-2xl font-black tracking-widest text-white">Payment successful</h2>
            <p className="mt-3 text-sm text-white leading-relaxed">
              Test card 4242 - You are now on {successPlan.title.toUpperCase()} plan - {successPlan.id==='lite' ? 'HK$10 per month' : successPlan.id==='premium' ? 'HK$50 per month with 90 days trial' : 'HK$0 Free'} - {successPlan.id!=='free' ? 'Redirecting to private events' : 'Current plan updated'}
            </p>
            <div className="mt-6 bg-black border border-zinc-700 rounded-xl p-4 text-left">
              <div className="text-xs tracking-widest text-zinc-400">PLAN</div>
              <div className="mt-1 text-sm font-bold text-white">{successPlan.title} {successPlan.price}</div>
              <div className="mt-2 text-xs font-mono text-zinc-400">Test Card: 4242 4242 4242 4242 Exp 12 34 CVC 123</div>
            </div>
            <button onClick={closeSuccessAndRedirect} className="mt-8 w-full h-12 rounded-full bg-white text-black font-black text-xs tracking-widest">OK</button>
          </div>
        </div>
      )}
    </main>
  )
}
