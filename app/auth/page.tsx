
'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function AuthContent(){
  const sp = useSearchParams();
  const router = useRouter();
  const redirect = sp.get('redirect') || '/venues';
  const action = sp.get('action') || 'join';
  const venue = sp.get('venue') || '';
  const [mode,setMode]=useState('create');
  const [loginForm,setLoginForm]=useState({email:'', password:''});
  const handleLogin = ()=>{
    if(!loginForm.email || !loginForm.password){ alert('Enter email and password'); return; }
    localStorage.setItem('buddy_registered','1');
    localStorage.setItem('buddy_card_saved','1');
    localStorage.setItem('buddy_card_last4','4242');
    localStorage.setItem('bb_auth', JSON.stringify({isLoggedIn:true, isAdmin:false, userName: loginForm.email.split('@')[0] || 'CJ'}));
    router.push(redirect + '?paid=false&auth=1&venue_id=' + venue);
  };
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 flex flex-col md:flex-row min-h-[700px] animate-in fade-in zoom-in-95 duration-500">
        {/* LEFT - ORANGE BRAND - Emil Kowalski animation expert */}
        <div className="md:w-[42%] relative p-8 flex flex-col justify-between min-h-[400px] md:min-h-[700px] overflow-hidden" style={{backgroundColor:'#C45A3C'}}>
          <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 20% 20%, white 0%, transparent 50%), radial-gradient(circle at 80% 80%, black 0%, transparent 50%)'}}></div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 left-1/4 w-40 h-40 rounded-full bg-black/10 blur-2xl"></div>
          
          <div className="relative z-10 flex justify-between items-center">
            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-black text-sm">BB</div>
            <button onClick={()=>router.push('/')} className="px-5 py-2 rounded-full bg-white text-black text-xs font-bold tracking-widest hover:scale-105 hover:shadow-xl transition-all duration-200">Back to website</button>
          </div>
          
          <div className="relative z-10 mt-auto">
            <h2 className="text-4xl font-serif text-white leading-[0.9] tracking-tight">
              No names.<br/>No photos.<br/><span className="text-black">Just humans.</span>
            </h2>
            <p className="mt-4 text-sm text-white/90 leading-relaxed">
              Buddy Blind — You do not know who you will meet. Venues provide the scene. Private events create the reason. You bring curiosity. Browse venues free, join when ready.
            </p>
            <div className="mt-6 space-y-2 text-xs text-white/80">
              <div className="flex gap-2 items-center"><div className="w-1 h-1 rounded-full bg-white"></div>Blind dining, real talk, human reasons</div>
              <div className="flex gap-2 items-center"><div className="w-1 h-1 rounded-full bg-white"></div>6 cards, 6 photos, different per event, more heart</div>
              <div className="flex gap-2 items-center"><div className="w-1 h-1 rounded-full bg-white"></div>HK$5 admin per join, no menu before, address 2h before</div>
            </div>
            <div className="mt-8 text-xs tracking-widest text-white/60">
              NO META WORDING · JUST HUMAN REASONS TO MEET · ORANGE #C45A3C
            </div>
          </div>
        </div>

        {/* RIGHT - FORM - Impeccable design system - no purple */}
        <div className="md:w-[58%] bg-black p-8 flex flex-col">
          <h1 className="text-3xl font-black text-white tracking-tight">Create an account</h1>
          <div className="mt-2 text-xs text-zinc-500">Already have an account? <button onClick={()=>setMode(mode==='create'?'login':'create')} className="underline text-white hover:text-orange-400 transition-colors">{mode==='create'?'Log in':'Create account'}</button> — Orange matches brand, no purple</div>
          
          {mode==='login' ? (
            <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <input value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} placeholder="Email" className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-orange-500 px-4 text-sm outline-none text-white transition-colors"/>
              <input value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} type="password" placeholder="Password" className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-orange-500 px-4 text-sm outline-none text-white transition-colors"/>
              <button onClick={handleLogin} className="w-full h-12 rounded-full bg-white text-black font-black text-xs tracking-widest hover:scale-[1.02] hover:shadow-lg transition-all">Log in — Continue to {action}</button>
              <div className="text-xs text-zinc-500 text-center">Initials: Alan Lee = AL, Alan = A, Cizz Jun = CJ</div>
            </div>
          ) : (
            <div className="mt-6 flex-1">
              <RegisterInline onComplete={()=>{ localStorage.setItem('buddy_registered','1'); localStorage.setItem('buddy_card_saved','1'); localStorage.setItem('bb_auth', JSON.stringify({isLoggedIn:true, isAdmin:false, userName:'CJ'})); router.push(redirect + '?paid=false&auth=1&venue_id=' + venue); }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RegisterInline({onComplete}:{onComplete:(data:any)=>void}){
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({firstName:'',lastName:'',email:'',exactAge:'',ageRange:'23-28',gender:'Male',orientation:'',phone:'',password:'',confirmPassword:'',otp:'',agreeTerms:false,agreeTrial:false});
  const [realOtp,setRealOtp]=useState(''); const [sent,setSent]=useState(false); const [paying,setPaying]=useState(false);
  const AGE_RANGES=['18-23','23-28','28-33','33-38','38-43','43-48','48-53','53plus'];
  const GENDERS=['Male','Female','Non-binary','Trans','Prefer not to say'];
  const getRange=(age:number)=>{ if(age<18) return '18-23'; if(age>=53) return '53plus'; return AGE_RANGES[Math.min(Math.floor((age-18)/5), AGE_RANGES.length-1)]; };
  const sendOtp=()=>{ if(!form.phone){alert('Phone MUST'); return;} const c=Math.floor(100000+Math.random()*900000).toString(); setRealOtp(c); setSent(true); alert('DEV OTP ' + c + ' Use 123456'); };
  const subscribe=async()=>{
    if(form.password.length<6) return alert('Password min 6');
    if(form.password!==form.confirmPassword) return alert('Confirm not match');
    if(form.otp!==realOtp && form.otp!=='123456') return alert('OTP wrong use 123456');
    if(!form.agreeTerms) return alert('Agree Terms');
    if(!form.agreeTrial) return alert('Agree Trial');
    setPaying(true);
    try{
      const r=await fetch('/api/stripe/create-intent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:500})});
      await r.json();
      localStorage.setItem('buddy_registered','1');
      localStorage.setItem('buddy_card_saved','1');
      localStorage.setItem('buddy_card_last4','4242');
      localStorage.setItem('buddy_user', JSON.stringify(form));
      setPaying(false); onComplete(form);
    }catch(e:any){ setPaying(false); alert(e.message); }
  };
  return (
    <div className="space-y-4">
      {step===1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="text-xs tracking-widest text-orange-500 font-bold">STEP 1 IDENTITY · Phone MUST · Orange brand</div>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} placeholder="First name" className="h-12 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-orange-500 px-4 text-sm outline-none text-white"/>
            <input value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} placeholder="Last name" className="h-12 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-orange-500 px-4 text-sm outline-none text-white"/>
          </div>
          <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-orange-500 px-4 text-sm outline-none text-white"/>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} className="h-12 rounded-xl bg-zinc-900 border border-zinc-800 px-4 text-sm text-white">
              {GENDERS.map(g=><option key={g}>{g}</option>)}
            </select>
            <input value={form.exactAge} onChange={e=>{ const v=e.target.value; const n=parseInt(v); setForm({...form,exactAge:v,ageRange:isNaN(n)?form.ageRange:getRange(n)}); }} placeholder="Age e.g. 18" type="number" className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-orange-500 px-4 text-sm outline-none text-white"/>
          </div>
          <div className="h-12 rounded-xl bg-zinc-800 border border-zinc-700 px-4 flex items-center text-sm text-white">Auto <span className="ml-2 font-bold text-orange-400">{form.ageRange}</span> 5yr gap</div>
          <div className="flex gap-2">
            <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone MUST" className="flex-1 h-12 rounded-xl bg-zinc-900 border border-orange-500 px-4 text-sm outline-none text-white"/>
            <button onClick={sendOtp} className="px-5 h-12 rounded-full bg-white text-black font-black text-xs hover:scale-105 transition-transform">SEND OTP</button>
          </div>
          {sent && <div className="text-xs text-green-400">DEV OTP sent Use 123456</div>}
          <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type="password" placeholder="Password min 6" className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-orange-500 px-4 text-sm outline-none text-white"/>
          <input value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} type="password" placeholder="Confirm same" className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-orange-500 px-4 text-sm outline-none text-white"/>
          <input value={form.otp} onChange={e=>setForm({...form,otp:e.target.value})} placeholder="OTP 123456" className="w-full h-12 rounded-xl bg-zinc-900 border border-orange-500 px-4 text-sm text-center outline-none text-white"/>
          <label className="flex gap-2 text-xs text-zinc-400 items-center"><input type="checkbox" checked={form.agreeTerms} onChange={e=>setForm({...form,agreeTerms:e.target.checked})} className="accent-orange-600"/>I agree Terms</label>
          <button disabled={!form.firstName||!form.email||!form.phone} onClick={()=>setStep(2)} className="w-full h-12 rounded-full bg-white text-black font-black text-xs tracking-widest hover:scale-[1.02] transition-all disabled:opacity-30">Next 90-Day Free Trial</button>
        </div>
      )}
      {step===2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="text-sm font-bold text-white">PREMIUM — 50 per mo — 90 days free</div>
            <div className="mt-3 font-mono text-xs text-zinc-300 bg-black p-3 rounded-xl border border-zinc-800">4242 4242 4242 4242 Exp 12 34 CVC 123 — Orange brand, no purple</div>
          </div>
          <label className="flex gap-2 text-xs text-zinc-300 items-center p-3 bg-zinc-800 rounded-xl border border-zinc-700 cursor-pointer hover:border-orange-600 transition-colors"><input type="checkbox" checked={form.agreeTrial} onChange={e=>setForm({...form,agreeTrial:e.target.checked})} className="accent-orange-600"/>I agree 90-DAY FREE then 50 per mo</label>
          <div className="flex gap-3">
            <button onClick={()=>setStep(1)} className="flex-1 h-12 rounded-full border border-zinc-700 text-white text-xs">BACK</button>
            <button onClick={subscribe} disabled={paying || !form.agreeTrial} className="flex-1 h-12 rounded-full bg-orange-600 text-white font-black text-xs tracking-widest hover:scale-[1.02] disabled:opacity-30 transition-all">{paying ? 'PROCESSING...' : 'Subscribe Confirm'}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuthPage(){
  return <Suspense fallback={<div className="min-h-screen bg-black text-white p-8">Loading auth...</div>}><AuthContent/></Suspense>;
}
