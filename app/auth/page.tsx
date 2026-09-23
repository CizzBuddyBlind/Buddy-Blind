
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
    router.push(redirect + '?paid=false&auth=1&venue_id=' + venue);
  };
  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-5xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900">
        <div className="bg-gradient-to-b from-violet-600 to-zinc-900 p-8 flex flex-col justify-between min-h-[600px]">
          <div className="flex justify-between items-center">
            <div className="text-lg font-black">BB</div>
            <button onClick={()=>router.push('/')} className="px-4 py-2 rounded-full bg-white text-black text-xs">Back to website</button>
          </div>
          <div className="mt-auto">
            <h2 className="text-2xl font-serif">Capturing Moments Creating Memories</h2>
            <p className="mt-3 text-xs opacity-70">Buddy Blind You do not know who you will meet Browse venues free join when ready</p>
          </div>
        </div>
        <div className="bg-zinc-900 p-8">
          <h1 className="text-2xl font-black">Create an account</h1>
          <div className="mt-2 text-xs text-zinc-500">Already have an account? <button onClick={()=>setMode(mode==='create'?'login':'create')} className="underline text-white">{mode==='create'?'Log in':'Create account'}</button></div>
          {mode==='login' ? (
            <div className="mt-8 space-y-4">
              <input value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} placeholder="Email" className="w-full h-12 rounded-xl bg-black border border-zinc-800 px-4 text-sm outline-none"/>
              <input value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} type="password" placeholder="Password" className="w-full h-12 rounded-xl bg-black border border-zinc-800 px-4 text-sm outline-none"/>
              <button onClick={handleLogin} className="w-full h-12 rounded-full bg-violet-600 text-white font-black text-xs">Log in Continue to {action}</button>
            </div>
          ) : (
            <div className="mt-6">
              <RegisterInline onComplete={()=>{ localStorage.setItem('buddy_registered','1'); router.push(redirect + '?paid=false&auth=1&venue_id=' + venue); }} />
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
      setPaying(false); onComplete(form);
    }catch(e:any){ setPaying(false); alert(e.message); }
  };
  return (
    <div className="space-y-4">
      {step===1 && (
        <>
          <div className="grid grid-cols-2 gap-3"><input value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} placeholder="First name" className="h-11 rounded-xl bg-black border border-zinc-800 px-3 text-xs outline-none"/><input value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} placeholder="Last name" className="h-11 rounded-xl bg-black border border-zinc-800 px-3 text-xs outline-none"/></div>
          <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" className="w-full h-11 rounded-xl bg-black border border-zinc-800 px-3 text-xs outline-none"/>
          <div className="grid grid-cols-2 gap-3"><select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} className="h-11 rounded-xl bg-black border border-zinc-800 px-3 text-xs">{GENDERS.map(g=><option key={g}>{g}</option>)}</select><input value={form.exactAge} onChange={e=>{ const v=e.target.value; const n=parseInt(v); setForm({...form,exactAge:v,ageRange:isNaN(n)?form.ageRange:getRange(n)}); }} placeholder="Age e.g. 18" type="number" className="h-11 rounded-xl bg-black border border-zinc-800 px-3 text-xs outline-none"/></div>
          <div className="h-11 rounded-xl bg-zinc-800 px-3 flex items-center text-xs">Auto <span className="ml-2 font-bold">{form.ageRange}</span></div>
          <div className="flex gap-2"><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone MUST" className="flex-1 h-11 rounded-xl bg-black border border-amber-500 px-3 text-xs outline-none"/><button onClick={sendOtp} className="px-4 h-11 rounded-full bg-white text-black font-black text-xs">SEND OTP</button></div>
          {sent && <div className="text-xs text-green-400">Use 123456</div>}
          <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type="password" placeholder="Password min 6" className="w-full h-11 rounded-xl bg-black border border-zinc-800 px-3 text-xs outline-none"/>
          <input value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} type="password" placeholder="Confirm same" className="w-full h-11 rounded-xl bg-black border border-zinc-800 px-3 text-xs outline-none"/>
          <input value={form.otp} onChange={e=>setForm({...form,otp:e.target.value})} placeholder="OTP 123456" className="w-full h-11 rounded-xl bg-black border border-amber-500 px-3 text-xs text-center outline-none"/>
          <label className="flex gap-2 text-xs"><input type="checkbox" checked={form.agreeTerms} onChange={e=>setForm({...form,agreeTerms:e.target.checked})}/>I agree Terms</label>
          <button disabled={!form.firstName||!form.email||!form.phone} onClick={()=>setStep(2)} className="w-full h-12 rounded-full bg-violet-600 text-white font-black text-xs disabled:opacity-30">Next 90-Day Free Trial</button>
        </>
      )}
      {step===2 && (
        <div>
          <div className="bg-black border border-zinc-800 rounded-xl p-4 text-xs">
            <div className="font-bold">BuddyBlind Featured in 100plus countries</div>
            <div className="mt-2">Enjoy first 90 days free Cancel anytime Quick match 90 days Free Trial Only 50 per month after</div>
          </div>
          <button onClick={()=>setStep(3)} className="mt-3 w-full h-12 rounded-full bg-white text-black font-black text-sm">Continue</button>
          <button onClick={()=>setStep(1)} className="mt-2 w-full h-10 rounded-full border border-zinc-800 text-xs">BACK</button>
        </div>
      )}
      {step===3 && (
        <div>
          <div className="bg-black border border-zinc-800 rounded-xl p-4 text-xs">
            <div className="flex justify-between"><span>PREMIUM</span><span className="font-black">50 per mo</span></div>
            <div className="mt-2 font-mono">4242 4242 4242 4242 Exp 12 34 CVC 123</div>
          </div>
          <label className="mt-3 flex gap-2 text-xs bg-zinc-800 rounded-lg p-2 border border-zinc-700"><input type="checkbox" checked={form.agreeTrial} onChange={e=>setForm({...form,agreeTrial:e.target.checked})}/>I agree 90-DAY FREE then 50 per mo</label>
          <div className="mt-3 flex gap-2"><button onClick={()=>setStep(2)} className="flex-1 h-12 rounded-full border border-zinc-700 text-xs">BACK</button><button disabled={paying||!form.agreeTrial} onClick={subscribe} className="flex-1 h-12 rounded-full bg-violet-600 text-white font-black text-xs disabled:opacity-50">{paying?'...':'Subscribe Confirm'}</button></div>
        </div>
      )}
    </div>
  );
}
export default function AuthPage(){ return <Suspense fallback={<div className="min-h-screen bg-black text-white p-8">Loading auth...</div>}><AuthContent/></Suspense>; }
